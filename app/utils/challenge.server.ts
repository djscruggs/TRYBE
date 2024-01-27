// app/utils/user.server.ts
import type { ChallengeData } from './types.server'
import { prisma } from './prisma.server'

export const createChallenge = async (challenge: prisma.challengeCreateInput) => {
  // const newChallenge = {id:1}
  console.log('in createChallenge')
  try {
    const newChallenge = await prisma.challenge.create({
      data: challenge,
    })
  } catch(error){
    console.log('error')
    console.error(error)
  }
  console.log('returning from create')
  return newChallenge
}
export const loadChallenge = async (challengeId: string | number, userId:string | number | undefined) => {
  const id = Number(challengeId)
  const uid = Number(userId)
  return await prisma.challenge.findUnique({
    where: {
      id: id,
      userId: uid
    },
  })

}