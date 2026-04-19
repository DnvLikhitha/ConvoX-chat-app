import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { useSocket } from '../../contexts/SocketContext'
import { chatApi, authApi } from '../../services/api'
import { toast } from 'react-toastify'
import { Plus, Search, X, Send, Users, Hash, Check, CheckCheck, MoreVertical, Paperclip, Flag as FlagIcon, AlertTriangle, ShieldOff, Smile } from 'lucide-react'
import { resolveUrl } from '../../utils/resolveUrl'
import graphThemeBg from '../../assets/graph theme.jpg'
import halloweenThemeBg from '../../assets/halloween theme.jpg'
import loveThemeBg from '../../assets/love theme.jpg'
import rainThemeBg from '../../assets/rain theme.jpg'

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
              className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#e6e6e6] transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Add Members *</label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                className="w-full rounded-xl bg-neutral-800 border border-neutral-700 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#e6e6e6] transition-colors" />
            </div>
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selected.map(u => (
                  <span key={u._id} onClick={() => toggle(u)} className="flex items-center gap-1 bg-[#e6e6e6]/10 text-[#e6e6e6] text-xs rounded-full px-3 py-1 cursor-pointer">
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
                        className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${sel ? 'bg-[#e6e6e6]/10' : 'hover:bg-neutral-700'}`}>
                        <div className="h-7 w-7 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-medium text-neutral-300 overflow-hidden">
                          {u.avatar ? (
                            <img src={resolveUrl(u.avatar)} alt={u.username} className="w-full h-full object-cover" />
                          ) : (
                            initials(u.username)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{u.username}</p>
                          <p className="text-xs text-neutral-500 truncate">{u.email}</p>
                        </div>
                        {sel && <Check className="h-4 w-4 text-[#e6e6e6] shrink-0" />}
                      </button>
                    )
                  })}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-neutral-800 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700 transition-colors">Cancel</button>
            <button type="submit" disabled={!groupName.trim() || !selected.length || creating}
              className="flex-1 rounded-xl bg-[#e6e6e6] py-2.5 text-sm text-black font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
    function onThemeUpdate({ chatId: updatedChatId, theme }) {
      if (updatedChatId === chatId) setChatBackground(theme || null);
    }
    function onTyping({ user: who, room }) {
      if (room !== chatId) return
      setTypingUsers(p => p.includes(who) ? p : [...p, who])
      clearTimeout(typingTimeouts.current[who])
      typingTimeouts.current[who] = setTimeout(() => setTypingUsers(p => p.filter(u => u !== who)), 3000)
    }
    function onReaction({ messageId, chatId: updatedChatId, reactions }) {
      if (updatedChatId !== chatId) return;
      setMessages(p => p.map(m => (m._id === messageId || m.id === messageId) ? { ...m, reactions } : m));
    }
    socket.on('new_message', onMsg)
    socket.on('theme_update', onThemeUpdate)
    socket.on('user_typing', onTyping)
    socket.on('message_reaction', onReaction)
    return () => { socket.off('new_message', onMsg); socket.off('theme_update', onThemeUpdate); socket.off('user_typing', onTyping); socket.off('message_reaction', onReaction) }
  }, [socket, connected, chatId])

  const handleReact = useCallback(async (messageId, emoji) => {
    if (!messageId || messageId.toString().startsWith('optimistic')) return;
    try {
      const token = localStorage.getItem("chat_token");
      const res = await fetch(`http://localhost:5000/api/chats/messages/${messageId}/react`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ emoji })
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Backend reaction error:", errorData);
      }
    } catch (err) { console.error("Error reacting:", err); }
  }, []);

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

  const [chatBackground, setChatBackground] = useState(null);

  useEffect(() => {
    if (chat && chat.theme !== undefined) {
      setChatBackground(chat.theme || null);
    } else if (chat) {
       // fallback if no theme provided
       setChatBackground(null);
    }
  }, [chat]);
  const [showMenu, setShowMenu] = useState(false);
  const themeInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [flagDialog, setFlagDialog] = useState({ open: false, messageId: null });
  const [flagReason, setFlagReason] = useState('');
  const [flagging, setFlagging] = useState(false);

  const REASON_MAP = {
    'Cyberbullying': 'harassment',
    'Harassment': 'harassment',
    'Hate Speech': 'hate_speech',
    'Spam': 'spam',
    'Threats': 'violence',
    'Other': 'other',
  };

  const handleFlagMessage = async () => {
    if (!flagDialog.messageId || !flagReason.trim()) return;
    setFlagging(true);
    try {
      const token = localStorage.getItem('chat_token');
      const enumReason = REASON_MAP[flagReason] || 'other';
      const res = await fetch(`http://localhost:5000/api/chats/messages/${flagDialog.messageId}/flag`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: enumReason, description: flagReason }),
      });
      if (res.ok) {
        setFlagDialog({ open: false, messageId: null });
        setFlagReason('');
        toast.success('✅ Message reported. Admins will review it.');
      } else {
        const err = await res.json();
        toast.error('Failed to report: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      toast.error('Failed to report message');
    } finally {
      setFlagging(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !chatId) return;
    try {
      const token = localStorage.getItem("chat_token");
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`http://localhost:5000/api/chats/${chatId}/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        const serverMsg = { ...data.data, status: data.data?.status || 'sent' };
        setMessages(prev => prev.some(m => m._id === serverMsg._id || m.messageId === serverMsg.messageId) ? prev : [...prev, serverMsg]);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to upload file');
      }
    } catch (err) {
      toast.error('Failed to upload file');
    }
  };

  const handleThemeChange = async (theme) => {
    try {
      const token = localStorage.getItem("chat_token");
      await fetch(`http://localhost:5000/api/chats/${chatId}/theme`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ theme })
      });
      setChatBackground(theme);
    } catch (err) {
      toast.error('Failed to update theme');
    }
    setShowMenu(false);
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-700 border-t-[#e6e6e6]" />
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] bg-transparent shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 relative flex-shrink-0 cursor-context-menu outline-none">
             <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center bg-neutral-800 text-[#e6e6e6] font-bold text-lg ring-2 ring-transparent hover:ring-neutral-700 transition-all">
               {chat?.avatar ? (
                  <img src={resolveUrl(chat.avatar)} alt={name} className="w-full h-full object-cover" />
               ) : initials(name)}
             </div>
          </div>
          <div>
            <div className="font-['Lexend:Bold',_sans-serif] text-[16px] text-[#e6e6e6] mb-0.5">{name}</div>
            <div className="font-['Lexend:Regular',_sans-serif] text-[13px] text-neutral-400 capitalize">{memberCount} members</div>
          </div>
        </div>
        
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition">
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden z-20">
              <div className="px-4 py-2 border-b border-neutral-800">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Chat Theme</span>
              </div>
              <button 
                onClick={() => handleThemeChange(null)} 
                className="w-full text-left px-4 py-2.5 text-[13px] text-white hover:bg-neutral-800 transition flex items-center justify-between"
              >
                Default Theme
                {!chatBackground && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
              <button 
                onClick={() => handleThemeChange("theme-rain")} 
                className="w-full text-left px-4 py-2.5 text-[13px] text-white hover:bg-neutral-800 transition flex items-center justify-between"
              >
                Rain Theme
                {chatBackground === "theme-rain" && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
              <button 
                onClick={() => handleThemeChange("theme-love")} 
                className="w-full text-left px-4 py-2.5 text-[13px] text-white hover:bg-neutral-800 transition flex items-center justify-between"
              >
                Love Theme
                {chatBackground === "theme-love" && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
              <button 
                onClick={() => handleThemeChange("theme-halloween")} 
                className="w-full text-left px-4 py-2.5 text-[13px] text-white hover:bg-neutral-800 transition flex items-center justify-between"
              >
                Halloween Theme
                {chatBackground === "theme-halloween" && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
              <button 
                onClick={() => handleThemeChange("theme-graph")} 
                className="w-full text-left px-4 py-2.5 text-[13px] text-white hover:bg-neutral-800 transition flex items-center justify-between"
              >
                Graph Theme
                {chatBackground === "theme-graph" && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-transparent">
        {chatBackground === 'theme-rain' && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-30" style={{ backgroundImage: `url("${rainThemeBg}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}
        {chatBackground === 'theme-love' && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-30" style={{ backgroundImage: `url("${loveThemeBg}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}
        {chatBackground === 'theme-halloween' && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40" style={{ backgroundImage: `url("${halloweenThemeBg}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}
        {chatBackground === 'theme-graph' && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40" style={{ backgroundImage: `url("${graphThemeBg}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}

        <div className="absolute inset-0 overflow-y-auto px-6 py-6 z-10 group chat-scroll-area">
          <div className="relative z-10 w-full space-y-6 flex flex-col min-h-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center h-full justify-center gap-3 py-12">
            <Hash className="h-9 w-9 text-neutral-700" />
            <p className="text-sm text-neutral-500">No messages yet — say hello!</p>
          </div>
        ) : messages.map((msg, idx) => {
          const isOwn = msg.sender?._id === user?.id || msg.sender?.username === user?.username;
          const isLast = idx === messages.length - 1 || messages[idx+1].sender?._id !== msg.sender?._id;
          const showAvatar = !isOwn && (!messages[idx-1] || messages[idx-1].sender?._id !== msg.sender?._id);
          const isImage = msg.messageType === 'file' && msg.fileUrl && (msg.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i));

          // Date formatting
          let showDateBadge = false;
          let dateLabel = '';
          
          if (msg.createdAt) {
             const msgDate = new Date(msg.createdAt);
             const today = new Date();
             const yesterday = new Date(today);
             yesterday.setDate(yesterday.getDate() - 1);
             
             if (msgDate.toDateString() === today.toDateString()) dateLabel = 'Today';
             else if (msgDate.toDateString() === yesterday.toDateString()) dateLabel = 'Yesterday';
             else dateLabel = msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: msgDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
             
             if (idx === 0) {
               showDateBadge = true;
             } else {
               const prevDate = new Date(messages[idx-1].createdAt);
               if (msgDate.toDateString() !== prevDate.toDateString()) {
                 showDateBadge = true;
               }
             }
          }

          if (msg.messageType === 'system') {
            return (
              <div key={msg._id || idx} className="w-full flex justify-center my-4 group">
                <span className="px-4 py-2 bg-neutral-800/80 border border-neutral-700/50 text-neutral-400 text-xs rounded-full shadow-sm backdrop-blur-md">
                  <span className="font-semibold text-neutral-300">{msg.sender?.username}</span> {msg.messageText}
                </span>
              </div>
            );
          }

          return (
            <div key={msg._id || idx} className="w-full group">
              {showDateBadge && (
                 <div className="flex justify-center my-6">
                    <span className="px-3 py-1 bg-[#18181b]/90 border border-[#27272a] text-neutral-400 text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-sm backdrop-blur-md">
                       {dateLabel}
                    </span>
                 </div>
              )}
              <div className={`flex w-full ${isOwn ? "justify-end" : "justify-start"} ${!showDateBadge && !showAvatar ? 'mt-1' : 'mt-4'}`}>
                <div className={`flex flex-col relative max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  
                  {showAvatar && (
                    <span className="text-[11px] font-semibold text-neutral-400 mb-1 ml-1">{msg.sender?.username}</span>
                  )}
                  
                  {msg.deletedByAdmin ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/40">
                      <ShieldOff className="w-4 h-4 text-neutral-500 shrink-0" />
                      <span className="text-xs text-neutral-500 italic">This message was removed by an admin</span>
                    </div>
                  ) : isImage ? (
                    <div className={`rounded-xl overflow-hidden border ${isOwn ? 'border-neutral-700' : 'border-[#27272a]'}`}>
                      <a href={`http://localhost:5000${msg.fileUrl}`} target="_blank" rel="noreferrer">
                         <img src={`http://localhost:5000${msg.fileUrl}`} alt={msg.fileName} className="max-w-xs object-cover" />
                      </a>
                    </div>
                  ) : (
                    <div className={`px-4 py-2.5 shadow-sm leading-relaxed text-[15px] ${
                      isOwn 
                        ? "bg-[#e6e6e6] text-black" 
                        : "bg-[#27272a] text-[#e6e6e6]"
                    } ${
                      isOwn 
                        ? `rounded-l-2xl rounded-tr-2xl ${isLast ? 'rounded-br-sm' : 'rounded-br-xl'}` 
                        : `rounded-r-2xl rounded-tl-2xl ${isLast ? 'rounded-bl-sm' : 'rounded-bl-xl'}`
                    }`}
                      onDoubleClick={() => handleReact(msg._id || msg.id, '❤️')}
                    >
                      {msg.messageType === 'file' ? (
                        <a 
                          href={`http://localhost:5000${msg.fileUrl}`} 
                          download={msg.fileName}
                          className={`flex items-center gap-3 font-medium hover:underline ${isOwn ? 'text-black/80' : 'text-blue-400'}`}
                        >
                          <div className={`p-2 rounded-lg ${isOwn ? 'bg-black/10' : 'bg-[#e6e6e6]/10'}`}>
                             <Paperclip className="w-4 h-4" />
                          </div>
                          <span className="truncate max-w-[200px]">{msg.fileName || 'Download file'}</span>
                        </a>
                      ) : (
                        <p className="whitespace-pre-wrap break-words">{msg.messageText}</p>
                      )}
                    </div>
                  )}
                  
                  {isLast && (
                    <div className={`flex items-center gap-1 mt-1 text-[10px] text-neutral-500 font-medium px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                       <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       {isOwn && (
                          msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-blue-500" /> :
                          msg.status === 'delivered' ? <CheckCheck className="w-3 h-3" /> :
                          <Check className="w-3 h-3" />
                       )}
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className={`absolute top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? '-left-16' : '-right-16'}`}>
                     {!isOwn && (
                       <button onClick={() => setFlagDialog({ open: true, messageId: msg._id || msg.id })} className="p-1 text-neutral-600 hover:text-red-500 transition-colors" title="Report message">
                         <FlagIcon className="w-4 h-4" />
                       </button>
                     )}
                     <div className="relative group/react flex items-center">
                        <button className="p-1 text-neutral-600 hover:text-yellow-500 transition-colors cursor-pointer" title="React"><Smile className="w-4 h-4" /></button>
                        <div className={`absolute top-1/2 -translate-y-1/2 ${isOwn ? 'right-6' : 'left-6'} hidden group-hover/react:flex bg-[#18181b] border border-[#27272a] rounded-full px-2 py-1 items-center gap-1 z-20 shadow-xl`}>
                          {['❤️', '😂', '😮', '😢', '🔥', '👍'].map(emoji => (
                             <button 
                               key={emoji} 
                               onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReact(msg._id || msg.id, emoji); }} 
                               className="hover:scale-125 transition-transform px-1 text-lg z-30 cursor-pointer"
                             >
                               {emoji}
                             </button>
                          ))}
                        </div>
                     </div>
                  </div>

                  {/* Reactions display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {Object.entries(msg.reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc; }, {})).map(([emoji, count]) => (
                         <div key={emoji} onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReact(msg._id || msg.id, emoji); }} className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] bg-[#18181b]/90 border border-[#27272a] text-neutral-300 cursor-pointer hover:bg-[#27272a] transition relative z-20`}>
                           <span>{emoji}</span>
                           {count > 1 && <span className="font-semibold text-[10px]">{count}</span>}
                         </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            </div>
          );
        })}
        {typingNames.length > 0 && <p className="text-xs text-neutral-500 animate-pulse">{typingNames.join(', ')} typing...</p>}
        <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* Flag / Report Dialog */}
      {flagDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setFlagDialog({ open: false, messageId: null })}>
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-[#e6e6e6] font-semibold text-sm">Report Message</h3>
                <p className="text-neutral-500 text-xs">Admins will review this report</p>
              </div>
              <button onClick={() => setFlagDialog({ open: false, messageId: null })} className="ml-auto text-neutral-500 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 mb-4">
              {['Cyberbullying', 'Harassment', 'Hate Speech', 'Spam', 'Threats', 'Other'].map(r => (
                <button
                  key={r}
                  onClick={() => setFlagReason(r)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all border ${
                    flagReason === r
                      ? 'bg-red-500/10 border-red-500/40 text-red-300'
                      : 'bg-neutral-800/50 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFlagDialog({ open: false, messageId: null })}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-sm hover:bg-neutral-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleFlagMessage}
                disabled={!flagReason || flagging}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {flagging ? 'Reporting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-transparent shrink-0 border-t border-[#27272a]">
        <form onSubmit={e => { e.preventDefault(); handleSend() }} className="flex items-end gap-2 bg-[#18181b] border border-[#27272a] rounded-2xl p-2 focus-within:border-neutral-500 focus-within:shadow-sm focus-within:shadow-black transition-all">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="*/*"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-neutral-400 hover:text-[#e6e6e6] hover:bg-[#27272a] rounded-xl transition-colors shrink-0 mb-0.5"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <textarea value={draft}
            onChange={e => { setDraft(e.target.value); if (socket) socket.emit('typing', { room: chatId, user: user?.username }) }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder={`Message ${name}...`} rows={1}
            className="flex-1 bg-transparent border-none focus:outline-none text-[#e6e6e6] placeholder-neutral-500 block w-full resize-none py-2.5 min-h-[44px] max-h-[120px] ml-2" />
          <button type="submit" disabled={!draft.trim()}
            className="p-2.5 text-neutral-400 hover:text-[#e6e6e6] hover:bg-[#27272a] rounded-xl transition-colors shrink-0 mb-0.5 disabled:opacity-40 disabled:cursor-not-allowed">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

/* ─── Main GroupsView — no left panel, driven by selectedPage prop ─── */
export default function GroupsView({ selectedPage, onGroupCreated: notifyParent }) {
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
    // Notify parent so sidebar can refresh
    notifyParent?.(g)
  }

  const hasGroup = selectedPage && selectedPage !== 'create' && selectedPage !== 'filter'

  return (
    <div className="flex flex-col h-full">
      {hasGroup ? (
        <GroupChatPanel chatId={selectedPage} user={user} socket={socket} connected={connected} />
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-neutral-800/50 border border-neutral-800">
            <Users className="h-7 w-7 text-neutral-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white">Select a group</p>
            <p className="text-xs text-neutral-500 mt-1">Click a group in the sidebar, or create a new one</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#e6e6e6] px-4 py-2 text-sm text-black font-medium hover:bg-white transition-colors"
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
