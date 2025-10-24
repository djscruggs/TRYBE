import { getUserByClerkId } from '~/models/user.server'
import { type LoaderFunction  } from 'react-router';

export const loader: LoaderFunction = async (args) => {
  const user = await getUserByClerkId(args.params.id ?? '')
  if (user) {
    return Response.json(user)
  } else {
    return Response.json({ message: 'Not found' }, 404)
  }
}
