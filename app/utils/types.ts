export interface User {
  id?: number | string
  email: string
  profile?: Profile
  memberChallenges?: MemberChallenge[]
  challenges?: Challenge[] | ChallengeSummary[]
  notes?: Note[]
  posts?: Post[]
}
export interface CurrentUser extends User {
  profile: Profile
  id: number
  // the four below are added in root loader, not currently in the db
  locale?: string
  dateFormat?: string
  timeFormat?: string
  dateTimeFormat?: string
}

export interface Note {
  id?: number
  userId?: number
  body: string | null
  image?: string | null
  imageMeta?: Record<string, unknown> | null
  video?: string | null
  videoMeta?: Record<string, unknown> | null
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
  _count?: any
}
export interface NoteSummary extends Note {
  _count: {
    likes: number
    replies?: number
  }
}

export interface Thread {
  id?: number
  userId?: number
  user?: User | CurrentUser
  title: string | null
  body: string | null
  image: string | null
  imageMeta: any
  video: string | null
  videoMeta: any
  challengeId: number
  challenge?: Challenge
  likeCount?: number
  commentCount?: number
  createdAt?: Date
  updatedAt?: Date
}
export interface ThreadSummary extends Thread {
  _count?: {
    likes: number
    comments: number
  }
}

export interface Post {
  id?: number
  userId?: number
  title?: string | null
  body?: string | null
  image?: string | null
  imageMeta?: Record<string, unknown> | null
  video?: string | null
  videoMeta?: Record<string, unknown> | null
  embed?: string | null
  public?: boolean
  challengeId?: number | null
  published?: boolean
  publishAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
  challenge?: Challenge
  user?: User
  notifyMembers?: boolean | null
  notificationSentOn: Date | null
  live?: boolean // computed field @see prisma.server
}
export interface PostSummary extends Post {
  _count: {
    likes: number
    comments: number
  }

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
  coverPhotoMeta?: Record<string, unknown> | null
  icon?: string | null
  color?: string | null
  reminders?: boolean
  syncCalendar?: boolean
  publishAt?: Date
  published?: boolean
  public?: boolean
  userId: number
  _count?: CountType
}
interface CountType {
  members?: number
  likes?: number
  comments?: number
}
export interface ChallengeSummary extends Challenge {
  _count: {
    members: number
    likes: number
    comments: number
  }
  isMember: boolean
}

export interface MemberChallenge {
  id?: number | string
  userId: number | string
  challengeId: number | string
  challenge?: Challenge
  lastCheckIn?: Date
  nextCheckIn?: Date
  _count?: {
    checkIns?: number
  }
}

export interface Profile {
  id: number | string
  firstName: string
  lastName: string
  userId: number | string
  profileImage: string
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

export interface ErrorObject extends Record<string, { _errors: string[] }> {}

// generic interface that handles responses from server loading a single object
export interface ObjectData {
  errors?: ErrorObject
  formData?: Record<string, number | boolean | Date | null | undefined> | undefined
  object?: Record<string, number | boolean | Date | null | undefined> | undefined
  loadingError?: string | undefined
  [key: string]: null | number | boolean | Date | undefined | Record<string, number | boolean | Date | null | undefined> | undefined
}
