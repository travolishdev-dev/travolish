const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

let _accessToken = null
let _refreshToken = null

export function setAuthToken(token) {
  _accessToken = token
}

export function setRefreshToken(token) {
  _refreshToken = token
  if (token) {
    localStorage.setItem('travolish_refresh', token)
  } else {
    localStorage.removeItem('travolish_refresh')
  }
}

export function loadRefreshToken() {
  _refreshToken = localStorage.getItem('travolish_refresh')
  return _refreshToken
}

export function clearTokens() {
  _accessToken = null
  _refreshToken = null
  localStorage.removeItem('travolish_refresh')
}

export async function refreshAccessToken() {
  if (!_refreshToken) throw new Error('No refresh token')
  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: _refreshToken }),
  })
  if (!res.ok) {
    clearTokens()
    throw new Error('Token refresh failed')
  }
  const { accessToken } = await res.json()
  _accessToken = accessToken
  return accessToken
}

function authHeaders() {
  return _accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}
}

export function getAuthHeaders() {
  return authHeaders()
}

async function request(method, path, { params = {}, body, extraHeaders = {} } = {}) {
  const doFetch = () => {
    const url = new URL(`${BASE_URL}${path}`, window.location.origin)
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
    })
    const headers = {
      ...authHeaders(),
      ...extraHeaders,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    }
    return fetch(url.toString(), {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  }

  let res = await doFetch()

  // Auto-refresh on 401 then retry once
  if (res.status === 401 && _refreshToken) {
    try {
      await refreshAccessToken()
      res = await doFetch()
    } catch {
      clearTokens()
      window.dispatchEvent(new Event('auth:sessionExpired'))
    }
  }

  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.status === 204 ? null : res.json().catch(() => null)
}

export const get = (path, params = {}, extraHeaders = {}) =>
  request('GET', path, { params, extraHeaders })

export const post = (path, body, extraHeaders = {}) =>
  request('POST', path, { body, extraHeaders })

export const put = (path, body, extraHeaders = {}) =>
  request('PUT', path, { body, extraHeaders })

export const del = (path, extraHeaders = {}) =>
  request('DELETE', path, { extraHeaders })

export const patch = (path, body, extraHeaders = {}) =>
  request('PATCH', path, { body, extraHeaders })
