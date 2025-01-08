import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import { prisma } from '~/models/prisma.server'

export const loader: LoaderFunction = async (args) => {
  await requireCurrentUser(args)
  const posts = await prisma.post.findMany({
    where: {
      notificationSentOn: {
        not: null
      },
      publishAt: {
        gt: new Date()
      }
    }
  })
  const updatedPosts = await prisma.post.updateMany({
    where: {
      notificationSentOn: {
        not: null
      },
      publishAt: {
        gt: new Date()
      }
    },
    data: {
      notificationSentOn: null
    }
  })

  return {
    posts,
    updatedPosts
  }
}
