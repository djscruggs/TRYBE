import { prisma } from '~/models/prisma.server'
import { mailPost } from '~/utils/mailer'
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
      user: {
        include: {
          profile: true
        }
      },
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

  await Promise.all(posts.map(async post => {
    if (post.challenge?.members) {
      await Promise.all(post.challenge?.members.map(async member => {
        const props = {
          to: member.user.email,
          replyTo: post.user.email,
          dynamic_template_data: {
            name: post.user.profile?.fullName ?? '',
            post_url: `https://www.jointhetrybe.com/posts/${post.id}`,
            date: post.createdAt.toLocaleDateString(),
            subject: `New post from ${post.challenge?.name}`,
            title: post.title,
            body: post.body
          }
        }
        try {
          await mailPost(props)
        } catch (err) {
          console.error('Error sending notification', err)
        }
      }))

      const update = await prisma.post.update({
        where: {
          id: post.id
        },
        data: {
          notificationSentOn: new Date()
        }
      })
    }
    // update the send date even if there were no members to mail
    const update = await prisma.post.update({
      where: {
        id: post.id
      },
      data: {
        notificationSentOn: new Date()
      }
    })
  }))

  // send email

  return json({ posts }, 200)
}

// export const loader: LoaderFunction = async (args) => {
//   return json({ message: 'This route does not accept GET requests' }, 200)
// }
