import { type Post } from '@prisma/client'
import { prisma } from './prisma.server'

export const createPost = async (
  post: Pick<Post, 'title' | 'body' | 'userId'>
) => {
  return await prisma.post.create({
    data: post
  })
}
export const updatePost = async (post: prisma.postCreateInput): Promise<Post> => {
  return await prisma.post.update({
    where: { id: post.id },
    data: post
  })
}
export const loadPost = async (postId: string | number): Promise<Post | null> => {
  const id = Number(postId)
  return await prisma.post.findUnique({
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
export const loadPostSummary = async (postId: string | number): Promise<Post | null> => {
  const id = Number(postId)
  return await prisma.post.findUnique({
    where: {
      id
    },
    include: {
      _count: {
        select: { comments: true, likes: true }
      },
      challenge: true
    }
  })
}
export const loadUserPosts = async (userId: string | number): Promise<Post[]> => {
  const uid = Number(userId)
  return await prisma.post.findMany({
    where: {
      userId: uid
    },
    include: {
      _count: {
        select: { likes: true, comments: true }
      }
    }
  })
}
export const deletePost = async (postId: number, userId: number): Promise<Post> => {
  const id = Number(postId)
  const uid = Number(userId)
  return await prisma.post.delete({
    where: {
      id,
      userId: uid
    }
  })
}
export const fetchPosts = async (): Promise<Post[]> => {
  return await prisma.post.findMany({
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
export const fetchMyPosts = async (userId: number): Promise<Post[]> => {
  return await prisma.post.findMany({
    where: {
      userId
    },
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
