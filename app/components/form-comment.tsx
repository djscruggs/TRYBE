import React, { useState } from 'react'
import { Form, useNavigate } from '@remix-run/react'
import axios from 'axios'
import { FormField } from './form-field'
import { Button } from '@material-tailwind/react'
interface FormCommentProps {
  challengeId: string | number
  revalidate?: () => void
}

export default function FormComment (props: FormCommentProps): JSX.Element {
  const [body, setBody] = useState('')
  const [challengeId, setChallengeId] = useState(props.challengeId)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit (ev: FormEvent<HTMLFormElement>): void {
    ev.preventDefault()
    if (body.length < 10) {
      setError('Comment must be at least 10 characters long')
    }
    const formData = new FormData()
    formData.append('body', body)
    formData.append('challengeId', String(challengeId))
    await axios.post('/api/comments', formData)
    setBody('')
    if (props.revalidate) {
      props.revalidate()
    } else {
      navigate('.')
    }
  }

  return (
    <div className='w-80'>
      <Form method="post" onSubmit={handleSubmit}>
      <FormField
          name='comment'
          placeholder='Enter comment'
          type='textarea'
          rows={3}
          required={true}
          value={body}
          onChange={(ev) => {
            setBody(String(ev.target.value))
            return ev.target.value
          }}
          error={error}
          />

        <Button type="submit" placeholder='Save' className="bg-red">Save</Button>
      </Form>
    </div>
  )
}
