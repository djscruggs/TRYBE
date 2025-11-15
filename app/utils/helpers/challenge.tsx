import type {
  Challenge,
  MemberChallenge,
  ChallengeSummary
} from '~/utils/types'
import { isPast, addDays } from 'date-fns'

export function hasStarted(
  challenge: Challenge | ChallengeSummary,
  memberChallenge?: MemberChallenge | null
): boolean {
  if (challenge.type === 'SCHEDULED') {
    if (challenge.startAt) {
      return isPast(challenge.startAt)
    }
  }
  if (memberChallenge) {
    if (memberChallenge.startAt) {
      return isPast(memberChallenge.startAt)
    }
  }
  return true
}
export function isExpired(
  challenge: Challenge | ChallengeSummary,
  memberChallenge?: MemberChallenge | null
): boolean {
  if (challenge.type === 'SCHEDULED') {
    if (challenge.endAt) {
      return isPast(challenge.endAt)
    }
  }
  if (memberChallenge) {
    if (memberChallenge.startAt) {
      // add challenge.numDays to startAt
      const endAt = addDays(memberChallenge.startAt, challenge.numDays ?? 0)
      return isPast(endAt)
    }
  }
  return false
}

export function getShortUrl(
  challenge: Challenge | ChallengeSummary,
  membership?: MemberChallenge | null,
  cohortId?: number
): string {
  const url = `${window.location.origin}/s/c${challenge.id}`
  if (membership?.cohortId) {
    return `${url}-${membership.cohortId}`
  }
  if (cohortId) {
    return `${url}-${cohortId}`
  }
  return url
}
