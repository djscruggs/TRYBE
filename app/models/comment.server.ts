import { prisma } from './prisma.server'

interface FetchCommentsParams {
  challengeId?: number
  postId?: number
}

export const fetchComments = async (params: FetchCommentsParams): Promise<prisma.comment[]> => {
  const { challengeId, postId } = params
  if (!challengeId && !postId) {
    throw new Error('challengeId or postId must be provided')
  }
  const comments = await prisma.comment.findMany({
    where: {
      AND: {
        replyToId: null,
        OR: [
          { challengeId: challengeId ? Number(challengeId) : undefined },
          { postId: postId ? Number(postId) : undefined }
        ]
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: {
        include: {
          profile: true
        }
      },
      replies: {
        include: {
          user: {
            include: {
              profile: true
            }
          },
          replies: {
            include: {
              user: {
                include: {
                  profile: true
                }
              },
              replies: {
                include: {
                  user: {
                    include: {
                      profile: true
                    }
                  },
                  replies: {
                    include: {
                      user: {
                        include: {
                          profile: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  return comments
}
export const fetchReplies = async (commentId: string | number): Promise<prisma.comment[]> => {
  const id = Number(commentId)
  return await prisma.comment.findUnique({
    where: { id },
    orderBy: {
      createdAt: 'desc'
    },
    replies: {
      include: {
        user: {
          include: {
            profile: true
          }
        },
        replies: {
          include: {
            user: {
              include: {
                profile: true
              }
            },
            replies: {
              include: {
                user: {
                  include: {
                    profile: true
                  }
                },
                replies: {
                  include: {
                    user: {
                      include: {
                        profile: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
}

export const createComment = async (comment: prisma.commentCreateInput): Promise<prisma.comment> => {
  console.log('comment data', comment)
  try {
    const newComment = await prisma.comment.create({
      data: comment
    })
    void upateCounts(newComment)
    return newComment
  } catch (error) {
    console.error('error', error)
    return error
  }
}
export const updateComment = async (comment: prisma.commentCreateInput): Promise<prisma.comment> => {
  const id = Number(comment.id)
  delete comment.id
  try {
    const newComment = await prisma.comment.update({
      where: { id },
      data: comment
    })
    // update counts of replies
    void upateCounts(newComment)
    return newComment
  } catch (error) {
    console.error('error', error)
    return error
  }
}
export const loadComment = async (commentId: string | number, userId?: string | number | undefined): Promise<prisma.comment> => {
  const id = Number(commentId)
  const where: prisma.commentWhereUniqueInput = { id }
  if (userId) {
    where.userId = Number(userId)
  }
  return await prisma.comment.findUnique({
    where,
    include: {
      user: {
        include: {
          profile: true
        }
      }
    }
  })
}

export const deleteComment = async (commentId: string | number): Promise<prisma.comment> => {
  const id = Number(commentId)
  const deleted = await prisma.comment.delete({
    where: {
      id
    }
  })
  void upateCounts(deleted)
  return deleted
}

const upateCounts = async (comment: prisma.comment): Promise<void> => {
  console.log('updaeCounts', comment)
  if (comment.replyToId) {
    const replyToId = Number(comment.replyToId)
    const count1 = await prisma.comment.count({
      where: { replyToId }
    })
    await prisma.comment.update({
      where: { id: replyToId },
      data: { replyCount: count1 }
    })
    if (comment.postId) {
      const postId = Number(comment.postId)
      const count2 = await prisma.comment.count({
        where: { postId }
      })
      await prisma.post.update({
        where: { id: postId },
        data: { commentCount: count2 }
      })
    }
    if (comment.challengeId) {
      const challengeId = Number(comment.challengeId)
      const count3 = await prisma.comment.count({
        where: { challengeId }
      })
      await prisma.challenge.update({
        where: { id: challengeId },
        data: { commentCount: count3 }
      })
    }
  }
}
