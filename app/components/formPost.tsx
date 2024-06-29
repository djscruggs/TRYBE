import React, { useMemo, useState, useRef, useContext } from 'react'
import { Form, useNavigate } from '@remix-run/react'
import axios from 'axios'
import { FormField } from './formField'
import { handleFileUpload } from '~/utils/helpers'
import { type PostSummary, type ChallengeSummary } from '~/utils/types'
import { Button, Radio, Checkbox } from '@material-tailwind/react'
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
import { TiDeleteOutline } from 'react-icons/ti'
import VideoRecorder from './videoRecorder'
import VideoPreview from './videoPreview'
import VideoChooser from './videoChooser'
import DatePicker from 'react-datepicker'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

interface FormPostProps {
  afterSave?: (post: PostSummary) => void
  onCancel?: () => void
  publishAt?: string | null
  title?: string | null
  post?: PostSummary
  challenge?: ChallengeSummary | null
  notifyMembers?: boolean
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
  const { afterSave, onCancel, post, challenge, publishAt, title, notifyMembers } = props
  const locale = currentUser?.locale ?? 'en-US'
  const [showVideoRecorder, setShowVideoRecorder] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const navigate = useNavigate()
  const imageRef = useRef<HTMLInputElement>(null)
  const [videoUploadOnly, setVideoUploadOnly] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(Boolean(post?.publishAt) || Boolean(publishAt))
  const [formData, setFormData] = useState(post ?? {
    published: true,
    publishAt: publishAt ? new Date(publishAt) : null,
    public: true,
    title: title ?? '',
    body: '',
    userId: currentUser?.id,
    challengeId: challenge ? challenge.id : null,
    embed: '',
    video: '',
    image: '',
    notifyMembers,
    notificationSentOn: null
  })
  const localDateTimeFormat = locale === 'en-US' ? 'M-dd-yyyy @ h:mm a' : 'dd-M-yyyy @ HH:MM'
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
  const handleNotifyCheck = (event: any): void => {
    const { checked } = event.target
    setFormData(prevFormData => ({
      ...prevFormData,
      notifyMembers: checked
    }))
  }
  const handleImage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const params = {
      event,
      setFile: setImage
    }
    handleFileUpload(params)
  }
  const videoChooserCallbackShow = (uploadOnly: boolean): void => {
    if (uploadOnly) {
      setVideoUploadOnly(true)
    } else {
      setVideoUploadOnly(uploadOnly)
    }
    setShowVideoRecorder(true)
  }
  const videoChooserCallbackHide = (): void => {
    setShowVideoRecorder(false)
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
    if (Number(formData?.body?.length) < 10) {
      const errors = {
        body: 'Post must be at least 10 characters long'
      }
      console.error(errors)
      setErrors(errors)
      return false
    }
    return true
  }
  const correctImageUrl = (): string => {
    // if image (file object) is set that means user attached a new image instead of existing url in db
    if (image) {
      return URL.createObjectURL(image)
    }
    if (formData.image && formData.image !== 'delete') {
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
      return
    }
    try {
      setSaving(true)
      const toSubmit = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        toSubmit.set(String(key), value)
      })

      // these are blob objects  to upload
      if (image) {
        toSubmit.set('image', image)
      }
      if (video) {
        toSubmit.set('video', video)
      }
      const result = await axios.post('/api/posts', toSubmit)
      toast.success('Post saved')
      if (afterSave) {
        afterSave(result.data as PostSummary)
      } else {
        navigate('/posts/' + result.data.id)
      }
    } catch (error) {
      console.error(error)
      toast.error(String(error))
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
  const setPublishAt = (value: any): void => {
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

      <Form method="post" onSubmit={handleSubmit} className='pb-4'>
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

        <VideoChooser recorderShowing={showVideoRecorder} showRecorder={videoChooserCallbackShow} hideRecorder={videoChooserCallbackHide} />
        <MdOutlineAddPhotoAlternate onClick={imageDialog} className='text-2xl cursor-pointer float-right' />

        {correctImageUrl() &&
          <div className="relative w-fit">
            <img src={correctImageUrl()} alt="image thumbnail" className='h-24 mb-2' />
            <TiDeleteOutline onClick={deleteCorrectImage} className='text-lg bg-white rounded-full text-red cursor-pointer absolute top-1 right-1' />
          </div>
        }
        {(video ?? formData.video) && !showVideoRecorder &&
          renderVideo
        }
        {showVideoRecorder &&
          <div className='w-full h-full my-6'>
            <VideoRecorder uploadOnly={videoUploadOnly} onStart={() => { setSaving(true) }} onStop={() => { setSaving(false) }} onSave={setVideo} onFinish={() => { setShowVideoRecorder(false) }} />
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
              name='publishAt'
              required={true}
              dateFormat={localDateTimeFormat}
              showTimeSelect
              minDate={new Date()}
              selected={formData.publishAt ? new Date(formData.publishAt) : null}
              onChange={(date: Date) => { setPublishAt(date) }}
              className={`p-1 border rounded-md pl-2 w-full ${errors.publishAt ? 'border-red' : 'border-slate-gray-500'}`}
            />
          </div>
          }
          {formData.challengeId &&
            <div className='my-4'>
              {!formData.notificationSentOn
                ? (
                <>
                <Checkbox defaultChecked={formData.notifyMembers ?? false} color="green" onClick={handleNotifyCheck} crossOrigin={undefined} label={'Email this post to challenge members.'}/>
                {formData.notifyMembers && currentUser &&
                <p className='ml-12 text-xs'>Replies will go to {currentUser.email}</p>
                }
                </>
                  )
                : (
                  <Checkbox defaultChecked={true} disabled={true} color="green" onClick={handleNotifyCheck} crossOrigin={undefined} label={`Emailed to members on ${format(formData.notificationSentOn, localDateTimeFormat)}`}/>
                  )}
            </div>

          }
        </div>
        <Button type="submit" onClick={handlePublish} className="bg-red hover:bg-green-500 disabled:bg-gray-400" disabled={saving}>
          {saving
            ? 'Publishing...'
            : formData.publishAt ? 'Schedule' : 'Publish Now'
          }
        </Button>
        <Button type="submit" onClick={handleDraft} className="bg-grey text-white ml-2 hover:bg-green-500 disabled:bg-gray-400" disabled={saving}>
          {saving
            ? 'Saving'
            : post?.id && post?.published ? 'Unpublish' : 'Save Draft'
          }
        </Button>
        <button onClick={handleCancel} className="mt-2 text-sm underline ml-4 hover:text-red">cancel</button>

      </Form>

    </div>
  )
}
