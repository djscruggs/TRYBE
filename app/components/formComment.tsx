import React, { useState, useContext, useRef } from 'react'
import { Form } from '@remix-run/react'
import axios from 'axios'
import { FormField } from './formField'
import type { Comment } from '~/utils/types'
import { toast } from 'react-hot-toast'
import { Button, Avatar } from '@material-tailwind/react'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import VideoRecorder from './videoRecorder'
import VideoChooser from './videoChooser'
import { handleFileUpload } from '~/utils/helpers'
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
import { TiDeleteOutline } from 'react-icons/ti'

interface FormCommentProps {
  challengeId?: number
  postId?: number
  replyToId?: number
  threadId?: number
  afterSave: (comment: Comment) => void
  onCancel?: () => void
  comment?: Comment
  prompt?: string
}

export default function FormComment (props: FormCommentProps): JSX.Element {
  let { comment, challengeId, postId, replyToId, threadId } = props
  if (comment) {
    challengeId = comment.challengeId
    postId = comment.postId
  }
  const { currentUser } = useContext(CurrentUserContext)
  const [body, setBody] = useState(comment ? comment.body : '')
  const [error, setError] = useState('')
  const [recording, setRecording] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  const [videoUploadOnly, setVideoUploadOnly] = useState(false)
  const [showVideoRecorder, setShowVideoRecorder] = useState(false)
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
    if (image) {
      return URL.createObjectURL(image)
    }
    if (image && image !== 'delete') {
      return image
    }
    return ''
  }
  const deleteCorrectImage = (): void => {
    if (image) {
      setImage(null)
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
  async function handleSubmit (ev: React.FormEvent<HTMLFormElement>): Promise<void> {
    ev.preventDefault()
    if (body.length < 10) {
      setError('Comment must be at least 10 characters long')
    }
    try {
      const formData = new FormData()
      formData.set('body', body)

      if (replyToId) {
        formData.set('replyToId', String(replyToId))
      }
      if (threadId) {
        formData.set('threadId', String(threadId))
      }
      if (challengeId) {
        formData.set('challengeId', String(challengeId))
      }
      if (postId) {
        formData.set('postId', String(postId))
      }
      if (comment?.id) {
        formData.set('id', String(comment.id))
      }
      // these are blob objects  to upload
      if (image) {
        formData.set('image', image)
      }
      if (video) {
        formData.set('video', video)
      }
      const updated = await axios.post('/api/comments', formData)
      setBody('')
      if (props.afterSave) {
        props.afterSave(updated.data as Comment)
      }
      toast.success('Comment saved')
    } catch (error: any) {
      toast.error(error?.message)
    }
  }
  const handleCancel = (ev: React.MouseEvent<HTMLButtonElement>): void => {
    ev.preventDefault()
    if (props.onCancel) {
      props.onCancel()
    }
  }
  return (
    <div className='w-full flex'>
      <div className='w-md pt-1'>
      {currentUser?.profile &&
        <Avatar src={currentUser.profile.profileImage} className='mr-2' size='sm'/>
      }
      </div>
      <div className='w-full'>
      <Form method="post" onSubmit={handleSubmit}>
      <FormField
          name='comment'
          placeholder={props.prompt ?? 'Enter comment'}
          type='textarea'
          rows={3}
          required={true}
          autoFocus={true}
          value={body}
          onChange={(ev) => {
            setBody(String(ev.target.value))
            return ev.target.value
          }}
          error={error}
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
        {showVideoRecorder &&
          <div className='w-full h-full my-6'>
            <VideoRecorder uploadOnly={videoUploadOnly} onStart={() => { setRecording(true) }} onStop={() => { setRecording(false) }} onSave={setVideo} onFinish={() => { setShowVideoRecorder(false) }} />
          </div>
        }
        <Button type="submit" onClick={handleSubmit} placeholder='Save' className="bg-red" disabled={recording}>Save</Button>
        {props.onCancel && (
          <button onClick={handleCancel} className="mt-2 text-sm underline ml-2">cancel</button>
        )}

      </Form>
      </div>
    </div>
  )
}
