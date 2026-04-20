import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/useAuth'
import { useSocket } from '../contexts/SocketContext'
import { chatApi, authApi, usersApi } from '../services/api'
import { toast } from 'react-toastify'
import { useIsMobile } from '../hooks/use-mobile'
import { SidebarComponent } from '../components/ui/sidebar-component'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { ScrollArea } from '../components/ui/scroll-area'
import { Separator } from '../components/ui/separator'
import { Skeleton } from '../components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog'
import {
  Search, Plus, Send, LogOut, Info, ArrowLeft, X, MessageSquare,
  Users, Hash, Check, CheckCheck, Shield, Clock, Menu, Flag, MoreVertical,
} from 'lucide-react'
import { cn } from '../lib/utils'

/* ─── Helpers ─── */
function initials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
}

function timeLabel(d) {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function chatDisplayName(chat, userId) {
  if (chat.chatName) return chat.chatName
  const others = chat.participants?.filter(p => p.user?._id !== userId) || []
  return others.map(p => p.user?.username).join(', ') || 'Chat'
}

/* ─── NewChatDialog ─── */
function NewChatDialog({ open, onOpenChange, onCreated }) {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState([])
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => { if (!open) { setSearch(''); setUsers([]); setSelected([]); setGroupName('') } else fetchUsers('') }, [open])
  useEffect(() => { const t = setTimeout(() => { if (open) fetchUsers(search) }, 300); return () => clearTimeout(t) }, [search, open])

  async function fetchUsers(q) {
    setLoading(true)
    try { const r = await authApi.getUsers(q); setUsers(r.data?.data?.users || []) }
    catch { setUsers([]) }
    finally { setLoading(false) }
  }

  function toggle(u) { setSelected(p => p.find(x => x._id === u._id) ? p.filter(x => x._id !== u._id) : [...p, u]) }

  async function create() {
    if (!selected.length) return
    setCreating(true)
    try {
      const isGroup = selected.length > 1
      const r = await chatApi.createChat({ chatType: isGroup ? 'group' : 'direct', participantIds: selected.map(u => u._id), chatName: isGroup ? (groupName || selected.map(u => u.username).join(', ')) : undefined })
      onCreated(r.data?.data?.chat)
      onOpenChange(false)
    } catch { toast.error('Failed to create chat') }
    finally { setCreating(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-9" />
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-6 pb-3">
            {selected.map(u => (
              <Badge key={u._id} variant="secondary" className="cursor-pointer gap-1" onClick={() => toggle(u)}>
                {u.username} <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}

        {selected.length > 1 && (
          <div className="px-6 pb-3 space-y-2">
            <Label>Group name</Label>
            <Input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Optional" />
          </div>
        )}

        <Separator />

        <ScrollArea className="max-h-64">
          <div className="p-4 space-y-1">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-20" /><Skeleton className="h-2.5 w-28" /></div>
                </div>
              ))
            ) : users.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No users found</p>
            ) : users.map(u => {
              const sel = selected.some(x => x._id === u._id)
              return (
                <Button key={u._id} variant={sel ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 h-auto py-2" onClick={() => toggle(u)}>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{initials(u.username)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  {u.status === 'online' && <Badge variant="outline" className="text-xs">Online</Badge>}
                </Button>
              )
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={create} disabled={!selected.length || creating}>
            {creating ? 'Creating...' : selected.length > 1 ? 'Create Group' : 'Start Chat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Sidebar Content ─── */
function SidebarContent({ chats, activeChat, onSelect, onNewChat, onLogout, user, loading }) {
  const [q, setQ] = useState('')
  const filtered = chats.filter(c => {
    if (!q) return true
    return chatDisplayName(c, user?.id).toLowerCase().includes(q.toLowerCase())
  })

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Messages</h1>
        </div>
        <Tooltip><TooltipTrigger asChild>
          <Button size="icon" variant="ghost" onClick={onNewChat}><Plus className="h-5 w-5" /></Button>
        </TooltipTrigger><TooltipContent>New chat</TooltipContent></Tooltip>
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." className="pl-9" />
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {loading ? [1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-24" /><Skeleton className="h-3 w-36" /></div>
            </div>
          )) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">{q ? 'No chats found' : 'No conversations yet'}</p>
              {!q && <Button variant="link" size="sm" onClick={onNewChat} className="mt-1">Start a chat</Button>}
            </div>
          ) : filtered.map(chat => {
            const active = activeChat?.chatId === chat.chatId
            const name = chatDisplayName(chat, user?.id)
            const others = chat.participants?.filter(p => p.user?._id !== user?.id) || []
            const online = others.some(p => p.user?.status === 'online')
            const preview = chat.lastMessage?.messageText || 'No messages yet'

            return (
              <Button
                key={chat._id || chat.chatId}
                variant={active ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-3 h-auto py-3 px-3"
                onClick={() => onSelect(chat)}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{initials(name)}</AvatarFallback>
                  </Avatar>
                  {chat.chatType !== 'group' && online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{name}</span>
                    <span className="text-[11px] text-muted-foreground ml-2 shrink-0">{timeLabel(chat.lastMessageAt || chat.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground truncate mr-2">{preview}</p>
                    {chat.unreadCount > 0 && (
                      <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-3">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials(user?.username)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Tooltip><TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={onLogout}><LogOut className="h-4 w-4" /></Button>
          </TooltipTrigger><TooltipContent>Logout</TooltipContent></Tooltip>
        </div>
      </div>
    </div>
  )
}

/* ─── ChatInfoPanel ─── */
function ChatInfoPanel({ chat, onClose }) {
  if (!chat) return null
  const name = chat.chatName || chat.participants?.map(p => p.user?.username).join(', ') || 'Chat'
  const online = chat.participants?.filter(p => p.user?.status === 'online').length || 0

  return (
    <Card className="h-full w-80 rounded-none border-0 border-l">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm">Chat Details</CardTitle>
        <Button size="icon" variant="ghost" onClick={onClose}><X className="h-4 w-4" /></Button>
      </CardHeader>
      <Separator />
      <ScrollArea className="flex-1">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="h-16 w-16 mb-3"><AvatarFallback className="text-xl">{initials(name)}</AvatarFallback></Avatar>
            <h4 className="font-semibold">{name}</h4>
            {chat.chatDescription && <p className="text-sm text-muted-foreground mt-1">{chat.chatDescription}</p>}
            <Badge variant="secondary" className="mt-2">
              {chat.chatType === 'group' ? <><Users className="h-3 w-3 mr-1" />Group</> : <>Direct</>}
            </Badge>
          </div>

          <Separator />

          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Members ({chat.participants?.length})</p>
              {online > 0 && <Badge variant="outline" className="text-xs">{online} online</Badge>}
            </div>
            <div className="space-y-1">
              {chat.participants?.map((p, i) => (
                <div key={p.user?._id || i} className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent">
                  <div className="relative">
                    <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{initials(p.user?.username)}</AvatarFallback></Avatar>
                    {p.user?.status === 'online' && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{p.user?.username || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{p.user?.status === 'online' ? 'Online' : 'Offline'}</p>
                  </div>
                  {p.role === 'admin' && <Badge variant="outline" className="text-[10px]"><Shield className="h-2.5 w-2.5 mr-0.5" />Admin</Badge>}
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Created {new Date(chat.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  )
}

/* ─── MessageStatus ─── */
function MsgStatus({ status }) {
  if (status === 'read') return <CheckCheck className="h-3.5 w-3.5 text-primary" />
  if (status === 'delivered') return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />
  return <Check className="h-3.5 w-3.5 text-muted-foreground" />
}

/* ─── Main ChatPage ─── */
export default function ChatPage() {
  const { user, logout } = useAuth()
  const { socket, connected } = useSocket()
  const isMobile = useIsMobile()

  const [chats, setChats] = useState([])
  const [friendsList, setFriendsList] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [draft, setDraft] = useState('')
  const [flagDialog, setFlagDialog] = useState({ open: false, messageId: null })
  const [flagReason, setFlagReason] = useState('')
  const [flagging, setFlagging] = useState(false)
  const [msgMenu, setMsgMenu] = useState(null)

  const bottomRef = useRef(null)
  const typingTimeouts = useRef({})

  // Load friends list
  useEffect(() => {
    (async () => {
      try {
        const r = await usersApi.getFriendsList()
        setFriendsList(r.data?.data?.friends || [])
      } catch (err) {
        console.error('Failed to load friends:', err)
      }
    })()
  }, [])

  // Load chats
  useEffect(() => {
    (async () => {
      setLoadingChats(true)
      try {
        const r = await chatApi.getChats()
        const allChats = r.data?.data?.chats || []
        // Sort by most recent message
        const sorted = [...allChats].sort((a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt))
        setChats(sorted)
      } catch { toast.error('Failed to load chats') }
      finally { setLoadingChats(false) }
    })()
  }, [user?.id])

  // Load messages
  useEffect(() => {
    if (!activeChat) return
    (async () => {
      setLoadingMsgs(true)
      try { const r = await chatApi.getMessages(activeChat.chatId); setMessages(r.data?.data?.messages || []) }
      catch { toast.error('Failed to load messages') }
      finally { setLoadingMsgs(false) }
    })()
    setTypingUsers([])
  }, [activeChat?.chatId])

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const activeChatIdRef = useRef(activeChat?.chatId)
  useEffect(() => {
    activeChatIdRef.current = activeChat?.chatId
    // Reset unread count when opening a chat
    if (activeChat?.chatId) {
      setChats(p => p.map(c => c.chatId === activeChat.chatId ? { ...c, unreadCount: 0 } : c))
    }
  }, [activeChat?.chatId])

  const joinedRooms = useRef(new Set())

  // Socket: Join rooms
  useEffect(() => {
    if (!socket || !connected) return
    chats.forEach(c => {
      if (!joinedRooms.current.has(c.chatId)) {
        socket.emit('join_room', c.chatId)
        joinedRooms.current.add(c.chatId)
      }
    })
  }, [socket, connected, chats])

  // Socket: Listeners
  useEffect(() => {
    if (!socket || !connected) return

    function onMsg(msg) {
      const isForActiveChat = msg.chatId === activeChatIdRef.current;
      
      if (isForActiveChat) {
        setMessages(p => p.some(m => m._id === msg._id || m.messageId === msg.messageId) ? p : [...p, msg])

        const senderId = msg.sender?._id || msg.sender
        const currentUserId = user?.id || user?._id
        if (senderId && currentUserId && String(senderId) !== String(currentUserId)) {
          socket.emit('messages_delivered', { chatId: msg.chatId })
          socket.emit('messages_read', { chatId: msg.chatId })
        }
      }
      
      setChats(p => p.map(c => {
        if (c.chatId === msg.chatId) {
          return { 
            ...c, 
            lastMessage: msg, 
            lastMessageAt: msg.createdAt || new Date().toISOString(),
            unreadCount: isForActiveChat ? 0 : (c.unreadCount || 0) + 1
          }
        }
        return c
      }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)))
    }

    function onTyping({ user: who, room }) {
      if (room !== activeChatIdRef.current) return
      setTypingUsers(p => p.includes(who) ? p : [...p, who])
      clearTimeout(typingTimeouts.current[who])
      typingTimeouts.current[who] = setTimeout(() => setTypingUsers(p => p.filter(u => u !== who)), 3000)
    }

    function onStatusUpdate({ chatId, status }) {
      if (chatId === activeChatIdRef.current) {
        setMessages(p => p.map(m => {
          // Only update messages sent by the current user (their messages get the status indicator)
          const isOwn = m.sender?._id === user?.id || m.sender?.username === user?.username
          if (isOwn && (m.status === 'sent' || m.status === 'delivered')) {
            return { ...m, status }
          }
          return m
        }))
      }
    }

    socket.on('new_message', onMsg)
    socket.on('user_typing', onTyping)
    socket.on('messages_status_update', onStatusUpdate)
    return () => { socket.off('new_message', onMsg); socket.off('user_typing', onTyping); socket.off('messages_status_update', onStatusUpdate) }
  }, [socket, connected, user?.id, user?.username]) // removed activeChat, chats from deps

  useEffect(() => {
    if (socket && connected && activeChat) {
      socket.emit('join_room', activeChat.chatId)
      socket.emit('messages_delivered', { chatId: activeChat.chatId })
      // Mark messages as read when user opens the chat
      socket.emit('messages_read', { chatId: activeChat.chatId })
    }
  }, [socket, connected, activeChat?.chatId])

  useEffect(() => {
    const handleClickOutside = () => setMsgMenu(null)
    if (msgMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [msgMenu])

  // Send
  const handleSend = useCallback(async () => {
    const text = draft.trim()
    if (!text || !activeChat) return
    setDraft('')
    try {
      const r = await chatApi.sendMessage(activeChat.chatId, { messageText: text })
      const msg = r.data?.data?.message
      if (msg) {
        setMessages(p => p.some(m => m._id === msg._id) ? p : [...p, msg])
        setChats(p => p.map(c => c.chatId === activeChat.chatId ? { ...c, lastMessage: msg, lastMessageAt: msg.createdAt } : c).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)))
      }
    } catch { toast.error('Failed to send') }
  }, [draft, activeChat])

  function emitTyping() {
    if (socket && activeChat) socket.emit('typing', { room: activeChat.chatId, user: user?.username })
  }

  async function handleFlagMessage() {
    if (!flagDialog.messageId || !flagReason.trim()) {
      toast.error('Please provide a reason')
      return
    }

    setFlagging(true)
    try {
      await usersApi.flagMessage(flagDialog.messageId, flagReason)
      toast.success('Message flagged. Admins will review it.')
      setFlagDialog({ open: false, messageId: null })
      setFlagReason('')
    } catch (err) {
      console.error('Failed:', err)
      toast.error('Failed to flag message')
    } finally {
      setFlagging(false)
    }
  }

  function selectChat(chat) {
    setActiveChat(chat)
    setShowInfo(false)
  }

  function onChatCreated(c) {
    setChats(p => [c, ...p])
    selectChat(c)
    if (socket && connected) socket.emit('join_room', c.chatId)
  }

  // Derive
  const name = activeChat ? chatDisplayName(activeChat, user?.id) : ''
  const others = activeChat?.participants?.filter(p => p.user?._id !== user?.id) || []
  const isGroup = activeChat?.chatType === 'group'
  const onlineCount = others.filter(p => p.user?.status === 'online').length
  const typingNames = typingUsers.filter(u => u !== user?.username)
  let lastDate = null

  const sidebar = (
    <SidebarContent
      chats={chats} activeChat={activeChat} onSelect={selectChat}
      onNewChat={() => setShowNewChat(true)} onLogout={logout}
      user={user} loading={loadingChats}
    />
  )

  return (
    <TooltipProvider>
      <div className="dark flex h-screen w-screen bg-background text-foreground">
        <SidebarComponent />
        {/* Chat area */}
        <div className="flex flex-1 min-w-0">
          <div className="flex flex-1 flex-col min-w-0">
            {!activeChat ? (
              /* Empty state */
              <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                  <MessageSquare className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                  Select an existing conversation from the sidebar or start a new chat to connect.
                </p>
                <Button onClick={() => setShowNewChat(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Start a New Chat
                </Button>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{initials(name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold truncate">{name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {isGroup ? `${activeChat.participants?.length} members${onlineCount ? ` · ${onlineCount} online` : ''}` : onlineCount ? 'Online' : 'Offline'}
                    </p>
                  </div>
                  <Badge variant={connected ? 'secondary' : 'destructive'} className="text-xs">
                    {connected ? 'Connected' : 'Offline'}
                  </Badge>
                  <Tooltip><TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => setShowInfo(v => !v)}>
                      <Info className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger><TooltipContent>Chat info</TooltipContent></Tooltip>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 relative group chat-scroll-area">
                  {/* Interactive Background */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03] transition-opacity duration-1000 group-hover:opacity-10 dark:opacity-[0.05] dark:group-hover:opacity-20"
                       style={{ backgroundImage: 'radial-gradient(circle at center, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px', backgroundPosition: 'center center' }} />
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-pink-900/10" />
                  
                  <div className="mx-auto max-w-3xl space-y-3 p-4 relative z-10 w-full h-full min-h-full">
                    {loadingMsgs ? (
                      <div className="flex flex-col items-center gap-3 py-12">
                        <Skeleton className="h-10 w-48 rounded-xl" />
                        <Skeleton className="h-10 w-64 rounded-xl" />
                        <Skeleton className="h-10 w-40 rounded-xl" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center py-16">
                        <Card className="text-center shadow-sm border border-border/50 bg-card/80 backdrop-blur-sm">
                          <CardHeader className="items-center">
                            <Users className="h-8 w-8 text-primary mb-1 animate-bounce" />
                            <CardDescription>No messages yet. Say hello! 👋</CardDescription>
                          </CardHeader>
                        </Card>
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
                          <div className="flex justify-center py-4 my-2">
                            <div className="bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-border/50 shadow-sm">
                              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                {new Date(msg.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        )
                      }
                      const time = new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

                      return (
                        <div key={msg._id || msg.messageId || idx} className="group/msg animate-in fade-in slide-in-from-bottom-2 duration-300">
                          {sep}
                          <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                            <div className={cn('flex max-w-[85%] gap-2 relative', isOwn ? 'flex-row-reverse' : '')}>
                              {!isOwn && showAvatar ? (
                                <Avatar className="h-8 w-8 mt-auto mb-1 ring-2 ring-background shadow-sm hover:scale-105 transition-transform"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{initials(msg.sender?.username)}</AvatarFallback></Avatar>
                              ) : !isOwn ? <div className="w-8" /> : null}
                              <div className="flex flex-col">
                                {!isOwn && showAvatar && isGroup && (
                                  <p className="text-[11px] font-medium text-primary/80 mb-1 ml-1">{msg.sender?.username}</p>
                                )}
                              <div className="relative group/bubble flex gap-2 items-center">
                                {isOwn && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setMsgMenu(msgMenu === msg._id ? null : msg._id) }}
                                    className="opacity-0 group-hover/msg:opacity-100 p-1.5 hover:bg-muted rounded-full text-muted-foreground transition-all flex-shrink-0"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                )}
                                <Card 
                                  className={cn(
                                    'px-4 py-2.5 text-[15px] leading-relaxed shadow-sm transition-shadow hover:shadow-md',
                                    isOwn 
                                      ? 'bg-primary text-primary-foreground border-primary rounded-2xl rounded-br-sm' 
                                      : 'bg-card border-border/50 rounded-2xl rounded-bl-sm'
                                  )}
                                >
                                  {msg.messageText}
                                  {msgMenu === msg._id && !isOwn && (
                                    <div className="mt-2 pt-2 border-t border-border/50">
                                      <button
                                        onClick={() => { setFlagDialog({ open: true, messageId: msg._id }); setFlagReason(''); setMsgMenu(null) }}
                                        className="w-full px-2 py-1 text-xs text-left text-destructive hover:bg-destructive/10 rounded flex items-center gap-2 transition"
                                      >
                                        <Flag className="h-3.5 w-3.5" /> Flag as inappropriate
                                      </button>
                                    </div>
                                  )}
                                </Card>
                                {!isOwn && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setMsgMenu(msgMenu === msg._id ? null : msg._id) }}
                                    className="opacity-0 group-hover/msg:opacity-100 p-1.5 hover:bg-muted rounded-full text-muted-foreground transition-all flex-shrink-0"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                                <div className={cn('flex items-center gap-1.5 mt-1 px-1', isOwn ? 'justify-end' : '')}>
                                  <span className="text-[10px] font-medium text-muted-foreground/70">{time}</span>
                                  {isOwn && <MsgStatus status={msg.status} />}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {typingNames.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs animate-pulse">
                          {typingNames.join(', ')} {typingNames.length === 1 ? 'is' : 'are'} typing...
                        </Badge>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t border-border bg-card p-4">
                  <form onSubmit={e => { e.preventDefault(); handleSend() }} className="mx-auto flex max-w-3xl items-end gap-2">
                    <Textarea
                      value={draft}
                      onChange={e => { setDraft(e.target.value); emitTyping() }}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                      placeholder="Type a message..."
                      rows={1}
                      className="min-h-10 flex-1 resize-none"
                    />
                    <Button type="submit" size="icon" disabled={!draft.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>

          {/* Info panel */}
          {showInfo && !isMobile && activeChat && (
            <ChatInfoPanel chat={activeChat} onClose={() => setShowInfo(false)} />
          )}
        </div>

        <NewChatDialog open={showNewChat} onOpenChange={setShowNewChat} onCreated={onChatCreated} />
        {/* Flag Message Dialog */}
        <Dialog open={flagDialog.open} onOpenChange={(open) => !open && setFlagDialog({ open: false, messageId: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Inappropriate Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Reason for flagging..."
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                maxLength={500}
                className="min-h-24"
              />
              <p className="text-xs text-muted-foreground">{flagReason.length}/500</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFlagDialog({ open: false, messageId: null })}>Cancel</Button>
              <Button onClick={handleFlagMessage} disabled={flagging}>
                {flagging ? 'Flagging...' : 'Flag Message'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
