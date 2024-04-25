import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import { fetchMyChallenges, fetchMyMemberships } from '~/models/challenge.server'
import { fetchMyNotes } from '~/models/note.server'
import { fetchMyPosts } from '~/models/post.server'
import { Button } from '@material-tailwind/react'
import CardChallenge from '~/components/cardChallenge'
import CardChallengeMembership from '~/components/cardChallengeMembership'
import CardPost from '~/components/cardPost'
import CardNote from '~/components/cardNote'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import React, { useContext } from 'react'

export const loader: LoaderFunction = async (args) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentUser = await requireCurrentUser(args)
  const uid = Number(currentUser?.id)
  const challenges = await fetchMyChallenges(uid) as { error?: string }
  const memberships = await fetchMyMemberships(uid) as { error?: string }
  const notes = await fetchMyNotes(uid) as { error?: string }
  const posts = await fetchMyPosts(uid) as { error?: string }
  console.log('end of my loader')
  console.log(challenges)
  return json({ challenges, notes, posts, memberships })
}

export default function ChallengesIndex (): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const data: any = useLoaderData()
  const { challenges, notes, posts, memberships } = data
  console.log(challenges)
  if (data?.error) {
    return <h1>{data.error}</h1>
  }
  if (!data) {
    return <p>Loading...</p>
  }
  return (
          <div className="mt-10">
            <h1 className="text-3xl font-bold mb-4">
              My Stuff
            </h1>
            <div className="max-w-md">
              <h2>Challenges</h2>
              {(challenges.length) > 0 &&
                challenges.map((challenge: any) => (
                  <p key={challenge.id}>
                    <CardChallenge challenge={challenge} isMember={challenge.isMember} />
                  </p>
                ))
              }
            </div>
            <div className="max-w-md">
              <h2>Memberships</h2>
              {(memberships.length) > 0 &&
                memberships.map((membership: any) => (
                  <div key={`${membership.id}-${membership.userId}`}>
                    <CardChallengeMembership membership={membership}/>
                  </div>
                ))
              }
            </div>
            <div className="max-w-md">
              <h2>Posts</h2>
              {(posts.length) > 0 &&
                posts.map((post: any) => (
                  <p key={post.id}>
                    <CardPost post={post} />
                  </p>
                ))
              }
            </div>
            <div className="max-w-md">
              <h2>Notes</h2>
              {(notes.length) > 0 &&
                notes.map((note: any) => (
                  <p key={note.id}>
                    <CardNote note={note} />
                  </p>
                ))
              }
            </div>
          </div>
  )
}
