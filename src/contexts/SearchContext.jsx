import { useEffect, useMemo, useState } from 'react'
import {
  defaultSearchDraft,
  SearchContext,
} from './searchContextValue'

const STORAGE_KEY = 'travolish.searchDraft'

function readStoredDraft() {
  if (typeof window === 'undefined') return defaultSearchDraft

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultSearchDraft
    return { ...defaultSearchDraft, ...JSON.parse(stored) }
  } catch {
    return defaultSearchDraft
  }
}

export function SearchProvider({ children }) {
  const [searchDraft, setSearchDraftState] = useState(readStoredDraft)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(searchDraft))
  }, [searchDraft])

  const value = useMemo(() => {
    const updateSearchDraft = (patch) => {
      setSearchDraftState((current) => ({ ...current, ...patch }))
    }

    const resetSearchDraft = () => setSearchDraftState(defaultSearchDraft)

    return {
      searchDraft,
      setSearchDraft: setSearchDraftState,
      updateSearchDraft,
      resetSearchDraft,
    }
  }, [searchDraft])

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  )
}
