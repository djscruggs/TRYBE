import React, { useState } from 'react'
// const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})([?&][^#\s]*)?(?:\.\.\.\.)?/g
// const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})([?&][^#\s]*)?/g

// convert url query param &t=10s to &start=10 because embeds use different query params
export const youtubeRegex = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+).*?/
function transformQueryParams (url: string): string {
  try {
    const urlObj = new URL(url)
    const params = new URLSearchParams(urlObj.search)
    if (params.has('t')) {
      const time = params.get('t')?.replace('s', '')
      params.set('start', time ?? '')
      params.delete('t')
    }
    if (params.has('v')) {
      params.delete('v')
    }
    return params.toString()
  } catch (error) {
    console.error('Error transforming query params:', error)
    return ''
  }
}

interface LinkRendererProps {
  text: string
}

const LinkRenderer: React.FC<LinkRendererProps> = ({ text }) => {
  // const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\.+)?/
  const matchYouTube = text.match(youtubeRegex)
  const [isIframeVisible, setIframeVisible] = useState(false)
  if (matchYouTube) {
    const transformedParams = transformQueryParams(matchYouTube[0])
    const videoId = matchYouTube[0]?.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? ''
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    return (
      <>
      <div className="aspect-video bg-gray-200 relative mt-4 w-full">
        {!isIframeVisible
          ? (
            <div
              className="absolute inset-0 bg-cover bg-center cursor-pointer"
              style={{ backgroundImage: `url(${thumbnailUrl})` }}
              onClick={() => { setIframeVisible(true) }}
            >
              <div className="absolute inset-0 flex items-center justify-center ">
                <button className="text-white text-5xl cursor-pointer">▶</button>
              </div>
            </div>
            )
          : (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&${transformedParams}`}
              title="YouTube video player"
              width="560"
              height="315"
              allow="autoplay; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
            )}
      </div>
      </>
    )
  }

  return null
}

export default LinkRenderer
