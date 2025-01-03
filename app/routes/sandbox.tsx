import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction } from '@remix-run/node'
import { prisma } from '~/models/prisma.server'
// const ogs = require('open-graph-scraper')
// const options = { url: 'http://ogp.me/' }
export const loader: LoaderFunction = async (args) => {
  const user = await requireCurrentUser(args)

  // const data = await ogs(options)
  // const { error, html, result } = data
  // console.log('error:', error) // This returns true or false. True if there was an error. The error itself is inside the result object.
  // console.log('html:', html) // This contains the HTML of page
  // console.log('result:', result) // This contains all of the Open Graph results
  const data = [

  ]
  // const result = await prisma.post.createMany({ data })
  return {
    data
  }
}
