import React, { useState, useContext, useRef, useMemo, useCallback } from 'react'
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

function getTypeAndId (comment: Comment): { type: string, id: number } {
  if (comment.postId) return { type: 'post', id: comment.postId }
  if (comment.challengeId) return { type: 'challenge', id: comment.challengeId }
  if (comment.checkInId) return { type: 'checkin', id: comment.checkInId }
  if (comment.threadId) return { type: 'thread', id: comment.threadId }
  if (comment.replyToId) return { type: 'comment', id: comment.replyToId }
  throw new Error('Not type found in Comment: ' + JSON.stringify(comment))
}

export default function FormChat (props: FormChatProps): JSX.Element {
  const { comment, onCancel } = props
  let type: string | undefined
  let id: number | undefined
  let objectId: number | undefined
  if (comment) {
    const { type: commentType, id: commentId } = getTypeAndId(comment)
    type = commentType
    id = comment.id
    objectId = commentId
  } else if (props.type) {
    type = props.type
    objectId = props.objectId
  }
  if (!type || !objectId) {
    throw new Error('type and objectId are required in formChat (props: ' + JSON.stringify(props) + ')')
  }

  const { currentUser } = useContext(CurrentUserContext)
  const [state, setState] = useState({
    body: comment ? comment.body : '',
    error: '',
    recording: false,
    image: null as File | string | null,
    video: null as File | string | null,
    videoUrl: comment?.videoMeta?.secure_url ?? null,
    videoUploadOnly: false,
    showVideoRecorder: false,
    submitting: false
  })
  const imageRef = useRef<HTMLInputElement>(null)
  const inputRef = props.inputRef ?? useRef<HTMLTextAreaElement>(null)

  const imageDialog = useCallback((): void => {
    if (imageRef.current) {
      imageRef.current.click()
    }
  }, [])

  const handleImage = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const params = {
      event,
      setFile: (file: File | string | null) => { setState(prev => ({ ...prev, image: file })) }
    }
    handleFileUpload(params)
  }, [])

  const correctImageUrl = useCallback((): string => {
    if (state.image && state.image !== 'delete') {
      return URL.createObjectURL(state.image as File)
    }
    if (comment?.imageMeta?.secure_url) {
      return comment.imageMeta.secure_url
    }
    return ''
  }, [state.image, comment?.imageMeta?.secure_url])

  const deleteCorrectImage = useCallback((): void => {
    if (state.image && state.image !== 'delete') {
      setState(prev => ({ ...prev, image: null }))
    } else if (comment?.imageMeta?.secure_url) {
      comment.imageMeta.secure_url = ''
      setState(prev => ({ ...prev, image: 'delete' }))
    }
  }, [state.image, comment?.imageMeta?.secure_url])

  const videoChooserCallbackShow = useCallback((uploadOnly: boolean): void => {
    setState(prev => ({ ...prev, videoUploadOnly: uploadOnly, showVideoRecorder: true }))
  }, [])

  const videoChooserCallbackHide = useCallback((): void => {
    setState(prev => ({ ...prev, showVideoRecorder: false }))
  }, [])

  const deleteVideo = useCallback((): void => {
    setState(prev => ({ ...prev, video: 'delete', videoUrl: null }))
  }, [])

  const renderVideo = useMemo(() => (
    <VideoPreview video={state.videoUrl ?? state.video} onClear={deleteVideo} />
  ), [state.video, state.videoUrl, deleteVideo])

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!state.body) {
      return
    }

    const tempBody = state.body
    const tempImage = state.image
    const tempVideo = state.video
    setState(prev => ({ ...prev, body: '', video: null, image: null, submitting: true }))
    try {
      const formData = new FormData()
      formData.set('body', state.body)
      switch (type) {
        case 'post':
          formData.set('postId', String(objectId))
          break
        case 'challenge':
          formData.set('challengeId', String(objectId))
          break
        case 'checkin':
          formData.set('checkInId', String(objectId))
          break
        case 'thread':
          formData.set('threadId', String(objectId))
          break
        case 'comment':
          formData.set('replyToId', String(objectId))
          break
        default:
          throw new Error('Invalid type in formChat: ' + type)
      }

      if (id) {
        formData.set('id', String(id))
      }
      if (state.image) {
        formData.set('image', state.image)
      }
      if (state.video) {
        formData.set('video', state.video)
      }
      if (props.onPending) {
        const _comment = {
          body: state.body,
          type,
          id,
          imageMeta: state.image
            ? {
                secure_url: URL.createObjectURL(state.image as File),
                url: '',
                public_id: '',
                format: '',
                resource_type: ''
              }
            : undefined,
          videoMeta: state.video
            ? {
                secure_url: URL.createObjectURL(state.video as File),
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
          ...(type === 'thread' && { threadId: props.objectId }),
          ...(type === 'comment' && { replyToId: props.objectId })
        }
        props.onPending(_comment as Comment)
      }
      const updated = await axios.post('/api/comments', formData)
      props.afterSave(updated.data as Comment)
    } catch (error: any) {
      if (props.onError && !id) {
        props.onError(error as Error)
      }
      console.error('error', error)
      const errorMessage = typeof error?.response?.data.message === 'string' ? error?.response?.data.message : 'An unexpected error occurred'
      toast.error(errorMessage as string)
      setState(prev => ({ ...prev, error: errorMessage, body: tempBody, video: tempVideo, image: tempImage }))
    } finally {
      setState(prev => ({ ...prev, submitting: false }))
    }
  }, [state.body, state.image, state.video, type, objectId, id, props, currentUser])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSubmit()
    }
  }, [handleSubmit])

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
          value={state.body}
          onChange={(ev) => {
            setState(prev => ({ ...prev, body: String(ev.target.value) }))
            return ev.target.value
          }}
          onKeyDown={handleKeyDown}
          error={state.error}
        />
        <input type="file" name="image" hidden ref={imageRef} onChange={handleImage} accept="image/*"/>

        {correctImageUrl() &&
          <div className="relative w-fit">
            <img src={correctImageUrl()} alt="image thumbnail" className='h-24 mb-2' />
            <TiDeleteOutline onClick={deleteCorrectImage} className='text-lg bg-white rounded-full text-red cursor-pointer absolute top-1 right-1' />
          </div>
        }
        {(state.video ?? state.videoUrl) && !state.showVideoRecorder &&
          renderVideo
        }
        {state.showVideoRecorder &&
          <div className='w-full h-full my-6'>
            <VideoRecorder uploadOnly={state.videoUploadOnly} onStart={() => { setState(prev => ({ ...prev, recording: true })) }} onStop={() => { setState(prev => ({ ...prev, recording: false })) }} onSave={(file) => { setState(prev => ({ ...prev, video: file })) }} onFinish={() => { setState(prev => ({ ...prev, showVideoRecorder: false })) }} />
          </div>
        }
        <div className='flex items-end justify-end -mt-3 rounded-md p-1'>
          <div className='w-fit flex items-center justify-end'>
            {comment?.id && onCancel &&
              <div className='underline text-red mr-2 cursor-pointer' onClick={onCancel}>cancel</div>
            }
            <span className='mr-2'><VideoChooser recorderShowing={state.showVideoRecorder} showRecorder={videoChooserCallbackShow} hideRecorder={videoChooserCallbackHide} /></span>
            <MdImage onClick={imageDialog} className='text-2xl cursor-pointer mr-2' />
            {state.submitting
              ? <Spinner />
              : <MdSend onClick={handleSubmit} className='text-2xl cursor-pointer' />
            }
          </div>
        </div>
      </Form>
    </div>
  )
}
