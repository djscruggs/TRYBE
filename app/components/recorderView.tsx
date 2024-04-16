import React, { useState } from 'react'
import VideoRecorder from './videoRecorder'
import AudioRecorder from './audioRecorder'

const RecorderView = () => {
  const [recordOption, setRecordOption] = useState('video')
  const toggleRecordOption = (type) => {
    return () => {
      setRecordOption(type)
    }
  }

  return (
    <div>

			<div className="button-flex">
				<button onClick={toggleRecordOption('video')}>Record Video</button>
				<button onClick={toggleRecordOption('audio')}>Record Audio</button>
			</div>
			<div>
				{recordOption === 'video' ? <VideoRecorder /> : <AudioRecorder />}
			</div>
		</div>
  )
}

export default RecorderView
