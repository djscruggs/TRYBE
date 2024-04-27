import { type Note } from '@prisma/client'
import { prisma } from './prisma.server'

export const createNote = async (
  note: Pick<Note, 'body' | 'userId' | 'replyToId' | 'challengeId' | 'commentId'>
): Promise<Note> => {
  const newNote = await prisma.note.create({
    data: note
  })
  void updateCounts(newNote)
  return newNote
}
export const updateNote = async (note: prisma.noteCreateInput): Promise<Note> => {
  const { id, ...data } = note
  const result = await prisma.note.update({
    where: { id },
    data
  })
  void updateCounts(result)
  return result
}
export const updateCounts = async (note: prisma.note): Promise<void> => {
  if (!note.replyToId) return
  const count = await prisma.note.count({
    where: { replyToId: Number(note.replyToId) }
  })
  return await prisma.note.update({
    where: { id: Number(note.replyToId) },
    data: { replyCount: count }
  })
}
export const loadNote = async (noteId: string | number): Promise<Note | null> => {
  const id = Number(noteId)
  return await prisma.note.findUnique({
    where: {
      id
    },
    include: {
      _count: {
        select: { replies: true, likes: true }
      }
    }
  })
}

export const deleteNote = async (noteId: string | number, userId: string | number): Promise<Note> => {
  const id = Number(noteId)
  const uid = Number(userId)
  const deleted = await prisma.note.delete({
    where: {
      id,
      userId: uid
    }
  })
  void updateCounts(deleted)
  return deleted
}
export const loadRepost = async (replyToId: string | number, userId: string | number, body: string | null): Promise<Note | null> => {
  const id = Number(replyToId)
  return await prisma.note.findFirst({
    where: {
      replyToId: Number(replyToId),
      userId: Number(userId),
      body
    }
  })
}
export const loadNoteSummary = async (noteId: string | number): Promise<Record<string, any> | null> => {
  const id = Number(noteId)
  const note = await prisma.note.findUnique({
    where: {
      id
    },
    include: {
      user: {
        include: {
          profile: true
        }
      },
      challenge: true,
      post: true,
      _count: {
        select: { replies: { where: { isShare: false } }, likes: true }
      },
      replyTo: true
    }
  })
  return note
}
export const loadUserNotes = async (userId: string | number): Promise<Note[]> => {
  const uid = Number(userId)
  return await prisma.note.findMany({
    where: {
      userId: uid
    },
    include: {
      _count: {
        select: { replies: true, likes: true }
      }
    }
  })
}
export const fetchNotes = async (): Promise<Note[]> => {
  return await prisma.note.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      _count: {
        select: { replies: true, likes: true }
      }
    }
  })
}
export const fetchUserNotes = async (userId: number): Promise<Note[]> => {
  return await prisma.note.findMany({
    where: {
      userId
    },
    include: {
      _count: {
        select: { replies: true, likes: true }
      }
    }
  })
}
