import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { useSocket } from '../../contexts/SocketContext'
import { statsApi, chatApi } from '../../services/api'
import { toast } from 'react-toastify'
import { MessageSquare, Users, Activity, Wifi, TrendingUp, Clock, Hash } from 'lucide-react'

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
    <div className="relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 p-5 flex flex-col gap-3 hover:border-neutral-700 transition-all duration-300">
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

export default function DashboardView() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [stats, setStats] = useState(null)
  const [recentChats, setRecentChats] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [loading, setLoading] = useState(true)

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
    socket.on('online-users', setOnlineUsers)
    socket.emit('get-online-users')
    return () => socket.off('online-users', setOnlineUsers)
  }, [socket])

  function chatName(chat) {
    if (chat.chatName) return chat.chatName
    const others = chat.participants?.filter(p => p.user?._id !== user?.id) || []
    return others.map(p => p.user?.username).join(', ') || 'Chat'
  }

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-700 border-t-violet-600" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pb-6">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700/30 via-violet-900/20 to-transparent border border-violet-700/30 p-7 flex items-center gap-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white text-xl font-bold shadow-lg shadow-violet-900/40">
          {initials(user?.username)}
        </div>
        <div>
          <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium mb-1">Welcome back</p>
          <h1 className="text-2xl font-bold text-white">{user?.username} 👋</h1>
          <p className="text-xs text-neutral-400 mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

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
        <div className="xl:col-span-2 rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-800">
            <Clock className="h-4 w-4 text-violet-400" />
            <h2 className="font-semibold text-white text-sm">Recent Conversations</h2>
          </div>
          {recentChats.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2">
              <MessageSquare className="h-8 w-8 text-neutral-700" />
              <p className="text-xs text-neutral-500">No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/50">
              {recentChats.map(chat => (
                <div key={chat.chatId || chat._id} className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-800/40 transition-colors cursor-pointer">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-violet-600/20 text-violet-300 flex items-center justify-center text-xs font-semibold">
                    {initials(chatName(chat))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{chatName(chat)}</p>
                    <p className="text-xs text-neutral-500 truncate">{chat.lastMessage?.messageText || 'No messages'}</p>
                  </div>
                  <span className="text-[11px] text-neutral-600 shrink-0">{timeLabel(chat.lastMessageAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Online Users */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-800">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h2 className="font-semibold text-white text-sm">Online</h2>
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500/20 px-1.5 text-[11px] font-medium text-emerald-400">
              {onlineUsers.length}
            </span>
          </div>
          <div className="p-3 space-y-1">
            {onlineUsers.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <Wifi className="h-7 w-7 text-neutral-700" />
                <p className="text-xs text-neutral-500">Nobody online</p>
              </div>
            ) : onlineUsers.slice(0, 8).map((u, i) => (
              <div key={u._id || i} className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 hover:bg-neutral-800 transition-colors">
                <div className="relative">
                  <div className="h-7 w-7 rounded-full bg-neutral-700 text-neutral-300 flex items-center justify-center text-[11px] font-semibold">
                    {initials(u.username || u)}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-[1.5px] border-neutral-900 bg-emerald-500" />
                </div>
                <span className="text-xs text-neutral-300 truncate">{u.username || u}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-violet-400" />
          <h2 className="font-semibold text-white text-sm">Platform Summary</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Registered users', value: stats?.totalUsers ?? '—' },
            { label: 'Active chats', value: stats?.totalChats ?? '—' },
            { label: 'Total messages', value: stats?.totalMessages ?? '—' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xl font-bold text-white tabular-nums">{item.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
