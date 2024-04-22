import { TiDeleteOutline } from 'react-icons/ti'

interface VideoPreviewProps {
  video: Blob | File | null | string
  onClear: () => void
}

const VideoPreview = (props: VideoPreviewProps) => {
  const { video, onClear } = props
  if (video === 'delete') {
    return <></>
  }
  console.log('video in preview is ', video)
  const url = typeof (video) === 'string' ? video : URL.createObjectURL(video)
  return (
          <div className="relative w-fit">
            <video src={url} className='h-24 mb-2' />
            <TiDeleteOutline onClick={onClear} className='text-lg bg-white rounded-full text-red cursor-pointer absolute top-1 right-1' />
          </div>
  )
}

export default VideoPreview
