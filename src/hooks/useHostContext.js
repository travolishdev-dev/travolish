import { useEffect, useState } from 'react'
import useAuthStore from '../stores/useAuthStore'
import { getHostListings } from '../services/hostListingsApi'

export default function useHostContext() {
  const backendUserId = useAuthStore((state) => state.backendUserId)
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!backendUserId) {
      setLoading(false)
      return
    }

    getHostListings(backendUserId)
      .then((data) => {
        const items = data?.content ?? (Array.isArray(data) ? data : [])
        setHotels(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [backendUserId])

  return {
    hostId: backendUserId,
    hotels,
    primaryHotelId: hotels[0]?.id ?? null,
    loading,
  }
}
