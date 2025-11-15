// app/utils/validators.server.ts

export const validateEmail = (email: string): string | undefined => {
  const validRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  if (!email.length || !validRegex.test(email)) {
    return 'Please enter a valid email address'
  }
}

export const validatePassword = (
  password: string | null,
  passwordMatch: string | null
): string | undefined => {
  if (!password || password.length < 5) {
    return 'Please enter a password that is at least 5 characters long'
  }
  if (password !== passwordMatch) {
    return "Your passwords don't match"
  }
}

export const validateName = (name: string): string | undefined => {
  if (!name.length) return 'Please enter a value'
}
