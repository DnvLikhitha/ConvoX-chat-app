import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { usersApi } from '../../services/api'
import { toast } from 'react-toastify'
import { Camera, Shield, UserPlus, Check, X, Clock, MessageSquare, Users, Hash, CalendarDays, Pencil, Save } from 'lucide-react'
import { ImageCropperModal } from '../ui/ImageCropperModal'
import { resolveUrl } from '../../utils/resolveUrl'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

function initials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
}

// Gradient per user (stable based on id)
const GRADIENTS = [
  ['#1a1a2e', '#16213e', '#0f3460', '#533483'],
  ['#0d1117', '#161b22', '#1f3a5f', '#2563eb'],
  ['#0a0a0a', '#1a0033', '#2d0057', '#7c3aed'],
  ['#0f1923', '#0d2137', '#0c3b5e', '#0ea5e9'],
  ['#0e0e0e', '#1a1200', '#2d2000', '#d97706'],
]

function getBannerGradient(userId) {
  const idx = userId ? (userId.charCodeAt(0) + userId.charCodeAt(userId.length - 1)) % GRADIENTS.length : 0
  const [c1, c2, c3, c4] = GRADIENTS[idx]
  return `linear-gradient(135deg, ${c1} 0%, ${c2} 33%, ${c3} 66%, ${c4} 100%)`
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const colors = {
    online: 'bg-emerald-400 shadow-lg shadow-emerald-400/50',
    away: 'bg-amber-400 shadow-lg shadow-amber-400/50',
    offline: 'bg-neutral-500',
  }
  return (
    <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-neutral-950 ${colors[status] || colors.offline}`} />
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent = 'text-[#e6e6e6]' }) {
  return (
    <div className="relative flex flex-col gap-2 rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4 hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300 group overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
      <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xl font-bold text-white tabular-nums">{value ?? '—'}</p>
        <p className="text-xs text-neutral-500 mt-0.5 uppercase tracking-wider font-medium">{label}</p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function UserProfileView({ userId = null, isFullscreen = false }) {
  const { user: currentUser } = useAuth()
  const [profileUser, setProfileUser] = useState(null)
  const [bio, setBio] = useState('')
  const [editBio, setEditBio] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [friendStatus, setFriendStatus] = useState(null)
  const [friendLoading, setFriendLoading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [localBannerUrl, setLocalBannerUrl] = useState(null)
  const [localAvatarUrl, setLocalAvatarUrl] = useState(null)

  const [cropModal, setCropModal] = useState({
    isOpen: false,
    imageSrc: null,
    aspect: 1,
    type: null // 'banner' | 'avatar'
  })

  const bannerRef = useRef(null)
  const avatarRef = useRef(null)

  const isOwnProfile = !userId || userId === currentUser?.id || userId === currentUser?._id

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      try {
        if (!isOwnProfile && userId) {
          const res = await usersApi.getUserProfile(userId)
          const { user: u, friendStatus: fs } = res.data?.data || {}
          setProfileUser(u || null)
          setBio(u?.bio || '')
          setFriendStatus(fs || null)
        } else {
          setProfileUser(currentUser)
          setBio(currentUser?.bio || '')
        }
      } catch {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [userId, currentUser, isOwnProfile])

  // ── File Selection ────────────────────────────────────────────────────────
  const handleBannerSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setCropModal({ isOpen: true, imageSrc: preview, aspect: 4, type: 'banner' })
    e.target.value = ''
  }

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setCropModal({ isOpen: true, imageSrc: preview, aspect: 1, type: 'avatar' })
    e.target.value = ''
  }

  // ── Crop & Upload ─────────────────────────────────────────────────────────
  const handleCropComplete = async (croppedBlob) => {
    if (!croppedBlob) return setCropModal({ ...cropModal, isOpen: false })
    
    const { type } = cropModal
    setCropModal({ ...cropModal, isOpen: false })
    
    // Create preview immediately
    const previewUrl = URL.createObjectURL(croppedBlob)
    
    const formData = new FormData()
    
    if (type === 'banner') {
      setBannerUploading(true)
      setLocalBannerUrl(previewUrl)
      formData.append('banner', croppedBlob, 'banner.jpg')
      try {
        const res = await usersApi.uploadBanner(formData)
        const newUrl = res.data?.data?.bannerUrl
        if (newUrl) {
          setLocalBannerUrl(resolveUrl(newUrl))
          setProfileUser(prev => ({ ...prev, bannerUrl: newUrl }))
          toast.success('Banner updated!')
        }
      } catch {
        setLocalBannerUrl(null)
        toast.error('Failed to upload banner')
      } finally {
        setBannerUploading(false)
      }
    } else if (type === 'avatar') {
      setAvatarUploading(true)
      setLocalAvatarUrl(previewUrl)
      formData.append('avatar', croppedBlob, 'avatar.jpg')
      try {
        const res = await usersApi.uploadAvatar(formData)
        const newUrl = res.data?.data?.avatarUrl
        if (newUrl) {
          setLocalAvatarUrl(resolveUrl(newUrl))
          setProfileUser(prev => ({ ...prev, avatar: newUrl }))
          toast.success('Avatar updated!')
        }
      } catch {
        setLocalAvatarUrl(null)
        toast.error('Failed to upload avatar')
      } finally {
        setAvatarUploading(false)
      }
    }
  }

  // ── Bio ───────────────────────────────────────────────────────────────────
  const startEdit = () => { setEditBio(bio); setIsEditing(true) }
  const cancelEdit = () => setIsEditing(false)
  const handleSaveBio = async () => {
    setSaving(true)
    try {
      await usersApi.updateProfile({ bio: editBio })
      setBio(editBio)
      setProfileUser(prev => ({ ...prev, bio: editBio }))
      toast.success('Bio updated!')
      setIsEditing(false)
    } catch {
      toast.error('Failed to update bio')
    } finally {
      setSaving(false)
    }
  }

  // ── Friends ───────────────────────────────────────────────────────────────
  const handleSendFriendRequest = async () => {
    setFriendLoading(true)
    try {
      await usersApi.sendFriendRequest(profileUser._id)
      setFriendStatus('sent')
      toast.success('Friend request sent!')
    } catch { toast.error('Failed to send friend request') }
    finally { setFriendLoading(false) }
  }
  const handleAcceptFriendRequest = async () => {
    setFriendLoading(true)
    try {
      await usersApi.acceptFriendRequest(profileUser._id)
      setFriendStatus('friend')
      toast.success('Friend request accepted!')
    } catch { toast.error('Failed') }
    finally { setFriendLoading(false) }
  }
  const handleRejectFriendRequest = async () => {
    setFriendLoading(true)
    try {
      await usersApi.rejectFriendRequest(profileUser._id)
      setFriendStatus(null)
      toast.success('Request rejected')
    } catch { toast.error('Failed') }
    finally { setFriendLoading(false) }
  }

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-800 border-t-[#e6e6e6]" />
    </div>
  )

  const displayBanner = localBannerUrl || resolveUrl(profileUser?.bannerUrl)
  const displayAvatar = localAvatarUrl || resolveUrl(profileUser?.avatar)
  const resolvedStatus = isOwnProfile ? 'online' : profileUser?.status

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">

      {/* ── Banner ─────────────────────────────────────────────────────────── */}
      <div className="relative flex-shrink-0 h-52 rounded-2xl overflow-hidden group">
        {displayBanner ? (
          <img
            src={displayBanner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" style={{ background: getBannerGradient(profileUser?._id) }} />
        )}

        {/* Overlay fade at bottom for avatar overlap */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-neutral-950 to-transparent" />

        {/* Upload overlay */}
        {isOwnProfile && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <button
              onClick={() => bannerRef.current?.click()}
              disabled={bannerUploading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium transition-all border border-white/20 text-sm"
            >
              <Camera className="h-4 w-4" />
              {bannerUploading ? 'Uploading…' : 'Change Banner'}
            </button>
          </div>
        )}
        <input ref={bannerRef} type="file" accept="image/*" onChange={handleBannerSelect} className="hidden" />
      </div>

      {/* ── Avatar + Name Row ──────────────────────────────────────────────── */}
      <div className="flex items-end gap-4 -mt-14 px-6 pb-4 relative z-10">
        {/* Avatar */}
        <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => isOwnProfile && avatarRef.current?.click()}>
          <div className="h-28 w-28 rounded-full border-4 border-neutral-950 bg-neutral-800 flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-2xl">
            {displayAvatar ? (
              <img src={displayAvatar} alt={profileUser?.username} className="w-full h-full object-cover" />
            ) : (
              <span className="select-none">{initials(profileUser?.username)}</span>
            )}
          </div>
          <StatusDot status={resolvedStatus} />
          {isOwnProfile && (
            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {avatarUploading
                ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                : <Camera className="h-5 w-5 text-white" />
              }
            </div>
          )}
          <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
        </div>

        {/* Name + role */}
        <div className="flex-1 pb-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white truncate">{profileUser?.username}</h1>
            {profileUser?.role === 'admin' && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold border border-violet-500/30">
                <Shield className="h-3 w-3" /> Admin
              </span>
            )}
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              resolvedStatus === 'online'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                : 'bg-neutral-700/50 text-neutral-400 border border-neutral-600/30'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${resolvedStatus === 'online' ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
              {resolvedStatus === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-sm text-neutral-400 mt-0.5 truncate">{profileUser?.email}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pb-1 flex-shrink-0">
          {isOwnProfile && (
            <button
              onClick={startEdit}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.08] hover:bg-white/[0.13] border border-white/[0.1] text-white rounded-xl text-sm font-medium transition-all"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profile
            </button>
          )}
          {!isOwnProfile && (
            <>
              {friendStatus === 'friend' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-xl text-sm font-medium">
                  <Check className="h-4 w-4" /> Friends
                </div>
              )}
              {friendStatus === 'sent' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-sm font-medium">
                  <Clock className="h-4 w-4" /> Pending
                </div>
              )}
              {friendStatus === 'pending' && (
                <>
                  <button onClick={handleAcceptFriendRequest} disabled={friendLoading}
                    className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                    <Check className="h-4 w-4" /> Accept
                  </button>
                  <button onClick={handleRejectFriendRequest} disabled={friendLoading}
                    className="flex items-center gap-1 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-sm transition-colors disabled:opacity-50">
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
              {!friendStatus && (
                <button onClick={handleSendFriendRequest} disabled={friendLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#e6e6e6] hover:bg-[#d0d0d0] text-black rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                  <UserPlus className="h-4 w-4" />
                  {friendLoading ? 'Sending…' : 'Add Friend'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <div className="mx-6 h-px bg-white/[0.06]" />

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 px-6 py-5">

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={MessageSquare} label="Messages" value={profileUser?.totalMessages ?? 0} accent="text-blue-400" />
          <StatCard icon={Hash} label="Chats" value={profileUser?.totalChats ?? 0} accent="text-violet-400" />
          <StatCard icon={Users} label="Friends" value={profileUser?.friends?.length ?? profileUser?.friendCount ?? 0} accent="text-emerald-400" />
          <StatCard icon={CalendarDays} label="Joined" value={profileUser?.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'} accent="text-amber-400" />
        </div>

        {/* About me */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">About Me</h2>
            {isOwnProfile && !isEditing && (
              <button onClick={startEdit} className="text-neutral-500 hover:text-neutral-300 transition-colors">
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-3">
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value.slice(0, 500))}
                placeholder="Tell everyone about yourself…"
                rows={4}
                className="w-full bg-neutral-900 border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#e6e6e6]/50 transition-colors resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-600">{editBio.length}/500</p>
                <div className="flex gap-2">
                  <button onClick={cancelEdit}
                    className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSaveBio} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-[#e6e6e6] hover:bg-[#d0d0d0] text-black rounded-lg font-medium transition-colors disabled:opacity-50">
                    <Save className="h-3.5 w-3.5" />
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-300 leading-relaxed">
              {bio || <span className="text-neutral-600 italic">No bio yet — click edit to add one</span>}
            </p>
          )}
        </div>

        {/* Member since */}
        <p className="text-xs text-neutral-600 text-center pb-2">
          Member since {profileUser?.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
        </p>
      </div>

      <ImageCropperModal
        title={cropModal.type === 'banner' ? 'Adjust Banner' : 'Adjust Avatar'}
        open={cropModal.isOpen}
        imageSrc={cropModal.imageSrc}
        aspect={cropModal.aspect}
        onClose={() => setCropModal({ ...cropModal, isOpen: false })}
        onCropComplete={handleCropComplete}
      />
    </div>
  )
}
