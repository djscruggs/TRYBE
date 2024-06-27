import { resizeImageToFit } from '~/utils/helpers'
import { type Challenge, type ChallengeSummary } from '~/utils/types'
import { Link } from '@remix-run/react'
import Logo from './logo'
import MenuChallenge from './menuChallenge'

export default function ChallengeHeader ({ challenge, size }: { challenge: Challenge | ChallengeSummary, size: 'small' | 'large' }): JSX.Element {
  const [imgWidth, imgHeight] = resizeImageToFit(Number(challenge.coverPhotoMeta?.width), Number(challenge.coverPhotoMeta?.height), 60)
  return (
    <>
    {size === 'large'
      ? (
          <>
            <div className={`${challenge.coverPhotoMeta?.secure_url ? '' : 'mt-0.5 mb-2'} flex justify-center`}>
            {challenge.coverPhotoMeta?.secure_url && <img src={challenge.coverPhotoMeta?.secure_url} alt={`${challenge?.name} cover photo`} className={`max-w-[${imgWidth}px] max-h-[${imgHeight}px] object-cover`} />}
            </div>
          </>
        )
      : (
      <div className='flex flex-row justify-start items-center w-full relative'>
        <Link to={`/challenges/${challenge.id}`}>
          {challenge.coverPhotoMeta?.secure_url
            ? <img
              src={challenge.coverPhotoMeta?.secure_url}
              alt={`${challenge?.name} cover photo`}
              width={imgWidth}
              height={imgHeight}
              className={`max-w-[${imgWidth}px] max-h-[${imgHeight}px] rounded-md`}
            />
            : <Logo size='40px' backgroundColor='yellow'/>
          }
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
