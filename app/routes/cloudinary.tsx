import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from '@remix-run/node'

// Require the cloudinary library
import { v2 as cloudinary } from 'cloudinary'

// Return "https" URLs by setting secure: true
cloudinary.config({
  secure: true
})

// Log the configuration

export const loader: LoaderFunction = async (args) => {
  await requireCurrentUser(args)
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    resource_type: 'auto'
  }
  const imagePath = process.cwd() + '/public/uploads/note-42-image.png'
  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(imagePath, options)
    return { result }
  } catch (error) {
    console.error(error)
    return { error }
  }
}
