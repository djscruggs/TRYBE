import { type Thread } from '@prisma/client'
import { prisma } from './prisma.server'

export const createThread = async (
  thread: Pick<Thread, 'body' | 'userId' | 'replyToId' | 'challengeId' | 'commentId'>
): Promise<Thread> => {
  const newThread = await prisma.thread.create({
    data: thread
  })
  void updateCounts(newThread)
  return newThread
}
export const updateThread = async (thread: prisma.threadCreateInput): Promise<Thread> => {
  const { id, ...data } = thread
  const result = await prisma.thread.update({
    where: { id },
    data
  })
  void updateCounts(result)
  return result
}
export const updateCounts = async (thread: prisma.thread): Promise<void> => {
  const commentCount = await prisma.comment.count({
    where: { threadId: Number(thread.id) }
  })
  const likeCount = await prisma.like.count({
    where: { threadId: Number(thread.id) }
  })
  await prisma.thread.update({
    where: { id: Number(thread.id) },
    data: { commentCount, likeCount }
  })
}
export const loadThread = async (threadId: string | number): Promise<Thread | null> => {
  const id = Number(threadId)
  return await prisma.thread.findUnique({
    where: {
      id
    },
    include: {
      _count: {
        select: { comments: true, likes: true }
      }
    }
  })
}

export const deleteThread = async (threadId: string | number, userId: string | number): Promise<Thread> => {
  const id = Number(threadId)
  const uid = Number(userId)
  const deleted = await prisma.thread.delete({
    where: {
      id,
      userId: uid
    }
  })
  void updateCounts(deleted)
  return deleted
}
export const loadThreadSummary = async (threadId: string | number): Promise<Thread | null> => {
  const id = Number(threadId)
  const thread = await prisma.thread.findUnique({
    where: {
      id
    },
    include: {
      user: {
        include: {
          profile: true
        }
      },
      challenge: true
    }
  })
  return thread
}
export const loadUserThreads = async (userId: string | number): Promise<Thread[]> => {
  const uid = Number(userId)
  return await prisma.thread.findMany({
    where: {
      userId: uid
    },
    include: {
      _count: {
        select: { comments: true, likes: true }
      }
    }
  })
}
export const fetchThreads = async (): Promise<Thread[]> => {
  return await prisma.thread.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      _count: {
        select: { comments: true, likes: true }
      }
    }
  })
}
export const fetchUserThreads = async (userId: number): Promise<Thread[]> => {
  return await prisma.thread.findMany({
    where: {
      userId
    },
    include: {
      _count: {
        select: { comments: true, likes: true }
      }
    }
  })
}
