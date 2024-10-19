import React from 'react'

const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

export const removeRenderedLinks = (text: string): string => {
  return text.replace(youtubeRegex, '')
}

interface LinkRendererProps {
  text: string
}

const LinkRenderer: React.FC<LinkRendererProps> = ({ text }) => {
  const matchYouTube = text.match(youtubeRegex)

  if (matchYouTube) {
    const videoId = matchYouTube[1]
    return (
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          width="560"
          height="315"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    )
  }

  // Future: Add more conditions for other platforms like Twitter here

  return null
}

export default LinkRenderer
