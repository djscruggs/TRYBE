import React from 'react'
import { useLoaderData, json } from '@remix-run/react'
import { type LoaderFunction } from '@remix-run/server-runtime'
import { fetchChallengeMembers } from '~/models/challenge.server'

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.id) {
    return json({ loadingError: 'Challenge id not included' })
  }
  const result = await fetchChallengeMembers(params.id)

  if (!result) {
    const error = { loadingError: 'Challenge not found' }
    return json(error)
  }
  const data: Array<Record<string, any>> = result
  return json(data)
}
export default function ViewChallengeMembers (): JSX.Element {
  const members = useLoaderData() as Array<Record<string, any>>
  return (
    <>

    <div className="mt-8">
      <p>Members</p>
      {members.map((member) => {
        return (
          <div key={member.id}>
            <div>{member.user.profile?.firstName} {member.user.profile?.lastName}</div>
            <div> {member.body}</div>
          </div>
        )
      })}
    </div>
    </>

  )
}
