import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import './i18n'
import App from './App.jsx'
import { SearchProvider } from './contexts/SearchContext.jsx'
import queryClient from './lib/queryClient.js'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
if (!GOOGLE_CLIENT_ID && import.meta.env.DEV) {
  console.error('[Auth] VITE_GOOGLE_CLIENT_ID is not set — Google Sign-In will fail. Restart the dev server after setting it in .env')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <SearchProvider>
          <BrowserRouter>
            <Suspense fallback={null}>
              <App />
            </Suspense>
          </BrowserRouter>
        </SearchProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
