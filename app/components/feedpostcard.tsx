import { Card } from "~/utils/material-tailwind";
import { SlShareAlt } from "react-icons/sl";
import { FaRegComment, FaRegHeart } from "react-icons/fa";
import RandomAvatar from "./randomavatar";
import { useMobileSize } from "~/hooks/useMobileSize";
export default function FeedPostCard() {
  const isMobile = useMobileSize();
  return (
    <div className="mt-2 w-md border-0 drop-shadow-none mr-2">
      <div className="drop-shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex items-center">
            <RandomAvatar size={isMobile ? "md" : "xl"} className="mr-4" />
            <div className={`mb-2 text-${isMobile ? "sm" : "base"}`}>
              Stir fried some colorfull bell peppers and garnished with nuts,
              seeds, and basil. Getting better at food photography too!
            </div>
          </div>
          <Card className="md:col-span-2 p-0 border drop-shadow-lg border-gray rounded-lg">
            <img
              src="/images/stirfry.jpeg"
              className="rounded-lg cursor-pointer"
            />
          </Card>
        </div>
        <span className="text-xs text-gray-500">Yesterday</span>
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
        </div>
        <div className="flex justify-center items-center cursor-pointer">
          <SlShareAlt className="text-grey text-sm mr-1" />
          <span className="text-xs">Share</span>
        </div>
      </div>
    </div>
  );
}
