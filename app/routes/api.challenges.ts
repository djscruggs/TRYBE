import { fetchMemberChallenges } from '~/models/user.server'

import { createChallenge, updateChallenge, loadChallengeSummary, fetchChallengeSummaries } from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import {
  json, type LoaderFunction,
  unstable_parseMultipartFormData
  , type ActionFunctionArgs
} from '@remix-run/node'
import { convertStringValues } from '~/utils/helpers'
import { uploadHandler, saveToCloudinary, deleteFromCloudinary } from '~/utils/uploadFile'

export async function action (args: ActionFunctionArgs): Promise<any> {
  const currentUser = await requireCurrentUser(args)
  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)

  const formData = Object.fromEntries(rawData)
  const cleanData = convertStringValues(formData)
  if (!cleanData.userId) {
    cleanData.userId = currentUser?.id
  }
  try {
    const converted = cleanData
    delete converted.image
    delete converted.video
    delete converted.userId
    delete converted.deleteImage
    delete converted.coverPhoto
    converted.endAt = converted.endAt ? new Date(converted.endAt as Date).toISOString() : null
    converted.startAt = converted.startAt ? new Date(converted.startAt as Date).toISOString() : null
    converted.publishAt = converted.publishAt ? new Date(converted.publishAt as Date).toISOString() : new Date().toISOString()
    let data: any
    if (converted.id) {
      data = await updateChallenge(converted)
    } else {
      converted.userId = currentUser?.id
      data = await createChallenge(converted)
    }
    // now handle the photo
    let newCoverPhoto
    // new photo is uploaded as photo, not coverPhoto
    if (rawData.get('image')) {
      newCoverPhoto = rawData.get('image') as File
    }
    if (rawData.get('deleteImage') === 'true') {
      if (data.coverPhotoMeta?.public_id) {
        await deleteFromCloudinary(data.coverPhotoMeta?.public_id as string, 'image')
      }
      data.coverPhotoMeta = {}
    }
    if (newCoverPhoto) {
      const nameNoExt = `challenge-${data.id}-cover`
      const coverPhotoMeta = await saveToCloudinary(newCoverPhoto, nameNoExt)
      data.coverPhotoMeta = coverPhotoMeta
    }
    await updateChallenge(data)
    // reload challenge with all the extra info
    const updatedChallenge = await loadChallengeSummary(Number(data.id))
    return updatedChallenge
  } catch (error) {
    console.error('error', error)
    return {
      formData,
      error
    }
  }
}

export const loader: LoaderFunction = async (args) => {
  const { params } = args
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentUser = await requireCurrentUser(args)
  const uid = Number(currentUser?.id)
  const challenges = await fetchChallengeSummaries(uid) as { error?: string }
  if (!challenges || (challenges.error != null)) {
    const error = { loadingError: 'Unable to load challenges' }
    return json(error)
  }
  const memberships = await fetchMemberChallenges(uid) || []
  return json({ challenges, memberships, error: null })
}
