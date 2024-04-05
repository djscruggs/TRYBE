import { deleteNote } from '~/models/note.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunctionArgs } from '@remix-run/node'

export async function action ({ params, request }: ActionFunctionArgs) {
  const user = await requireCurrentUser({ request })
  try {
    await deleteNote(Number(params?.id), Number(user?.id))
    return json({ message: `Deleted note ${params?.id}` }, 204)
  } catch (error) {
    return json({ message: `Error deleting note ${params?.id}` }, 500)
  }
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
