import { create } from 'zustand'

const STORAGE_KEY = 'travolish-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem(STORAGE_KEY, theme)
}

const useThemeStore = create((set) => ({
  theme: getInitialTheme(),

  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },

  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return { theme: next }
    })
  },
}))

// Sync on startup in case the store initialises after index.html's inline script
applyTheme(getInitialTheme())

export default useThemeStore
