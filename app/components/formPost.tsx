import React, { useState, useRef, useContext } from 'react'
import { Form, useNavigate } from '@remix-run/react'
import axios from 'axios'
import { FormField } from './formField'
import { handleImageUpload } from '~/utils/helpers'
import { type Post, type ChallengeSummary } from '~/utils/types'
import { Button, Radio } from '@material-tailwind/react'
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
import { BiVideoPlus, BiVideoOff } from 'react-icons/bi'
import { TiDeleteOutline } from 'react-icons/ti'
import VideoRecorder from './videoRecorder'
import DatePicker from 'react-datepicker'
import { CurrentUserContext } from '../utils/CurrentUserContext'

interface FormPostProps {
  afterSave?: () => void
  onCancel?: () => void
  post?: Post
  challenge: ChallengeSummary | null
  forwardRef?: React.RefObject<HTMLTextAreaElement>
}
interface Errors {
  title?: string
  body?: string
  published?: string
  publishAt?: string
  embed?: string
  image?: string
  video?: string
}

export default function FormPost (props: FormPostProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const { afterSave, onCancel, post, challenge } = props
  const [showVideo, setShowVideo] = useState(false)
  const [body, setBody] = useState(post?.body ?? '')
  const [errors, setErrors] = useState<Errors>({})
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [error, setError] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const navigate = useNavigate()
  const imageRef = useRef<HTMLInputElement>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [formData, setFormData] = useState(post ?? {
    published: true,
    publishAt: null,
    title: '',
    body: '',
    userId: currentUser?.id,
    challengeId: challenge ? challenge.Id : null,
    embed: '',
    video: '',
    image: ''
  })
  const imageDialog = (): void => {
    if (imageRef.current) {
      imageRef.current.click()
    }
  }
  const handleChange = (event: any): void => {
    const { name, value } = event.target
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }))
  }
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>): void => {
    handleImageUpload(e, setImage)
  }
  const handlePublish = (event: any): void => {
    setFormData(prevFormData => ({
      ...prevFormData,
      published: true
    }))
  }
  const handleDraft = (event: any): void => {
    setFormData(prevFormData => ({
      ...prevFormData,
      published: false
    }))
  }
  async function handleSubmit (event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    console.log(formData)
    if (formData?.body.length < 10) {
      setError('Post must be at least 10 characters long')
    }

    const formData2 = new FormData()
    formData2.append('body', body)
    if (post?.id) {
      formData2.append('id', post.id.toString())
    }
    if (challenge?.id) {
      formData2.append('challengeId', challenge.id.toString())
    }
    if (image) {
      formData2.append('image', image)
    }
    console.log('submitting')
    return null
    const result = await axios.post('/api/posts', formData)
    if (afterSave) {
      afterSave()
    } else {
      navigate('/posts/' + result.data.id)
    }
  }

  const handlePublishAt = (event: any): void => {
    if (event?.target?.value === 'immediately') {
      setFormData(prevFormData => ({
        ...prevFormData,
        publishAt: null
      }))
      setShowDatePicker(false)
    } else {
      setShowDatePicker(true)
      setFormData(prevFormData => ({
        ...prevFormData
      }))
    }
  }
  const setPublishDate = (value: any): void => {
    console.log('datetime is', value)
    setFormData(prevFormData => ({
      ...prevFormData,
      publishAt: value
    }))
  }
  const handleCancel = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    event.preventDefault()
    if (onCancel) {
      onCancel()
    } else {
      navigate(-1)
    }
  }
  return (
    <div className='w-full'>
      <Form method="post" onSubmit={handleSubmit}>
      <FormField
        name='title'
        type='text'
        placeholder='Enter a Title'
        required={true}
        value={formData.title}
        onChange={handleChange}
      />
      <FormField
          name='body'
          autoResize={true}
          type='textarea'
          placeholder='Enter the text of your post'
          rows={10}
          required={true}
          value={body}
          onChange={(event) => {
            setBody(String(event.target.value))
            return event.target.value
          }}
          error={error}
          />
        <input type="file" name="image" hidden ref={imageRef} onChange={handleImage} accept="image/*"/>

        {!showVideo && <BiVideoPlus onClick={() => { setShowVideo(true) }} className='ml-2 text-2xl cursor-pointer float-right' />}
        {showVideo && <BiVideoOff onClick={() => { setShowVideo(false) }} className='ml-2 text-2xl cursor-pointer float-right' />}
        <MdOutlineAddPhotoAlternate onClick={imageDialog} className='text-2xl cursor-pointer float-right' />

        {image &&
          <div className="relative w-fit">
            <img src={URL.createObjectURL(image)} alt="image thumbnail" className='h-24 mb-2' />
            <TiDeleteOutline onClick={() => { setImage(null) }} className='text-lg bg-white rounded-full text-red cursor-pointer absolute top-1 right-1' />
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
        <div className='my-4'>
          <fieldset>
          <legend>Publish:</legend>
          <label className="flex w-full cursor-pointer items-center p-0">
            <Radio name="publishAt" value="immediately" onClick={handlePublishAt} defaultChecked={!showDatePicker} crossOrigin={undefined}/>
            Immediately
          </label>
          <label className="flex w-full cursor-pointer items-center px-0 py-2">
            <Radio name="publishAt" value="date" onClick={handlePublishAt} defaultChecked={showDatePicker} crossOrigin={undefined}/>
            On Date
          </label>
          </fieldset>
          {showDatePicker &&
          <div className='w-full border border-gray-50 inline'>
            <DatePicker
              name='startAt'
              required={true}
              dateFormat="MM-dd-YYYY h:mm:ss a"
              showTimeSelect
              minDate={new Date()}
              selected={formData.publishAt ?? new Date()}
              onChange={(date: Date) => { setPublishDate(date) }}
              className={`p-1 border rounded-md pl-2 w-full ${errors.publishAt ? 'border-red' : 'border-slate-gray-500'}`}
            />
          </div>
          }
        </div>
        <Button type="submit" onClick={handlePublish} className="bg-blue disabled:gray-400" disabled={btnDisabled}>
          {btnDisabled
            ? 'Publishing...'
            : 'Publish Now'
          }
        </Button>
        <Button type="submit" onClick={handleDraft} className="bg-yellow text-black ml-2 disabled:gray-400" disabled={btnDisabled}>
        Save Draft
        </Button>
        <Button type="submit" onClick={handleCancel} className="bg-red ml-2 disabled:gray-400" disabled={btnDisabled}>
        Cancel
        </Button>

      </Form>

    </div>
  )
}
