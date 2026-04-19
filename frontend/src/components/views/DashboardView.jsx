import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { useSocket } from '../../contexts/SocketContext'
import { statsApi, chatApi } from '../../services/api'
import { toast } from 'react-toastify'
import { MessageSquare, Users, Activity, Wifi, TrendingUp, Clock, Hash } from 'lucide-react'
import UserProfileView from './UserProfileView'
import AddFriendsView from './AddFriendsView'
import ProfilePreviewModal from '../ui/ProfilePreviewModal'
import { resolveUrl } from '../../utils/resolveUrl'

function initials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
}
function timeLabel(d) {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  if (date.toDateString() === now.toDateString())
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function StatCard({ icon: Icon, label, value, colorClass }) {
  return (
    <div className="relative flex flex-col gap-3 rounded-2xl bg-[#18181b] border border-[#27272a] p-5 hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300 group overflow-hidden shadow-md">
      {/* Subtle glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white tabular-nums">
          {value ?? <span className="h-7 w-12 inline-block rounded bg-neutral-800 animate-pulse" />}
        </p>
        <p className="mt-0.5 text-xs text-neutral-400">{label}</p>
      </div>
    </div>
  )
}

export default function DashboardView({ onProfileOpen, selectedDashboardView, onDashboardViewChange }) {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [stats, setStats] = useState(null)
  const [recentChats, setRecentChats] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [contextMenu, setContextMenu] = useState(null) // { userId, x, y }

  const handleContextMenu = (e, userId) => {
    e.preventDefault()
    setContextMenu({ userId, x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [sr, cr] = await Promise.all([
          statsApi.getStats().catch(() => ({ data: { data: { totalUsers: 0, totalMessages: 0, totalChats: 0, onlineUsers: 0 } } })),
          chatApi.getChats().catch(() => ({ data: { data: { chats: [] } } })),
        ])
        if (!mounted) return
        setStats(sr.data?.data)
        const chats = [...(cr.data?.data?.chats || [])].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
        setRecentChats(chats.slice(0, 5))
      } catch { toast.error('Failed to load dashboard') }
      finally { if (mounted) setLoading(false) }
    }
    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!socket) return
    const handleOnlineUsers = (ids) => {
      // Filter the raw IDs against our friend list so we only show friends 
      // (and this way we have access to their real username/avatar!)
      const onlineFriends = (user?.friends || [])
        .filter(f => ids.includes(f._id || f.id))
        .map(f => ({ _id: f._id || f.id, username: f.username, avatar: f.avatar }))
        
      setOnlineUsers(onlineFriends)
      setStats(prev => prev ? { ...prev, onlineUsers: ids.length } : null)
    }
    
    // Listen for the initial load and any incremental changes from the backend
    socket.on('online_users', handleOnlineUsers)
    socket.on('user_status_changed', ({ userId, status }) => {
      setOnlineUsers(prev => {
        if (status === 'online') {
          // If they came online, see if they are a friend
          const friend = user?.friends?.find(f => (f._id || f.id) === userId)
          if (friend && !prev.find(p => p._id === userId)) {
            return [...prev, { _id: userId, username: friend.username, avatar: friend.avatar }]
          }
          return prev
        } else {
          // If they went offline, remove them
          return prev.filter(p => p._id !== userId)
        }
      })
      
      setStats(prev => {
        if (!prev) return prev
        const count = prev.onlineUsers || 0
        return { ...prev, onlineUsers: Math.max(0, status === 'online' ? count + 1 : count - 1) }
      })
    })

    // Listen to new messages to update the recent conversations list
    const handleNewMessage = (msg) => {
      setRecentChats(prev => {
        const chats = [...prev];
        const chatIdx = chats.findIndex(c => c.chatId === msg.chatId || c._id === msg.chatId);
        
        if (chatIdx !== -1) {
          // Update existing chat
          const updatedChat = { ...chats[chatIdx] };
          updatedChat.lastMessage = msg;
          updatedChat.lastMessageAt = msg.createdAt || new Date();
          chats.splice(chatIdx, 1);
          chats.unshift(updatedChat);
        } else {
          // New chat received, we might need to fetch the full chat object but for now, 
          // to make it instantly responsive without full page reload, we'd trigger a reload of stats.
          statsApi.getStats()
            .then(sr => setStats(sr.data?.data))
            .catch(() => {});
          chatApi.getChats()
             .then(cr => {
               const sorted = [...(cr.data?.data?.chats || [])].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
               setRecentChats(sorted.slice(0, 5));
             })
             .catch(() => {});
        }
        return chats.slice(0, 5); // Keep max 5 recent chats
      });
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('online_users', handleOnlineUsers)
      socket.off('user_status_changed')
      socket.off('new_message', handleNewMessage)
    }
  }, [socket, user?.friends])

  function chatName(chat) {
    if (chat.chatName) return chat.chatName
    const others = chat.participants?.filter(p => p.user?._id !== user?.id) || []
    return others.map(p => p.user?.username).join(', ') || 'Chat'
  }

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-700 border-t-[#e6e6e6]" />
    </div>
  )

  // Show UserProfileView if "overview" is selected
  if (selectedDashboardView === 'overview') {
    return <UserProfileView isFullscreen={true} />
  }

  // Show Friends add page
  if (selectedDashboardView === 'friends') {
    return <AddFriendsView />
  }

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pb-6">

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} colorClass="bg-blue-500/15 text-blue-400" />
        <StatCard icon={MessageSquare} label="Total Messages" value={stats?.totalMessages} colorClass="bg-violet-500/15 text-violet-400" />
        <StatCard icon={Hash} label="Active Chats" value={stats?.totalChats} colorClass="bg-emerald-500/15 text-emerald-400" />
        <StatCard icon={Wifi} label="Online Now" value={stats?.onlineUsers} colorClass="bg-amber-500/15 text-amber-400" />
      </div>

      {/* Recent + Online */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Recent Conversations */}
        <div className="xl:col-span-2 rounded-2xl bg-[#18181b] border border-[#27272a] overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#27272a] bg-[#18181b]">
            <Clock className="h-4 w-4 text-neutral-400" />
            <h2 className="font-semibold text-neutral-200 text-sm">Recent Conversations</h2>
          </div>
          {recentChats.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2 bg-[#18181b]">
              <MessageSquare className="h-8 w-8 text-neutral-700" />
              <p className="text-xs text-neutral-500">No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-[#27272a] bg-[#18181b] max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
              {recentChats.map(chat => (
                <div key={chat.chatId || chat._id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#e6e6e6]/5 transition-colors cursor-pointer">
                  <div 
                    className="h-9 w-9 shrink-0 rounded-full bg-[#e6e6e6]/20 text-[#e6e6e6] flex items-center justify-center text-xs font-semibold overflow-hidden"
                    onContextMenu={(e) => {
                       // Find the participant that isn't me to show their profile on right click
                       const other = chat.participants?.find(p => p.user?._id !== user?.id)
                       if (other?.user?._id) handleContextMenu(e, other.user._id)
                    }}
                  >
                    {chat.participants?.find(p => p.user?._id !== user?.id)?.user?.avatar ? (
                      <img src={resolveUrl(chat.participants.find(p => p.user?._id !== user?.id)?.user?.avatar)} className="object-cover w-full h-full" alt="" />
                    ) : initials(chatName(chat))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{chatName(chat)}</p>
                    <p className="text-xs text-neutral-500 truncate">{chat.lastMessage?.messageText || chat.lastMessage?.content || 'No messages'}</p>
                  </div>
                  <span className="text-[11px] text-neutral-600 shrink-0 ml-4 pt-1 items-start self-start">{timeLabel(chat.lastMessageAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Online Users */}
        <div className="rounded-2xl bg-[#18181b] border border-[#27272a] overflow-hidden shadow-lg">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#27272a] bg-[#18181b]">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <h2 className="font-semibold text-neutral-200 text-sm">Online</h2>
            </div>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800/80 text-[10px] font-bold text-neutral-400">
              {onlineUsers.length}
            </span>
          </div>
          <div className="p-2 max-h-64 overflow-y-auto bg-[#18181b]">
            {onlineUsers.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <Wifi className="h-7 w-7 text-neutral-700" />
                <p className="text-xs text-neutral-500">Nobody online</p>
              </div>
            ) : onlineUsers.slice(0, 8).map((u, i) => (
              <div key={u._id || i} className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 hover:bg-[#e6e6e6]/10 transition-colors">
                <div className="relative shrink-0" onContextMenu={(e) => handleContextMenu(e, u._id)}>
                  <div className="h-7 w-7 rounded-full bg-neutral-800 border border-[#27272a] text-neutral-300 flex items-center justify-center text-[11px] font-semibold overflow-hidden cursor-context-menu">
                    {u.avatar ? <img src={resolveUrl(u.avatar)} className="object-cover w-full h-full" alt="" /> : initials(u.username || '?')}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-[2px] border-[#18181b] bg-emerald-500" />
                </div>
                <span className="text-xs text-neutral-300 truncate">{u.username || u}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl bg-[#18181b] border border-[#27272a] overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#27272a] bg-[#18181b]">
          <TrendingUp className="h-4 w-4 text-neutral-400" />
          <h2 className="font-semibold text-neutral-200 text-sm">Platform Summary</h2>
        </div>
        <div className="grid grid-cols-4 divide-x divide-[#27272a] bg-[#18181b]">
          {[
            { label: 'My Friends', value: user?.friends?.length || 0 },
            { label: 'Registered users', value: stats?.totalUsers ?? '—' },
            { label: 'Active chats', value: stats?.totalChats ?? '—' },
            { label: 'Total messages', value: stats?.totalMessages ?? '—' },
          ].map(item => (
            <div key={item.label} className="p-5 text-center">
              <p className="text-xl font-bold text-white tabular-nums">{item.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
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
