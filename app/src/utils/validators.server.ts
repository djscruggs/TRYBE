// app/utils/validators.server.ts

export const validateEmail = (email: string): string | undefined => {
  var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!email.length || !validRegex.test(email)) {
    return "Please enter a valid email address"
  }
}

export const validatePassword = (password: string | null, password_match: string | null): string | undefined => {
  if (!password || password.length < 5) {
    return "Please enter a password that is at least 5 characters long"
  }
  if(password != password_match){
    return "Your passwords don't match"
  }
}

export const validateName = (name: string): string | undefined => {
  if (!name.length) return `Please enter a value`
}