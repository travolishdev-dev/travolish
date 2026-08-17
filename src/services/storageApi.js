import { post, getAuthHeaders } from '../lib/api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Upload a profile photo directly to the backend (multipart/form-data).
// The backend stores it in R2 and returns the full public CDN URL.
// Backend: POST /api/users/{id}/image
// Returns: { avatarUrl: string }
export async function uploadAvatar(userId, file) {
  const formData = new FormData()
  formData.append('file', file)

  // Do not set Content-Type manually — the browser must set it to
  // multipart/form-data with the correct boundary string.
  const res = await fetch(
    new URL(`${BASE_URL}/api/users/${userId}/image`, window.location.origin).toString(),
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    }
  )

  if (!res.ok) throw new Error(`Avatar upload failed: ${res.status}`)
  return res.json() // { avatarUrl: string }
}

// ── KYC document upload (still uses GCS signed-URL path) ──────────────────────
// Backend: POST /api/storage/avatar/signed-url
// Body:    { filename: string, contentType: string }
// Returns: { signedUrl: string, publicUrl: string }
export async function getAvatarUploadUrl(filename, contentType) {
  return post('/api/storage/avatar/signed-url', { filename, contentType })
}

export async function uploadToGcs(signedUrl, file) {
  const res = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!res.ok) throw new Error(`GCS upload failed: ${res.status}`)
}
