import { type Note } from '@prisma/client'
import { prisma } from './prisma.server'

export const createNote = async (
  note: Pick<Note, 'body' | 'userId' | 'replyToId' | 'challengeId' | 'commentId'>
): Promise<Note> => {
  console.log('in create note with data', note)
  console.log('prismate', typeof prisma.note.create)
  return await prisma.note.create({
    data: note
  })
}
export const updateNote = async (note: prisma.noteCreateInput): Promise<Note> => {
  return await prisma.note.update({
    where: { id: note.id },
    data: note
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
export const loadNoteSummary = async (noteId: string | number): Promise<Array<Record<string, any>>> => {
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
export const deleteNote = async (noteId: string | number): Promise<Note> => {
  const id = Number(noteId)
  return await prisma.note.delete({
    where: {
      id
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
