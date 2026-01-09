import { getUserByClerkId } from '~/models/user.server'
import { type LoaderFunction } from 'react-router'

export const loader: LoaderFunction = async (args) => {
  const clerkId = args.params.id ?? ''
  const user = await getUserByClerkId(clerkId)

  if (!user) {
    return Response.json(
      {
        message: 'User not found in database',
        clerkId,
        error: 'USER_NOT_FOUND',
        hint: 'User may need to be created via webhook or clerkId needs to be set in database'
      },
      { status: 404 }
    )
  }

  return user
}
