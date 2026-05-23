import { post } from '../lib/api'

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
