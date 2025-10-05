import { createNote, updateNote, loadNoteSummary } from '~/models/note.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from 'react-router';
import { unstable_parseMultipartFormData } from 'react-router';
import { uploadHandler, handleFormUpload } from '~/utils/uploadFile'
import { type CurrentUser } from '~/utils/types'
import { type Note } from '@prisma/client'

interface NoteData extends Note {
  challenge?: { connect: { id: number } }
  post?: { connect: { id: number } }
  comment?: { connect: { id: number } }
  user: { connect: { id: number } }
  replyTo?: { connect: { id: number } }
}
export const action: ActionFunction = async (args) => {
  const currentUser: CurrentUser | null = await requireCurrentUser(args)
  if (!currentUser) {
    return json({ message: 'You must be logged in to create a note or thread' }, 401)
  }
  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  const data: Partial<NoteData> = {
    body: rawData.get('body') as string ?? '',
    user: { connect: { id: currentUser.id } }
  }
  if (rawData.get('id')) {
    data.id = Number(rawData.get('id'))
  }
  if (rawData.get('challengeId')) {
    data.challenge = { connect: { id: Number(rawData.get('challengeId')) } }
  }
  if (rawData.get('postId')) {
    data.post = { connect: { id: Number(rawData.get('postId')) } }
  }
  if (rawData.get('isThread')) {
    data.isThread = rawData.get('isThread') === 'true'
  }
  if (rawData.get('commentId')) {
    data.comment = { connect: { id: Number(rawData.get('commentId')) } }
  }
  if (rawData.get('replyToId')) {
    data.replyTo = { connect: { id: Number(rawData.get('replyToId')) } }
  }
  let result
  if (data.id) {
    result = await updateNote(data)
  } else {
    result = await createNote(data)
  }
  await handleFormUpload({ formData: rawData, dataObj: result, nameSpace: 'note', onUpdate: updateNote })
  // send back a full note that includes profile, user etc
  const newNote = await loadNoteSummary(result.id)
  return newNote
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
