import { create } from 'zustand'

interface ShouldRefreshType {
  shouldRefresh: boolean
  setShouldRefresh: (shouldRefresh: boolean) => void
}

export const useShouldRefresh = create<ShouldRefreshType>((set) => ({
  shouldRefresh: true,
  setShouldRefresh: (shouldRefresh) => {
    set({ shouldRefresh })
  }
}))
