import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { mediaApi } from '../../services/api'
import { FileImage, FileText, Video, Download, X } from 'lucide-react'
import { resolveUrl } from '../../utils/resolveUrl'

const IMG_EXT = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i
const VID_EXT = /\.(mp4|mov|avi|mkv|webm)$/i

function getType(item) {
  const url = item.fileUrl || ''
  const name = item.fileName || ''
  if (item.messageType === 'image' || IMG_EXT.test(url) || IMG_EXT.test(name)) return 'Images'
  if (VID_EXT.test(url) || VID_EXT.test(name)) return 'Videos'
  return 'Documents'
}

function Lightbox({ src, onClose }) {
  if (!src) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <img src={src} alt="Preview" className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" />
        <button onClick={onClose} className="absolute -top-4 -right-4 h-8 w-8 flex items-center justify-center rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function MediaCard({ item, onPreview }) {
  const type = getType(item)
  const isImg = type === 'Images'
  const fileUrl = resolveUrl(item.fileUrl)
  const senderAvatar = resolveUrl(item.sender?.avatar)
  const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="group relative rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all duration-300">
      <div
        className={`aspect-video flex items-center justify-center bg-neutral-800/80 ${isImg && fileUrl ? 'cursor-pointer' : ''}`}
        onClick={() => isImg && fileUrl && onPreview(fileUrl)}
      >
        {isImg && fileUrl ? (
          <img src={fileUrl} alt={item.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => e.target.style.display = 'none'} />
        ) : type === 'Videos' ? <Video className="h-8 w-8 text-amber-400" />
          : <FileText className="h-8 w-8 text-emerald-400" />}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-medium text-white truncate">{item.fileName || 'File'}</p>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
               <div className="h-4 w-4 rounded-full bg-neutral-800 flex items-center justify-center text-[8px] text-neutral-400 overflow-hidden shrink-0 border border-neutral-700">
                  {senderAvatar ? (
                    <img src={senderAvatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    item.sender?.username?.charAt(0).toUpperCase() || '?'
                  )}
               </div>
               <p className="text-[11px] font-semibold text-neutral-300 truncate max-w-[80px]">
                 {item.sender?.username || '—'}
               </p>
            </div>
            <p className="text-[10px] text-neutral-600 ml-5">{date}</p>
          </div>
          {fileUrl && (
            <a href={fileUrl} download={item.fileName} onClick={e => e.stopPropagation()}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-800 text-neutral-400 hover:bg-violet-600 hover:text-white transition-all" title="Download">
              <Download className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
      <div className="absolute top-1.5 right-1.5">
        <span className={`text-[9px] font-medium rounded-full px-1.5 py-0.5 ${type === 'Images' ? 'bg-blue-500/20 text-blue-400' : type === 'Videos' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {type.slice(0, -1)}
        </span>
      </div>
    </div>
  )
}

/* ─── MediaView — no own filter tabs, driven by selectedFilter prop ─── */
export default function MediaView({ selectedFilter }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    let mounted = true
    mediaApi.getAll()
      .then(r => { if (mounted) setItems(r.data?.data || []) })
      .catch(() => { if (mounted) setItems([]) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  // Only show media RECEIVED by current user (not sent by them)
  const received = items.filter(item => {
    const senderId = item.sender?._id || item.sender
    return senderId !== user?.id && senderId !== user?._id
  })

  // Apply type filter from sidebar
  const activeFilter = selectedFilter || 'all'
  const filtered = activeFilter === 'all'
    ? received
    : received.filter(i => getType(i) === activeFilter)

  const isEmpty = filtered.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Header — shows active filter from sidebar */}
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-800 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-white">Media & Files</h1>
          <p className="text-xs text-neutral-500">
            {activeFilter === 'all' ? 'All received files' : `Received ${activeFilter.toLowerCase()}`}
            {!loading && ` · ${filtered.length} item${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {activeFilter !== 'all' && (
          <span className={`ml-auto px-2.5 py-1 rounded-full text-xs font-medium ${
            activeFilter === 'Images' ? 'bg-blue-500/15 text-blue-400' :
            activeFilter === 'Videos' ? 'bg-amber-500/15 text-amber-400' :
            'bg-emerald-500/15 text-emerald-400'
          }`}>
            {activeFilter}
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pt-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-700 border-t-violet-600" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <FileImage className="h-12 w-12 text-neutral-700" />
            <p className="text-sm font-medium text-white">
              No {activeFilter === 'all' ? 'received media' : activeFilter.toLowerCase()} yet
            </p>
            <p className="text-xs text-neutral-500">Files shared with you will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 xl:grid-cols-4">
            {filtered.map(item => <MediaCard key={item._id} item={item} onPreview={setLightbox} />)}
          </div>
        )}
      </div>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  )
}
