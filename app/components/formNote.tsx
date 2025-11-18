import { Button } from '~/components/ui/button';
import React, { useState, useRef, useMemo, JSX } from 'react'
import { Form, useNavigate } from 'react-router';
import axios from 'axios'
import { FormField } from './formField'
import { handleFileUpload } from '~/utils/helpers'
import CardChallenge from './cardChallenge'
import CardPost from './cardPost'
import { type Note, type NoteSummary, type PostSummary, type Challenge, type Post, type ChallengeSummary } from '~/utils/types'
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
import { TiDeleteOutline } from 'react-icons/ti'
import VideoRecorder from './videoRecorder'
import VideoPreview from './videoPreview'
import VideoChooser from './videoChooser'

interface FormNoteProps {
  afterSave?: (note: NoteSummary) => void
  onCancel?: () => void
  note?: Note
  challenge?: Challenge | ChallengeSummary
  post?: Post
  replyToId?: number
  prompt?: string
  isShare?: boolean
  isThread?: boolean
  forwardRef?: React.RefObject<HTMLTextAreaElement>
}

export default function FormNote (props: FormNoteProps): JSX.Element {
  let { afterSave, onCancel, note, challenge, prompt, replyToId, post, isThread } = props
  if (note?.challenge) {
    challenge = note.challenge
  }
  const handleKeyDown = async (event: React.KeyboardEvent<HTMLFormElement>): Promise<void> => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      await handleSubmit(event)
    }
  }

  const [showVideoRecorder, setShowVideoRecorder] = useState(false)
  const placeholder = prompt ?? 'What\'s on your mind?'
  const [body, setBody] = useState(note?.body || '')
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [videoRecording, setVideoRecording] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const imageRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<File | string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(note?.imageMeta?.secure_url ?? null)
  const [videoUploadOnly, setVideoUploadOnly] = useState(false)

  const [video, setVideo] = useState<File | string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(note?.videoMeta?.secure_url ?? null)
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
    setBtnDisabled(true)
    try {
      const formData = new FormData()
      formData.append('body', body)
      if (note?.id) {
        formData.append('id', note.id.toString())
      }
      if (replyToId) {
        formData.append('replyToId', replyToId.toString())
        formData.append('isShare', 'true')
      }
      if (challenge) {
        formData.append('challengeId', challenge.id.toString())
      }
      if (post?.id) {
        formData.append('postId', post.id.toString())
      }
      if (image) {
        formData.append('image', image)
      }
      if (video) {
        formData.append('video', video)
      }
      if (isThread) {
        formData.append('isThread', 'true')
      }

      const result = await axios.post('/api/notes', formData)
      setBody('')
      setImage(null)
      setImageUrl(null)
      setVideo(null)
      setShowVideoRecorder(false)
      if (afterSave) {
        afterSave(result.data as NoteSummary)
      } else {
        navigate('/challenges')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setBtnDisabled(false)
    }
  }
  const handleCancel = (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    ev.preventDefault()
    setBody('')
    setImage(null)
    setImageUrl(null)
    setVideo(null)
    if (onCancel) {
      onCancel()
    }
  }
  const showCancel = (): boolean => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return Boolean(video || body || image || challenge || post || replyToId)
  }
  const renderVideo = useMemo(() => (
    <VideoPreview video={video} onClear={deleteVideo} />
  ), [video, videoUrl])
  return (
    <div className='w-full mb-8'>
      <Form method="post" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <FormField
          name='note'
          autoResize={true}
          placeholder={placeholder}
          type='textarea'
          rows={4}
          required={true}
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
              : 'Save'
          }
        </Button>
        {showCancel() &&
          <button onClick={handleCancel} className="mt-2 text-sm underline ml-2 hover:text-red">cancel</button>
        }
        {challenge && !isThread && <CardChallenge challenge={challenge as ChallengeSummary} isShare={true}/>}
        {post && <CardPost post={post as PostSummary} isShare={true}/>}

      </Form>

    </div>
  )
}
