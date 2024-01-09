import {
  Card,
  CardBody,
  CardFooter,
  Button,
} from "@material-tailwind/react";
import { FcLike } from "react-icons/fc";
import { SlShareAlt } from "react-icons/sl";
import { CiChat1 } from "react-icons/ci";
import { FaRegCalendarAlt, FaUserFriends, FaRegHeart } from 'react-icons/fa';
import RandomAvatar from "./randomavatar";
 
export default function FeedCommunityCard() {
  return (
    <div className="mt-2 w-md border-0 drop-shadow-none mr-2">
      <div className="drop-shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex items-center">
            <RandomAvatar size='xl' className="mr-4" />
            <div className="mb-2 text-base">
              I just joined the meditation community! Excited to connect with you!
            </div>
          </div>
          <Card className="md:col-span-2 p-0 border-1 drop-shadow-lg border-gray rounded-lg">
            <img src="/images/meditation-outdoors.jpeg" className="rounded-lg cursor-pointer"/>
          </Card>
        </div>
        <span className="text-xs text-gray-500">6 hours ago</span>
      </div>
      <hr />
      <div className="grid grid-cols-3 text-center py-2 cursor-pointer">
        <div className="flex justify-center items-center">
          <CiChat1 className="text-gray mr-1" />
          <span className="text-xs">1 comment</span>
        </div>
        <div className="flex justify-center items-center cursor-pointer">
          {/* Replace with the actual heart icon import */}
          <FcLike className="text-gray text-sm mr-1" color="red"/>
          <span className="text-xs">10 likes</span>
        </div>
        <div className="flex justify-center items-center cursor-pointer">
          <SlShareAlt  className="text-gray text-sm mr-1" />
          <span className="text-xs">Share</span>
        </div>
      </div>
    </div>
  );
}