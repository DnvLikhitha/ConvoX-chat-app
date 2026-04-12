import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { usersApi } from '../../services/api'
import { toast } from 'react-toastify'
import { Search, UserPlus, Check, Clock, X } from 'lucide-react'
import ProfilePreviewModal from '../ui/ProfilePreviewModal'
import { resolveUrl } from '../../utils/resolveUrl'

function initials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
}

export default function AddFriendsView() {
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('search') // 'search' | 'pending'
  
  const [contextMenu, setContextMenu] = useState(null) // { userId, x, y }
  const handleContextMenu = (e, userId) => {
    e.preventDefault()
    setContextMenu({ userId, x: e.clientX, y: e.clientY })
  }
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [friendRequests, setFriendRequests] = useState({})
  const debounceTimer = useRef(null)

  // Pending requests state
  const [pendingRequestsList, setPendingRequestsList] = useState([])
  const [loadingPending, setLoadingPending] = useState(false)

  // Debounced search
  useEffect(() => {
    if (activeTab !== 'search') return

    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await usersApi.searchUsers(searchQuery)
        const results = response.data?.data?.users || []
        // Filter out current user
        setSearchResults(results.filter(u => u._id !== currentUser?._id && u._id !== currentUser?.id))
      } catch (err) {
        console.error('Search failed:', err)
        toast.error('Failed to search users')
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [searchQuery, currentUser?._id, activeTab])

  // Load pending requests
  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingRequests()
    }
  }, [activeTab])

  const loadPendingRequests = async () => {
    setLoadingPending(true)
    try {
      const res = await usersApi.getFriendRequests()
      setPendingRequestsList(res.data?.data?.requests || [])
    } catch (err) {
      toast.error('Failed to load pending requests')
    } finally {
      setLoadingPending(false)
    }
  }

  const handleAddFriend = async (userId) => {
    if (friendRequests[userId]) return

    setFriendRequests(prev => ({ ...prev, [userId]: 'pending' }))
    try {
      await usersApi.sendFriendRequest(userId)
      toast.success('Friend request sent!')
      setFriendRequests(prev => ({ ...prev, [userId]: 'sent' }))
    } catch (err) {
      console.error('Failed to send request:', err)
      toast.error('Failed to send friend request')
      setFriendRequests(prev => {
        const updated = { ...prev }
        delete updated[userId]
        return updated
      })
    }
  }

  const handleAccept = async (userId) => {
    try {
      await usersApi.acceptFriendRequest(userId)
      toast.success('Request accepted!')
      setPendingRequestsList(prev => prev.filter(req => (req.from && req.from._id !== userId)))
    } catch {
      toast.error('Failed to accept request')
    }
  }

  const handleReject = async (userId) => {
    try {
      await usersApi.rejectFriendRequest(userId)
      toast.success('Request rejected')
      setPendingRequestsList(prev => prev.filter(req => (req.from && req.from._id !== userId)))
    } catch {
      toast.error('Failed to reject request')
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header & Tabs */}
      <div className="sticky top-0 bg-[#18181b] z-10 px-0 py-4 border-b border-[#27272a] mb-6">
        <h1 className="text-2xl font-bold text-white mb-6">Friends</h1>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('search')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'search' ? 'border-white text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Add Friends
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'pending' ? 'border-white text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Pending Requests
            {pendingRequestsList.length > 0 && activeTab !== 'pending' && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-[10px] text-amber-500">
                {pendingRequestsList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-0">
        
        {/* --- SEARCH TAB --- */}
        {activeTab === 'search' && (
          <>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#18181b] border border-[#27272a] rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors shadow-inner"
              />
            </div>

            {loading && searchQuery && (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-700 border-t-[#e6e6e6]" />
              </div>
            )}

            {!loading && !searchQuery && (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <Search className="h-12 w-12 text-neutral-800" />
                <p className="text-neutral-500 font-medium">Search users to add as friends</p>
              </div>
            )}

            {!loading && searchQuery && searchResults.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <UserPlus className="h-12 w-12 text-neutral-800" />
                <p className="text-neutral-500 font-medium">No users found</p>
              </div>
            )}

            {!loading && searchResults.length > 0 && (
              <div className="space-y-3">
                {searchResults.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-neutral-700 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-[#e6e6e6] font-bold overflow-hidden cursor-context-menu"
                        onContextMenu={(e) => handleContextMenu(e, user._id)}
                      >
                         {user.avatar ? <img src={resolveUrl(user.avatar)} className="object-cover w-full h-full" alt="" /> : initials(user.username)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-neutral-200 truncate">{user.username}</p>
                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddFriend(user._id)}
                      disabled={!!friendRequests[user._id]}
                      className={`ml-3 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm shrink-0 shadow-sm ${
                        friendRequests[user._id] === 'sent'
                          ? 'bg-neutral-800/50 text-neutral-500 cursor-default border border-transparent'
                          : friendRequests[user._id] === 'pending'
                          ? 'bg-neutral-800 text-neutral-400 cursor-wait border border-neutral-700'
                          : 'bg-white text-black hover:bg-neutral-200 border border-transparent'
                      }`}
                    >
                      {friendRequests[user._id] === 'sent' ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Sent</span>
                        </>
                      ) : friendRequests[user._id] === 'pending' ? (
                        <>
                          <Clock className="h-4 w-4" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          <span>Add Friend</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* --- PENDING TAB --- */}
        {activeTab === 'pending' && (
          <>
            {loadingPending ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-700 border-t-[#e6e6e6]" />
              </div>
            ) : pendingRequestsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#18181b] border border-[#27272a]">
                  <Check className="h-6 w-6 text-neutral-600" />
                </div>
                <p className="text-neutral-500 font-medium">You have no pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Pending — {pendingRequestsList.length}</h2>
                {pendingRequestsList.map(reqUser => {
                  const sender = reqUser.from || {}
                  return (
                  <div
                    key={reqUser._id}
                    className="flex items-center justify-between p-4 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-neutral-700 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-[#e6e6e6] font-bold overflow-hidden cursor-context-menu"
                        onContextMenu={(e) => handleContextMenu(e, sender._id)}
                      >
                        {sender.avatar ? <img src={resolveUrl(sender.avatar)} className="object-cover w-full h-full" alt="" /> : initials(sender.username)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-neutral-200 truncate">{sender.username}</p>
                        <p className="text-xs text-neutral-500 truncate">Incoming Friend Request</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <button
                        onClick={() => handleAccept(sender._id)}
                        className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"
                        title="Accept Request"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReject(sender._id)}
                        className="flex items-center justify-center h-9 w-9 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        title="Reject Request"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </>
        )}
        
      </div>
      
      {contextMenu && (
        <ProfilePreviewModal 
          userId={contextMenu.userId} 
          position={{ x: contextMenu.x, y: contextMenu.y }} 
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}
