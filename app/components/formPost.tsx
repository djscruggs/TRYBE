import React, { useMemo, useState, useRef, useContext } from 'react'
import { Form, useNavigate } from 'react-router';
import axios from 'axios'
import { FormField } from './formField'
import { handleFileUpload } from '~/utils/helpers'
import { type PostSummary, type ChallengeSummary, type Challenge } from '~/utils/types'
import pkg from '@material-tailwind/react';
const { Button, Radio, Checkbox } = pkg;
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
import { TiDeleteOutline } from 'react-icons/ti'
import VideoRecorder from './videoRecorder'
import VideoPreview from './videoPreview'
import VideoChooser from './videoChooser'
import DatePicker from 'react-datepicker'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

interface FormPostProps {
  afterSave?: (post: PostSummary) => void
  onCancel?: () => void
  publishAt?: string | null
  dayNumber?: number | null
  title?: string | null
  post?: PostSummary
  challenge?: ChallengeSummary | Challenge
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
  const { afterSave, onCancel, post, publishAt, title, notifyMembers, dayNumber } = props
  const challenge = props.challenge ?? post?.challenge
  const locale = currentUser?.locale ?? 'en-US'
  const [showVideoRecorder, setShowVideoRecorder] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [image, setImage] = useState<File | null | 'delete'>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(post?.imageMeta?.secure_url ?? null)
  const [video, setVideo] = useState<File | null | 'delete'>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(post?.videoMeta?.secure_url ?? null)
  const navigate = useNavigate()
  const showPublishAt = (challenge?.type === 'SCHEDULED' || !challenge)
  const showScheduleOptions = !challenge
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
    notificationSentOn: null,
    publishOnDayNumber: challenge?.type === 'SELF_LED' ? dayNumber : null
  })
  const [showPublishOnDayNumber] = useState(challenge?.type === 'SELF_LED')
  const postDateTimeFormat = locale === 'en-US' ? 'M-dd-yyyy @ h:mm a' : 'dd-M-yyyy @ HH:MM'
  const challengeDateFormat = locale === 'en-US' ? 'MMM d, yyyy' : 'd MMM, yyyy'
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
  const handlePublishOnDayNumber = (event: any): void => {
    const { value } = event.target
    setFormData(prevFormData => ({
      ...prevFormData,
      publishOnDayNumber: value
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
      setFile: setImage,
      setFileURL: setImageUrl
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
      setErrors(errors)
      return false
    }
    return true
  }

  const deleteImage = (): void => {
    setImage('delete')
    setImageUrl(null)
  }
  const deleteVideo = (): void => {
    setVideo('delete')
    setVideoUrl(null)
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
    <VideoPreview video={videoUrl ?? video} onClear={deleteVideo} />
  ), [video, videoUrl])
  return (

    <div className='w-full'>
      {challenge && challenge.type === 'SELF_LED' &&
          <div className='my-4 text-lg'>
            Content for Day {formData.publishOnDayNumber}
          </div>
        }

      <Form method="post" onSubmit={handleSubmit} className='pb-4'>
      <label htmlFor='title' className='text-md'>Post Title</label>
      <FormField
        name='title'
        type='text'
        placeholder='Enter a Title'
        autoFocus={true}
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

        {imageUrl &&
          <div className="relative w-fit">
            <img src={imageUrl} alt="image thumbnail" className='h-24 mb-2' />
            <TiDeleteOutline onClick={deleteImage} className='text-lg bg-white rounded-full text-red cursor-pointer absolute top-1 right-1' />
          </div>
        }
        {(video ?? videoUrl) && !showVideoRecorder &&
          renderVideo
        }
        {showVideoRecorder &&
          <div className='w-full h-full my-6'>
            <VideoRecorder uploadOnly={videoUploadOnly} onStart={() => { setSaving(true) }} onStop={() => { setSaving(false) }} onSave={setVideo} onFinish={() => { setShowVideoRecorder(false) }} />
          </div>
        }
        {challenge && ((challenge?.type === 'SCHEDULED' && formData.publishAt) ?? (challenge?.type === 'SELF_LED' && formData.publishOnDayNumber)) &&
        <div className='my-4 mt-8 rounded-md p-2 border border-red'>
          <label className="flex w-full  items-center p-0 text-red">
            {challenge?.type === 'SCHEDULED'
              ? 'Post will be sent to members on ' + format(formData.publishAt, challengeDateFormat)
              : 'Post will be sent to members on Day ' + formData.publishOnDayNumber
            }
            </label>
        </div>
        }
         {showPublishOnDayNumber &&
          <div className='my-4 mt-8 rounded-md p-2 border items-center flex flex-row'>
            <label className='mr-2'>
              Day number that post will be shown to members
            </label>
            <div className='w-[60px] '>
              <FormField
                name='publishOnDayNumber'
                type='number'
                required={true}
                maxValue={challenge?.numDays ?? undefined}
                minValue={1}
                value={formData.publishOnDayNumber}
                onChange={handlePublishOnDayNumber}
              />
            </div>
          </div>
         }

        {showScheduleOptions && showPublishAt &&
          <div className='my-4'>
            <fieldset>
            <legend>Publish:</legend>
            { formData.publishAt && (
              <div>
                <label className="flex w-full cursor-pointer items-center p-0">Publish on {format(formData.publishAt, postDateTimeFormat)}</label>
              </div>
            )}
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
                dateFormat={postDateTimeFormat}
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
                    <Checkbox defaultChecked={true} disabled={true} color="green" onClick={handleNotifyCheck} crossOrigin={undefined} label={`Emailed to members on ${format(formData.notificationSentOn, postDateTimeFormat)}`}/>
                    )}
              </div>

            }
          </div>
        }

        {challenge &&
          <Button type="submit" onClick={handlePublish} className="bg-red hover:bg-green-500 disabled:bg-gray-400" disabled={saving}>
          {saving
            ? 'Saving...'
            : challenge?.type === 'SELF_LED' ? 'Save' : 'Schedule'
          }
          </Button>
        }
        {!challenge &&
          <>
            <Button type="submit" onClick={handlePublish} className="bg-red hover:bg-green-500 disabled:bg-gray-400" disabled={saving}>
              {saving
                ? 'Publishing...'
                : challenge?.type === 'SELF_LED' ? 'Save' : formData.publishAt ? 'Schedule' : 'Publish Now'
              }
            </Button>
            <Button type="submit" onClick={handleDraft} className="bg-grey text-white ml-2 hover:bg-green-500 disabled:bg-gray-400" disabled={saving}>
              {saving
                ? 'Saving'
                : post?.id && post?.published ? 'Unpublish' : 'Save Draft'
              }
            </Button>
          </>
        }
        <button onClick={handleCancel} className="mt-2 text-sm underline ml-4 hover:text-red">cancel</button>

      </Form>

    </div>
  )
}
