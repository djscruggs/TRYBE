import React, { useState, useRef, useMemo, useContext } from 'react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { Form, useNavigate } from '@remix-run/react'
import axios from 'axios'
import { FormField } from './formField'
import { handleFileUpload } from '~/utils/helpers'
import { type CheckIn } from '~/utils/types'
import { Button } from '@material-tailwind/react'
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
import { TiDeleteOutline } from 'react-icons/ti'
import VideoRecorder from './videoRecorder'
import VideoPreview from './videoPreview'
import VideoChooser from './videoChooser'
import { toast } from 'react-hot-toast'

interface FormCheckinProps {
  checkIn?: CheckIn
  afterCheckIn?: (checkIn: CheckIn) => void
  onCancel?: () => void
  challengeId: number
  saveLabel?: string
}

export default function FormCheckIn (props: FormCheckinProps): JSX.Element {
  const { afterCheckIn, onCancel, checkIn, challengeId, saveLabel } = props
  const { currentUser } = useContext(CurrentUserContext)
  if (!challengeId) {
    throw new Error('challengeId is required')
  }
  const handleKeyDown = async (event: React.KeyboardEvent<HTMLFormElement>): Promise<void> => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      await handleSubmit(event)
    }
  }

  const [showVideoRecorder, setShowVideoRecorder] = useState(false)
  const [body, setBody] = useState(checkIn?.body ?? '')
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [videoRecording, setVideoRecording] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const imageRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<File | string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(checkIn?.imageMeta?.secure_url ?? null)
  const [videoUploadOnly, setVideoUploadOnly] = useState(false)

  const [video, setVideo] = useState<File | string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(checkIn?.videoMeta?.secure_url ?? null)
  const imageDialog = (): void => {
    if (imageRef.current) {
      imageRef.current.click()
    }
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
  const deleteImage = (): void => {
    setImage('delete')
    setImageUrl(null)
  }
  const deleteVideo = (): void => {
    setVideo('delete')
    setVideoUrl(null)
  }
  const validate = (): boolean => {
    // if (body.length < 10) {
    //   setError('Note must be at least 10 characters long')
    //   return false
    // }
    return true
  }
  async function handleSubmit (ev: React.FormEvent<HTMLFormElement>): Promise<void> {
    ev.preventDefault()
    if (!validate()) {
      return
    }
    if (!currentUser?.id) {
      throw new Error('User ID is required')
    }
    setBtnDisabled(true)
    try {
      const formData = new FormData()
      formData.append('body', body)
      formData.append('userId', String(currentUser?.id))
      if (checkIn?.id) {
        formData.append('checkinId', checkIn.id.toString())
      }
      formData.append('challengeId', challengeId.toString())
      if (image) {
        formData.append('image', image)
      }
      if (video) {
        formData.append('video', video)
      }
      const result = await axios.post('/api/challenges/' + challengeId + '/checkins', formData)
      clearInputs()
      toast.success('🎉 Woo hoo! Great job!')
      if (afterCheckIn) {
        afterCheckIn(result.data as CheckIn)
      } else {
        navigate('/challenges/v/' + challengeId + '/checkins/mine')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.statusText ?? 'An error occurred')
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setBtnDisabled(false)
    }
  }
  const clearInputs = (): void => {
    setBody('')
    setImage(null)
    setImageUrl(null)
    setVideo(null)
    setVideoUrl(null)
    setShowVideoRecorder(false)
  }
  const handleCancel = (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    ev.preventDefault()
    clearInputs()
    if (onCancel) {
      onCancel()
    }
  }
  const showCancel = (): boolean => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return Boolean(video || body || image || video)
  }
  const renderVideo = useMemo(() => (
    <VideoPreview video={video} onClear={deleteVideo} />
  ), [video, videoUrl])
  return (
    <div className='w-full'>
      <Form method="post" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <FormField
          name='note'
          autoResize={true}
          placeholder={'Add a note (optional)'}
          type='textarea'
          rows={2}
          value={body}
          onKeyDown={handleKeyDown}
          onChange={(ev) => {
            setBody(String(ev.target.value))
            return ev.target.value
          }}
          error={error}
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
        {videoUrl && !showVideoRecorder &&
          <div className="relative w-fit">
            <video src={videoUrl} className='h-24 mb-2' />
            <TiDeleteOutline onClick={deleteVideo} className='text-lg bg-white rounded-full text-red cursor-pointer absolute top-1 right-1' />
          </div>
        }
        {video && !showVideoRecorder &&
          renderVideo
        }
        {showVideoRecorder &&
          <div className='mt-6'>
            <VideoRecorder uploadOnly={videoUploadOnly} onStart={() => { setVideoRecording(true) }} onStop={() => { setVideoRecording(false) }} onSave={setVideo} onFinish={() => { setShowVideoRecorder(false) }} />
          </div>
        }
        <Button type="submit" placeholder='Save' className="bg-red disabled:gray-400" disabled={btnDisabled || (showVideoRecorder && !video)}>
          {btnDisabled
            ? 'Saving...'
            : videoRecording
              ? 'Recording...'
              : saveLabel ?? 'Check In'
          }
        </Button>

          <button onClick={handleCancel} className="mt-2 text-sm underline ml-2 hover:text-red">cancel</button>

      </Form>

    </div>
  )
}
