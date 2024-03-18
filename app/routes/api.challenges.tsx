import { createChallenge, updateChallenge, challengeSchema } from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import {
  json, type LoaderFunction,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData
  , type ActionFunctionArgs
} from '@remix-run/node'
import { convertStringValues } from '../utils/helpers' // or cloudflare/deno
const fs = require('fs')
export async function action (args: ActionFunctionArgs) {
  console.log('top of action')
  const currentUser = await requireCurrentUser(args)
  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 5_000_000,
      file: ({ filename }) => filename
    }),
    // parse everything else into memory
    unstable_createMemoryUploadHandler()
  )
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
    function escapeRegExp (string: string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
    }
    const nameNoExt = `challenge-${data.id}`
    const ext = file.type.split('/').at(-1)
    const fullName = `${nameNoExt}.${ext}`
    const directory = `${process.cwd()}/public/uploads`
    const src = file.filepath
    const dest = `${directory}/${fullName}`
    // first delete any existing files
    // the regex below deletes files that match wildcard pattern challenge-<id>.*
    await fs.readdir(directory, (err: Error, files: any) => {
      for (let i = 0, len = files.length; i < len; i++) {
        const match = files[i].match(new RegExp(escapeRegExp(nameNoExt) + '.*'))
        if (match !== null) {
          fs.unlink(`${directory}/${match[0]}`, (err: Error) => {
            if (err) console.error(err)
          })
        }
      }
    })
    await fs.copyFile(src, dest, fs.constants.COPYFILE_FICLONE, (err: any) => {
      if (err) {
        throw err
      }
    })
    const webPath = `/uploads/${fullName}`
    data.coverPhoto = webPath
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
