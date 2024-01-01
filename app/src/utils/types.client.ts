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
}

export type Profile = {
  id?: number | string
  firstName?: string
  lastName?: string
  userId?: number | string
}
