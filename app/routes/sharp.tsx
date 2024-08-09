import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from '@remix-run/node'

const inputDir = path.join(__dirname, '../public/images/icons')
console.log('inputDir', inputDir)
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
        console.log(inputFile)
        const outputFile = path.join(outputDir, file)

        sharp(inputFile)
          .resize(targetWidth, targetHeight, {
            fit: sharp.fit.inside,
            position: sharp.strategy.entropy
          })
          .toFile(outputFile, (err, info) => {
            if (err) throw err
            console.log(`Processed ${file}:`, info)
          })
      })
    })
  } catch (error) {
    return { error }
  }
  return { success: true }
}
