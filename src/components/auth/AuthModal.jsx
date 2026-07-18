import { useState } from 'react'
import { X, Mail, ArrowLeft, Loader2 } from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../../stores/useAuthStore'
import { useAndroidBackClose } from '../../hooks/useAndroidBackClose'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AuthModal() {
  const { t } = useTranslation('auth')
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInWithGoogle,
    startEmailSignup,
    verifyEmailSignup,
  } = useAuthStore()
  const [role, setRole] = useState('guest')

  // Email signup flow: 'options' -> 'email' -> 'code'
  const [step, setStep] = useState('options')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const resetAndClose = () => {
    setStep('options')
    setEmail('')
    setFirstName('')
    setCode('')
    setSubmitting(false)
    closeAuthModal()
  }

  useAndroidBackClose(isAuthModalOpen, resetAndClose)

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      localStorage.setItem('travolish_signup_role', role)
      await signInWithGoogle(credentialResponse.credential)
      resetAndClose()
      toast.success(t('toast.signedIn'))
    } catch (error) {
      console.error('Google sign-in error:', error)
      toast.error(error.message || t('toast.googleFailed'))
    }
  }

  const handleSendCode = async (e) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) {
      toast.error(t('toast.invalidEmail'))
      return
    }
    setSubmitting(true)
    try {
      await startEmailSignup(email.trim(), role)
      setStep('code')
      toast.success(t('toast.codeSent'))
    } catch (error) {
      toast.error(error.message || t('toast.codeFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (code.trim().length < 6) {
      toast.error(t('toast.invalidCode'))
      return
    }
    setSubmitting(true)
    try {
      await verifyEmailSignup(email.trim(), code.trim(), {
        firstName: firstName.trim() || undefined,
      })
      resetAndClose()
      toast.success(t('toast.welcome'))
    } catch (error) {
      toast.error(error.message || t('toast.verifyFailed'))
    } finally {
      setSubmitting(false)
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
            onClick={resetAndClose}
            className="fixed inset-0 bg-black/50 z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)]"
            >
              {/* Header — stays fixed when keyboard opens */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
                <button
                  onClick={step === 'options' ? resetAndClose : () => setStep(step === 'code' ? 'email' : 'options')}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={step === 'options' ? t('aria.close') : t('aria.back')}
                >
                  {step === 'options' ? <X size={18} /> : <ArrowLeft size={18} />}
                </button>
                <h2 className="text-base font-bold text-dark">{t('heading')}</h2>
                <div className="w-6" />
              </div>

              {/* Body — scrollable so submit button stays reachable when keyboard is open */}
              <div className="p-6 overflow-y-auto">
                {step === 'options' && (
                  <>
                    <h3 className="text-xl font-semibold text-dark mb-2">{t('welcome')}</h3>
                    <p className="text-muted text-sm mb-6">
                      {t('welcomeDesc')}
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
                        {t('roleGuest')}
                      </button>
                      <button
                        onClick={() => setRole('host')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                          role === 'host'
                            ? 'bg-white text-dark shadow-sm'
                            : 'text-muted hover:text-dark'
                        }`}
                      >
                        {t('roleHost')}
                      </button>
                    </div>

                    {/* Email signup */}
                    <button
                      onClick={() => setStep('email')}
                      className="w-full flex items-center justify-center gap-2 py-3 mb-3 rounded-xl border border-gray-300 text-sm font-semibold text-dark hover:bg-gray-50 transition-colors"
                    >
                      <Mail size={18} />
                      {t('continueEmail')}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-[11px] uppercase tracking-wide text-muted">{t('or')}</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Google Sign In */}
                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error(t('toast.googleError'))}
                        width="368"
                        size="large"
                        shape="rectangular"
                        theme="outline"
                        text="continue_with"
                      />
                    </div>

                    <p className="text-[11px] text-muted mt-6 leading-relaxed">
                      {t('terms')}{' '}
                      <a href="#" className="underline font-semibold text-dark">{t('termsLink')}</a> and
                      acknowledge our{' '}
                      <a href="#" className="underline font-semibold text-dark">{t('privacyLink')}</a>.
                    </p>
                  </>
                )}

                {step === 'email' && (
                  <form onSubmit={handleSendCode}>
                    <h3 className="text-xl font-semibold text-dark mb-2">{t('emailStep.heading')}</h3>
                    <p className="text-muted text-sm mb-6">
                      {t(role === 'guest' ? 'emailStep.descGuest' : 'emailStep.descHost')}
                    </p>

                    <label className="block text-sm font-semibold text-dark mb-1.5">
                      {t('emailStep.firstName')} <span className="text-muted font-normal">{t('emailStep.optional')}</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t('emailStep.firstNamePlaceholder')}
                      className="w-full px-4 py-3 mb-4 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />

                    <label className="block text-sm font-semibold text-dark mb-1.5">{t('emailStep.email')}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('emailStep.emailPlaceholder')}
                      autoFocus
                      required
                      autoComplete="email"
                      className="w-full px-4 py-3 mb-6 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-dark text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {submitting && <Loader2 size={16} className="animate-spin" />}
                      {t('emailStep.sendCode')}
                    </button>
                  </form>
                )}

                {step === 'code' && (
                  <form onSubmit={handleVerify}>
                    <h3 className="text-xl font-semibold text-dark mb-2">{t('codeStep.heading')}</h3>
                    <p className="text-muted text-sm mb-6">
                      {t('codeStep.desc')}{' '}
                      <span className="font-semibold text-dark">{email}</span>.
                    </p>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      autoFocus
                      autoComplete="one-time-code"
                      className="w-full px-4 py-3 mb-6 rounded-xl border border-gray-300 text-center text-2xl font-bold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 py-3 mb-3 rounded-xl bg-dark text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {submitting && <Loader2 size={16} className="animate-spin" />}
                      {t('codeStep.verify')}
                    </button>

                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={submitting}
                      className="w-full py-2 text-sm font-semibold text-muted hover:text-dark transition-colors disabled:opacity-60"
                    >
                      {t('codeStep.resend')}
                    </button>
                  </form>
                )}
              </div>
            </Motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
