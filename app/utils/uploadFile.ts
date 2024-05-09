import { promises as fs } from 'fs'
import { unstable_composeUploadHandlers, unstable_createFileUploadHandler, unstable_createMemoryUploadHandler } from '@remix-run/node'
import { v2 as cloudinary } from 'cloudinary'
import type { UploadApiResponse } from 'cloudinary'

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
  await cloudinary.uploader.destroy(publicId, { resource_type: type })
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
