// app/utils/types.server.ts
export interface RegisterForm {
  email: string
  password?: string
  firstName: string
  lastName: string
}
export interface LoginForm {
  email: string
  password: string
  request: Request
}
export interface ChallengeData {
  name: string | null
  description: string | null
  mission: string | null
  startAt: Date
  endAt?: Date | null
  frequency?: 'DAILY' | 'WEEKDAYS' | 'ALTERNATING' | 'WEEKLY' | 'CUSTOM'
  coverPhoto?: string | null
  icon?: string | null
  color?: string | null
  reminders?: boolean
  syncCalendar?: boolean
  publishAt?: Date
  published?: boolean
  userId: string | number
}
export interface ChallengeSummary extends ChallengeData {
  _count: {
    likes: number
    members: number
    comments: number
  }
}
export interface Comment {
  id: string | number
  userId: string | number
  challengeId: string | number
  content: string
  createdAt: Date
  updatedAt: Date
}
export interface Note {
  id?: number
  userId?: string | number
  body: string | null
  image?: string | null
  challengeId?: string | number
  replyToId?: string | number
  commentId?: string | number
  isShare?: boolean
  createdAt?: Date
  updatedAt?: Date
  challenge?: Challenge
}
export interface NoteSummary extends Note {
  _count: {
    likes: number
    comments: number
  }
}
export interface ErrorObject extends Record<string, { _errors: string[] }> {}

// generic interface that handles responses from server loading a single object
export interface ObjectData {
  errors?: ErrorObject
  formData?: Record<string, string | number | boolean | Date | null | undefined> | undefined
  object?: Record<string, string | number | boolean | Date | null | undefined> | undefined
  loadingError?: string | undefined
  [key: string]: null | string | number | boolean | Date | undefined | Record<string, string | number | boolean | Date | null | undefined> | undefined
}
