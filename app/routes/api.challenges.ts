import { createChallenge, updateChallenge, challengeSchema, loadChallengeSummary } from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import {
  json, type LoaderFunction,
  unstable_parseMultipartFormData
  , type ActionFunctionArgs
} from '@remix-run/node'
import { convertStringValues } from '../utils/helpers'
import { uploadHandler, saveToCloudinary, deleteFromCloudinary } from '../utils/uploadFile'

export async function action (args: ActionFunctionArgs): Promise<any> {
  const currentUser = await requireCurrentUser(args)
  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)

  const formData = Object.fromEntries(rawData)
  const cleanData = convertStringValues(formData)
  if (!cleanData.userId) {
    cleanData.userId = currentUser.id
  }
  try {
    const validation = challengeSchema.safeParse(cleanData)
    if (!validation.success) {
      return ({
        formData,
        errors: validation.error.format()
      })
    }
    // convert types where necessary
    const converted = cleanData
    delete converted.photo
    delete converted.userId
    converted.endAt = converted.endAt ? new Date(converted.endAt).toISOString() : null
    converted.startAt = converted.startAt ? new Date(converted.startAt).toISOString() : null
    converted.publishAt = converted.publishAt ? new Date(converted.publishAt).toISOString() : new Date().toISOString()
    let data: any
    if (converted.id) {
      data = await updateChallenge(converted)
    } else {
      converted.userId = currentUser.id
      data = await createChallenge(converted)
    }
    // now handle the photo
    let coverPhoto
    if (rawData.get('photo') === 'delete') {
      data.coverPhoto = null
    } else if (rawData.get('photo')) {
      coverPhoto = rawData.get('photo') as File
    }
    if (coverPhoto ?? rawData.get('photo') === 'delete') {
      if (data.coverPhotoMeta?.public_id) {
        await deleteFromCloudinary(data.coverPhotoMeta?.public_id)
        data.coverPhotoMeta = null
      }
      // const nameNoExt = `challenge-${data.id}`
      // data.coverPhotoMeta = await writeFile(file)
      if (coverPhoto) {
        const nameNoExt = `challenge-${data.id}-cover`
        const coverPhotoMeta = await saveToCloudinary(coverPhoto, nameNoExt)
        data.coverPhoto = coverPhotoMeta.secure_url
        data.coverPhotoMeta = coverPhotoMeta
      }
      await updateChallenge(data)
    }
    // reload challenge with all the extra info
    const updatedChallenge = await loadChallengeSummary(Number(data.id))

    return updatedChallenge
  } catch (error) {
    console.log('error', error)
    return {
      formData,
      error
    }
  }
}
export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
