import { requireCurrentUser } from '../models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import FormNote from '~/components/form-note'
import { prisma } from '../models/prisma.server'
import CardNote from '../components/cardNote'
import React from 'react'
export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  console.log('in quote loader')
  const currentUser = await requireCurrentUser(args)
  const { params } = args
  if (!params.id) {
    throw new Error('Id of note to quote is required')
  }

  const quote = await prisma.note.findUnique({
    where: {
      id: parseInt(params.id)
    }
  })
  return json({ quote })
}

export default function NewNote ({ children }: { children: React.ReactNode }): JSX.Element {
  const data = useLoaderData()
  const { quote } = data
  console.log(data)
  const navigate = useNavigate()
  const handleCancel = (): void => {
    navigate(-1)
  }
  return (
          <div className='max-w-[400px] mt-10  pl-4 ml-4' style={{ borderLeft: '2px solid', borderImage: 'linear-gradient(to bottom, #ffffff, #C4C4C4) 1 100%' }}>
            <FormNote replyToId={quote.id} onCancel={handleCancel} prompt='Share your thoughts...' />
            <div className='pl-2 pt-4'>
              <CardNote note={quote} />
            </div>
          </div>
  )
}
