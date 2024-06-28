import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import React, { useLoaderData, useParams, useNavigate, useState, useContext, useMatches } from '@remix-run/react'
import { fetchCheckIns } from '~/models/challenge.server'
import { type ObjectData } from '~/utils/types'

export const loader: LoaderFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)
  const userId = Number(args.params.userId ?? currentUser?.id)
  const challengeId = Number(args.params.id)
  const checkIns = await fetchCheckIns(userId, challengeId) as { error?: string }
  return json({ checkIns })
}
export default function CheckIns (): JSX.Element {
  const data: any = useLoaderData()
  const matches = useMatches()
  console.log(matches)
  const challenge = matches.find((match) => match.id === 'routes/challenges.v.$id')?.data as ObjectData
  const { checkIns } = data
  console.log(checkIns)

  if (data?.error) {
    return <h1>{data.error}</h1>
  }
  if (!data) {
    return <p>Loading...</p>
  }
  console.log(challenge)
  return (
    <>
          <div>Check ins</div>
          {checkIns.map((checkIn) => (
            <div key={checkIn.id}>{checkIn.createdAt}</div>
          ))}
    </>
  )
}
