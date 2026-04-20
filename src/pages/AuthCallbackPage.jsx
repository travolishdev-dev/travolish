import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        if (session) {
          // Check if profile exists, if not create one
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!profile) {
            const role = localStorage.getItem('travolish_signup_role') || 'guest'

            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || '',
                email: session.user.email,
                avatar_url: session.user.user_metadata?.avatar_url || '',
                role: role,
              })

            if (profileError) {
              console.error('Profile creation error:', profileError)
            }
            localStorage.removeItem('travolish_signup_role')
          }

          navigate('/', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/', { replace: true })
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-brand rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted text-sm">Signing you in...</p>
      </div>
    </div>
  )
}
