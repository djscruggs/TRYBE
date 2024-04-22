import { TiDeleteOutline } from 'react-icons/ti'

interface VideoPreviewProps {
  video: Blob
  onClear: () => void
}

const VideoPreview = (props: VideoPreviewProps) => {
  const { video, onClear } = props

  return (
          <div className="relative w-fit">
            <video src={URL.createObjectURL(video)} className='h-24 mb-2' />
            <TiDeleteOutline onClick={onClear} className='text-lg bg-white rounded-full text-red cursor-pointer absolute top-1 right-1' />
          </div>
  )
}

export default VideoPreview
