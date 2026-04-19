import { useState, useEffect } from 'react'
import { usersApi } from '../../services/api'
import { Mail, CalendarDays, Key, MapPin, Hash, MessageSquare } from 'lucide-react'
import { resolveUrl } from '../../utils/resolveUrl'

function initials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
}

export default function ProfilePreviewModal({ userId, position, onClose, onMessageClick }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let mounted = true
    
    async function load() {
      try {
        const res = await usersApi.getUserProfile(userId)
        if (!mounted) return
        setProfile(res.data?.data)
      } catch (err) {
        console.error('Failed to load profile', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()

    return () => { mounted = false }
  }, [userId])

  // Click outside to close helper
  useEffect(() => {
    const handleCaptureClick = (e) => {
      // Small timeout prevents immediate close
      setTimeout(() => {
        if (!e.target.closest('#profile-modal-container')) {
          onClose()
        }
      }, 0)
    }
    document.addEventListener('click', handleCaptureClick, true)
    document.addEventListener('contextmenu', handleCaptureClick, true)
    
    return () => {
      document.removeEventListener('click', handleCaptureClick, true)
      document.removeEventListener('contextmenu', handleCaptureClick, true)
    }
  }, [onClose])

  if (!userId) return null

  // Ensure modal fits within viewport given mouse position
  let top = position?.y || 0
  let left = position?.x || 0
  
  // Adjusted arbitrarily to fit generic screens if too close to edge
  if (top > window.innerHeight - 400) {
    top = window.innerHeight - 420
  }
  if (left > window.innerWidth - 300) {
    left = window.innerWidth - 320
  }

  return (
    <div 
      id="profile-modal-container"
      className="fixed z-50 w-72 rounded-2xl overflow-hidden bg-[#18181b] border border-[#27272a] shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95 duration-200"
      style={{ top, left }}
      onClick={(e) => e.stopPropagation()}
    >
      {loading ? (
        <div className="h-64 flex items-center justify-center p-8 bg-[#18181b]">
           <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-700 border-t-[#e6e6e6]" />
        </div>
      ) : profile?.user ? (
        <div className="flex flex-col relative w-full">
          {/* Banner */}
          <div className="h-24 w-full bg-neutral-800 shrink-0">
             {profile.user.bannerUrl ? (
               <img src={resolveUrl(profile.user.bannerUrl)} alt="Banner" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-gradient-to-tr from-violet-900 to-fuchsia-900 opacity-60" />
             )}
          </div>
          
          <button onClick={onClose} className="absolute top-3 right-3 h-7 w-7 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors">
             &times;
          </button>

          {/* Avatar Base */}
          <div className="px-4 relative flex justify-between items-end pb-3 border-b border-[#27272a] bg-[#18181b]">
             <div className="relative -mt-10 rounded-full h-20 w-20 bg-[#18181b] p-1.5 z-10 shrink-0">
               <div className="w-full h-full rounded-full bg-neutral-800 flex items-center justify-center text-xl font-bold text-neutral-300 overflow-hidden outline outline-2 outline-[#27272a]">
                 {profile.user.avatar ? (
                   <img src={resolveUrl(profile.user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   initials(profile.user.username)
                 )}
               </div>
               <span className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-[2.5px] border-[#18181b] ${
                 profile.user.status === 'online' ? 'bg-emerald-500' : 
                 profile.user.status === 'away' ? 'bg-amber-500' : 'bg-neutral-500'
               }`} title={profile.user.status || 'Offline'} />
             </div>
             
             {profile.friendStatus === 'friend' && (
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  Friend
                </div>
             )}
          </div>

          <div className="p-4 bg-[#18181b]">
            <h3 className="text-lg font-extrabold text-white leading-tight">{profile.user.username}</h3>
            
            <div className="mt-3">
               <h4 className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">About Me</h4>
               <p className="text-[13px] text-neutral-300 leading-snug">
                 {profile.user.bio || "No bio right now"}
               </p>
            </div>

            {profile.friendStatus === 'friend' && (
               <div className="mt-4 pt-4 border-t border-[#27272a]">
                 <button 
                   onClick={() => {
                     if (onMessageClick) onMessageClick(profile.user);
                     else window.dispatchEvent(new CustomEvent('open-dm', { detail: { user: profile.user } }));
                     if (onClose) onClose();
                   }}
                   className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#e6e6e6] hover:bg-white text-black font-semibold rounded-lg transition-colors"
                 >
                   <MessageSquare className="w-4 h-4" />
                   Message
                 </button>
               </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-neutral-400 text-sm">
           User not found.
        </div>
      )}
    </div>
  )
}
