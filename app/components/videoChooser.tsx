import { BiVideoPlus, BiVideoOff } from 'react-icons/bi'
import { useState } from 'react'

interface VideoChooserProps {
  recorderShowing: boolean // if the video recorder is not showing, it shows the chooser and plus icon, otherwise it shows the cancel icon
  showRecorder: (uploadOnly: boolean) => void // function to trigger to show the recorder -- uploadOnly indicates whether it should show the video uploader or the video recorder
  hideRecorder: () => void // function to trigger to hide the recorder
}

export default function VideoChooser ({ recorderShowing, showRecorder, hideRecorder }: VideoChooserProps): JSX.Element {
  const [showVideoChooser, setShowVideoChooser] = useState(false)
  const chooseVideoUploadOrRecord = (option: string): void => {
    if (option === 'upload') {
      showRecorder(true)
    } else {
      showRecorder(false)
    }
    setShowVideoChooser(false)
  }
  const handleHideRecorder = (): void => {
    hideRecorder()
  }
  return (
    <>
    {!recorderShowing &&
      <div className='relative'>
      {showVideoChooser &&
        <div className='cursor-pointer min-w-36 absolute right-0 bottom-2 bg-white border border-gray rounded-md flex flex-col text-left' >
          <p className='hover:bg-gray-100 p-1' onClick={() => { chooseVideoUploadOrRecord('upload') }}>Upload video file</p>
          <p className='hover:bg-gray-100 p-1' onClick={() => { chooseVideoUploadOrRecord('record') }}>Record video</p>
        </div>
      }
      <BiVideoPlus onClick={() => { setShowVideoChooser(true) }} className='ml-2 text-2xl cursor-pointer float-right' />
      </div>
    }
    {recorderShowing && <BiVideoOff onClick={handleHideRecorder} className='ml-2 text-2xl cursor-pointer float-right' />}
    </>
  )
}
