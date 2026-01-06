import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import React, {
  useMemo,
  useState,
  useRef,
  useContext,
  useEffect,
  type JSX
} from 'react'
import { Form, useNavigate, useFetcher } from 'react-router'
import { FormField } from './formField'
import { handleFileUpload } from '~/utils/helpers'
import {
  type PostSummary,
  type ChallengeSummary,
  type Challenge
} from '~/utils/types'
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

export default function FormPost(props: FormPostProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const {
    afterSave,
    onCancel,
    post,
    publishAt,
    title,
    notifyMembers,
    dayNumber
  } = props
  const challenge = props.challenge ?? post?.challenge
  const locale = currentUser?.locale ?? 'en-US'
  const [showVideoRecorder, setShowVideoRecorder] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [image, setImage] = useState<File | null | 'delete'>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(
    post?.imageMeta?.secure_url ?? null
  )
  const [video, setVideo] = useState<File | null | 'delete'>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(
    post?.videoMeta?.secure_url ?? null
  )
  const navigate = useNavigate()
  const fetcher = useFetcher()

  // Handle fetcher response
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setSaving(false)
      if (fetcher.data.error) {
        toast.error(fetcher.data.error)
      } else {
        toast.success('Post saved')
        if (afterSave) {
          afterSave(fetcher.data as PostSummary)
        } else {
          navigate('/posts/' + fetcher.data.id)
        }
      }
    }
  }, [fetcher.state, fetcher.data, afterSave, navigate])
  const showPublishAt = challenge?.type === 'SCHEDULED' || !challenge
  const showScheduleOptions = !challenge
  const imageRef = useRef<HTMLInputElement>(null)
  const [videoUploadOnly, setVideoUploadOnly] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(
    Boolean(post?.publishAt) || Boolean(publishAt)
  )
  const [formData, setFormData] = useState(
    post ?? {
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
    }
  )
  const [showPublishOnDayNumber] = useState(challenge?.type === 'SELF_LED')
  const postDateTimeFormat =
    locale === 'en-US' ? 'M-dd-yyyy @ h:mm a' : 'dd-M-yyyy @ HH:MM'
  const challengeDateFormat = locale === 'en-US' ? 'MMM d, yyyy' : 'd MMM, yyyy'
  // this triggers the browser's upload file dialog, not a modal
  const imageDialog = (): void => {
    if (imageRef.current) {
      imageRef.current.click()
    }
  }
  const handleChange = (event: any): void => {
    const { name, value } = event.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }))
  }
  const handlePublishOnDayNumber = (event: any): void => {
    const { value } = event.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      publishOnDayNumber: value
    }))
  }
  const handleNotifyCheck = (event: any): void => {
    const { checked } = event.target
    setFormData((prevFormData) => ({
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
    setFormData((prevFormData) => ({
      ...prevFormData,
      published: true
    }))
  }
  const handleDraft = (event: any): void => {
    setFormData((prevFormData) => ({
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
  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!validate()) {
      return
    }
    setSaving(true)

    const form = event.currentTarget
    const formData = new FormData(form)

    // Add the file inputs to FormData
    if (image && image !== 'delete') {
      formData.set('image', image)
    } else if (image === 'delete') {
      formData.set('image', 'delete')
    }

    if (video && video !== 'delete') {
      formData.set('video', video)
    } else if (video === 'delete') {
      formData.set('video', 'delete')
    }

    // Submit using fetcher which properly handles multipart/form-data
    fetcher.submit(formData, {
      method: 'post',
      action: '/api/posts',
      encType: 'multipart/form-data'
    })
  }

  const handlePublishAt = (event: any): void => {
    if (event?.target?.value === 'immediately') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        publishAt: null
      }))
      setShowDatePicker(false)
    } else {
      setShowDatePicker(true)
      setFormData((prevFormData) => ({
        ...prevFormData
      }))
    }
  }

  const setPublishAt = (value: any): void => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      publishAt: value
    }))
  }
  const handleCancel = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    event.preventDefault()
    if (onCancel) {
      onCancel()
    } else {
      navigate(-1)
    }
  }
  const renderVideo = useMemo(
    () => <VideoPreview video={videoUrl ?? video} onClear={deleteVideo} />,
    [video, videoUrl]
  )
  return (
    <div className="w-full">
      {challenge && challenge.type === 'SELF_LED' && (
        <div className="my-4 text-lg">
          Content for Day {formData.publishOnDayNumber}
        </div>
      )}

      <Form
        method="post"
        encType="multipart/form-data"
        onSubmit={handleSubmit}
        className="pb-4"
      >
        <label htmlFor="title" className="text-md">
          Post Title
        </label>
        <FormField
          name="title"
          type="text"
          placeholder="Enter a Title"
          autoFocus={true}
          required={true}
          value={formData.title}
          onChange={handleChange}
        />
        <FormField
          name="body"
          autoResize={true}
          type="textarea"
          placeholder="Enter the text of your post"
          rows={10}
          required={true}
          value={formData.body}
          onChange={handleChange}
          error={errors.body}
        />
        <input
          type="file"
          name="image"
          hidden
          ref={imageRef}
          onChange={handleImage}
          accept="image/*"
        />

        <VideoChooser
          recorderShowing={showVideoRecorder}
          showRecorder={videoChooserCallbackShow}
          hideRecorder={videoChooserCallbackHide}
        />
        <MdOutlineAddPhotoAlternate
          onClick={imageDialog}
          className="text-2xl cursor-pointer float-right"
        />

        {imageUrl && (
          <div className="relative w-fit">
            <img src={imageUrl} alt="image thumbnail" className="h-24 mb-2" />
            <TiDeleteOutline
              onClick={deleteImage}
              className="text-lg bg-white rounded-full text-red cursor-pointer absolute top-1 right-1"
            />
          </div>
        )}
        {(video ?? videoUrl) && !showVideoRecorder && renderVideo}
        {showVideoRecorder && (
          <div className="w-full h-full my-6">
            <VideoRecorder
              uploadOnly={videoUploadOnly}
              onStart={() => {
                setSaving(true)
              }}
              onStop={() => {
                setSaving(false)
              }}
              onSave={setVideo}
              onFinish={() => {
                setShowVideoRecorder(false)
              }}
            />
          </div>
        )}
        {challenge &&
          ((challenge?.type === 'SCHEDULED' && formData.publishAt) ??
            (challenge?.type === 'SELF_LED' &&
              formData.publishOnDayNumber)) && (
            <div className="my-4 mt-8 rounded-md p-2 border border-red">
              <label className="flex w-full  items-center p-0 text-red">
                {challenge?.type === 'SCHEDULED'
                  ? 'Post will be sent to members on ' +
                    (formData.publishAt
                      ? format(formData.publishAt, challengeDateFormat)
                      : 'N/A')
                  : 'Post will be sent to members on Day ' +
                    formData.publishOnDayNumber}
              </label>
            </div>
          )}
        {showPublishOnDayNumber && (
          <div className="my-4 mt-8 rounded-md p-2 border items-center flex flex-row">
            <label className="mr-2">
              Day number that post will be shown to members
            </label>
            <div className="w-[60px] ">
              <FormField
                name="publishOnDayNumber"
                type="number"
                required={true}
                maxValue={challenge?.numDays ?? undefined}
                minValue={1}
                value={formData.publishOnDayNumber}
                onChange={handlePublishOnDayNumber}
              />
            </div>
          </div>
        )}

        {showScheduleOptions && showPublishAt && (
          <div className="my-4">
            <fieldset>
              <legend>Publish:</legend>
              {formData.publishAt && (
                <div>
                  <label className="flex w-full cursor-pointer items-center p-0">
                    Publish on {format(formData.publishAt, postDateTimeFormat)}
                  </label>
                </div>
              )}
              <RadioGroup
                defaultValue={showDatePicker ? 'date' : 'immediately'}
                onValueChange={(value) => {
                  handlePublishAt({ target: { value } } as any)
                }}
                className="grid grid-cols-2 gap-2"
              >
                <label className="flex w-full cursor-pointer items-center p-0">
                  <RadioGroupItem value="immediately" className="mr-2" />
                  Immediately
                </label>
                <label className="flex w-full cursor-pointer items-center px-0 py-2">
                  <RadioGroupItem value="date" className="mr-2" />
                  On Date
                </label>
              </RadioGroup>
            </fieldset>
            {showDatePicker && (
              <div className="w-full border border-gray-50 inline">
                <DatePicker
                  name="publishAt"
                  required={true}
                  dateFormat={postDateTimeFormat}
                  showTimeSelect
                  minDate={new Date()}
                  selected={
                    formData.publishAt ? new Date(formData.publishAt) : null
                  }
                  onChange={(date: Date) => {
                    setPublishAt(date)
                  }}
                  className={`p-1 border rounded-md pl-2 w-full ${errors.publishAt ? 'border-red' : 'border-slate-gray-500'}`}
                  preventOpenOnFocus={true}
                />
              </div>
            )}
            {formData.challengeId && (
              <div className="my-4">
                {!formData.notificationSentOn ? (
                  <>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        defaultChecked={formData.notifyMembers ?? false}
                        onClick={handleNotifyCheck}
                      />
                      <span>Email this post to challenge members.</span>
                    </label>
                    {formData.notifyMembers && currentUser && (
                      <p className="ml-12 text-xs">
                        Replies will go to {currentUser.email}
                      </p>
                    )}
                  </>
                ) : (
                  <label className="flex items-center gap-2">
                    <Checkbox
                      defaultChecked={true}
                      disabled={true}
                      onClick={handleNotifyCheck}
                    />
                    <span>
                      {formData.notificationSentOn
                        ? `Emailed to members on ${format(formData.notificationSentOn, postDateTimeFormat)}`
                        : ''}
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>
        )}

        {challenge && (
          <Button
            type="submit"
            onClick={handlePublish}
            className="bg-red hover:bg-green-500 disabled:bg-gray-400"
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : challenge?.type === 'SELF_LED'
                ? 'Save'
                : 'Schedule'}
          </Button>
        )}
        {!challenge && (
          <>
            <Button
              type="submit"
              onClick={handlePublish}
              className="bg-red hover:bg-green-500 disabled:bg-gray-400"
              disabled={saving}
            >
              {saving
                ? 'Publishing...'
                : challenge?.type === 'SELF_LED'
                  ? 'Save'
                  : formData.publishAt
                    ? 'Schedule'
                    : 'Publish Now'}
            </Button>
            <Button
              type="submit"
              onClick={handleDraft}
              className="bg-grey text-white ml-2 hover:bg-green-500 disabled:bg-gray-400"
              disabled={saving}
            >
              {saving
                ? 'Saving'
                : post?.id && post?.published
                  ? 'Unpublish'
                  : 'Save Draft'}
            </Button>
          </>
        )}
        <button
          onClick={handleCancel}
          className="mt-2 text-sm underline ml-4 hover:text-red"
        >
          cancel
        </button>
      </Form>
    </div>
  )
}
