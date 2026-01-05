import React, { useState } from 'react'
import VideoRecorder from './videoRecorder'
import AudioRecorder from './audioRecorder'

const RecorderView = () => {
  const [recordOption, setRecordOption] = useState('video')
  const toggleRecordOption = (type: string) => {
    return () => {
      setRecordOption(type)
    }
  }

  const handleStart = () => {
    console.log('Recording started')
  }

  const handleStop = () => {
    console.log('Recording stopped')
  }

  const handleSave = (video: File | null) => {
    console.log('Video saved:', video)
  }

  const handleFinish = () => {
    console.log('Recording finished')
  }

  return (
    <div>
      <div className="button-flex">
        <button onClick={toggleRecordOption('video')}>Record Video</button>
        <button onClick={toggleRecordOption('audio')}>Record Audio</button>
      </div>
      <div>
        {recordOption === 'video' ? (
          <VideoRecorder
            onStart={handleStart}
            onStop={handleStop}
            onSave={handleSave}
            onFinish={handleFinish}
          />
        ) : (
          <AudioRecorder />
        )}
      </div>
    </div>
  )
}

export default RecorderView
