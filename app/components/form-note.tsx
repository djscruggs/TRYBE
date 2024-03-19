import React, { useState } from 'react'
import { Form, useNavigate } from '@remix-run/react'
import axios from 'axios'
import { FormField } from './form-field'
import { Button } from '@material-tailwind/react'
interface FormCommentProps {
  challengeId: string | number
  afterSave?: () => void
  onCancel?: () => void
}

export default function FormNote (props: FormCommentProps): JSX.Element {
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit (ev: React.FormEvent<HTMLFormElement>): Promise<void> {
    ev.preventDefault()
    if (body.length < 10) {
      setError('Note must be at least 10 characters long')
    }
    const formData = new FormData()
    formData.append('body', body)
    console.log('formData', formData)
    const result = await axios.post('/api/notes', formData)
    console.log('result', result)
    console.log(result)
    setBody('')
    if (props.afterSave) {
      props.afterSave()
    } else {
      navigate('.')
    }
  }
  const handleCancel = (ev: React.FormEvent<HTMLFormElement>): void => {
    ev.preventDefault()
    if (props.onCancel) {
      props.onCancel()
    }
  }
  return (
    <div className='w-full'>
      <Form method="post" onSubmit={handleSubmit}>
      <FormField
          name='note'
          placeholder="What's on your mind?"
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
        {props.onCancel && (
          <button onClick={handleCancel} className="mt-2 text-sm underline ml-2">cancel</button>
        )}

      </Form>
    </div>
  )
}
