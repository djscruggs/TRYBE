import { createNote, updateNote, loadRepost, deleteNote } from '~/models/note.server'
import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction, type ActionFunction  } from 'react-router';
import { parseFormData } from '@remix-run/form-data-parser';
import { writeFile, memoryUploadHandler } from '~/utils/uploadFile'

export const action: ActionFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)

  const request = args.request

  const formData = await parseFormData(request, memoryUploadHandler);
  const rawData = formData

  if (rawData.get('unrepost')) {
    const repost = await loadRepost(rawData.get('replyToId'), currentUser?.id, null)
    if (repost) {
      await deleteNote(repost.id, currentUser?.id)
    }
    return { message: 'Repost deleted' }
  }
  const image = rawData.get('image') as File
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
    return note
  }
  const result = await createNote(data)
  if (image) {
    const webPath = await writeFile(image)
    result.image = webPath
  }
  const updated = await updateNote(result)
  return updated
}

export const loader: LoaderFunction = async (args) => {
  return { message: 'This route does not accept GET requests' }
}