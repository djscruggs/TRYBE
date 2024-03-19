import React, { useContext } from 'react'
import {
  Card,
  Button
} from '@material-tailwind/react'
import { GiShinyApple } from 'react-icons/gi'
import { SlShareAlt } from 'react-icons/sl'
import { CiChat1 } from 'react-icons/ci'
import { FaRegCalendarAlt, FaUserFriends, FaRegHeart } from 'react-icons/fa'
import { type ChallengeSummary } from '../utils/types.client'
import { colorToClassName, textColorFromContainer, getIconOptionsForColor, buttonColorFromContainer } from '~/utils/helpers'
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { Link, useNavigate } from '@remix-run/react'

export default function CardChallenge ({ challenge }: { challenge: ChallengeSummary }): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const textColor = textColorFromContainer(challenge.color, 'white')
  const bgColor = colorToClassName(challenge.color, 'red')
  const buttonColor = buttonColorFromContainer(bgColor, 'white')
  const buttonTextColor = textColorFromContainer(buttonColor, 'red')
  const goToChallenge = (): void => {
    const url = `/challenges/${challenge.id}`
    if (currentUser) {
      navigate(url)
    } else {
      localStorage.setItem('redirect', url)
      navigate('/signup')
    }
  }
  const iconOptions: Record<string, JSX.Element> = getIconOptionsForColor(bgColor)
  return (
    <div className="mt-2 border-0 drop-shadow-none mr-2 w-full">
      <div className="drop-shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={`md:col-span-2 bg-${bgColor} p-2 border-1 drop-shadow-lg border-gray rounded-md`}>
            <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col justify-center items-center col-span-1">
                <div className={`bg-transparent border-2 border-${textColor} text-${textColor} rounded-full w-16 h-16 flex items-center justify-center`}>
                 {iconOptions[challenge.icon] || <GiShinyApple className={`text-${textColor} h-8 w-8`} />}
                </div>
                <div className="flex justify-center items-center mt-2">
                  <FaRegCalendarAlt className={`text-${textColor} h-4 w-4 mr-1`} />
                  <span className={`text-${textColor} text-xs pr-4`}>7 days</span>
                  <FaUserFriends className={`text-${textColor} h-4 w-4`} />
                  <span className={`text-${textColor} text-xs pl-2`}>{challenge._count.members}</span>
                </div>
              </div>
              <div className="flex flex-col items-center col-span-2">
                <div className={`mt-2 font-bold text-${textColor}`}>{challenge.name}</div>
                {currentUser && challenge.userId === currentUser.id && (<Link className={`underline text-xs text-${textColor}`} to = {`/challenges/${challenge.id}/edit`}>edit</Link>)}
                <Button onClick={goToChallenge} className={`bg-${buttonColor} text-${buttonTextColor} p-3 py-2 rounded-full mt-3`}>Sign up!</Button>
              </div>
            </div>
          </Card>
        </div>
        {/* <span className="text-xs text-gray-500">2 hours ago</span> */}
      </div>
      <hr />
      <div className="grid grid-cols-3 text-center py-2 cursor-pointer">
        <div className="flex justify-center items-center">
        <Link to={`/challenges/${challenge.id}/comments#comments`}>
          <CiChat1 className="text-gray mr-1 inline" />
          <span className="text-xs">{challenge._count.comments} comments</span>
          </Link>
        </div>
        <div className="flex justify-center items-center cursor-pointer">
          {/* Replace with the actual heart icon import */}
          <FaRegHeart className="text-gray text-sm mr-1" />
          <span className="text-xs" onClick={goToChallenge}>{challenge._count.likes} likes</span>
        </div>
        <div className="flex justify-center items-center cursor-pointer">
          <SlShareAlt className="text-gray text-sm mr-1" />
          <span className="text-xs">Share</span>
        </div>
      </div>
    </div>
  )
}
