import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { useSocket } from '../../contexts/SocketContext'
import { chatApi, authApi } from '../../services/api'
import { toast } from 'react-toastify'
import { Plus, Search, X, Send, Users, Hash, Check, CheckCheck } from 'lucide-react'

function initials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
}

/* ─── Create Group Modal ─── */
function CreateGroupModal({ open, onClose, onCreate }) {
  const [groupName, setGroupName] = useState('')
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!open) { setGroupName(''); setSearch(''); setUsers([]); setSelected([]) }
    else fetchUsers('')
  }, [open])

  useEffect(() => {
    const t = setTimeout(() => { if (open) fetchUsers(search) }, 300)
    return () => clearTimeout(t)
  }, [search, open])

  async function fetchUsers(q) {
    setLoading(true)
    try { const r = await authApi.getUsers(q); setUsers(r.data?.data?.users || []) }
    catch { setUsers([]) }
    finally { setLoading(false) }
  }
  function toggle(u) {
    setSelected(p => p.find(x => x._id === u._id) ? p.filter(x => x._id !== u._id) : [...p, u])
  }
  async function submit(e) {
    e.preventDefault()
    if (!groupName.trim() || !selected.length) return
    setCreating(true)
    try {
      const r = await chatApi.createChat({ chatType: 'group', participantIds: selected.map(u => u._id), chatName: groupName.trim() })
      onCreate(r.data?.data?.chat)
      onClose()
    } catch { toast.error('Failed to create group') }
    finally { setCreating(false) }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="font-semibold text-white text-lg">Create Group</h2>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Group Name *</label>
            <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Project Alpha"
              className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-violet-600 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Add Members *</label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                className="w-full rounded-xl bg-neutral-800 border border-neutral-700 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-violet-600 transition-colors" />
            </div>
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selected.map(u => (
                  <span key={u._id} onClick={() => toggle(u)} className="flex items-center gap-1 bg-violet-600/20 text-violet-300 text-xs rounded-full px-3 py-1 cursor-pointer">
                    {u.username} <X className="h-3 w-3" />
                  </span>
                ))}
              </div>
            )}
            <div className="max-h-44 overflow-y-auto space-y-1 rounded-xl bg-neutral-800/50 p-2">
              {loading ? <p className="text-center text-xs text-neutral-500 py-4">Searching...</p>
                : users.length === 0 ? <p className="text-center text-xs text-neutral-500 py-4">No users found</p>
                  : users.map(u => {
                    const sel = selected.some(x => x._id === u._id)
                    return (
                      <button key={u._id} type="button" onClick={() => toggle(u)}
                        className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${sel ? 'bg-violet-600/20' : 'hover:bg-neutral-700'}`}>
                        <div className="h-7 w-7 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-medium text-neutral-300">
                          {initials(u.username)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{u.username}</p>
                          <p className="text-xs text-neutral-500 truncate">{u.email}</p>
                        </div>
                        {sel && <Check className="h-4 w-4 text-violet-400 shrink-0" />}
                      </button>
                    )
                  })}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-neutral-800 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700 transition-colors">Cancel</button>
            <button type="submit" disabled={!groupName.trim() || !selected.length || creating}
              className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm text-white font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {creating ? 'Creating...' : `Create (${selected.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Group Chat Panel ─── */
function GroupChatPanel({ chatId, user, socket, connected }) {
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [typingUsers, setTypingUsers] = useState([])
  const bottomRef = useRef(null)
  const typingTimeouts = useRef({})

  // Load chat info + messages
  useEffect(() => {
    if (!chatId) return
    let mounted = true
    setLoading(true)
    Promise.all([
      chatApi.getMessages(chatId),
      chatApi.getChats()
    ]).then(([msgR, chatsR]) => {
      if (!mounted) return
      setMessages(msgR.data?.data?.messages || [])
      const found = (chatsR.data?.data?.chats || []).find(c => (c.chatId || c._id) === chatId)
      setChat(found || null)
    }).catch(() => toast.error('Failed to load messages'))
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [chatId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    if (!socket || !connected || !chatId) return
    socket.emit('join_room', chatId)
    function onMsg(msg) { setMessages(p => p.some(m => m._id === msg._id) ? p : [...p, msg]) }
    function onTyping({ user: who, room }) {
      if (room !== chatId) return
      setTypingUsers(p => p.includes(who) ? p : [...p, who])
      clearTimeout(typingTimeouts.current[who])
      typingTimeouts.current[who] = setTimeout(() => setTypingUsers(p => p.filter(u => u !== who)), 3000)
    }
    socket.on('new_message', onMsg)
    socket.on('user_typing', onTyping)
    return () => { socket.off('new_message', onMsg); socket.off('user_typing', onTyping) }
  }, [socket, connected, chatId])

  const handleSend = useCallback(async () => {
    const text = draft.trim()
    if (!text) return
    setDraft('')
    try {
      const r = await chatApi.sendMessage(chatId, { messageText: text })
      const msg = r.data?.data?.message
      if (msg) setMessages(p => p.some(m => m._id === msg._id) ? p : [...p, msg])
    } catch { toast.error('Failed to send') }
  }, [draft, chatId])

  const typingNames = typingUsers.filter(u => u !== user?.username)
  const name = chat?.chatName || 'Group'
  const memberCount = chat?.participants?.length || 0
  let lastDate = null

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-700 border-t-violet-600" />
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-neutral-800 bg-neutral-900/50 shrink-0">
        <div className="h-9 w-9 rounded-xl bg-violet-600/20 text-violet-300 font-semibold flex items-center justify-center text-xs">
          {initials(name)}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{name}</p>
          <p className="text-xs text-neutral-500">{memberCount} members</p>
        </div>
        <span className={`ml-auto px-2 py-0.5 rounded-full text-[11px] ${connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {connected ? 'Live' : 'Offline'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center h-full justify-center gap-3 py-12">
            <Hash className="h-9 w-9 text-neutral-700" />
            <p className="text-sm text-neutral-500">No messages yet — say hello!</p>
          </div>
        ) : messages.map((msg, idx) => {
          const isOwn = msg.sender?._id === user?.id || msg.sender?.username === user?.username
          const prev = messages[idx - 1]
          const showAvatar = !prev || prev.sender?._id !== msg.sender?._id
          const msgDate = new Date(msg.createdAt).toLocaleDateString()
          let sep = null
          if (msgDate !== lastDate) {
            lastDate = msgDate
            sep = (
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-neutral-800" />
                <span className="text-[11px] text-neutral-600">{new Date(msg.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <div className="flex-1 h-px bg-neutral-800" />
              </div>
            )
          }
          const time = new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          return (
            <div key={msg._id || idx}>
              {sep}
              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[72%] gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  {!isOwn && showAvatar ? (
                    <div className="h-7 w-7 rounded-full bg-neutral-700 flex items-center justify-center text-[11px] text-neutral-300 mt-1 shrink-0">{initials(msg.sender?.username)}</div>
                  ) : !isOwn ? <div className="w-7 shrink-0" /> : null}
                  <div>
                    {!isOwn && showAvatar && <p className="text-xs text-violet-400 mb-1 ml-1">{msg.sender?.username}</p>}
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isOwn ? 'bg-violet-600 text-white rounded-tr-sm' : 'bg-neutral-800 text-neutral-100 rounded-tl-sm'}`}>
                      {msg.messageText}
                    </div>
                    <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'justify-end' : ''}`}>
                      <span className="text-[11px] text-neutral-600">{time}</span>
                      {isOwn && (msg.status === 'read' ? <CheckCheck className="h-3 w-3 text-violet-400" /> : <Check className="h-3 w-3 text-neutral-600" />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {typingNames.length > 0 && <p className="text-xs text-neutral-500 animate-pulse">{typingNames.join(', ')} typing...</p>}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-neutral-800 bg-neutral-900/50 px-5 py-3 shrink-0">
        <form onSubmit={e => { e.preventDefault(); handleSend() }} className="flex items-end gap-2">
          <textarea value={draft}
            onChange={e => { setDraft(e.target.value); if (socket) socket.emit('typing', { room: chatId, user: user?.username }) }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder={`Message ${name}...`} rows={1}
            className="flex-1 resize-none rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-violet-600 transition-colors min-h-10" />
          <button type="submit" disabled={!draft.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

/* ─── Main GroupsView — no left panel, driven by selectedPage prop ─── */
export default function GroupsView({ selectedPage }) {
  const { user } = useAuth()
  const { socket, connected } = useSocket()
  const [showCreate, setShowCreate] = useState(false)

  // If selectedPage === 'create', open modal automatically
  useEffect(() => {
    if (selectedPage === 'create') setShowCreate(true)
    else setShowCreate(false)
  }, [selectedPage])

  function onGroupCreated(g) {
    if (!g) return
    if (socket && connected) socket.emit('join_room', g.chatId)
    toast.success('Group created! Select it from the sidebar.')
    setShowCreate(false)
  }

  const hasGroup = selectedPage && selectedPage !== 'create' && selectedPage !== 'filter'

  return (
    <div className="flex flex-col h-full">
      {hasGroup ? (
        <GroupChatPanel chatId={selectedPage} user={user} socket={socket} connected={connected} />
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-violet-600/10 border border-violet-600/20">
            <Users className="h-7 w-7 text-violet-500/60" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white">Select a group</p>
            <p className="text-xs text-neutral-500 mt-1">Click a group in the sidebar, or create a new one</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Group
          </button>
        </div>
      )}

      <CreateGroupModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={onGroupCreated}
      />
    </div>
  )
}
