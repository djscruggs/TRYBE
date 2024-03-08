// app/utils/types.server.ts
export type RegisterForm = {
  email: string
  password: string
  firstName: string
  lastName: string
}
export type LoginForm = {
  email: string
  password: string
  request: Request
}
export type ChallengeData = {
  name: string;
  description: string;
  mission: string;
  startAt: Date;
  endAt?: Date | null;
  frequency?: "DAILY" | "WEEKDAYS" | "ALTERNATING" | "WEEKLY" | "CUSTOM";
  coverPhoto?: string;
  icon?: string;
  color?: string;
  reminders?: boolean;
  syncCalendar?: boolean;
  publishAt?: Date;
  published?: boolean;
  userId: string | number;
}
export type ErrorObject = {
  [key: string]: {
    _errors: string[];
  };
};
//generic type that handles responses from server loading a single object
export type ObjectData = {
  errors?: ErrorObject;
  formData?: FormData;
  object?: any
  loadingError?: string
  [key: string]: any
};

