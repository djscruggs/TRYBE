// app/utils/types.server.ts
export interface RegisterForm {
  email: string
  password?: string
  firstName: string
  lastName: string
  clerkId?: string
  profileImage?: string
}
export interface User {
  id?: number | string
  email: string
  profile?: Profile
  memberChallenges?: MemberChallenge[]
}

export interface Challenge {
  id: number | string
  name: string
  description: string
  mission: string
  color: string
  userId: number | string
  duration: number
  unit: string
  icon: string
}
export interface ChallengeSummary extends Challenge {
  _count: {
    members?: number
    likes?: number
    comments?: number
  }
}

export interface MemberChallenge {
  id?: number | string
  userId: number | string
  challengeId: number | string
}

export interface Profile {
  id?: number | string
  firstName?: string
  lastName?: string
  userId?: number | string
  profileImage?: string
}
