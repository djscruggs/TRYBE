import { useState, JSX } from "react";
import FormChat from "./formChat";
import { textToJSX } from "~/utils/helpers";
import type { Comment } from "~/utils/types";
import { formatDistanceToNow, isValid } from "date-fns";
import Liker from "./liker";
import { Lightbox } from "react-modal-image";
import AvatarLoader from "./avatarLoader";
import ChatDrawer from "./chatDrawer";
import { FaRegComment } from "react-icons/fa";
import ActionsPopupMenu from "./actionsPopupMenu";
interface CommentsProps {
  comment: Comment | null;
  allowReply?: boolean;
  highlightedObject?: string | null;
  highlightedId?: number | null;
  onDelete?: (comment: Comment) => void;
}

export default function ChatItem(props: CommentsProps): JSX.Element {
  const [comment, setComment] = useState<Comment | null>(props.comment ?? null);
  const [deleted, setDeleted] = useState(false);
  const [showReplies, setShowReplies] = useState(
    Boolean(
      props.highlightedObject === "comment" &&
        props.highlightedId === comment?.id
    ) || false
  );
  const allowReply = props.allowReply ?? false;
  const [showLightbox, setShowLightbox] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleEdit = (): void => {
    if (!comment || deleted) return;
    setShowForm(true);
  };
  const afterDelete = (comment: Comment): void => {
    setDeleted(true);
    props.onDelete?.(comment);
  };
  const handleComments = (event: any): void => {
    event.preventDefault();
    event.stopPropagation();
    setShowForm(false);
  };

  const afterSave = (comment: Comment): void => {
    setComment(comment);
    setShowForm(false);
  };
  if (!comment || deleted) return <></>;
  return (
    <>
      {showForm ? (
        <div className="w-full border-l-2  pl-4 mb-4 pr-2">
          <FormChat
            afterSave={afterSave}
            type="comment"
            onCancel={() => {
              setShowForm(false);
            }}
            comment={comment}
          />
        </div>
      ) : (
        <>
          <div className="w-full p-1 z-max hover:bg-gray-100 pr-2 pt-2 pl-2">
            <div className="relative break-all">
              <CommentContent
                comment={comment}
                showLightbox={showLightbox}
                setShowLightbox={setShowLightbox}
              />
              <div className="relative flex flex-row ml-12">
                {allowReply && (
                  <>
                    <div
                      className={`text-xs cursor-pointer ${comment.replyCount > 0 ? "mr-4" : "mr-2"}`}
                      onClick={handleComments}
                    >
                      <span
                        onClick={() => {
                          setShowReplies(true);
                        }}
                      >
                        <FaRegComment className="text-grey h-4 w-4 mr-2 inline" />
                        {comment.replyCount > 0 &&
                          `${comment.replyCount} comments`}
                      </span>
                    </div>
                    <ChatDrawer
                      isOpen={showReplies}
                      placement="right"
                      onClose={() => {
                        setShowReplies(false);
                      }}
                      comments={comment.replies}
                      size={500}
                      id={comment.id as number}
                      type="comment"
                      commentCount={comment.replyCount}
                    >
                      <CommentContent
                        comment={comment}
                        showLightbox={showLightbox}
                        setShowLightbox={setShowLightbox}
                        isDrawerTop={
                          props.highlightedObject === "comment" &&
                          props.highlightedId === comment.id
                        }
                      />
                    </ChatDrawer>
                  </>
                )}
                <Liker
                  itemId={comment.id as number}
                  itemType="comment"
                  count={comment.likeCount}
                />
                <ActionsPopupMenu
                  object={comment}
                  type="comment"
                  editCallback={handleEdit}
                  afterDelete={afterDelete}
                  className="ml-2"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

const CommentContent = (props: {
  comment: Comment;
  showLightbox: boolean;
  setShowLightbox: (showLightbox: boolean) => void;
  isDrawerTop?: boolean;
}): JSX.Element => {
  const { comment, showLightbox, setShowLightbox, isDrawerTop } = props;
  let date = new Date();
  if (isValid(comment?.createdAt)) {
    date = new Date(comment.createdAt);
  }
  const formattedDate = formatDistanceToNow(date, { addSuffix: true });
  return (
    <>
      <div className={`flex ${isDrawerTop ? "pl-2" : ""}`}>
        <div className="shrink-0">
          <AvatarLoader
            object={comment}
            clickable={true}
            size="sm"
            shape="circle"
            marginClass="mr-2"
          />
        </div>
        <div className="grow">
          <div className="text-xs mb-2">
            <span className="font-bold">{comment.user?.profile?.fullName}</span>{" "}
            - <span className="text-xs">{formattedDate}</span>
          </div>
          {textToJSX(comment.body)}
        </div>
      </div>
      <div className="ml-10 mb-4">
        {comment.imageMeta?.secure_url && (
          <div className="mt-4">
            <img
              src={comment.imageMeta.secure_url}
              onClick={() => {
                setShowLightbox(true);
              }}
              className="w-1/2 mt-2 cursor-pointer"
            />
            {showLightbox && (
              <Lightbox
                medium={comment.imageMeta.secure_url}
                large={comment.imageMeta.secure_url}
                alt="comment photo"
                onClose={() => {
                  setShowLightbox(false);
                }}
              />
            )}
          </div>
        )}
        {comment.videoMeta?.secure_url && (
          <div className="mt-4">
            <video className="w-full mt-2 cursor-pointer" controls={true}>
              <source
                src={comment.videoMeta.secure_url}
                type={`video/${comment.videoMeta.format}`}
              />
            </video>
          </div>
        )}
      </div>
    </>
  );
};
