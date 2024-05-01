import { prisma } from '../models/prisma.server'
import type { Challenge } from '@prisma/client'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'

export const loader: LoaderFunction = async (args) => {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      challengeId: {
        not: null
      },
      notifyMembers: true,
      notificationSentOn: null,
      publishAt: {
        lt: new Date()
      }
    },
    include: {
      challenge: {
        include: {
          members: {
            include: {
              user: {
                include: {
                  profile: true
                }
              }
            }
          }
        }
      }
    }
  })
  posts.map(post => {
    post.challenge?.members.map(member => {
      console.log(member.user.email, member.user.profile?.fullName)
      // send email
    })
    // update notificationSentOn
    prisma.post.update({
      where: {
        id: post.id
      },
      data: {
        notificationSentOn: new Date()
      }
    }).then(() => {
      console.log('Notification sent for post', post.id)
    }).catch(err => {
      console.log('Error sending notification', err)
    })
  })
  return json({ posts }, 200)
}

// export const loader: LoaderFunction = async (args) => {
//   return json({ message: 'This route does not accept GET requests' }, 200)
// }
