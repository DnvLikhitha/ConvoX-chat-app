import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { usersApi } from '../../services/api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { Check, Camera, Eye, EyeOff, AlertTriangle, X, Flag, Trash, ShieldOff } from 'lucide-react'

function initials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 mb-4">
      <div className="px-5 py-3 border-b border-neutral-800">
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function FieldInput({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-400 mb-1.5">{label}</label>
      <input className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-violet-600 transition-colors" {...props} />
    </div>
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
      </div>
      <button onClick={() => onChange(!checked)} className={`relative shrink-0 h-6 w-11 rounded-full transition-all duration-300 ${checked ? 'bg-violet-600' : 'bg-neutral-700'}`}>
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  )
}

/* ── Profile Content ── */
function ProfileContent({ user }) {
  const [username, setUsername] = useState(user?.username || '')
  const [bio, setBio] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  async function handleSave() {
    setSaving(true)
    try {
      await usersApi.updateProfile({ username, bio, avatar: avatarPreview })
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <>
      <Card title="Avatar">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl overflow-hidden bg-violet-600 flex items-center justify-center text-white text-xl font-bold">
              {avatarPreview ? <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" /> : initials(user?.username)}
            </div>
            <button onClick={() => fileRef.current?.click()} className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-violet-600 hover:border-violet-600 hover:text-white transition-all">
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div>
            <p className="text-sm text-white font-medium">{user?.username}</p>
            <p className="text-xs text-neutral-500">{user?.email}</p>
            <button onClick={() => fileRef.current?.click()} className="mt-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors">Upload photo</button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
            const f = e.target.files?.[0]; if (!f) return
            const r = new FileReader(); r.onload = ev => setAvatarPreview(ev.target.result); r.readAsDataURL(f)
          }} />
        </div>
      </Card>

      <Card title="Personal Info">
        <FieldInput label="Display Name" value={username} onChange={e => setUsername(e.target.value)} />
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={2}
            className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-violet-600 transition-colors resize-none" />
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm text-white font-medium hover:bg-violet-700 transition-colors disabled:opacity-50">
          {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Check className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </Card>
    </>
  )
}

/* ── Security Content ── */
function SecurityContent() {
  const [current, setCurrent] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [showC, setShowC] = useState(false)
  const [showN, setShowN] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (newPwd !== confirm) { toast.error('Passwords do not match'); return }
    if (newPwd.length < 6) { toast.error('Min 6 characters'); return }
    setSaving(true)
    try {
      await usersApi.updatePassword({ currentPassword: current, newPassword: newPwd })
      toast.success('Password updated!')
      setCurrent(''); setNewPwd(''); setConfirm('')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const score = newPwd.length === 0 ? 0 : newPwd.length < 6 ? 1 : newPwd.length < 10 ? 2 : 3
  const colors = ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500']

  return (
    <Card title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">Current Password</label>
          <div className="relative">
            <input type={showC ? 'text' : 'password'} value={current} onChange={e => setCurrent(e.target.value)} placeholder="Current password" required
              className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-violet-600 transition-colors" />
            <button type="button" onClick={() => setShowC(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300">
              {showC ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">New Password</label>
          <div className="relative">
            <input type={showN ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="New password" required
              className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-violet-600 transition-colors" />
            <button type="button" onClick={() => setShowN(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300">
              {showN ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {newPwd && (
            <div className="mt-2 flex gap-1">
              {[1, 2, 3].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : 'bg-neutral-700'}`} />)}
            </div>
          )}
        </div>
        <FieldInput label="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm new password" required />
        <button type="submit" disabled={saving || !current || !newPwd || !confirm}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm text-white font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          {saving ? 'Updating...' : 'Update Password'}
        </button>

        <div className="pt-4 border-t border-neutral-800">
          <p className="text-xs font-medium text-neutral-400 mb-3">Danger Zone</p>
          <DangerSection />
        </div>
      </form>
    </Card>
  )
}

/* ── Danger section (embedded in Security) ── */
function DangerSection() {
  const [showModal, setShowModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  async function handleDelete() {
    if (confirmText !== user?.username) { toast.error('Username does not match'); return }
    setDeleting(true)
    try { await usersApi.deleteAccount(); toast.success('Account deleted'); logout(); navigate('/login') }
    catch { toast.error('Failed to delete'); setDeleting(false) }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 rounded-xl bg-red-500/5 border border-red-500/20 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">Delete Account</p>
          <p className="text-xs text-neutral-500 mt-0.5">This permanently deletes your account</p>
        </div>
        <button onClick={() => setShowModal(true)} className="shrink-0 text-xs text-red-400 font-medium px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors">
          Delete
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
              <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Confirm Deletion
              </h2>
              <button onClick={() => { setShowModal(false); setConfirmText('') }} className="text-neutral-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-neutral-300">Type <strong className="text-white">{user?.username}</strong> to confirm.</p>
              <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder={user?.username}
                className="w-full rounded-xl bg-neutral-800 border border-red-500/30 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none" />
              <div className="flex gap-3">
                <button onClick={() => { setShowModal(false); setConfirmText('') }} className="flex-1 rounded-xl bg-neutral-800 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700">Cancel</button>
                <button onClick={handleDelete} disabled={confirmText !== user?.username || deleting}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm text-white font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  {deleting ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ── Preferences Content ── */
function PreferencesContent() {
  const [desktop, setDesktop] = useState(() => localStorage.getItem('notif_desktop') === 'true')
  const [sound, setSound] = useState(() => localStorage.getItem('notif_sound') !== 'false')
  const [preview, setPreview] = useState(() => localStorage.getItem('notif_preview') !== 'false')
  const [accent, setAccent] = useState(() => localStorage.getItem('accent_color') || '#7C3AED')
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('font_size') || 'Medium')

  function saveNotif(key, val, setter) {
    setter(val); localStorage.setItem(key, val)
    if (key === 'notif_desktop' && val) Notification.requestPermission()
    toast.success('Saved')
  }
  function applyAccent(color) { setAccent(color); localStorage.setItem('accent_color', color); toast.success('Accent updated') }
  function applySize(size) { setFontSize(size); localStorage.setItem('font_size', size); const m = { Small: '14px', Medium: '16px', Large: '18px' }; document.documentElement.style.fontSize = m[size]; toast.success('Font size updated') }

  const ACCENTS = [
    { value: '#7C3AED', label: 'Purple' }, { value: '#2563EB', label: 'Blue' },
    { value: '#059669', label: 'Emerald' }, { value: '#DC2626', label: 'Red' },
    { value: '#D97706', label: 'Amber' }, { value: '#DB2777', label: 'Pink' },
  ]

  return (
    <>
      <Card title="Notifications">
        <Toggle checked={desktop} onChange={v => saveNotif('notif_desktop', v, setDesktop)} label="Desktop Notifications" description="Browser notifications for new messages" />
        <div className="h-px bg-neutral-800" />
        <Toggle checked={sound} onChange={v => saveNotif('notif_sound', v, setSound)} label="Sound Alerts" description="Play a sound on new messages" />
        <div className="h-px bg-neutral-800" />
        <Toggle checked={preview} onChange={v => saveNotif('notif_preview', v, setPreview)} label="Message Preview" description="Show message content in notifications" />
      </Card>

      <Card title="Appearance">
        <p className="text-xs text-neutral-500 -mt-1">Accent Color</p>
        <div className="grid grid-cols-3 gap-2">
          {ACCENTS.map(({ value, label }) => (
            <button key={value} onClick={() => applyAccent(value)} className={`flex items-center gap-2 rounded-xl p-2.5 border transition-all ${accent === value ? 'border-white/30 bg-neutral-800' : 'border-neutral-800 hover:border-neutral-700'}`}>
              <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: value }} />
              <span className="text-xs text-neutral-300 truncate">{label}</span>
              {accent === value && <Check className="h-3 w-3 text-white ml-auto shrink-0" />}
            </button>
          ))}
        </div>
        <p className="text-xs text-neutral-500">Font Size</p>
        <div className="flex gap-2">
          {['Small', 'Medium', 'Large'].map(s => (
            <button key={s} onClick={() => applySize(s)} className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all border ${fontSize === s ? 'bg-violet-600 border-violet-600 text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'}`}>{s}</button>
          ))}
        </div>
      </Card>
    </>
  )
}

/* ── Flagged Messages (admin) ── */
function FlaggedMessagesContent() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/flagged-messages', {
      headers: { Authorization: `Bearer ${localStorage.getItem('chat_token')}` }
    })
      .then(r => r.json())
      .then(d => setMessages(d.data || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-700 border-t-violet-600" />
    </div>
  )
  if (error) return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 text-center">
      <ShieldOff className="h-8 w-8 text-neutral-600 mx-auto mb-2" />
      <p className="text-sm text-neutral-400">Failed to load flagged messages</p>
      <p className="text-xs text-neutral-600 mt-1">{error}</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Flag className="h-4 w-4 text-red-400" />
        <h2 className="font-semibold text-white text-sm">Flagged Messages</h2>
        <span className="ml-auto text-xs text-neutral-500">{messages.length} flagged</span>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-8 text-center">
          <Flag className="h-10 w-10 text-neutral-700 mx-auto mb-3" />
          <p className="text-sm font-medium text-white">No flagged messages</p>
          <p className="text-xs text-neutral-500 mt-1">All clear — nothing to review</p>
        </div>
      ) : messages.map((msg, i) => (
        <div key={msg._id || i} className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <Flag className="h-3.5 w-3.5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-medium text-white">{msg.sender?.username || 'Unknown'}</p>
                <span className="text-[11px] text-neutral-600">
                  {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">{msg.messageText || msg.content || '—'}</p>
              {msg.flagReason && <p className="mt-1.5 text-xs text-amber-500">Reason: {msg.flagReason}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Default (no page selected) ── */
function DefaultContent({ user }) {
  return (
    <div className="flex flex-col gap-4 items-start">
      <div className="flex items-center gap-4 w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
        <div className="h-14 w-14 rounded-2xl bg-violet-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {initials(user?.username)}
        </div>
        <div>
          <p className="font-semibold text-white">{user?.username}</p>
          <p className="text-sm text-neutral-400">{user?.email}</p>
        </div>
      </div>
      <p className="text-sm text-neutral-500 px-1">Select an option from the sidebar to manage your settings.</p>
    </div>
  )
}

/* ── Main SettingsView — no sub-nav, driven by selectedPage prop ── */
export default function SettingsView({ selectedPage }) {
  const { user } = useAuth()

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-lg">
        {!selectedPage && <DefaultContent user={user} />}
        {selectedPage === 'profile' && <ProfileContent user={user} />}
        {selectedPage === 'security' && <SecurityContent />}
        {selectedPage === 'preferences' && <PreferencesContent />}
        {selectedPage === 'admin' && <FlaggedMessagesContent />}
      </div>
    </div>
  )
}
