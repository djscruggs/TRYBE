import { createChallenge, updateChallenge, challengeSchema, loadChallengeSummary } from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import {
  json, type LoaderFunction,
  unstable_parseMultipartFormData
  , type ActionFunctionArgs
} from '@remix-run/node'
import { convertStringValues } from '../utils/helpers'
import { saveToCloudinary, uploadHandler } from '../utils/uploadFile'

export async function action (args: ActionFunctionArgs): Promise<any> {
  console.log('top of action')
  const currentUser = await requireCurrentUser(args)
  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  let file
  if (rawData.get('photo')) {
    file = rawData.get('photo')
  }

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
    if (file) {
      // const nameNoExt = `challenge-${data.id}`
      // data.coverPhotoMeta = await writeFile(file)
      data.coverPhotoMeta = await saveToCloudinary(file)
      data.coverPhoto = data.coverPhotoMeta.secure_url
      await updateChallenge(data)
    }
    // reload challenge with all the extra info
    const updatedChallenge = loadChallengeSummary(data.id)

    return (await updatedChallenge)
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
