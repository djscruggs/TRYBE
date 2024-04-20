import React, { useState, useRef } from 'react'
import { Form, useNavigate } from '@remix-run/react'
import axios from 'axios'
import { FormField } from './formField'
import { handleImageUpload } from '~/utils/helpers'
import CardChallenge from './cardChallenge'
import { type Note, type Challenge } from '~/utils/types'
import { Button } from '@material-tailwind/react'
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
import { BiVideoPlus, BiVideoOff } from 'react-icons/bi'
import { TiDeleteOutline } from 'react-icons/ti'
import VideoRecorder from './videoRecorder'

interface FormNoteProps {
  afterSave?: () => void
  onCancel?: () => void
  note?: Note
  challenge?: Challenge
  replyToId?: number
  prompt?: string
  isShare?: boolean
  forwardRef?: React.RefObject<HTMLTextAreaElement>
}

export default function FormNote (props: FormNoteProps): JSX.Element {
  let { afterSave, onCancel, note, challenge, prompt, replyToId } = props
  if (note?.challenge) {
    challenge = note.challenge
  }
  const [showVideo, setShowVideo] = useState(false)
  const placeholder = prompt ?? 'What\'s on your mind?'
  const [body, setBody] = useState(note?.body || '')
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const imageRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileDataURL, setFileDataURL] = useState<string | null>(note?.image ? note.image : null)
  const [video, setVideo] = useState<File | null>(null)
  const imageDialog = (): void => {
    if (imageRef.current) {
      imageRef.current.click()
    }
  }
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>): void => {
    handleImageUpload(e, setFile, setFileDataURL)
  }

  async function handleSubmit (ev: React.FormEvent<HTMLFormElement>): Promise<void> {
    ev.preventDefault()
    if (body.length < 10) {
      setError('Note must be at least 10 characters long')
    }

    const formData = new FormData()
    formData.append('body', body)
    if (note) {
      formData.append('id', note.id.toString())
    }
    if (note) {
      formData.append('id', note.id.toString())
    }
    if (replyToId) {
      formData.append('replyToId', replyToId.toString())
      formData.append('isShare', 'true')
    }
    if (challenge) {
      formData.append('challengeId', challenge.id.toString())
    }
    if (file) {
      formData.append('image', file)
    }
    const result = await axios.post('/api/notes', formData)
    setBody('')
    setFile(null)
    setFileDataURL(null)
    if (afterSave) {
      afterSave()
    } else {
      navigate('/notes/' + result.data.id)
    }
  }
  const handleCancel = (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    ev.preventDefault()
    setBody('')
    setFile(null)
    setFileDataURL(null)
    setVideo(null)
    if (onCancel) {
      onCancel()
    }
  }
  console.log('parent video is', video)
  return (
    <div className='w-full'>
      <Form method="post" onSubmit={handleSubmit}>
      <FormField
          name='note'
          autoResize={true}
          placeholder={placeholder}
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
        <input type="file" name="image" hidden ref={imageRef} onChange={handleImage} accept="image/*"/>

        {!showVideo && <BiVideoPlus onClick={() => { setShowVideo(true) }} className='ml-2 text-2xl cursor-pointer float-right' />}
        {showVideo && <BiVideoOff onClick={() => { setShowVideo(false) }} className='ml-2 text-2xl cursor-pointer float-right' />}
        <MdOutlineAddPhotoAlternate onClick={imageDialog} className='text-2xl cursor-pointer float-right' />

        {fileDataURL &&
          <div className="relative w-fit">
            <img src={fileDataURL} alt="image thumbnail" className='h-24 mb-2' />
            <TiDeleteOutline onClick={() => { setFile(null); setFileDataURL(null) }} className='text-lg bg-white rounded-full text-red cursor-pointer absolute top-1 right-1' />
          </div>
        }
        {video && !showVideo &&
          <div className="relative w-fit">
            <video src={URL.createObjectURL(video)} className='h-24 mb-2' />
            <TiDeleteOutline onClick={() => { setVideo(null) }} className='text-lg bg-white rounded-full text-red cursor-pointer absolute top-1 right-1' />
          </div>
        }
        {showVideo &&
          <div className='mt-6'>
            <VideoRecorder onStart={() => { setBtnDisabled(true) }} onStop={() => { setBtnDisabled(false) }} onSave={setVideo} onFinish={() => { setShowVideo(false) }} />
          </div>
        }
        <Button type="submit" placeholder='Save' className="bg-red disabled:gray-400" disabled={btnDisabled}>
          {btnDisabled
            ? 'Recording...'
            : 'Save'
          }
        </Button>
        {(video || body || file) &&
          <button onClick={handleCancel} className="mt-2 text-sm underline ml-2">cancel</button>
        }
        {challenge && <CardChallenge challenge={challenge} isShare={true}/>}

      </Form>

    </div>
  )
}
