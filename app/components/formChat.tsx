import React, { useState, useContext, useRef, useMemo } from 'react'
import { Form } from '@remix-run/react'
import axios from 'axios'
import { FormField } from './formField'
import type { Comment } from '~/utils/types'
import { toast } from 'react-hot-toast'
import { Spinner } from '@material-tailwind/react'
import { MdImage, MdSend } from 'react-icons/md'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import VideoRecorder from './videoRecorder'
import VideoChooser from './videoChooser'
import { handleFileUpload } from '~/utils/helpers'
import { TiDeleteOutline } from 'react-icons/ti'
import VideoPreview from './videoPreview'
interface FormChatProps {
  type?: 'post' | 'challenge' | 'reply' | 'thread' | 'checkin' | 'comment'
  objectId?: number
  onPending: (comment: Comment) => void
  afterSave: (comment: Comment) => void
  onCancel?: () => void
  onError?: (error: Error) => void
  comment?: Comment
  prompt?: string
  inputRef?: React.RefObject<HTMLTextAreaElement | HTMLInputElement>
}

export default function FormChat (props: FormChatProps): JSX.Element {
  let { comment, type, id, onCancel } = props
  if (comment) {
    type = comment.type
    id = comment.id
  }

  const { currentUser } = useContext(CurrentUserContext)
  const [body, setBody] = useState(comment ? comment.body : '')
  const [error, setError] = useState('')
  const [recording, setRecording] = useState(false)
  const [image, setImage] = useState<File | string | null>(null)
  const [video, setVideo] = useState<File | string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(comment?.videoMeta?.secure_url ? comment?.videoMeta?.secure_url : null)
  const imageRef = useRef<HTMLInputElement>(null)
  const inputRef = props.inputRef ?? useRef<HTMLTextAreaElement>(null)
  const [videoUploadOnly, setVideoUploadOnly] = useState(false)
  const [showVideoRecorder, setShowVideoRecorder] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  // this triggers the browser's upload file dialog, not a modal
  const imageDialog = (): void => {
    if (imageRef.current) {
      imageRef.current.click()
    }
  }
  const handleImage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const params = {
      event,
      setFile: setImage
    }
    handleFileUpload(params)
  }
  const correctImageUrl = (): string => {
    // if image (file object) is set that means user attached a new image instead of existing url in db
    if (image && image !== 'delete') {
      return URL.createObjectURL(image as File)
    }
    if (comment?.imageMeta?.secure_url) {
      return comment.imageMeta.secure_url
    }
    return ''
  }
  const deleteCorrectImage = (): void => {
    if (image && image !== 'delete') {
      setImage(null)
    } else if (comment?.imageMeta?.secure_url) {
      comment.imageMeta.secure_url = ''
      setImage('delete')
    }
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
  const deleteVideo = (): void => {
    setVideo('delete')
    setVideoUrl(null)
  }
  const renderVideo = useMemo(() => (
    <VideoPreview video={videoUrl ?? video} onClear={deleteVideo} />
  ), [video, videoUrl])
  async function handleSubmit (): Promise<void> {
    if (!body) {
      return
    }

    const tempBody = body
    const tempImage = image
    const tempVideo = video
    setBody('')
    setVideo(null)
    setImage(null)
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.set('body', body)

      // Set the appropriate ID based on the type
      switch (type) {
        case 'post':
          formData.set('postId', String(props.objectId))
          break
        case 'challenge':
          formData.set('challengeId', String(props.objectId))
          break
        case 'checkin':
          formData.set('checkInId', String(props.objectId))
          break
        case 'thread':
          formData.set('threadId', String(props.objectId))
          break
        default:
          throw new Error('Invalid type in formChat: ' + type)
      }

      if (id) {
        formData.set('id', String(id))
      }
      // these are blob objects to upload
      if (image) {
        formData.set('image', image)
      }
      if (video) {
        formData.set('video', video)
      }
      // construct a comment object that can be used for onPending
      if (props.onPending) {
        const _comment = {
          body,
          type,
          id,
          imageMeta: image
            ? {
                secure_url: URL.createObjectURL(image as File),
                url: '',
                public_id: '',
                format: '',
                resource_type: ''
              }
            : undefined,
          videoMeta: video
            ? {
                secure_url: URL.createObjectURL(video as File),
                url: '',
                public_id: '',
                format: '',
                resource_type: ''
              }
            : undefined,
          user: currentUser,
          userId: currentUser?.id ?? 0,
          likeCount: 0,
          replyCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...(type === 'post' && { postId: props.objectId }),
          ...(type === 'challenge' && { challengeId: props.objectId }),
          ...(type === 'checkin' && { checkInId: props.objectId }),
          ...(type === 'thread' && { threadId: props.objectId })
        }
        console.log('_comment', _comment)
        props.onPending(_comment as Comment)
      }
      const updated = await axios.post('/api/comments', formData)
      if (props.afterSave) {
        props.afterSave(updated.data as Comment)
      }
    } catch (error: any) {
      if (props.onError) {
        props.onError(error as Error)
      }
      const errorMessage = typeof error?.response.data.message === 'string' ? error.message : 'An unexpected error occurred'
      toast.error(errorMessage as string)
      setError(errorMessage as string)
      setBody(tempBody)
      setVideo(tempVideo)
      setImage(tempImage)
    } finally {
      setSubmitting(false)
    }
  }
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSubmit()
    }
  }
  return (
    <div className='w-full'>
      <Form method="post" onSubmit={handleSubmit}>
        <FormField
          name='comment'
          placeholder={props.prompt ?? 'Reply...'}
          type='textarea'
          rows={2}
          inputRef={inputRef}
          required={true}
          autoFocus={true}
          value={body}
          onChange={(ev) => {
            setBody(String(ev.target.value))
            return ev.target.value
          }}
          onKeyDown={handleKeyDown}
          error={error}
          />
        <input type="file" name="image" hidden ref={imageRef} onChange={handleImage} accept="image/*"/>

        {correctImageUrl() &&
          <div className="relative w-fit">
            <img src={correctImageUrl()} alt="image thumbnail" className='h-24 mb-2' />
            <TiDeleteOutline onClick={deleteCorrectImage} className='text-lg bg-white rounded-full text-red cursor-pointer absolute top-1 right-1' />
          </div>
        }
        {(video ?? videoUrl) && !showVideoRecorder &&
          renderVideo
        }
        {showVideoRecorder &&
          <div className='w-full h-full my-6'>
            <VideoRecorder uploadOnly={videoUploadOnly} onStart={() => { setRecording(true) }} onStop={() => { setRecording(false) }} onSave={setVideo} onFinish={() => { setShowVideoRecorder(false) }} />
          </div>
        }
        <div className='flex items-end justify-end -mt-3 rounded-md p-1'>
          <div className='w-fit flex items-center justify-end'>
            {comment?.id && onCancel &&
              <div className='underline text-red mr-2 cursor-pointer' onClick={onCancel}>cancel</div>
            }
            <span className='mr-2'><VideoChooser recorderShowing={showVideoRecorder} showRecorder={videoChooserCallbackShow} hideRecorder={videoChooserCallbackHide} /></span>
            <MdImage onClick={imageDialog} className='text-2xl cursor-pointer mr-2' />
            {submitting
              ? <Spinner />
              : <MdSend onClick={handleSubmit} className='text-2xl cursor-pointer' />

            }
          </div>
        </div>

      </Form>

    </div>
  )
}
