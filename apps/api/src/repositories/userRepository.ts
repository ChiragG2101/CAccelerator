import mongoose from 'mongoose'

import { UserModel, type UserDocument } from '../models/User.js'

export interface UserRecord {
  clerkUserId: string
  email?: string
  username?: string
  linkedinUrl?: string
  createdAt: string
  updatedAt: string
}

export interface UpsertUserInput {
  clerkUserId: string
  email?: string
  username?: string
  linkedinUrl?: string
}

export class UserRepository {
  private readonly inMemoryUsers = new Map<string, UserRecord>()

  async upsert(input: UpsertUserInput): Promise<UserRecord> {
    const payload = compact(input)

    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findOneAndUpdate(
        { clerkUserId: input.clerkUserId },
        { $set: payload },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      ).lean<UserDocument>()

      if (!user) {
        throw new Error(`Failed to upsert user for clerkUserId=${input.clerkUserId}`)
      }

      const userDoc: UserDocument = user
      return toRecord(userDoc)
    }

    const existing = this.inMemoryUsers.get(input.clerkUserId)
    const now = new Date().toISOString()
    const next: UserRecord = {
      clerkUserId: input.clerkUserId,
      email: payload.email ?? existing?.email,
      username: payload.username ?? existing?.username,
      linkedinUrl: payload.linkedinUrl ?? existing?.linkedinUrl,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }

    this.inMemoryUsers.set(input.clerkUserId, next)
    return next
  }

  async getByClerkUserId(clerkUserId: string): Promise<UserRecord | null> {
    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findOne({ clerkUserId }).lean<UserDocument>()
      return user ? toRecord(user) : null
    }

    return this.inMemoryUsers.get(clerkUserId) ?? null
  }
}

function compact(input: UpsertUserInput): Omit<UpsertUserInput, 'clerkUserId'> {
  return Object.fromEntries(
    Object.entries({
      email: input.email,
      username: input.username,
      linkedinUrl: input.linkedinUrl,
    }).filter(([, value]) => value !== undefined && value !== '')
  ) as Omit<UpsertUserInput, 'clerkUserId'>
}

function toRecord(user: UserDocument): UserRecord {
  return {
    clerkUserId: user.clerkUserId,
    email: user.email,
    username: user.username,
    linkedinUrl: user.linkedinUrl,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
