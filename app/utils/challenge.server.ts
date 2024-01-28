import { prisma } from './prisma.server'
import z from 'zod'

const createChallenge = async (challenge: prisma.challengeCreateInput) => {
  try {
    const newChallenge = await prisma.challenge.create({
      data: challenge,
    })
    return newChallenge
  } catch(error){
    console.log('error')
    console.error(error)
    return error
  }
}
const updateChallenge = async (challenge: prisma.challengeCreateInput) => {
  try {
    const newChallenge = await prisma.challenge.update({
      where: { id: challenge.id },
      data: challenge,
    })
    return newChallenge
  } catch(error){
    console.log('error')
    console.error(error)
    return error
  }
}
const loadChallenge = async (challengeId: string | number, userId:string | number | undefined) => {
  const id = Number(challengeId)
  const uid = Number(userId)
  return await prisma.challenge.findUnique({
    where: {
      id: id,
      userId: uid
    },
  })
}
function getSchemaDefaults<Schema extends z.AnyZodObject>(schema: Schema) {
  return Object.fromEntries(
      Object.entries(schema.shape).map(([key, value]) => {
          if (value instanceof z.ZodDefault) return [key, value._def.defaultValue()]
          return [key, undefined]
      })
  )
}
const challengeSchema =  
                    z.object({
                            name: z
                              .string()
                              .min(1, { message: "Challenge name is required" }),
                            description: z
                              .string()
                              .min(1, { message: "Description is required" }),
                            startAt: z
                              .coerce
                              .date({required_error: "Please select a date"})
                              .min(new Date(), { message: "Must start today or after" }),
                            endAt: z
                                .coerce
                                .date()
                                .or(z.literal(''))
                                .nullable(),
                            frequency: z
                              .enum(["DAILY","WEEKDAYS","ALTERNATING","WEEKLY","CUSTOM"]),
                            coverPhoto: z
                              .string()
                              .optional(),
                            icon: z
                              .string()
                              .optional(),
                            color: z
                              .string()
                              .optional(),
                            reminders: z
                              .boolean()
                              .default(false),
                            syncCalendar: z
                              .boolean()
                              .default(false),
                            publishAt: z
                              .date()
                              .optional(),
                            published: z
                              .boolean()
                              .default(false),
                            userId: z
                              .coerce
                              .bigint()
                          })
export { createChallenge, updateChallenge, loadChallenge, challengeSchema};                              