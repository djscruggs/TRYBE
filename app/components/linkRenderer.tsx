import React, { useState } from 'react'

const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})([?&][^#\s]*)?/
// convert url query param &t=10s to &start=10 because embeds use different query params
function transformQueryParams (queryParams: string): string {
  const result = queryParams.replace(/&t=(\d+)(s)?/, '&start=$1')
  return result
}

export const removeRenderedLinks = (text: string): string => {
  return text.replace(youtubeRegex, '')
}

interface LinkRendererProps {
  text: string
}

const LinkRenderer: React.FC<LinkRendererProps> = ({ text }) => {
  const matchYouTube = text.match(youtubeRegex)
  const [isIframeVisible, setIframeVisible] = useState(false)

  if (matchYouTube) {
    const videoId = matchYouTube[1]
    const queryParams = matchYouTube[2] || ''
    const transformedParams = transformQueryParams(queryParams)
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

    return (
      <>
      <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative">
        {!isIframeVisible
          ? (
            <div
              className="w-full h-full bg-cover bg-center cursor-pointer"
              style={{ backgroundImage: `url(${thumbnailUrl})` }}
              onClick={() => { setIframeVisible(true) }}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <button className="text-white text-2xl">▶</button>
              </div>
            </div>
            )
          : (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1${transformedParams}`}
              title="YouTube video player"
              width="560"
              height="315"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
