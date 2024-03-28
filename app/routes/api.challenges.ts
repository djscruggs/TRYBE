import { createChallenge, updateChallenge, challengeSchema } from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import {
  json, type LoaderFunction,
  unstable_parseMultipartFormData
  , type ActionFunctionArgs
} from '@remix-run/node'
import { convertStringValues } from '../utils/helpers'
import { writeFile, uploadHandler } from '../utils/uploadFile'

export async function action (args: ActionFunctionArgs): Promise<any> {
  console.log('top of action')
  const currentUser = await requireCurrentUser(args)
  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  /* @ts-expect-error */
  const file: NodeOnDiskFile = rawData.get('photo')

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
    if (!file) {
      return data
    }
    // now handle the photo
    // use the name without the extension, which is figured out in the writeFile function
    const nameNoExt = `challenge-${data.id}`
    data.coverPhoto = await writeFile(file, nameNoExt)
    const result = await updateChallenge(data)
    return (result)
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
