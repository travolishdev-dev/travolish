import { useContext } from 'react'
import { SearchContext } from '../contexts/searchContextValue'

export function useSearchContext() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearchContext must be used inside SearchProvider')
  }
  return context
}
