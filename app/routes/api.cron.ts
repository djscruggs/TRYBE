import { prisma } from '../models/prisma.server'
import { type CheckinReminderMailerProps, mailPost, sendCheckinReminder } from '../utils/mailer'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { generateUrl } from '~/utils/helpers'
export const loader: LoaderFunction = async (args) => {
  const scheduledPosts = await sendScheduledPosts()
  const { dayNumberPosts, dayNotifications } = await sendDayNumberPosts()
  return json({ scheduledPosts, dayNumberPosts, dayNotifications }, 200)
}

export const sendScheduledPosts = async (): Promise<number> => {
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
        const postLink = generateUrl(`/challenges/v/${post.challenge?.id}/chat#featured-id-${post.id}`)
        const props = {
          to: member.user.email,
          replyTo: post.user.email,
          fromName: 'Trybe',
          dynamic_template_data: {
            name: (`${post.user.profile?.firstName ?? ''} ${post.user.profile?.lastName ?? ''}`).trim(),
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
          post.notificationSentOn = new Date()
        } catch (err) {
          console.error('Error sending notification', err)
        }
      }))
    }
  }))
  return posts.length
}

export const sendDayNumberPosts = async (): Promise<{ dayNumberPosts: number, dayNotifications: number }> => {
  // Step 1: Get challenges with status PUBLISHED and type SELF_LED
  const currentTimeGMT = new Date()
  const currentHourGMT = currentTimeGMT.getUTCHours()
  const currentMinuteGMT = currentTimeGMT.getUTCMinutes()
  const challenges = await prisma.challenge.findMany({
    where: {
      status: 'PUBLISHED',
      type: 'SELF_LED'
    },
    include: {
      members: {
        where: {
          notificationHour: {
            gte: currentHourGMT,
            lte: currentHourGMT + (currentMinuteGMT + 4 >= 60 ? 1 : 0)
          },
          notificationMinute: {
            gte: currentMinuteGMT,
            lte: (currentMinuteGMT + 4) % 60
          }
        },
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      }
    }
  })

  // Step 2: Organize memberChallenges by dayNumber
  const dayNumberHash: Record<number, any[]> = {}
  challenges.forEach(challenge => {
    challenge.members.forEach(member => {
      if (!dayNumberHash[member.dayNumber]) {
        dayNumberHash[member.dayNumber] = []
      }
      // add the challenge object so we can access its properties when sending the daily reminder email
      const memberWithChallenge = { ...member, challenge }
      dayNumberHash[member.dayNumber].push(memberWithChallenge)
    })
  })

  // Step 3: Find posts for each challengeId scheduled for the days in the hash
  const posts = await prisma.post.findMany({
    where: {
      challengeId: {
        in: challenges.map(challenge => challenge.id)
      },
      publishOnDayNumber: {
        in: Object.keys(dayNumberHash).map(Number)
      },
      published: true
    },
    include: {
      user: {
        include: {
          profile: true
        }
      },
      challenge: true
    }
  })

  // Step 4: Email the correct post to each member or send a generic reminder if no posts
  let nonPostNotifications = 0 // count of non post notifications sent, added to return value
  if (posts.length === 0) {
    // Send generic reminder email
    await Promise.all(Object.values(dayNumberHash).flat().map(async member => {
      const props: CheckinReminderMailerProps = {
        to: member.user.email,
        dynamic_template_data: {
          name: (`${member.user.profile?.firstName ?? ''} ${member.user.profile?.lastName ?? ''}`.trim() || 'Trybe Member'),
          challenge_name: member.challenge.name,
          checkin_url: generateUrl(`/challenges/v/${member.challenge.id}/checkins`)
        }
      }
      try {
        await sendCheckinReminder(props)
        nonPostNotifications++
      } catch (err) {
        console.error('Error sending reminder email', err.response.body.errors)
      }
    }))
  } else {
    await Promise.all(posts.map(async post => {
      // Skip if publishOnDayNumber is null
      if (post.publishOnDayNumber === null) {
        return
      }

      const members = dayNumberHash[post.publishOnDayNumber]
      if (members) {
        await Promise.all(members.map(async member => {
          const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
          const host = process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'app.jointhetrybe.com'
          const postLink = `${protocol}://${host}/challenges/v/${post.challengeId}/chat#featured-id-${post.id}`
          const props = {
            to: member.user.email,
            replyTo: post.user.email,
            fromName: 'Trybe',
            dynamic_template_data: {
              name: (`${post.user.profile?.firstName ?? ''} ${post.user.profile?.lastName ?? ''}`).trim(),
              post_url: postLink,
              date: post.publishAt?.toLocaleDateString() ?? post.createdAt.toLocaleDateString(),
              subject: `${post.title}`,
              title: post.title,
              body: convertYouTubeLinksToImages(post.body ?? '', postLink)
            }
          }
          try {
            await mailPost(props)
          } catch (err) {
            console.error('Error sending notification', err)
          }
        }))
      }
    }))
  }

  // Step 5: Increment memberChallenge.dayNumber by 1
  await prisma.memberChallenge.updateMany({
    where: {
      challenge: {
        type: 'SELF_LED',
        status: 'PUBLISHED'
      },
      notificationHour: {
        gte: currentHourGMT,
        lte: currentHourGMT + (currentMinuteGMT + 4 >= 60 ? 1 : 0)
      },
      notificationMinute: {
        gte: currentMinuteGMT,
        lte: (currentMinuteGMT + 4) % 60
      }
    },
    data: {
      dayNumber: {
        increment: 1
      }
    }
  })
  return { dayNumberPosts: posts.length, dayNotifications: nonPostNotifications }
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
