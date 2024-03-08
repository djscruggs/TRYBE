// app/utils/types.server.ts
export type RegisterForm = {
  email: string
  password: string
  firstName: string
  lastName: string
}
export type User = {
  id?: number | string
  email: string
  profile?: Profile
  memberChallenges?: MemberChallenge[]
}

export interface Challenge  {
  id: number | string
  name: string
  description: string
  color: string
  userId: number | string
  duration: number
  unit: string
  icon: string
}
export interface ChallengeSummary extends Challenge {
  _count: {
    members: number
  }
}

export type MemberChallenge = {
  id?: number | string
  userId: number | string
  challengeId: number | string
}

export type Profile = {
  id?: number | string
  firstName?: string
  lastName?: string
  userId?: number | string
}
