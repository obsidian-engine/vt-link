import { create } from 'zustand'

type UIState = {
  sidebarOpen: boolean
  setOpen: (v: boolean) => void
  isLoading: boolean
  setLoading: (v: boolean) => void
}

export const useUI = create<UIState>((set) => ({
  sidebarOpen: false,
  setOpen: (v) => set({ sidebarOpen: v }),
  isLoading: false,
  setLoading: (v) => set({ isLoading: v }),
}))