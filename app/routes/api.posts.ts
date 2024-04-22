import { createPost, updatePost } from '~/models/post.server'
import type { User, Post, Challenge } from '@prisma/client'
import { loadChallenge } from '~/models/challenge.server'
import { requireCurrentUser } from '~/models/auth.server'
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { unstable_parseMultipartFormData } from '@remix-run/node'
import { uploadHandler, writeFile } from '~/utils/uploadFile'

export const action: ActionFunction = async (args) => {
  const currentUser = await requireCurrentUser(args) as User
  const request = args.request
  const rawData = await unstable_parseMultipartFormData(request, uploadHandler)
  for (const [key, value] of rawData.entries()) {
    console.log('in iterator')
    console.log(key, value)
  }
  // if this is for a challenge, load it and check whether it's public
  console.log('rawData', rawData.get('challengeId'))
  const challengeId = rawData.get('challengeId') ? Number(rawData.get('challengeId')) : null
  console.log('challengeId is', challengeId)
  let challenge
  if (challengeId) {
    challenge = await loadChallenge(challengeId) as Challenge
  }
  console.log('published', rawData.get('published'))
  const image = rawData.get('image') as File
  const video = rawData.get('video') as File
  console.log('video is ', video)
  const data: Partial<Post> = {
    body: rawData.get('body')?.toString() ?? null,
    title: rawData.get('title')?.toString() ?? '',
    userId: currentUser?.id,
    public: rawData.get('public') === 'true',
    published: rawData.get('published') === 'true'
  }
  if (challenge) {
    data.challengeId = challenge.id
    data.public = Boolean(challenge.public)
  }
  let result
  if (rawData.get('id')) {
    result = await updatePost(data)
  } else {
    result = await createPost(data)
  }
  if (image?.name) {
    const imgNoExt = `post-${result.id}-image`
    const imgPath = await writeFile(image, imgNoExt)
    result.image = imgPath
  } else {
    result.image = null
  }
  if (video?.name) {
    const vidNoExt = `post-${result.id}-video`
    const vidPath = await writeFile(video, vidNoExt)
    result.video = vidPath
  } else {
    result.video = null
  }
  const updated = await updatePost(result)
  console.log(updated)
  return json(updated)
}

export const loader: LoaderFunction = async (args) => {
  return json({ message: 'This route does not accept GET requests' }, 200)
}
