import React, { useContext, useState, JSX } from "react";
import { Card } from '~/components/ui/card';
import type { PostSummary } from "~/utils/types";
// import { AiOutlineRetweet } from 'react-icons/ai'
// import { GoComment } from 'react-icons/go'
import { textToJSX, removeYouTubeLinks } from "~/utils/helpers";

import { CurrentUserContext } from "~/contexts/CurrentUserContext";
import AvatarLoader from "./avatarLoader";
import { useNavigate, useLocation } from "react-router";
import { toast } from "react-hot-toast";
import FormPost from "./formPost";
import axios from "axios";
import ShareMenu from "./shareMenu";
import { FaRegComment } from "react-icons/fa";
import Liker from "./liker";
import DialogDelete from "./dialogDelete";
import { format } from "date-fns";
import ChatDrawer from "~/components/chatDrawer";
import LinkRenderer from "./linkRenderer";
interface CardPostProps {
  post: PostSummary | null;
  isShare?: boolean;
  fullPost?: boolean;
  hideMeta?: boolean;
  revalidator?: Revalidator;
  isChat?: boolean;
  highlightedObject?: string | null;
  highlightedId?: number | null;
}
interface Revalidator {
  revalidate: () => void;
}

export default function CardPost(props: CardPostProps): JSX.Element {
  const { currentUser } = useContext(CurrentUserContext);
  const { fullPost, isShare, hideMeta, revalidator, isChat } = props;
  const dateTimeFormat = currentUser?.dateTimeFormat
    ? currentUser.dateTimeFormat
    : "M-dd-yyyy @ h:mm a";
  const [post, setPost] = useState(props.post);
  const [showComments, setShowComments] = useState(
    props.highlightedObject === "post" && props.highlightedId === post?.id
  );
  if (!post) return <></>;
  const [showLightbox, setShowLightbox] = useState(false);
  const [editing, setEditing] = useState(false);
  const location = useLocation();
  const isOwnRoute = location.pathname === `/posts/${post.id}`;
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const canEdit =
    (currentUser?.role === "ADMIN" || currentUser?.id === post.userId) &&
    !isShare;
  const goToPost = (): void => {
    if (isOwnRoute) return;
    navigate(`/posts/${post.id}`);
  };
  const handlePhotoClick = (event: any): void => {
    event.preventDefault();
    event.stopPropagation();
    setShowLightbox(true);
  };
  const handleEdit = (event: any): void => {
    if (!canEdit) return;
    event.preventDefault();
    event.stopPropagation();
    setEditing(true);
  };
  const handleDeleteDialog = (event: any): void => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteDialog(true);
  };
  const cancelDialog = (event: any): void => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteDialog(false);
  };
  const handleDelete = (event: any): void => {
    event.preventDefault();
    event.stopPropagation();
    axios
      .delete(`/api/posts/delete/${post.id}`)
      .then(() => {
        toast.success("Post deleted");
        if (revalidator) {
          revalidator.revalidate();
        }
        if (post.challengeId) {
          navigate(`/challenges/${post.challengeId}`);
        } else {
          navigate("/challenges");
        }
      })
      .catch((error) => {
        toast.error("Error deleting post");
        console.error("Error deleting post:", error);
      });
  };

  const afterSave = (post: PostSummary): void => {
    setPost(post);
    setEditing(false);
  };
  const getFullUrl = (): string => {
    return `${window.location.origin}/posts/${post.id}`;
  };
  return (
    <>
      {editing ? (
        <>
          <FormPost
            post={post}
            challenge={post.challenge}
            onCancel={() => {
              setEditing(false);
            }}
            afterSave={afterSave}
          />
        </>
      ) : (
        <div className={"mt-2 w-full border-0  drop-shadow-none mr-2"}>
          <div
            className={`drop-shadow-none ${!isOwnRoute ? "cursor-pointer" : ""}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className={`md:col-span-2 p-2  relative ${isChat ? "shadow-none bg-yellow" : "border drop-shadow-lg border-gray rounded-md"}`}
              >
                {post.challenge?.type === "SELF_LED" ? (
                  <>
                    <div className="bg-yellow w-full p-0 text-center absolute left-0 top-0 b-4 rounded-t-md">
                      This post is sent to members on Day{" "}
                      {post.publishOnDayNumber}
                    </div>
                    <div className="h-6"> </div>
                  </>
                ) : (
                  <>
                    {!post.published && !post.challengeId && (
                      <>
                        <div className="bg-yellow w-full p-0 text-center absolute left-0 top-0 b-4 rounded-t-md">
                          Draft
                        </div>
                        {/* spacer to push down the conent below */}
                        <div className="h-6"> </div>
                      </>
                    )}
                    {!post.live && post.published && post.publishAt && (
                      <>
                        <div className="bg-green-500 w-full p-0 text-white text-center absolute left-0 top-0 b-4 rounded-t-md">
                          Scheduled for {format(post.publishAt, dateTimeFormat)}
                        </div>
                        <div className="h-6"> </div>
                      </>
                    )}
                  </>
                )}
                <PostContent
                  post={post}
                  fullPost={fullPost ?? false}
                  handlePhotoClick={handlePhotoClick}
                >
                  {canEdit && !isShare && (
                    <div className="mt-2 text-xs text-gray-500 w-full text-right">
                      <span
                        className="underline cursor-pointer mr-1"
                        onClick={handleEdit}
                      >
                        edit
                      </span>
                      <span
                        className="underline cursor-pointer mr-1"
                        onClick={handleDeleteDialog}
                      >
                        delete
                      </span>
                    </div>
                  )}
                </PostContent>
                {deleteDialog && (
                  <DialogDelete
                    prompt="Are you sure you want to delete this note?"
                    isOpen={deleteDialog}
                    deleteCallback={(event: any) => {
                      handleDelete(event);
                    }}
                    onCancel={cancelDialog}
                  />
                )}
              </Card>
            </div>
            {/* <span className="text-xs text-gray-500">2 hours ago</span> */}
          </div>
          {!isShare && !hideMeta && (
            <>
              <hr className={`${isChat ? "border-0 none" : "border-gray"}`} />
              <div
                className={`grid grid-cols-3 text-center ${isChat ? "pt-2" : "py-2"} cursor-pointer w-full`}
              >
                <div
                  className="ml-6 flex justify-center items-center"
                  onClick={() => {
                    setShowComments(true);
                  }}
                >
                  <FaRegComment className="text-grey mr-1 inline" />
                  <span className="text-xs">{post.commentCount} comments</span>
                </div>
                <div className="flex justify-center items-center cursor-pointer">
                  <div className="mr-2">
                    <Liker
                      itemId={post.id}
                      itemType="post"
                      count={post.likeCount}
                      className="mr-2"
                    />
                  </div>
                </div>
                {post.public && post.published && (
                  <div className="flex justify-center items-center cursor-pointer">
                    <ShareMenu
                      copyUrl={getFullUrl()}
                      itemType="post"
                      itemId={post.id}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
      <ChatDrawer
        isOpen={showComments}
        placement="right"
        onClose={() => {
          setShowComments(false);
        }}
        size={500}
        id={post.id ?? 0}
        type="post"
      >
        <PostContent
          post={post}
          fullPost={fullPost ?? false}
          handlePhotoClick={handlePhotoClick}
        />
      </ChatDrawer>
    </>
  );
}

export const PostContent = (props: {
  post: PostSummary;
  fullPost: boolean;
  children?: React.ReactNode;
  handlePhotoClick: (event: any) => void;
}): JSX.Element => {
  const { post, fullPost, children, handlePhotoClick } = props;
  const maxLength = 300;
  const fullBodyStripped = removeYouTubeLinks(post.body ?? "");
  let shortBodyStripped = removeYouTubeLinks(post.body ?? "");
  let isTruncated = false;
  if (shortBodyStripped.length > maxLength) {
    shortBodyStripped = shortBodyStripped.slice(0, maxLength) + "...";
    isTruncated = true;
  }
  const finalBody = fullPost ? fullBodyStripped : shortBodyStripped;
  const [showFullBody, setShowFullBody] = useState(fullPost);

  return (
    <div className="flex items-start w-full">
      <AvatarLoader object={post} marginClass="mr-2" size="md"/>
      <div className="flex flex-col w-full h-full">
        <div className="font-bold my-2">{post.title}</div>
        <div>
          {textToJSX(
            String(showFullBody ? fullBodyStripped : shortBodyStripped)
          )}
        </div>
        {isTruncated && (
          <span
            className="text-xs underline text-blue cursor-pointer mr-1 mb-4 text-right italic"
            onClick={() => {
              setShowFullBody(!showFullBody);
            }}
          >
            {showFullBody ? "less" : "more"}
          </span>
        )}
        <LinkRenderer text={post.body ?? ""} />

        <div className="mt-4">
          {post.videoMeta?.secure_url && (
            <video
              className="recorded"
              src={post.videoMeta.secure_url}
              onClick={(event) => {
                event?.stopPropagation();
              }}
              controls
            />
          )}

          {post.imageMeta?.secure_url && (
            <img
              src={post.imageMeta.secure_url}
              alt="post picture"
              className="mt-4 cursor-pointer max-w-[200px]"
              onClick={handlePhotoClick}
            />
          )}
        </div>
        {children}
      </div>
    </div>
  );
};
