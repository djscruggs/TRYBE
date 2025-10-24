import { prisma } from '~/models/prisma.server'
import { type LoaderFunction } from 'react-router';

export const loader: LoaderFunction = async (args) => {
  const categories = await prisma.category.findMany()
  return Response.Response.json({ categories }, { status: 200 })
}
