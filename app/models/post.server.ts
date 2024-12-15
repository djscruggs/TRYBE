import { type Post, type Prisma } from '@prisma/client'
import { prisma } from './prisma.server'
import { deleteFromCloudinary } from '../utils/uploadFile'
type ExtendedPost = Post & {
  videoMeta?: Prisma.JsonValue
  imageMeta?: Prisma.JsonValue
}
export const createPost = async (
  post: Pick<Post, 'title' | 'body' | 'userId'>
): Promise<Post> => {
  return await prisma.post.create({
    data: post
  })
}
export const updatePost = async (
  post: Prisma.PostUpdateInput & Record<string, any>
): Promise<Post> => {
  // extract id, computed and other fields that prisma squawks about on update
  const { id, challengeId, userId, live, ...data } = post
  return await prisma.post.update({
    where: { id },
    data
  })
}
export const loadPost = async (postId: string | number): Promise<ExtendedPost | null> => {
  const id = Number(postId)
  return await prisma.post.findUnique({
    where: {
      id
    },
    include: {
      _count: {
        select: { comments: true, likes: true }
      },
      user: {
        include: {
          profile: true
        }
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
      challenge: true,
      user: {
        include: { profile: true }
      }
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
export const deletePost = async (postId: number, userId: number): Promise<ExtendedPost> => {
  const id = Number(postId)
  const uid = Number(userId)
  const post: ExtendedPost | null = await loadPost(id)

  if (post?.videoMeta && typeof post.videoMeta === 'object' && 'public_id' in post.videoMeta) {
    await deleteFromCloudinary((post.videoMeta as { public_id: string }).public_id, 'video')
  }

  if (post?.imageMeta && typeof post.imageMeta === 'object' && 'public_id' in post.imageMeta) {
    await deleteFromCloudinary((post.imageMeta as { public_id: string }).public_id, 'image')
  }

  return await prisma.post.delete({
    where: {
      id,
      userId: uid
    }
  }) as ExtendedPost
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

export const fetchUserPosts = async (userId: number): Promise<Post[]> => {
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
      },
      user: {
        include: {
          profile: true
        }
      }
    }
  })
}
