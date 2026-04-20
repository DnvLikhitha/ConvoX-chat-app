import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { useSocket } from '../../contexts/SocketContext'
import { usersApi } from '../../services/api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { 
  Check, Camera, Eye, EyeOff, AlertTriangle, 
  X, ShieldCheck, UserCircle, SlidersHorizontal, 
  Bell, Palette, Trash2, Ban, ShieldAlert, Shield
} from 'lucide-react'
import { resolveUrl } from '../../utils/resolveUrl'
import FlaggedMessagesTable from '../ui/flagged-messages-table'

/* ─── Shared UI Components ─── */
function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-4 mb-8">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#18181b] border border-[#27272a] text-[#e6e6e6] shadow-sm">
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

function FieldInput({ label, hint, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">{label}</label>
      <input
        className="w-full rounded-xl bg-[#0e0e10] border border-[#27272a] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
        {...props}
      />
      {hint && <p className="text-[11px] text-neutral-600">{hint}</p>}
    </div>
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-6 p-5 hover:bg-white/[0.02] transition-colors group">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white group-hover:text-[#e6e6e6] transition-colors">{label}</p>
        {description && <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{description}</p>}
      </div>
      <button 
        onClick={() => onChange(!checked)} 
        className={`relative shrink-0 h-6 w-11 rounded-full transition-all duration-300 ease-in-out ${checked ? 'bg-[#e6e6e6]' : 'bg-neutral-800'}`}
      >
        <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-[#0e0e10] shadow-sm transition-transform duration-300 ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  )
}

/* ─── Profile Content ─── */
function ProfileContent({ user }) {
  const [username, setUsername] = useState(user?.username || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = { username, bio }
      // Only include avatar if we've actually selected a new one
      if (avatarPreview) {
        payload.avatar = avatarPreview
      }
      
      await usersApi.updateProfile(payload)
      toast.success('Profile updated successfully', {
        icon: <Check className="h-4 w-4 text-emerald-500" />
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <SectionHeader icon={UserCircle} title="Profile" subtitle="Manage your public identity and bio" />

      {/* Hero Card */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-800 to-[#18181b] border border-[#27272a] p-6 mb-2">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <UserCircle className="h-24 w-24" />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6 relative">
          <div className="group relative">
            <div className="h-24 w-24 rounded-3xl overflow-hidden bg-[#0e0e10] border-2 border-[#27272a] ring-4 ring-black/20 shadow-2xl transition-transform hover:scale-105">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
              ) : user?.avatar ? (
                <img src={resolveUrl(user.avatar)} alt={user.username} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-neutral-500">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <button 
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 h-9 w-9 flex items-center justify-center rounded-xl bg-white text-black shadow-xl hover:scale-110 active:scale-95 transition-all"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold text-white">{user?.username}</h2>
            <p className="text-sm text-neutral-400">{user?.email}</p>
            <div className="mt-3 flex gap-2 justify-center sm:justify-start">
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Member Since {new Date(user?.createdAt).getFullYear()}
              </span>
            </div>
          </div>
        </div>
        <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
      </div>

      {/* Fields */}
      <div className="rounded-2xl bg-[#18181b] border border-[#27272a] p-5 space-y-5">
        <FieldInput
          label="Display Name"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="What should people call you?"
        />
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Biography</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Write a short bio..."
            rows={3}
            className="w-full rounded-xl bg-[#0e0e10] border border-[#27272a] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors resize-none"
          />
          <p className="text-[11px] text-neutral-600">{bio.length}/500 characters</p>
        </div>
        
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#e6e6e6] py-3 text-sm text-black font-bold hover:bg-white active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Update Profile'}
          {!saving && <Check className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

/* ─── Security Content ─── */
function SecurityContent() {
  const [current, setCurrent] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPwd !== confirm) return toast.error("Passwords don't match")
    setSaving(true)
    try {
      await usersApi.updatePassword({ currentPassword: current, newPassword: newPwd })
      toast.success('Password updated successfully')
      setCurrent(''); setNewPwd(''); setConfirm('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const PwField = ({ label, value, onChange, show, onToggle, placeholder }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="w-full rounded-xl bg-[#0e0e10] border border-[#27272a] px-4 py-3 pr-11 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 pb-8">
      <SectionHeader icon={ShieldCheck} title="Security" subtitle="Manage your password and account safety" />

      <div className="rounded-2xl bg-[#18181b] border border-[#27272a] overflow-hidden">
        <div className="px-5 pt-5 pb-2">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Change Password</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <PwField label="Current Password" value={current} onChange={e => setCurrent(e.target.value)} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} placeholder="••••••••" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PwField label="New Password" value={newPwd} onChange={e => setNewPwd(e.target.value)} show={showNew} onToggle={() => setShowNew(!showNew)} placeholder="Min. 8 chars" />
              <PwField label="Confirm New" value={confirm} onChange={e => setConfirm(e.target.value)} show={showNew} onToggle={() => setShowNew(!showNew)} placeholder="Re-type password" />
            </div>
            
            <button 
              type="submit" 
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 py-3 text-sm text-white font-bold hover:bg-white/10 transition-all disabled:opacity-50 mt-2"
            >
              {saving ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
        
        <div className="mt-6 border-t border-[#27272a] px-5 py-4 bg-red-950/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Danger Zone</p>
          </div>
          <DangerSection />
        </div>
      </div>
    </div>
  )
}

/* ─── Danger Zone Content ─── */
function DangerSection() {
  const [showModal, setShowModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleDelete() {
    if (confirmText !== user?.username) return toast.error('Confirmation mismatch')
    setDeleting(true)
    try {
      await usersApi.deleteAccount()
      toast.success('Account permanently deleted')
      logout()
      navigate('/')
    } catch {
      toast.error('Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-white">Delete Account</p>
          <p className="text-xs text-neutral-500 mt-0.5">This action is permanent and cannot be undone.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-900/20"
        >
          Deactivate
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#18181b] border border-[#27272a] shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a]">
              <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Confirm Deletion
              </h2>
              <button onClick={() => { setShowModal(false); setConfirmText('') }} className="text-neutral-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-neutral-300 leading-relaxed">
                To confirm, please type your username <span className="font-mono font-bold text-white bg-white/10 px-1 rounded">{user?.username}</span> below:
              </p>
              <input
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder={user?.username}
                className="w-full rounded-xl bg-[#0e0e10] border border-red-500/30 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none font-mono"
              />
              <div className="flex gap-3">
                <button onClick={() => { setShowModal(false); setConfirmText('') }} className="flex-1 rounded-xl bg-neutral-800 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700 transition-colors">Cancel</button>
                <button 
                  onClick={handleDelete} 
                  disabled={confirmText !== user?.username || deleting}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-30"
                >
                  {deleting ? 'Deleting...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ─── Preferences Content ─── */
function PreferencesContent() {
  const [desktop, setDesktop] = useState(() => localStorage.getItem('notif_desktop') === 'true')
  const [sound, setSound] = useState(() => localStorage.getItem('notif_sound') !== 'false')
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'Monochrome')

  const updatePref = (key, val, setter) => {
    setter(val)
    localStorage.setItem(key, val)
    toast.success('Preference updated', {
      position: "bottom-right",
      autoClose: 1000,
      hideProgressBar: true,
      theme: "dark"
    })
  }

  return (
    <div className="space-y-4 pb-8">
      <SectionHeader icon={SlidersHorizontal} title="Preferences" subtitle="Customize your ConvoX experience" />

      {/* Notifications */}
      <div className="rounded-2xl bg-[#18181b] border border-[#27272a] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#27272a]">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Notifications</p>
        </div>
        <Toggle checked={desktop} onChange={v => updatePref('notif_desktop', v, setDesktop)} label="Desktop Notifications" description="Receive push notifications when you're not looking" />
        <div className="h-px bg-[#27272a] mx-5" />
        <Toggle checked={sound} onChange={v => updatePref('notif_sound', v, setSound)} label="Sound Effects" description="Play a subtle ping on incoming messages" />
      </div>

      {/* Appearance */}
      <div className="rounded-2xl bg-[#18181b] border border-[#27272a] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#27272a]">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Appearance</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Theme Engine</p>
            <div className="grid grid-cols-2 gap-3">
              {['Monochrome', 'Deep Zinc'].map(t => (
                <button
                  key={t}
                  onClick={() => updatePref('app_theme', t, setTheme)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    theme === t ? 'bg-[#e6e6e6] border-[#e6e6e6] text-black font-bold' : 'bg-[#0e0e10] border-[#27272a] text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-xs tracking-tight">{t}</span>
                  {theme === t && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Flagged Messages (Admin) ─── */
function FlaggedMessagesContent() {
  return (
    <div className="h-full min-h-0 flex flex-col">
      <FlaggedMessagesTable />
    </div>
  )
}

/* ─── Default Content ─── */
function DefaultContent({ user }) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-neutral-800 to-[#18181b] border border-[#27272a] p-8 text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.03),transparent)] pointer-events-none" />
        <div className="relative">
          <div className="h-20 w-20 rounded-2xl bg-[#e6e6e6] flex items-center justify-center text-black text-3xl font-bold mx-auto mb-6 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 underline decoration-[#e6e6e6]/20 underline-offset-8">Welcome, {user?.username}</h2>
          <p className="text-neutral-400 max-w-xs mx-auto text-sm leading-relaxed">
            Manage your account settings, security preferences, and privacy controls from the dashboard menu.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a] group hover:border-neutral-500 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-white mb-1">Secure Account</p>
          <p className="text-xs text-neutral-500">Your data is encrypted and saved locally.</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a] group hover:border-neutral-500 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
            <Check className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-white mb-1">Status Verified</p>
          <p className="text-xs text-neutral-500">Your profile is currently active and public.</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
export default function SettingsView({ selectedPage }) {
  const { user } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()

  // Real-time admin system notifications
  useEffect(() => {
    if (!socket) return

    const handleWarning = ({ reason, count, type }) => {
      const isBan = type === 'ban' || count >= 4
      
      toast(
        <div className="flex flex-col gap-1 p-1">
          <div className="flex items-center gap-2 font-bold text-white">
            {isBan ? <Ban className="h-4 w-4 text-red-500" /> : <ShieldAlert className="h-4 w-4 text-amber-500" />}
            {isBan ? 'ACCOUNT RESTRICTED' : 'FORMAL WARNING'}
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            {isBan 
              ? 'Your account has been banned due to repeated violations.' 
              : `Warning ${count}/4: ${reason}`
            }
          </p>
        </div>,
        {
          position: "top-center",
          autoClose: isBan ? false : 8000,
          theme: "dark",
          className: "border border-red-500/20 bg-black/90 backdrop-blur-xl",
          hideProgressBar: true
        }
      )

      if (isBan) {
        // Delay logout to let them read the toast
        setTimeout(() => {
          localStorage.removeItem('chat_token')
          window.location.href = '/login' // Force hard reload to clear all state
        }, 5000)
      }
    }

    socket.on('admin_warning', handleWarning)
    return () => { socket.off('admin_warning') }
  }, [socket])

  return (
    <div className={`h-full ${selectedPage === 'admin' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
      <div className={`mx-auto w-full p-4 sm:p-8 ${selectedPage === 'admin' ? 'max-w-none h-full' : 'max-w-3xl'}`}>
        {selectedPage === 'profile' && <ProfileContent user={user} />}
        {selectedPage === 'security' && <SecurityContent />}
        {selectedPage === 'preferences' && <PreferencesContent />}
        {selectedPage === 'admin' && (
          <div className="flex-1 min-h-0 p-1">
            <FlaggedMessagesContent />
          </div>
        )}
        {!selectedPage && <DefaultContent user={user} />}
      </div>
    </div>
  )
}
