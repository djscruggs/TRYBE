import React, { useState, useContext, useEffect, JSX } from "react";
import FormComment from "./formComment";
import { Spinner } from '~/components/ui/spinner'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';
import { CurrentUserContext } from "~/contexts/CurrentUserContext";
import { textToJSX } from "~/utils/helpers";
import { toast } from "react-hot-toast";
import axios from "axios";
import type { Comment } from "~/utils/types";
import CommentsContainer from "./commentsContainer";
import { formatDistanceToNow } from "date-fns";
import { FaRegComment } from "react-icons/fa";
import Liker from "./liker";
import { Lightbox } from "react-modal-image";
import DialogDelete from "./dialogDelete";
interface CommentsProps {
  comment: Comment | null;
  isReply: boolean | undefined;
  allowReplies: boolean;
}

export default function CommentItem(props: CommentsProps): JSX.Element {
  const [comment, setComment] = useState<Comment | null>(props.comment ?? null);
  const [replies, setReplies] = useState<Comment[]>(comment?.replies ?? []);
  const [newestReply, setNewestReply] = useState<Comment | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [replying, setReplying] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const { currentUser } = useContext(CurrentUserContext);

  const handleEdit = (): void => {
    if (!comment || deleting) return;
    setShowForm(true);
  };

  const handleDelete = async (event: any): Promise<void> => {
    event.preventDefault();
    event.stopPropagation();
    if (!comment) return;
    setDeleting(true);
    try {
      const formData = new FormData();
      formData.append("id", comment.id.toString());
      formData.append("intent", "delete");
      await axios.post("/api/comments", formData);
      toast.success("Comment deleted");
      setComment(null);
    } catch (error) {
      toast.error("Error deleting comment");
      console.error(error);
    } finally {
      setDeleting(false);
      setDeleteDialog(false);
    }
  };
  const cancelDialog = (event: any): void => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteDialog(false);
  };
  const afterSave = (comment: Comment): void => {
    setComment(comment);
    setShowForm(false);
  };
  const afterSaveReply = async (reply: Comment): Promise<void> => {
    // refresh comment after save
    if (replies) {
      const newReplies = [reply].concat(replies);
      setReplies(newReplies);
    } else {
      setNewestReply(reply);
    }

    setReplying(false);
  };
  const canReply = (): boolean => {
    if (typeof props.allowReplies === "undefined") {
      return Boolean(
        currentUser?.id && comment && (comment?.threadDepth ?? 0) < 5
      );
    }
    return props.allowReplies;
  };
  if (!comment) return <></>;
  return (
    <>
      {showForm ? (
        <div className="w-full border-l-2  pl-4 mb-4">
          <FormComment
            afterSave={afterSave}
            onCancel={() => {
              setShowForm(false);
            }}
            comment={comment}
          />
        </div>
      ) : (
        <>
          <div className="w-full pl-4">
            <div className={"relative mb-2 p-2 break-all"}>
              {comment.user?.id === currentUser?.id && (
                <div className="text-xs text-gray-500 w-sm flex text-right justify-end absolute top-2 right-2">
                  <span
                    className="underline cursor-pointer mr-1"
                    onClick={handleEdit}
                  >
                    edit
                  </span>
                  {deleting ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <span
                      className="underline cursor-pointer mr-1"
                      onClick={() => {
                        setDeleteDialog(true);
                      }}
                    >
                      delete
                    </span>
                  )}
                  {deleteDialog && (
                    <DialogDelete
                      prompt="Are you sure you want to delete this comment?"
                      isOpen={deleteDialog}
                      deleteCallback={(event: any) => {
                        handleDelete(event).catch((err) => {
                          console.error(err);
                        });
                      }}
                      onCancel={cancelDialog}
                    />
                  )}
                </div>
              )}
              <div className="flex">
                <div className="shrink-0">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage
                      src={
                        comment.user?.profile?.profileImage as string | undefined
                      }
                    />
                    <AvatarFallback>
                      {comment.user?.profile?.firstName?.charAt(0) ?? '?'}
                      {comment.user?.profile?.lastName?.charAt(0) ?? ''}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="grow">
                  <div className="text-xs mb-2">
                    {comment.user?.profile?.firstName}{" "}
                    {comment.user?.profile?.lastName} -{" "}
                    <span>
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  {comment?.body && textToJSX(comment.body)}
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
                    <video
                      className="w-full mt-2 cursor-pointer"
                      controls={true}
                    >
                      <source
                        src={comment.videoMeta.secure_url}
                        type={`video/${comment.videoMeta.format}`}
                      />
                    </video>
                  </div>
                )}
                <div className="flex justify-start mt-4">
                  {replying && (
                    <FormComment
                      afterSave={afterSaveReply}
                      onCancel={() => {
                        setReplying(false);
                      }}
                      replyToId={comment.id as number}
                    />
                  )}
                  {!replying && (
                    <>
                      <Liker
                        itemId={comment.id as number}
                        itemType="comment"
                        count={comment.likeCount}
                      />
                      {canReply() && (
                        <div className="ml-2">
                          <FaRegComment
                            className="h-4 w-4 text-grey cursor-pointer"
                            onClick={() => {
                              setReplying(true);
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* comment contains replies, so create a new container for those */}
          {replies && replies.length > 0 && (
            <div className="pl-4">
              <CommentsContainer
                newestComment={newestReply}
                comments={replies}
                isReply={true}
                allowReplies={canReply()}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
