export type Role = "ADMIN" | "CREATOR" | "EMPLOYER" | "CLIENT" | "STUDENT";

export interface ProfileTheme {
  accent?: string;
  style?: string;
}

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  bio: string | null;
  headline: string | null;
  isPublic: boolean;
  theme: ProfileTheme;
  customHighlights: string[];
}

export type WorkMode = "remote" | "hybrid" | "onsite";

export interface Candidate {
  id: string;
  clerkUserId: string;
}

export interface CandidatePersona {
  headline: string;
  summary: string;
  yearsExperience?: number;
  seniority?: string;
  skills: string[];
  industries: string[];
  currentRole?: string;
  roles: string[];
  locations: string[];
  education: string[];
  experience: Array<{
    company?: string;
    title: string;
    startDate?: string;
    endDate?: string;
    bullets: string[];
  }>;
  achievements: string[];
  preferences: {
    targetRole: string;
    preferredLocations: string[];
    workModes: WorkMode[];
  };
}

export interface CandidateProfile {
  id: string;
  candidateId: string;
  parsed: CandidatePersona;
  parseStatus: "completed" | "fallback";
  parseVersion: string;
  targetRole?: string;
  preferredLocations: string[];
  workModes: WorkMode[];
}

export interface UserRecord {
  clerkUserId: string;
  email?: string;
  username?: string;
  linkedinUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IngestProfileResponse {
  userId: string;
  user?: UserRecord;
  profileCompleteness: number;
  source: "dummy";
}

export interface JobOpening {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: "Remote" | "Hybrid" | "Onsite";
  salaryRange: string;
  postedAt: string;
  applyUrl: string;
  description: string;
  mustHaveSkills: string[];
}

export interface Recommendation {
  id: string;
  userId: string;
  jobId: string;
  score: number;
  reasons: string[];
  keywordGaps: string[];
  job?: JobOpening;
}

export interface RecommendationsResponse {
  userId: string;
  recommendations: Recommendation[];
  source: "api";
}

export interface TailoredResume {
  jobId: string;
  headline: string;
  summary: string;
  bullets: string[];
  keywordsToAdd: string[];
}

export interface TailorResumeResponse {
  userId: string;
  tailored: TailoredResume;
  source: "api";
}
