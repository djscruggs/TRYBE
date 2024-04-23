import React, { useMemo, useState, useRef, useContext } from 'react'
import { Form, useNavigate } from '@remix-run/react'
import axios from 'axios'
import { FormField } from './formField'
import { handleFileUpload } from '~/utils/helpers'
import { type Post, type ChallengeSummary } from '~/utils/types'
import { Button, Radio } from '@material-tailwind/react'
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
import { BiVideoPlus, BiVideoOff } from 'react-icons/bi'
import { TiDeleteOutline } from 'react-icons/ti'
import VideoRecorder from './videoRecorder'
import VideoPreview from './videoPreview'
import DatePicker from 'react-datepicker'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { toast } from 'react-hot-toast'

interface FormPostProps {
  afterSave?: () => void | null
  onCancel?: () => void | null
  post?: Post
  locale?: string
  challenge?: ChallengeSummary | null
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
  const { afterSave, onCancel, post, challenge, locale } = props
  const [showVideo, setShowVideo] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const navigate = useNavigate()
  const imageRef = useRef<HTMLInputElement>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [formData, setFormData] = useState(post ?? {
    published: true,
    publishAt: null,
    public: true,
    title: '',
    body: '',
    userId: currentUser?.id,
    challengeId: challenge ? challenge.id : null,
    embed: '',
    video: '',
    image: ''
  })
  const localDateFormat = locale === 'en-US' ? 'MM-dd-YYYY h:mm a' : 'dd-MM-YYYY HH:MM'
  // this triggers the browser's upload file dialog, not a modal
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
    handleFileUpload(e, setImage)
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
  const validate = (): boolean => {
    if (!formData) {
      throw new Error('no form data submitted')
    }
    console.log(formData)
    if (Number(formData?.body?.length) < 10) {
      const errors = {
        body: 'Post must be at least 10 characters long'
      }
      console.log(errors)
      setErrors(errors)
      return false
    }
    return true
  }
  const correctImageUrl = (): string => {
    if (image) {
      return URL.createObjectURL(image)
    } else if (formData.image && formData.image !== 'delete') {
      return formData.image
    }
    return ''
  }
  const deleteCorrectImage = (): void => {
    if (image) {
      setImage(null)
    }
    if (formData.image) {
      setFormData(prevFormData => ({
        ...prevFormData,
        image: 'delete'
      }))
    }
  }
  const correctVideoUrl = (): string => {
    if (video) {
      return URL.createObjectURL(video)
    } else if (formData.video) {
      return formData.video
    }
    return ''
  }
  const deleteCorrectVideo = (): void => {
    if (video) {
      setVideo(null)
    } else if (formData.video) {
      setFormData(prevFormData => ({
        ...prevFormData,
        video: 'delete'
      }))
    }
  }
  async function handleSubmit (event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!validate()) {
      console.log('not valid')
      return
    }
    try {
      setSaving(true)
      const toSubmit = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        toSubmit.set(String(key), value)
      })

      if (image) {
        toSubmit.set('image', image)
      }
      if (video) {
        toSubmit.set('video', video)
      }
      const result = await axios.post('/api/posts', toSubmit)
      toast.success('Post saved')
      if (afterSave) {
        afterSave()
      } else {
        navigate('/posts/' + result.data.id)
      }
    } catch (error) {
      console.error(error)
      toast.error(error)
    } finally {
      setSaving(false)
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
  const renderVideo = useMemo(() => (
    <VideoPreview video={formData.video ? formData.video : video} onClear={deleteCorrectVideo} />
  ), [video, formData.video])

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
          value={formData.body}
          onChange={handleChange}
          error={errors.body}
          />
        <input type="file" name="image" hidden ref={imageRef} onChange={handleImage} accept="image/*"/>

        {!showVideo && <BiVideoPlus onClick={() => { setShowVideo(true) }} className='ml-2 text-2xl cursor-pointer float-right' />}
        {showVideo && <BiVideoOff onClick={() => { setShowVideo(false) }} className='ml-2 text-2xl cursor-pointer float-right' />}
        <MdOutlineAddPhotoAlternate onClick={imageDialog} className='text-2xl cursor-pointer float-right' />

        {correctImageUrl() &&
          <div className="relative w-fit">
            <img src={correctImageUrl()} alt="image thumbnail" className='h-24 mb-2' />
            <TiDeleteOutline onClick={deleteCorrectImage} className='text-lg bg-white rounded-full text-red cursor-pointer absolute top-1 right-1' />
          </div>
        }
        {(video ?? formData.video) && !showVideo &&
          renderVideo
        }
        {showVideo &&
          <div>
            <VideoRecorder onStart={() => { setSaving(true) }} onStop={() => { setSaving(false) }} onSave={setVideo} onFinish={() => { setShowVideo(false) }} />
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
              dateFormat={localDateFormat}
              showTimeSelect
              minDate={new Date()}
              selected={formData.publishAt ?? new Date()}
              onChange={(date: Date) => { setPublishDate(date) }}
              className={`p-1 border rounded-md pl-2 w-full ${errors.publishAt ? 'border-red' : 'border-slate-gray-500'}`}
            />
          </div>
          }
        </div>
        <Button type="submit" onClick={handlePublish} className="bg-blue disabled:gray-400" disabled={saving}>
          {saving
            ? 'Publishing...'
            : 'Publish Now'
          }
        </Button>
        <Button type="submit" onClick={handleDraft} className="bg-yellow text-black ml-2 disabled:gray-400" disabled={saving}>
          {saving
            ? 'Saving'
            : formData.published ? 'Unpublish' : 'Save Draft'
          }
        </Button>
        <Button type="submit" onClick={handleCancel} className="bg-red ml-2 disabled:gray-400" disabled={saving}>
        Cancel
        </Button>

      </Form>

    </div>
  )
}
