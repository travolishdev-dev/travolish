import { createContext } from 'react'

export const defaultSearchDraft = {
  destination: '',
  checkIn: '',
  checkOut: '',
  adults: 2,
  children: 0,
}

export const SearchContext = createContext(null)
