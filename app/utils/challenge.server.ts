// app/utils/user.server.ts
import type { ChallengeData } from './types.server'
import { prisma } from './prisma.server'

export const createChallenge = async (challenge: ChallengeData) => {
  const newChallenge = {id:1}
  // const newChallenge = await prisma.challenge.create({
  //   data: challenge,
  // })
  console.log('returning from create')
  return { id: newChallenge.id}
}