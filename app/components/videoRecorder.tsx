import { useState, useRef, useEffect } from 'react'
import { handleFileUpload, isMobileDevice } from '~/utils/helpers'
import { TiDeleteOutline } from 'react-icons/ti'

const mimeType = 'video/webm; codecs="opus,vp8"'
interface VideoRecorderProps {
  onStart: () => void
  onStop: () => void
  onSave: (video: File | null) => void
  onFinish: () => void
}

const VideoRecorder = ({ onStart, onStop, onSave, onFinish, uploadOnly }: VideoRecorderProps): JSX.Element => {
  const [permission, setPermission] = useState(true)
  const videoUpload = useRef<HTMLInputElement>(null)
  const liveVideoFeed = useRef(null)
  const [recordingStatus, setRecordingStatus] = useState('inactive')
  const [stream, setStream] = useState<MediaStream | null>()
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoChunks, setVideoChunks] = useState([])
  uploadOnly
  useEffect(() => {
    if (isMobileDevice() || uploadOnly) {
      return
    }
    getCameraPermission().then(() => {
      setPermission(true)
    }).catch((err) => {
      console.log(err.message)
      setPermission(false)
    })
  }, [])

  // need this to handle setting video file during upload on mobile device
  useEffect(() => {
    if (isMobileDevice() || uploadOnly) {
      onSave(videoFile)
    }
  }, [videoFile])

  const getCameraPermission = async (): Promise<void> => {
    setLocalVideoUrl(null)
    // get video and audio permissions and then stream the result media stream to the videoSrc variable
    if ('MediaRecorder' in window) {
      try {
        const videoConstraints = {
          audio: false,
          video: true
        }
        const audioConstraints = { audio: true }

        // create audio and video streams separately
        const audioStream = await navigator.mediaDevices.getUserMedia(
          audioConstraints
        )
        const videoStream = await navigator.mediaDevices.getUserMedia(
          videoConstraints
        )

        setPermission(true)
        // combine both audio and video streams

        const combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...audioStream.getAudioTracks()
        ])

        setStream(combinedStream)

        // set videostream to live feed player
        liveVideoFeed.current.srcObject = videoStream
      } catch (err) {
        alert(err.message)
      }
    } else {
      alert('The MediaRecorder API is not supported in your browser.')
    }
  }
  const reset = async (): Promise<void> => {
    setLocalVideoUrl(null)
    setVideoFile(null)
    setRecordingStatus('inactive')
    if (!isMobileDevice() && !uploadOnly) {
      await getCameraPermission()
    }
  }

  const startRecording = async (): Promise<void> => {
    if (onStart) {
      onStart()
    }
    setLocalVideoUrl(null)
    setRecordingStatus('recording')
    await getCameraPermission()

    const media = new MediaRecorder(stream, { mimeType })
    mediaRecorder.current = media

    mediaRecorder.current.start()

    const localVideoChunks = []

    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === 'undefined') return
      if (event.data.size === 0) return
      localVideoChunks.push(event.data)
    }
    console.log(mediaRecorder)
    setVideoChunks(localVideoChunks)
  }

  const stopRecording = (): void => {
    if (onStop) {
      onStop()
    }
    setRecordingStatus('recorded')

    mediaRecorder.current.stop()

    mediaRecorder.current.onstop = () => {
      const videoBlob = new Blob(videoChunks, { type: mimeType })
      setVideoFile(videoBlob)
      const videoUrl = URL.createObjectURL(videoBlob)

      setLocalVideoUrl(videoUrl)

      setVideoChunks([])
    }
  }
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    console.log(event.target)
    handleFileUpload({ event, setFile: setVideoFile, setFileURL: setLocalVideoUrl })
  }
  const saveVideo = (): void => {
    onSave(videoFile)
    const tracks = stream.getTracks()
    if (tracks) {
      tracks.forEach(track => { track.stop() })
    }
    setStream(null)
    if (liveVideoFeed?.current?.srcObject) {
      liveVideoFeed.current.srcObject = null
    }
    onFinish()
  }

  return (
    <>
    {isMobileDevice() || uploadOnly
      ? (
        <>
          {localVideoUrl
            ? (
                  <div className="relative mt-8 mb-2">
                    <video className="recorded" src={localVideoUrl} controls></video>
                    <TiDeleteOutline onClick={reset} className='text-lg bg-white rounded-full text-red cursor-pointer absolute top-3 right-2' />
                  </div>
              )
            : null
          }
          <div className="flex flex-col items-center justify-end">
            <p className="text-2xl text-blue-gray-500 text-center">
              {/* On a mobile device it always gives the option to record or upload, so prompt text reflects that */}
              {localVideoUrl ? 'Choose a different video' : isMobileDevice() ? 'Record or upload a video' : 'Upload a video'}
            </p>
            <div className={`${localVideoUrl ? 'mt-2' : 'mt-10'} ml-36`}>
              <FileInput passedRef={videoUpload} onChange={handleVideoUpload} immediateTrigger={uploadOnly} />
            </div>
          </div>

        </>
        )
      : (
      <>
        {!permission
          ? (
                  <p>Allow access to your camera to record a video</p>
            )
          : null}
      <div className="block min-h-[310px] relative justifys-center">

            {!localVideoUrl &&
              <div className='border-2 border-gray-300 rounded-lg h-[3'>
                <video ref={liveVideoFeed} autoPlay></video>
              </div>
            }
            {localVideoUrl
              ? (

                  <video className="h-full" src={localVideoUrl} controls></video>

                )
              : null}

      </div>
      <div className='w-full flex justify-center'>
        {recordingStatus === 'inactive' &&
          <>
          <button className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded' onClick={startRecording} type="button">
              Start Recording
          </button>
          <button className='bg-red hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2' onClick={onFinish} type="button">
            Never Mind
          </button>

          </>
        }
        {recordingStatus === 'recording' &&
            <button className='bg-red hover:bg-green-700 text-white font-bold py-2 px-4 rounded' onClick={stopRecording} type="button">
              Stop Recording
            </button>
        }
        {recordingStatus === 'recorded' &&
          <>
          <button className='bg-red text-white font-bold py-2 px-4 rounded' onClick={reset} type="button">
            Discard
          </button>
          <button className='bg-green-700 text-white font-bold py-2 px-4 rounded ml-2' onClick={saveVideo} type="button">
            Looks Good 👍
          </button>
          </>
        }
      </div>
      </>
        )}
    </>
  )
}

interface FileInputProps {
  passedRef: HTMLInputElement
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  immediateTrigger?: boolean
}
const FileInput = ({ passedRef, onChange, immediateTrigger }: FileInputProps): JSX.Element => {
  const textColor = 'white'
  useEffect(() => {
    console.log(passedRef)
    if (immediateTrigger) {
      passedRef.current.click()
    }
  }, [])
  return (
    <input type="file"
      name="video"
      ref={passedRef}
      onChange={onChange}
      accept="video/*"
      capture
      className={`text-sm text-${textColor}
                file:text-white
                  file:mr-5 file:py-2 file:px-6
                  file:rounded-full file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  file:cursor-pointer file:bg-blue
                  hover:file:bg-red`}
    />
  )
}

export default VideoRecorder
