import { createHash } from "node:crypto";
import { Router, type Request, type RequestHandler } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { z } from "zod";
import type { CareerRuntime, ProfileInput, WorkMode } from "../domain.js";
import { seedJobs } from "../data/seedJobs.js";
import type { CareerStore } from "../services/careerStore.js";
import { fallbackParse } from "../services/profile/profileParser.js";
import {
  extractResume,
  MAX_RESUME_BYTES,
} from "../services/profile/resumeExtractor.js";
import { rankJob } from "../services/recommendations/ranking.service.js";
import { fallbackTailor } from "../services/tailoring/tailoringFallback.js";

const preferencesSchema = z.object({
  targetRole: z.string().trim().min(2).max(120),
  preferredLocations: z.array(z.string().trim().min(1)).min(1).max(10),
  workModes: z
    .array(z.enum(["remote", "hybrid", "onsite"]))
    .min(1)
    .max(3),
});
const pastedResumeSchema = preferencesSchema.extend({
  resumeText: z.string().trim().min(20).max(100_000),
});
const idSchema = z.string().min(1).max(100);
const asyncHandler =
  (handler: RequestHandler): RequestHandler =>
  (req, res, next) =>
    void Promise.resolve(handler(req, res, next)).catch(next);
const fail = (
  status: number,
  code: string,
  message: string,
  fieldErrors?: unknown,
) => Object.assign(new Error(message), { status, code, fieldErrors });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: MAX_RESUME_BYTES },
});
const list = (value: unknown) =>
  Array.isArray(value)
    ? value.map(String)
    : value == null
      ? []
      : [String(value)];

export function createRouter(
  store: CareerStore,
  auth: RequestHandler,
  runtime?: CareerRuntime,
) {
  const router = Router();
  router.get("/health/live", (req, res) =>
    res.json({ data: { status: "ok" }, requestId: req.requestId }),
  );
  router.get(
    "/health/ready",
    asyncHandler(async (req, res) => {
      let hermes: unknown = {
        status: runtime ? "unknown" : "degraded",
        detail: runtime ? undefined : "fallback-only",
      };
      if (runtime) {
        try {
          hermes = await runtime.health();
        } catch {
          hermes = { status: "degraded" };
        }
      }
      const mongo =
        mongoose.connection.readyState === 1
          ? "connected"
          : process.env.DUMMY_API_MODE === "true"
            ? "not-required"
            : "disconnected";
      const ready =
        mongo !== "disconnected" &&
        (process.env.NODE_ENV !== "production" || Boolean(runtime));
      res
        .status(ready ? 200 : 503)
        .json({
          data: { status: ready ? "ok" : "unavailable", mongo, hermes },
          requestId: req.requestId,
        });
    }),
  );
  router.get("/health", (req, res) =>
    res.json({ ok: true, service: "api", requestId: req.requestId }),
  );

  const parseWithHermes = async (
    resumeText: string,
    preferences: z.infer<typeof preferencesSchema>,
    requestId: string,
  ) => {
    if (!runtime)
      throw fail(
        503,
        "HERMES_NOT_CONFIGURED",
        "Candidate parsing is not configured",
      );
    return runtime.parseCandidate(
      { resumeText, ...preferences },
      { requestId },
    );
  };
  router.post(
    "/v1/parse/resume",
    upload.single("resume"),
    asyncHandler(async (req, res) => {
      if (!req.file)
        throw fail(400, "RESUME_REQUIRED", "Attach one PDF or DOCX resume");
      const preferences = preferencesSchema.safeParse({
        targetRole: req.body.targetRole,
        preferredLocations: list(req.body.preferredLocations),
        workModes: list(req.body.workModes),
      });
      if (!preferences.success)
        throw fail(
          400,
          "VALIDATION_ERROR",
          "Invalid resume preferences",
          preferences.error.flatten().fieldErrors,
        );
      const extracted = await extractResume(req.file);
      const parsed = await parseWithHermes(
        extracted.text,
        preferences.data,
        req.requestId,
      );
      res
        .status(200)
        .json({
          data: {
            source: "resume",
            persona: parsed.data,
            provenance: {
              contentHash: extracted.contentHash,
              extractionVersion: extracted.extractionVersion,
              hermesRunId: parsed.hermesSessionId,
            },
          },
          requestId: req.requestId,
        });
    }),
  );

  router.use("/v1", auth);
  const current = async (req: Request) => {
    if (!req.authIdentity)
      throw fail(401, "UNAUTHENTICATED", "Authentication required");
    return store.resolveCandidate(req.authIdentity);
  };
  const owned = async (req: Request) => {
    const candidate = await current(req);
    if (candidate.id !== String(req.params.candidateId))
      throw fail(
        403,
        "FORBIDDEN",
        "Resource does not belong to current candidate",
      );
    return candidate;
  };
  const parseAndSave = async (
    candidateId: string,
    resumeText: string,
    preferences: z.infer<typeof preferencesSchema>,
    metadata: Omit<ProfileInput, keyof z.infer<typeof preferencesSchema>>,
    requestId: string,
  ) => {
    const runtimeInput = { resumeText, ...preferences };
    let parsed;
    let status: "completed" | "fallback" = "completed";
    let hermesRunId: string | undefined;
    if (!runtime && process.env.NODE_ENV === "production")
      throw fail(
        503,
        "HERMES_UNAVAILABLE",
        "Resume parsing is temporarily unavailable",
      );
    try {
      if (runtime) {
        const result = await runtime.parseCandidate(runtimeInput, {
          requestId,
        });
        parsed = result.data;
        hermesRunId = result.hermesSessionId;
      } else {
        parsed = fallbackParse(runtimeInput);
        status = "fallback";
      }
    } catch (error) {
      if (process.env.NODE_ENV === "production") throw error;
      parsed = fallbackParse(runtimeInput);
      status = "fallback";
    }
    return store.saveProfile(
      candidateId,
      { ...preferences, ...metadata, hermesRunId },
      parsed,
      status,
    );
  };

  router.post(
    "/v1/candidates",
    asyncHandler(async (req, res) => {
      const candidate = await current(req);
      res.json({ data: candidate, requestId: req.requestId });
    }),
  );
  router.put(
    "/v1/candidates/:candidateId/profile",
    asyncHandler(async (req, res) => {
      const candidate = await owned(req);
      const body = pastedResumeSchema.safeParse(req.body);
      if (!body.success)
        throw fail(
          400,
          "VALIDATION_ERROR",
          "Invalid resume profile",
          body.error.flatten().fieldErrors,
        );
      const { resumeText, ...preferences } = body.data;
      const profile = await parseAndSave(
        candidate.id,
        resumeText,
        preferences,
        {
          source: "pasted-text",
          contentHash: createHash("sha256").update(resumeText).digest("hex"),
          extractionVersion: "text-v1",
        },
        req.requestId,
      );
      res.json({ data: profile, requestId: req.requestId });
    }),
  );
  router.post(
    "/v1/candidates/:candidateId/resume",
    upload.single("resume"),
    asyncHandler(async (req, res) => {
      const candidate = await owned(req);
      if (!req.file)
        throw fail(400, "RESUME_REQUIRED", "Attach one PDF or DOCX resume");
      const preferences = preferencesSchema.safeParse({
        targetRole: req.body.targetRole,
        preferredLocations: list(req.body.preferredLocations),
        workModes: list(req.body.workModes),
      });
      if (!preferences.success)
        throw fail(
          400,
          "VALIDATION_ERROR",
          "Invalid resume preferences",
          preferences.error.flatten().fieldErrors,
        );
      const extracted = await extractResume(req.file);
      const profile = await parseAndSave(
        candidate.id,
        extracted.text,
        preferences.data,
        {
          source: "upload",
          contentHash: extracted.contentHash,
          originalFileName: req.file.originalname,
          mimeType: req.file.mimetype,
          extractionVersion: extracted.extractionVersion,
        },
        req.requestId,
      );
      res.status(201).json({ data: profile, requestId: req.requestId });
    }),
  );
  router.get(
    "/v1/candidates/:candidateId/profile",
    asyncHandler(async (req, res) => {
      await owned(req);
      const profile = await store.getProfile(String(req.params.candidateId));
      if (!profile) throw fail(404, "PROFILE_NOT_FOUND", "Profile not found");
      res.json({ data: profile, requestId: req.requestId });
    }),
  );
  router.get(
    "/v1/jobs",
    asyncHandler(async (req, res) => {
      await current(req);
      res.json({ data: seedJobs, requestId: req.requestId });
    }),
  );
  router.get(
    "/v1/jobs/:jobId",
    asyncHandler(async (req, res) => {
      await current(req);
      const job = seedJobs.find((item) => item.id === req.params.jobId);
      if (!job) throw fail(404, "JOB_NOT_FOUND", "Job not found");
      res.json({ data: job, requestId: req.requestId });
    }),
  );
  router.post(
    "/v1/events",
    asyncHandler(async (req, res) => {
      const candidate = await current(req);
      const body = z
        .object({
          candidateId: idSchema,
          type: z.string().min(1).max(100),
          metadata: z.record(z.string(), z.unknown()).optional(),
        })
        .safeParse(req.body);
      if (!body.success)
        throw fail(
          400,
          "VALIDATION_ERROR",
          "Invalid event",
          body.error.flatten().fieldErrors,
        );
      if (body.data.candidateId !== candidate.id)
        throw fail(
          403,
          "FORBIDDEN",
          "Event does not belong to current candidate",
        );
      res.status(202).json({ data: { ok: true }, requestId: req.requestId });
    }),
  );
  const recommendations = asyncHandler(async (req, res) => {
    await owned(req);
    const candidateId = String(req.params.candidateId);
    const profile = await store.getProfile(candidateId);
    if (!profile)
      throw fail(409, "PROFILE_REQUIRED", "Complete a profile first");
    const limitResult = z.coerce
      .number()
      .int()
      .min(1)
      .max(20)
      .safeParse(req.query.limit ?? 20);
    if (!limitResult.success)
      throw fail(400, "VALIDATION_ERROR", "Invalid limit");
    const data = seedJobs
      .map((job) => ({
        id: `${candidateId}:${job.id}:v1`,
        job,
        ...rankJob(profile, job),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limitResult.data);
    res.json({ data, requestId: req.requestId });
  });
  router.get("/v1/candidates/:candidateId/recommendations", recommendations);
  router.post("/v1/candidates/:candidateId/recommendations", recommendations);
  router.post(
    "/v1/candidates/:candidateId/tailored-resumes",
    asyncHandler(async (req, res) => {
      const candidate = await owned(req);
      const body = z.object({ jobId: idSchema }).safeParse(req.body);
      if (!body.success)
        throw fail(
          400,
          "VALIDATION_ERROR",
          "Invalid request",
          body.error.flatten().fieldErrors,
        );
      const profile = await store.getProfile(candidate.id);
      if (!profile)
        throw fail(409, "PROFILE_REQUIRED", "Complete a profile first");
      const job = seedJobs.find((item) => item.id === body.data.jobId);
      if (!job) throw fail(404, "JOB_NOT_FOUND", "Job not found");
      let output;
      let status: "completed" | "fallback" = "completed";
      try {
        output = runtime
          ? (
              await runtime.tailorResume(
                { candidate: profile.parsed, job },
                { requestId: req.requestId },
              )
            ).data
          : fallbackTailor(profile, job);
        if (!runtime) status = "fallback";
      } catch {
        output = fallbackTailor(profile, job);
        status = "fallback";
      }
      const tailored = await store.saveTailored(
        candidate.id,
        profile.id,
        job.id,
        output,
        status,
      );
      res.status(201).json({ data: tailored, requestId: req.requestId });
    }),
  );
  router.get(
    "/v1/candidates/:candidateId/tailored-resumes/:id",
    asyncHandler(async (req, res) => {
      await owned(req);
      const tailored = await store.getTailored(
        String(req.params.candidateId),
        String(req.params.id),
      );
      if (!tailored)
        throw fail(
          404,
          "TAILORED_RESUME_NOT_FOUND",
          "Tailored resume not found",
        );
      res.json({ data: tailored, requestId: req.requestId });
    }),
  );
  return router;
}
