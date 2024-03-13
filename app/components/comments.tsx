import React from 'react'

interface CommentsProps {
  challengeId: string | number
}

export default function Comments ({ challengeId }: CommentsProps): JSX.Element {
  return (
          <div>
            Comments
          </div>
  )
}
