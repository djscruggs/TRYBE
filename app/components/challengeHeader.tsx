import { JSX } from 'react'
import { resizeImageToFit } from '~/utils/helpers'
import { type Challenge, type ChallengeSummary } from '~/utils/types'
import { Link } from 'react-router';
import ChallengeIcon from './challengeIcon'
import MenuChallenge from './menuChallenge'
export default function ChallengeHeader ({ challenge, size, className }: { challenge: Challenge | ChallengeSummary, size: 'small' | 'large', className?: string, isMember?: boolean }): JSX.Element {
  const imgSize = size === 'small' ? 60 : 500
  const [imgWidth, imgHeight] = resizeImageToFit(Number(challenge.coverPhotoMeta?.width), Number(challenge.coverPhotoMeta?.height), imgSize)
  return (
    <>
    {size === 'large'
      ? (
          <>
            <div className={`${challenge.coverPhotoMeta?.secure_url ? '' : 'mt-0.5 mb-2'} flex justify-center ${className ?? ''}`}>
            {challenge.coverPhotoMeta?.secure_url && <img src={challenge.coverPhotoMeta?.secure_url} alt={`${challenge?.name} cover photo`} className={`max-w-[${imgWidth}px] max-h-[${imgHeight}px] object-cover`} />}
            </div>
          </>
        )
      : (
      <div className={`flex flex-row justify-start items-center w-full relative ${className ?? ''}`}>
        <Link to={`/challenges/v/${challenge.id}`}>
          <ChallengeIcon icon={challenge.icon as string | undefined} size={size} />
        </Link>
        <div className='text-2xl pl-2'>{challenge.name}</div>
        <div className='ml-4'>
          <MenuChallenge challenge={challenge} />
        </div>

      </div>
        )}
    </>
  )
}
