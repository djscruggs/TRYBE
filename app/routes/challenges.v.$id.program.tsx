import {  Link } from 'react-router';
import { useContext, useState, useEffect, JSX } from 'react'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { type MetaFunction} from 'react-router';
import type { Post } from '~/utils/types'
import ChallengeSchedule from '~/components/challengeSchedule'
import { useMemberContext } from '~/contexts/MemberContext'

export const meta: MetaFunction = () => {
  return [
    { title: 'Program' },
    {
      property: 'og:title',
      content: 'Program'
    }
  ]
}

export default function Program (): JSX.Element {
  const { membership, challenge } = useMemberContext()
  const { currentUser } = useContext(CurrentUserContext)

  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const fetchPosts = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/challenges/v/${challenge?.id}/program`)
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        const data = await response.json()
        setPosts(data.posts as Post[])
      } catch (error) {
        console.error('Error fetching posts:', error)
      }
    }

    void fetchPosts()
  }, [challenge?.id])

  return (
    <>
      <div className='flex flex-col justify-center mt-6 w-full max-w-lg md:max-w-xl'>
        {posts.length === 0 &&
          <div className='max-w-lg text-center '>
            {challenge?.userId === currentUser?.id
              ? <div>You have not scheduled content. <Link className='text-red underline' to={`/challenges/v/${challenge.id}/schedule`}>Edit schedule.</Link></div>
              : <div>Schedule has not been published yet.</div>
            }
          </div>
        }
        {challenge &&
          <ChallengeSchedule challenge={challenge} posts={posts} key={challenge.id} isSchedule={false} membership={membership} />
        }
      </div>
    </>
  )
}
