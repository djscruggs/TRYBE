import {
  Card,
  CardBody,
  CardFooter,
  Button
} from '~/utils/material-tailwind'
import { GiShinyApple } from 'react-icons/gi'
import { AiFillCaretDown } from 'react-icons/ai'
import { SlShareAlt } from 'react-icons/sl'
import { FaRegComment, FaRegCalendarAlt, FaUserFriends, FaRegHeart } from 'react-icons/fa'
import RandomAvatar from './randomavatar'
import { useMobileSize } from '~/hooks/useMobileSize'

export default function FeedChallengeCard () {
  const isMobile = useMobileSize()
  return (
    <div className="mt-2 w-md border-0 drop-shadow-none mr-2">
      <div className="drop-shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex items-center">
            <RandomAvatar size={isMobile ? 'md' : 'xl'} className="mr-4" />
            <div className={`mb-2 text-${isMobile ? 'sm' : 'base'}`}>
              Three more spots available in this challenge! Any takers?
            </div>
          </div>
          <Card className="md:col-span-2 bg-[#FBF18D] p-2 border-1 drop-shadow-lg border-gray rounded-md">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center col-span-1">
                <div className="bg-transparent border-2 border-black rounded-full w-16 h-16 flex items-center justify-center">
                  <GiShinyApple className="text-black text-3xl" />
                </div>
                <div className="flex justify-center items-center mt-2">
                  <FaRegCalendarAlt className="text-black h-4 w-4" />
                  <span className="text-xs pr-4">7 days</span>
                  <FaUserFriends className="text-black h-4 w-4" />
                  <span className="text-xs pl-2">3</span>
              </div>
              </div>
              <div className="flex flex-col items-center col-span-2">
                <div className="mt-2 font-bold">Vegetarian Diet Challenge</div>
                <Button className="bg-red p-3 py-2 rounded-full mt-3">Sign up!</Button>
              </div>
            </div>
          </Card>
        </div>
        <span className="text-xs text-gray-500">2 hours ago</span>
      </div>
      <hr />
      <div className="grid grid-cols-3 text-center py-2 cursor-pointer">
        <div className="flex justify-center items-center">
          <FaRegComment className="text-grey mr-1" />
          <span className="text-xs">12 comments</span>
        </div>
        <div className="flex justify-center items-center cursor-pointer">
          {/* Replace with the actual heart icon import */}
          <FaRegHeart className="text-grey text-sm mr-1" />
          <span className="text-xs">32 likes</span>
        </div>
        <div className="flex justify-center items-center cursor-pointer">
          <SlShareAlt className="text-grey text-sm mr-1" />
          <span className="text-xs">Share</span>
        </div>
      </div>
    </div>
  )
}
