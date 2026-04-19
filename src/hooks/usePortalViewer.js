import useAuthStore from '../stores/useAuthStore'
import { previewAccountProfile } from '../data/mockPortalData'

export default function usePortalViewer() {
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)

  const fullName =
    profile?.full_name?.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    user?.user_metadata?.name?.trim() ||
    previewAccountProfile.fullName

  const viewer = {
    fullName,
    preferredName: fullName.split(' ')[0] || previewAccountProfile.preferredName,
    email: user?.email || profile?.email || previewAccountProfile.email,
    phone: profile?.phone || previewAccountProfile.phone,
    avatar: profile?.avatar_url || previewAccountProfile.avatar,
    role: profile?.role || previewAccountProfile.role,
    city: profile?.city || previewAccountProfile.city,
    timeZone: previewAccountProfile.timeZone,
    joinedLabel: previewAccountProfile.joinedLabel,
    travelStyle: previewAccountProfile.travelStyle,
    bio: previewAccountProfile.bio,
    badges: previewAccountProfile.badges,
    stats: previewAccountProfile.stats,
    preferences: previewAccountProfile.preferences,
    emergencyContact: previewAccountProfile.emergencyContact,
    savedAddresses: previewAccountProfile.savedAddresses,
  }

  return {
    user,
    profile,
    viewer,
    isPreview: !user,
  }
}
