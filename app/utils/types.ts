// app/utils/types.ts
export interface User {
  id?: number | string
  email: string
  profile?: Profile
  memberChallenges?: MemberChallenge[]
}
export interface Note {
  id?: number
  userId?: number
  body: string | null
  image?: string | null
  video?: string | null
  challengeId?: number
  challenge?: Challenge
  postId?: number
  post?: Post
  replyToId?: number
  replyTo?: Note
  commentId?: number
  isShare?: boolean
  createdAt?: Date
  updatedAt?: Date
  user?: User
  _count: any
}
export interface Post {
  id?: number
  userId?: number
  title?: string | null
  body?: string | null
  image?: string | null
  video?: string | null
  embed?: string | null
  public?: boolean
  challengeId?: number | null
  published?: boolean
  publishAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
  challenge?: Challenge
  user?: User
}
export interface Challenge {
  id: number
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
  public?: boolean
  userId: number
  _count?: {
    members?: number
    likes?: number
    comments?: number
  }
}
export interface ChallengeSummary extends Challenge {
  id: number | null | undefined
  _count: {
    members?: number
    likes?: number
    comments?: number
  }
  isMember?: boolean
}

export interface MemberChallenge {
  id?: number | string
  userId: number | string
  challengeId: number | string
  challenge?: Challenge
  lastCheckIn?: Date
  nextCheckIn?: Date
}

export interface Profile {
  id?: number | string
  firstName?: string
  lastName?: string
  userId?: number | string
  profileImage?: string
}
// app/utils/types.ts
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

export interface Comment {
  id: number
  body: string
  userId: number
  challengeId: number
  postId: number
  createdAt: Date
  updatedAt: Date
  user?: User
  replies?: Comment[]
  replyToId?: number
  replyTo?: Comment
  threadDepth?: number
}

export interface NoteSummary extends Note {
  _count: {
    likes: number
    replies?: number
  }
}
export interface ErrorObject extends Record<string, { _errors: string[] }> {}

// generic interface that handles responses from server loading a single object
export interface ObjectData {
  errors?: ErrorObject
  formData?: Record<string, number | boolean | Date | null | undefined> | undefined
  object?: Record<string, number | boolean | Date | null | undefined> | undefined
  loadingError?: string | undefined
  [key: string]: null | number | boolean | Date | undefined | Record<string, number | boolean | Date | null | undefined> | undefined
}
