import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { FormField } from '~/components/formField'
import { type ChallengeWithHost } from '~/utils/types'
import { toast } from 'react-hot-toast'
import { Button } from '@material-tailwind/react'
import { loadChallengeWithHost } from '~/models/challenge.server'
import { type LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export const loader: LoaderFunction = async (args): Promise<ChallengeWithHost | null | { loadingError: string }> => {
  const { params } = args
  console.log(params)
  if (!params.id) {
    return null
  }
  const challenge: ChallengeWithHost | null = await loadChallengeWithHost(Number(params.id))
  if (!challenge) {
    const error = { loadingError: 'Challenge not found' }
    return error
  }
  return challenge
}
export default function Contact (): JSX.Element {
  const challenge = useLoaderData<typeof loader>()
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const [subject, setSubject] = useState(`Question about ${challenge.name}`)
  const [body, setBody] = useState('')
  const [btnDisabled, setBtnDisabled] = useState(false)
  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()
    try {
      setBtnDisabled(true)
      const response = await axios.post('/api/contact', { subject, body, currentUser })
      if (response.data.success) {
        toast.success('Message sent successfully!')
        setSubject('')
        setBody('')
      } else {
        toast.error('Message send failed!')
      }
    } catch (error) {
      toast.error(String(error))
    } finally {
      setBtnDisabled(false)
    }
  }
  const handleCancel = (): void => {
    navigate(-1)
  }
  return (
    <div className='mt-4  w-96'>
      <form onSubmit={handleSubmit}>
        <div className='mb-2'>
          <label htmlFor="subject">Subject</label>
          <FormField
            name='subject'
            placeholder='Enter subject'
            type='text'
            required={true}
            value={subject}
            onChange={(ev: React.ChangeEvent<HTMLTextAreaElement>) => {
              setSubject(String(ev.target.value))
              return ev.target.value
            }}
          />
        </div>
        <div className='mb-2'>
          <label htmlFor="body">Body</label>
          <FormField
            name='body'
            autoResize={true}
            placeholder='Enter your message'
            type='textarea'
            rows={4}
            required={true}
            value={body}
            onChange={(ev: React.ChangeEvent<HTMLTextAreaElement>) => {
              setBody(String(ev.target.value))
              return ev.target.value
            }}
          />
        </div>
        <Button type="submit" placeholder='Save' className="bg-red disabled:gray-400" disabled={btnDisabled}>
          Send Message
        </Button>

          <span onClick={handleCancel} className="mt-2 text-sm underline ml-2 cursor-pointer hover:text-red">cancel</span>

      </form>
    </div>
  )
}
