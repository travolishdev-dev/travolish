import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Google OAuth via @react-oauth/google uses a popup — no redirect callback needed.
// This page exists only as a safety net for any lingering links.
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/', { replace: true }) }, [navigate])
  return null
}
