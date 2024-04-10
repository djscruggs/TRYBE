import { useRouteLoaderData, useNavigate } from '@remix-run/react'
import FormNote from '~/components/formNote'
import CardNote from '../components/cardNote'


export default function NewNote ({ children }: { children: React.ReactNode }): JSX.Element {
  const data = useRouteLoaderData('routes/notes.$id')
  const navigate = useNavigate()
  const handleCancel = (): void => {
    navigate(-1)
  }
  return (
          <div className='max-w-[400px] mt-10  pl-4 ml-4' style={{ borderLeft: '2px solid', borderImage: 'linear-gradient(to bottom, #ffffff, #C4C4C4) 1 100%' }}>
            <FormNote replyToId={data.note.id} onCancel={handleCancel} prompt='Share your thoughts...' />
            <div className='pl-2 pt-4'>
              <CardNote note={data.note} />
            </div>
          </div>
  )
}
