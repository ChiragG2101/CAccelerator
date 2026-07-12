import mongoose, { Schema } from 'mongoose'

export interface UserDocument {
  clerkUserId: string
  email?: string
  username?: string
  linkedinUrl?: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<UserDocument>(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    username: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
)

export const UserModel = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema)
