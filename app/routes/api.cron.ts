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
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
        const host = process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'app.jointhetrybe.com'
        const postLink = `${protocol}://${host}/challenges/v/${post.challenge?.id}/chat#post-${post.id}`
        const props = {
          to: member.user.email,
          replyTo: post.user.email,
          fromName: 'Trybe',
          dynamic_template_data: {
            name: post.user.profile?.fullName ?? '',
            post_url: postLink,
            date: post.publishAt?.toLocaleDateString() ?? post.createdAt.toLocaleDateString(),
            subject: `${post.challenge?.name}: ${post.title}`,
            title: post.title,
            // body: post.body
            body: convertYouTubeLinksToImages(post.body ?? '', postLink)
          }
        }
        try {
          await mailPost(props)
          await prisma.post.update({
            where: {
              id: post.id
            },
            data: {
              notificationSentOn: new Date()
            }
          })
        } catch (err) {
          console.error('Error sending notification', err)
        }
      }))
    }
  }))

  // send email

  return json({ posts }, 200)
}

export function convertYouTubeLinksToImages (body: string, postLink: string = ''): string {
  const youtubeRegex = /https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)(?:&[^\s]*)?/g

  return body.replace(youtubeRegex, (match, p1, videoId) => {
    if (postLink) {
      return `<br><br ><a href="${postLink}"><img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="YouTube Video"></a>`
    }
    return `<br><br><img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="YouTube Video">`
  })
}

/*
StackOverflow discussion: https://stackoverflow.com/questions/10624139/how-to-get-youtube-thumbnail-from-url
https://img.youtube.com/vi/ROJ_VVc5oPM/mqdefault.jpg
YouTube Image Sizes
 Default (120x90):
URL: https://img.youtube.com/vi/${videoId}/default.jpg
Medium (320x180):
URL: https://img.youtube.com/vi/${videoId}/mqdefault.jpg
High (480x360) has black bars:
URL: https://img.youtube.com/vi/${videoId}/hqdefault.jpg
Standard (640x480) has black bars:
URL: https://img.youtube.com/vi/${videoId}/sddefault.jpg
Max Resolution (1280x720) no black bars but large:
URL: https://img.youtube.com/vi/${videoId}/maxresdefault.jpg
*/

// export const loader: LoaderFunction = async (args) => {
//   return json({ message: 'This route does not accept GET requests' }, 200)
// }
