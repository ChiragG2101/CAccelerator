export type Role = 'ADMIN' | 'CREATOR' | 'EMPLOYER' | 'CLIENT' | 'STUDENT'

export interface ProfileTheme {
  accent?: string
  style?: string
}

export interface Profile {
  id: string
  name: string | null
  email: string
  role: Role
  bio: string | null
  headline: string | null
  isPublic: boolean
  theme: ProfileTheme
  customHighlights: string[]
}
