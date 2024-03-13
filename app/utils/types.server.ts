// app/utils/types.server.ts
export interface RegisterForm {
  email: string
  password: string
  firstName: string
  lastName: string
}
export interface LoginForm {
  email: string
  password: string
  request: Request
}
export interface ChallengeData {
  name: string
  description: string
  mission: string
  startAt: Date
  endAt?: Date | null
  frequency?: 'DAILY' | 'WEEKDAYS' | 'ALTERNATING' | 'WEEKLY' | 'CUSTOM'
  coverPhoto?: string
  icon?: string
  color?: string
  reminders?: boolean
  syncCalendar?: boolean
  publishAt?: Date
  published?: boolean
  userId: string | number
}
export interface Comment {
  id: string | number
  userId: string | number
  challengeId: string | number
  content: string
  createdAt: Date
  updatedAt: Date
}
export interface ErrorObject extends Record<string, { _errors: string[] }> {}

// generic interface thatandles responses from server loading a single object
export interface ObjectData {
  errors?: ErrorObject
  formData?: Record<string, string | number | boolean | Date | null | undefined> | undefined
  object?: Record<string, string | number | boolean | Date | null | undefined> | undefined
  loadingError?: string | undefined
  [key: string]: null | string | number | boolean | Date | undefined | Record<string, string | number | boolean | Date | null | undefined> | undefined
}
