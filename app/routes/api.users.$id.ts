import { loadUser } from '~/models/user.server'
import { json, type LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async (args) => {
  const user = await loadUser(args.params.id)
  if (user) {
    return json(user)
  } else {
    return json({ message: 'Not found' }, 404)
  }
}
