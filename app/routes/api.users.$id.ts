import { loadUser } from '~/models/user.server'
import { type LoaderFunction  } from 'react-router';

export const loader: LoaderFunction = async (args) => {
  const user = await loadUser(args.params.id)
  if (user) {
    return user
  } else {
    return { message: 'Not found' }
  }
}
