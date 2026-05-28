import { useState } from 'react'
import { X } from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import useAuthStore from '../../stores/useAuthStore'

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle } = useAuthStore()
  const [role, setRole] = useState('guest')

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      localStorage.setItem('travolish_signup_role', role)
      await signInWithGoogle(credentialResponse.credential)
      closeAuthModal()
      toast.success('Signed in successfully!')
    } catch (error) {
      console.error('Google sign-in error:', error)
      toast.error(error.message || 'Unable to sign in with Google.')
    }
  }

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          {/* Backdrop */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="fixed inset-0 bg-black/50 z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <button
                  onClick={closeAuthModal}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
                <h2 className="text-base font-bold text-dark">Log in or sign up</h2>
                <div className="w-6" />
              </div>

              {/* Body */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-dark mb-2">Welcome to Travolish</h3>
                <p className="text-muted text-sm mb-6">
                  Sign in to save your favorite properties, manage bookings, and list your home.
                </p>

                {/* Role Selection */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                  <button
                    onClick={() => setRole('guest')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                      role === 'guest'
                        ? 'bg-white text-dark shadow-sm'
                        : 'text-muted hover:text-dark'
                    }`}
                  >
                    Guest
                  </button>
                  <button
                    onClick={() => setRole('host')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                      role === 'host'
                        ? 'bg-white text-dark shadow-sm'
                        : 'text-muted hover:text-dark'
                    }`}
                  >
                    Host
                  </button>
                </div>

                {/* Google Sign In */}
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google sign-in failed. Please try again.')}
                    width="368"
                    size="large"
                    shape="rectangular"
                    theme="outline"
                    text="continue_with"
                  />
                </div>

                <p className="text-[11px] text-muted mt-6 leading-relaxed">
                  By continuing, you agree to Travolish's{' '}
                  <a href="#" className="underline font-semibold text-dark">Terms of Service</a> and
                  acknowledge our{' '}
                  <a href="#" className="underline font-semibold text-dark">Privacy Policy</a>.
                </p>
              </div>
            </Motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
