import { createThread, updateThread, loadThreadSummary } from '~/models/thread.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { unstable_parseMultipartFormData } from '@remix-run/node'
import { uploadHandler, handleFormUpload } from '~/utils/uploadFile'
import { type CurrentUser } from '~/utils/types'
import { type Thread } from '@prisma/client'

interface ThreadData extends Thread {
  challenge?: { connect: { id: number } }
  user: { connect: { id: number } }
}
export const action: ActionFunction = async (args) => {
  const currentUser: CurrentUser | null = await requireCurrentUser(args)
  if (!currentUser) {
    return json({ message: 'You must be logged in to create a thread or thread' }, 401)
  }
  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  const data: Partial<ThreadData> = {
    title: rawData.get('title') as string ?? '',
    body: rawData.get('body') as string ?? '',
    user: { connect: { id: currentUser.id } }
  }
  if (rawData.get('id')) {
    data.id = Number(rawData.get('id'))
  }
  if (rawData.get('challengeId')) {
    data.challenge = { connect: { id: Number(rawData.get('challengeId')) } }
  }
  let result
  if (data.id) {
    result = await updateThread(data)
  } else {
    result = await createThread(data)
  }
  await handleFormUpload({ formData: rawData, dataObj: result, nameSpace: 'thread', onUpdate: updateThread })
  // send back a full thread that includes profile, user etc
  const newThread = await loadThreadSummary(result.id)
  return newThread
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
