import { deleteNote } from '~/models/note.server'
import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction, type ActionFunctionArgs } from 'react-router'

export async function action(args: ActionFunctionArgs) {
  const { params } = args
  const user = await requireCurrentUser(args)
  try {
    await deleteNote(Number(params?.id), Number(user?.id))
    return { message: `Deleted note ${params?.id}` }
  } catch (error) {
    return { message: `Error deleting note ${params?.id}` }
  }
}

export const loader: LoaderFunction = async (args) => {
  return { message: 'This route does not accept GET requests' }
}
