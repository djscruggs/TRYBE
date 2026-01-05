import { useState, useRef } from 'react'

const mimeType = 'audio/webm'

const AudioRecorder = () => {
  const [permission, setPermission] = useState(false)

  const mediaRecorder = useRef<MediaRecorder | null>(null)

  const [recordingStatus, setRecordingStatus] = useState('inactive')

  const [stream, setStream] = useState<MediaStream | null>(null)

  const [audio, setAudio] = useState<string | null>(null)

  const [audioChunks, setAudioChunks] = useState<Blob[]>([])

  const getMicrophonePermission = async () => {
    if ('MediaRecorder' in window) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        })
        setPermission(true)
        setStream(mediaStream)
      } catch (err) {
        alert((err as Error).message)
      }
    } else {
      alert('The MediaRecorder API is not supported in your browser.')
    }
  }

  const startRecording = async () => {
    if (!stream) return
    setRecordingStatus('recording')
    const media = new MediaRecorder(stream, { mimeType })

    mediaRecorder.current = media

    mediaRecorder.current.start()

    const localAudioChunks: Blob[] = []

    mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
      if (typeof event.data === 'undefined') return
      if (event.data.size === 0) return
      localAudioChunks.push(event.data)
    }

    setAudioChunks(localAudioChunks)
  }

  const stopRecording = () => {
    if (!mediaRecorder.current) return
    setRecordingStatus('inactive')
    mediaRecorder.current.stop()

    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType })
      const audioUrl = URL.createObjectURL(audioBlob)

      setAudio(audioUrl)

      setAudioChunks([])
    }
  }

  return (
    <div>
      <h2>Audio Recorder</h2>
      <main>
        <div className="audio-controls">
          {!permission ? (
            <button onClick={getMicrophonePermission} type="button">
              Get Microphone
            </button>
          ) : null}
          {permission && recordingStatus === 'inactive' ? (
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={startRecording}
              type="button"
            >
              Start Recording
            </button>
          ) : null}
          {recordingStatus === 'recording' ? (
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={stopRecording}
              type="button"
            >
              Stop Recording
            </button>
          ) : null}
        </div>
        {audio ? (
          <div className="audio-player">
            <audio src={audio} controls></audio>
            <a download href={audio}>
              Download Recording
            </a>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default AudioRecorder
