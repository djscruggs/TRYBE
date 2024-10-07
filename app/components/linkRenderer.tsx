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
      <iframe
        width="500"
        height="280"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    )
  }

  // Future: Add more conditions for other platforms like Twitter here

  return null
}

export default LinkRenderer
