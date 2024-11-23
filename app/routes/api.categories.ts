import { prisma } from '~/models/prisma.server'
import { json, type LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async (args) => {
  const categories = await prisma.category.findMany()
  return json({ categories }, 200)
}
