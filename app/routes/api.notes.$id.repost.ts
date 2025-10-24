import { createNote, updateNote, loadRepost, deleteNote } from '~/models/note.server'
import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction, type ActionFunction  } from 'react-router';
// import { unstable_parseMultipartFormData } from 'react-router'; // Not available in React Router v7
import { uploadHandler, writeFile } from '~/utils/uploadFile'

export const action: ActionFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)

  const request = args.request
  // const rawData = await unstable_parseMultipartFormData(request, uploadHandler) // Not available in React Router v7
  if (rawData.get('unrepost')) {
    const repost = await loadRepost(rawData.get('replyToId'), currentUser?.id, null)
    if (repost) {
      await deleteNote(repost.id, currentUser?.id)
    }
    return Response.json({ message: 'Repost deleted' }, 200)
  }
  const image = rawData.get('image')
  if (!rawData.get('replyToId')) {
    throw new Error('replyToId is required')
  }

  const data = {
    body: rawData.get('body') ?? null,
    replyTo: { connect: { id: Num(rawData.get('replyToId')) } },
    isShare: true,
    user: { connect: { id: currentUser?.id } }
  }
  // check to make sure the repost doesn't already exist
  const note = await loadRepost(data.replyToId, currentUser?.id, data.body)
  if (note) {
    return Response.json(note)
  }
  const result = await createNote(data)
  if (image) {
    // const nameNoExt = image.name.split('.')[0]
    const webPath = await writeFile(image)
    result.image = webPath
  }
  const updated = await updateNote(result)
  return Response.json(updated)
}

export const loader: LoaderFunction = async (args) => {
  return Response.json({ message: 'This route does not accept GET requests' }, 200)
}
