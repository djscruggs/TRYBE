import { createPost, updatePost } from '~/models/post.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { unstable_parseMultipartFormData } from '@remix-run/node'
import { uploadHandler, writeFile } from '~/utils/uploadFile'

export const action: ActionFunction = async (args) => {
  const currentUser = await requireCurrentUser(args)

  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  for (const [key, value] of rawData.entries()) {
    console.log(key, value)
  }
  const image = rawData.get('image')
  const data = {
    body: rawData.get('body'),
    title: rawData.get('title'),
    user: { connect: { id: currentUser?.id } }
  }
  if (rawData.get('id')) {
    data.id = parseInt(rawData.get('id'))
  }
  if (rawData.get('challengeId')) {
    data.challenge = { connect: { id: parseInt(rawData.get('challengeId')) } }
  }
  let result
  if (data.id) {
    result = await updatePost(data)
  } else {
    result = await createPost(data)
  }
  if (image) {
    const nameNoExt = image.name.split('.')[0]
    const webPath = await writeFile(image, nameNoExt)
    result.image = webPath
  } else {
    result.image = null
  }
  const updated = await updatePost(result)
  return json(updated)
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
