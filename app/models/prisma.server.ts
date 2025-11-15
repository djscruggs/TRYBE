import { PrismaClient } from '@prisma/client'
import { isAfter, isEqual } from 'date-fns'
import { MockPrismaClient } from '../../prisma/mockPrismaClient'
let prisma: PrismaClient
declare global {
  // eslint-disable-next-line no-var, @typescript-eslint/naming-convention
  var __db: PrismaClient | undefined
}
function extendPrisma(prisma: PrismaClient): PrismaClient {
  // @ts-expect-error return type is satisfied by the input type
  return prisma
    .$extends({
      result: {
        profile: {
          fullName: {
            needs: { firstName: true, lastName: true },
            compute(profile) {
              return `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
            }
          }
        }
      }
    })
    .$extends({
      result: {
        post: {
          live: {
            needs: { published: true, publishAt: true },
            compute(post) {
              if (!post.publishAt) {
                if (post.published) {
                  return true
                } else {
                  return false
                }
              }
              return (
                post.published &&
                (isAfter(new Date(), post.publishAt) ||
                  isEqual(new Date(), post.publishAt))
              )
            }
          }
        }
      }
    })
    .$extends({
      result: {
        challenge: {
          categories: {
            needs: { categories: true },
            compute(challenge): Array<{ id: number; name: string }> {
              if (
                !challenge.categories ||
                !Array.isArray(challenge.categories)
              ) {
                return [] // Return an empty array if categories are not loaded
              }
              return challenge.categories.map((item) => {
                if (item.category) {
                  // Handle the case where category is an object with id and name
                  return {
                    id: item.category.id,
                    name: item.category.name
                  }
                } else {
                  // Handle the default structure case
                  return {
                    id: item.categoryId,
                    name: `Category ${item.categoryId}` // Placeholder name, adjust as needed
                  }
                }
              })
            }
          }
        }
      }
    })
}
if (process.env.NODE_ENV === 'production') {
  void (async () => {
    prisma = extendPrisma(new PrismaClient())
    await prisma.$connect()
  })()
} else {
  if (!global.__db) {
    void (async () => {
      global.__db = extendPrisma(new PrismaClient())
      await global.__db.$connect()
    })()
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  prisma = global.__db!
}

export { prisma }
