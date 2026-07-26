import { useCallback, useEffect, useMemo, useState } from 'react'
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

  const updateSearchDraft = useCallback((patch) => {
    setSearchDraftState((current) => ({ ...current, ...patch }))
  }, [])

  const resetSearchDraft = useCallback(() => setSearchDraftState(defaultSearchDraft), [])

  const value = useMemo(
    () => ({ searchDraft, setSearchDraft: setSearchDraftState, updateSearchDraft, resetSearchDraft }),
    [searchDraft, updateSearchDraft, resetSearchDraft],
  )

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  )
}
