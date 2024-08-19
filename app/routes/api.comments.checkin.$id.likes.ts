import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction, type ActionFunctionArgs } from '@remix-run/node'
import { prisma, prisma } from '~/models/prisma.server'
import { type Like } from '@prisma/client'

export const loader: LoaderFunction = async (args) => {
  const user = await requireCurrentUser(args)
  const { id } = args.params

  const likedCommentIds = await prisma.comment.findMany({
    where: {
      checkInId: Number(id),
      likes: {
        some: {
          userId: user?.id
        }
      }
    },
    select: {
      id: true
    }
  })
  return json(likedCommentIds.map(comment => comment.id))
}
