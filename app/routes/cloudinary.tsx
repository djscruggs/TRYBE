import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction } from '@remix-run/node'

// Require the cloudinary library
const cloudinary = require('cloudinary').v2

// Return "https" URLs by setting secure: true
cloudinary.config({
  secure: true
})

// Log the configuration
console.log(cloudinary.config())

export const loader: LoaderFunction = async (args) => {
  await requireCurrentUser(args)
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    resource_type: 'auto'
  }
  const imagePath = process.cwd() + '/public/uploads/post-video-38.webm'
  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(imagePath, options)
    console.log(result)
    return { result }
  } catch (error) {
    console.error(error)
    return { error }
  }
}
