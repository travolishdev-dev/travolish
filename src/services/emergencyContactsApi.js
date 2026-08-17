import { del, get, patch, post, put } from '../lib/api'

const base = (userId) => `/api/users/${userId}/emergency-contacts`

/** Fetch all emergency contacts for a user — primary first. */
export async function listEmergencyContacts(userId) {
  return get(base(userId))
}

/** Add a new emergency contact. */
export async function createEmergencyContact(userId, body) {
  return post(base(userId), body)
}

/** Update an existing contact's fields. */
export async function updateEmergencyContact(userId, contactId, body) {
  return put(`${base(userId)}/${contactId}`, body)
}

/** Delete a contact. */
export async function deleteEmergencyContact(userId, contactId) {
  return del(`${base(userId)}/${contactId}`)
}

/** Promote a contact to primary (server handles demoting the current one). */
export async function setEmergencyContactPrimary(userId, contactId) {
  return patch(`${base(userId)}/${contactId}/primary`, {})
}
