import { useEffect, useState } from 'react'
import usePortalViewer from './usePortalViewer'
import { findUserByEmail, createUser } from '../services/usersApi'
import { getHostListings } from '../services/hostListingsApi'

export default function useHostContext() {
  const { viewer } = usePortalViewer()
  const [hostId, setHostId] = useState(null)
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const email = viewer.email
    if (!email) {
      setLoading(false)
      return
    }

    const nameParts = (viewer.fullName ?? '').trim().split(' ')
    findUserByEmail(email)
      .catch(async (err) => {
        if (!err.message?.includes('404')) throw err
        return createUser({ firstName: nameParts[0] ?? '', lastName: nameParts.slice(1).join(' '), email })
      })
      .then((user) => {
        setHostId(user.id)
        return getHostListings(user.id)
      })
      .then((data) => {
        const items = data?.content ?? (Array.isArray(data) ? data : [])
        setHotels(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [viewer.email])

  return {
    hostId,
    hotels,
    primaryHotelId: hotels[0]?.id ?? null,
    loading,
  }
}
