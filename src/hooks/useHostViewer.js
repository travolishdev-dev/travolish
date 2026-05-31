import useAuthStore from '../stores/useAuthStore'

const FALLBACK = {
  fullName: 'Host',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=320&h=320&fit=crop',
}

export default function useHostViewer() {
  const { user, profile } = useAuthStore()

  const viewer = {
    fullName:
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.email?.split('@')[0] ||
      FALLBACK.fullName,
    email: user?.email || FALLBACK.email,
    avatar:
      profile?.avatar_url ||
      user?.user_metadata?.avatar_url ||
      FALLBACK.avatar,
  }

  return { viewer }
}
