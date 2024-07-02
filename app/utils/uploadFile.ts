import { promises as fs } from 'fs'
import { unstable_composeUploadHandlers, unstable_createFileUploadHandler, unstable_createMemoryUploadHandler } from '@remix-run/node'
import { v2 as cloudinary } from 'cloudinary'
import type { UploadApiResponse } from 'cloudinary'
import type { Note, Thread, Post, CheckIn, Challenge } from '@prisma/client'
import { Prisma } from '@prisma/client'
export async function writeFile (file: any, nameWithoutExtension: string): Promise<string> {
  const directory = `${process.cwd()}/public/uploads`
  const fullName = _newFileName(file, nameWithoutExtension)
  const dest = `${directory}/${fullName}`
  const src = String(file.filepath)

  const deleteExistingFiles = async (directory: string, fullName: string): Promise<void> => {
    const files = await fs.readdir(directory)
    for (const file of files) {
      const match = file.match(new RegExp(escapeRegExp(fullName) + '.*'))
      if (match !== null) {
        await fs.unlink(`${directory}/${match[0]}`)
      }
    }
  }

  await deleteExistingFiles(directory, fullName)
  await fs.copyFile(src, dest, fs.constants.COPYFILE_FICLONE)

  return `/uploads/${fullName}`
}

const _newFileName = (file: any, nameWithoutExtension: string): string => {
  let ext = file.type.split('/').at(-1)
  // check if it's a webm file - video file types have extra encoding stuff at the end so you can't use just the last element
  if (ext.includes('webm')) {
    ext = 'webm'
  }
  return `${nameWithoutExtension}.${ext}`
}

export const saveToCloudinary = async (file: any, nameWithoutExtension: string): Promise<UploadApiResponse> => {
  // first write file to the uploads directory
  // const uploadedName = await writeFile(file, nameWithoutExtension)
  // const filePath = `${directory}${uploadedName}`
  // const fileName = _newFileName(file, nameWithoutExtension)
  const filePath = String(file.filepath)
  const options = {
    use_filename: false,
    unique_filename: false,
    public_id: nameWithoutExtension,
    overwrite: true,
    resource_type: 'auto'
  }
  const result = await cloudinary.uploader.upload(filePath, options)
  return result
}

type ResourceType = 'image' | 'video'
export const deleteFromCloudinary = async (publicId: string, type: ResourceType): Promise<void> => {
  return await cloudinary.uploader.destroy(publicId, { resource_type: type })
}

function escapeRegExp (string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export const uploadHandler = unstable_composeUploadHandlers(
  unstable_createFileUploadHandler({
    maxPartSize: 10_000_000,
    file: ({ filename }) => filename
  }),
  // parse everything else into memory
  unstable_createMemoryUploadHandler()
)

interface DataObj {
  id: number
  imageMeta: UploadApiResponse | null
  videoMeta: UploadApiResponse | null
}
interface FormUploadProps {
  formData: FormData
  dataObj: DataObj
  nameSpace: string // how should we name the file? i.e. note-5.jpeg or thread-2.mp4
  onUpdate: (dataObj: DataObj) => Promise<DataObj>
}

export const handleFormUpload = async ({ formData, dataObj, nameSpace, onUpdate }: FormUploadProps): Promise<DataObj> => {
  // check if there is a video/image OR if it should be deleted
  let image, video
  let shouldUpdate = false
  if (formData.get('image') && formData.get('image') !== 'delete') {
    image = formData.get('image') as File
  }
  try {
    if (image ?? formData.get('image') === 'delete') {
      shouldUpdate = true
      // delete existing file if it exists
      if (dataObj.imageMeta?.public_id) {
        console.log('delete image', dataObj.imageMeta.public_id)
        await deleteFromCloudinary(String(dataObj.imageMeta.public_id), 'image')
      }
      if (image) {
        const imgNoExt = `${nameSpace}-${dataObj.id}-image`
        const imgMeta = await saveToCloudinary(image, imgNoExt)
        dataObj.imageMeta = imgMeta
      } else {
        dataObj.imageMeta = Prisma.DbNull
      }
    }
  } catch (error) {
    console.error('error uploading image', error)
  }
  if (formData.get('video') && formData.get('video') !== 'delete') {
    video = formData.get('video') as File
  }
  try {
    if (video ?? formData.get('video') === 'delete') {
      shouldUpdate = true
      // delete existing file if it exists
      if (dataObj.videoMeta?.public_id) {
        await deleteFromCloudinary(String(dataObj.videoMeta.public_id), 'video')
      }
      if (video) {
        const vidNoExt = `${nameSpace}-${dataObj.id}-video`
        const videoMeta = await saveToCloudinary(video, vidNoExt)
        dataObj.videoMeta = videoMeta
      } else {
        dataObj.videoMeta = Prisma.DbNull
      }
    }
  } catch (error) {
    console.error('error uploading video', error)
  }
  if (shouldUpdate) {
    await onUpdate(dataObj)
  }
  return dataObj
}
