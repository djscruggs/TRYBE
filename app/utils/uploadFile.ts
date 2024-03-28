import { promises as fs } from 'fs'
import { unstable_composeUploadHandlers, unstable_createFileUploadHandler, unstable_createMemoryUploadHandler } from '@remix-run/node'

export async function writeFile (file: any, nameWithoutExtension: string): Promise<string> {
  const ext = file.type.split('/').at(-1)
  const fullName = `${nameWithoutExtension}.${ext}`
  const directory = `${process.cwd()}/public/uploads`
  const src = file.filepath
  const dest = `${directory}/${fullName}`

  const deleteExistingFiles = async (directory: string, fullName: string) => {
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
function escapeRegExp (string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export const uploadHandler = unstable_composeUploadHandlers(
  unstable_createFileUploadHandler({
    maxPartSize: 5_000_000,
    file: ({ filename }) => filename
  }),
  // parse everything else into memory
  unstable_createMemoryUploadHandler()
)
