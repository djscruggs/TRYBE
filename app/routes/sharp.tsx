import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from '@remix-run/node'

const inputDir = path.join(__dirname, '../public/images/icons')
const outputDir = path.join(__dirname, '../public/images/icons/resized')
const targetWidth = 150
const targetHeight = 150
export const loader: LoaderFunction = async (args) => {
  await requireCurrentUser(args)

  try {
    fs.readdir(inputDir, (err, files) => {
      if (err) throw err

      files.forEach(file => {
        const inputFile = path.join(inputDir, file)
        const outputFile = path.join(outputDir, file)

        sharp(inputFile)
          .resize(targetWidth, targetHeight, {
            fit: sharp.fit.inside,
            position: sharp.strategy.entropy
          })
          .toFile(outputFile, (err, info) => {
            if (err) throw err
          })
      })
    })
  } catch (error) {
    return { error }
  }
  return { success: true }
}
