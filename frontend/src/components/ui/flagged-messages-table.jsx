import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Filter, Search, AlertTriangle, Shield, ShieldOff, Trash2, UserX, Flag, Ban } from 'lucide-react';
import { useMemo, useState, useEffect, useCallback } from 'react';

const REASON_COLOR = {
  'Cyberbullying': 'bg-red-500/15 text-red-400 border-red-500/30',
  'Harassment': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'Hate Speech': 'bg-red-400/15 text-red-300 border-red-400/30',
  'Spam': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  'Threats': 'bg-red-600/15 text-red-500 border-red-600/30',
  'Other': 'bg-neutral-600/30 text-neutral-400 border-neutral-600/30',
  'harassment': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'hate_speech': 'bg-red-400/15 text-red-300 border-red-400/30',
  'spam': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  'violence': 'bg-red-600/15 text-red-500 border-red-600/30',
  'other': 'bg-neutral-600/30 text-neutral-400 border-neutral-600/30',
};

function FlagRow({ flag, expanded, onToggle, onAction, isActing }) {
  const ts = flag.timestamp
    ? new Date(flag.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '—';
  const dateStr = flag.timestamp
    ? new Date(flag.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';
  const reasonClass = REASON_COLOR[flag.reason] || REASON_COLOR['other'];

  return (
    <>
      <motion.button
        onClick={onToggle}
        className="w-full p-4 text-left transition-colors hover:bg-neutral-800/40"
        layout
      >
        <div className="flex items-center gap-3 min-w-0">
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
            <ChevronDown className="h-3.5 w-3.5 text-neutral-600" />
          </motion.div>

          {/* Reason badge */}
          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${reasonClass}`}>
            {flag.reason || 'other'}
          </span>

          {/* Time */}
          <span className="shrink-0 text-[11px] text-neutral-600 font-mono">{dateStr} {ts}</span>

          {/* Sender */}
          <div className="shrink-0 flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-300">
              {flag.sender?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="text-[13px] font-medium text-white">{flag.sender?.username || 'Unknown'}</span>
          </div>

          {/* Message preview */}
          <p className="flex-1 truncate text-[13px] text-neutral-500 italic min-w-0">
            &ldquo;{flag.content || '—'}&rdquo;
          </p>

          {/* Reported by */}
          <span className="shrink-0 text-[11px] text-neutral-600">
            by <span className="text-neutral-400">{flag.flaggedBy?.username || '?'}</span>
          </span>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-[#27272a] bg-neutral-900/60"
          >
            <div className="p-4 space-y-4">
              {/* Message content */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Message Content</p>
                <p className="bg-neutral-800/70 border border-neutral-700/50 rounded-xl px-3 py-2.5 text-sm text-neutral-300 leading-relaxed font-mono">
                  &ldquo;{flag.content || '—'}&rdquo;
                </p>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">Reported User</p>
                  <p className="text-white font-medium">{flag.sender?.username || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">Reported By</p>
                  <p className="text-neutral-300">{flag.flaggedBy?.username || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">Timestamp</p>
                  <p className="text-neutral-400 font-mono text-xs">{flag.timestamp ? new Date(flag.timestamp).toLocaleString() : '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">Category</p>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${reasonClass}`}>{flag.reason || 'other'}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  onClick={() => onAction(flag, 'dismiss')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition border border-neutral-700"
                >
                  <Check className="w-3 h-3" /> Dismiss
                </button>
                <button
                  onClick={() => onAction(flag, 'warn')}
                  disabled={!flag.sender?._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition disabled:opacity-40"
                >
                  <AlertTriangle className="w-3 h-3" /> Warn User
                </button>
                <button
                  onClick={() => onAction(flag, 'remove')}
                  disabled={!flag.messageId}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition disabled:opacity-40"
                >
                  <Trash2 className="w-3 h-3" /> Remove Msg
                </button>
                <button
                  onClick={() => onAction(flag, 'ban')}
                  disabled={!flag.sender?._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition disabled:opacity-40"
                >
                  <Ban className="w-3 h-3" /> Ban User
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterPanel({ filters, onChange, flags }) {
  const reasons = [...new Set(flags.map(f => f.reason).filter(Boolean))];
  const senders = [...new Set(flags.map(f => f.sender?.username).filter(Boolean))];

  const toggle = (cat, val) => {
    const curr = filters[cat];
    onChange({ ...filters, [cat]: curr.includes(val) ? curr.filter(v => v !== val) : [...curr, val] });
  };

  const hasActive = Object.values(filters).some(g => g.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full overflow-y-auto bg-transparent p-4 space-y-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">Filters</p>
        {hasActive && (
          <button onClick={() => onChange({ reason: [], sender: [] })} className="text-[11px] text-neutral-500 hover:text-white transition">
            Clear all
          </button>
        )}
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">Category</p>
        {reasons.map(r => {
          const sel = filters.reason.includes(r);
          return (
            <motion.button key={r} whileHover={{ x: 2 }} onClick={() => toggle('reason', r)}
              className={`flex w-full items-center justify-between gap-2 border rounded-lg px-3 py-2 text-xs transition-colors ${sel ? 'border-neutral-500 bg-neutral-800 text-white' : 'border-neutral-800 text-neutral-500 hover:border-neutral-700 hover:bg-neutral-800/40'}`}
            >
              <span className="capitalize">{r}</span>
              {sel && <Check className="h-3 w-3" />}
            </motion.button>
          );
        })}
      </div>

      {/* Sender */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">Reported User</p>
        {senders.map(s => {
          const sel = filters.sender.includes(s);
          return (
            <motion.button key={s} whileHover={{ x: 2 }} onClick={() => toggle('sender', s)}
              className={`flex w-full items-center justify-between gap-2 border rounded-lg px-3 py-2 text-xs transition-colors ${sel ? 'border-neutral-500 bg-neutral-800 text-white' : 'border-neutral-800 text-neutral-500 hover:border-neutral-700 hover:bg-neutral-800/40'}`}
            >
              {s}
              {sel && <Check className="h-3 w-3" />}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

export function FlaggedMessagesTable() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ reason: [], sender: [] });

  const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('chat_token')}`, 'Content-Type': 'application/json' });

  const fetchFlags = useCallback(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/admin/flagged-messages', { headers: auth() })
      .then(async r => {
        if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.message || `HTTP ${r.status}`); }
        return r.json();
      })
      .then(d => { setFlags(d.data || []); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchFlags(); }, [fetchFlags]);

  async function handleAction(flag, action) {
    const id = flag._id;
    if (action === 'ban' && !window.confirm(`Ban ${flag.sender?.username}?`)) return;

    // Optimistically remove from list immediately for snappy UX
    setFlags(prev => prev.filter(f => f._id !== id));
    setExpandedId(null);

    try {
      const endpoints = {
        dismiss: [`http://localhost:5000/api/admin/messages/${id}/approve`, 'POST', { action: 'dismiss' }],
        warn:    [`http://localhost:5000/api/admin/users/${flag.sender?._id}/warn`, 'POST', { reason: flag.reason, messageId: flag.messageId }],
        remove:  [`http://localhost:5000/api/admin/messages/${flag.messageId}/remove`, 'DELETE', null],
        ban:     [`http://localhost:5000/api/admin/users/${flag.sender?._id}/ban`, 'POST', { reason: flag.reason }],
      };
      const [url, method, body] = endpoints[action];
      const res = await fetch(url, { method, headers: auth(), body: body ? JSON.stringify(body) : undefined });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.message || `HTTP ${res.status}`); }

      const data = await res.json();

      // Check if warn triggered auto-ban
      if (action === 'warn' && data.autoBanned) {
        alert(`[BAN] ${flag.sender?.username} was automatically banned after reaching ${data.warningCount} warnings.`);
      } else if (action === 'warn') {
        const remaining = 4 - data.warningCount;
        alert(`Warning ${data.warningCount}/4 issued to ${flag.sender?.username}. ${remaining > 0 ? `${remaining} more warning(s) will result in a ban.` : ''}`);
      }

      // Refresh to stay in sync
      fetchFlags();
    } catch (e) {
      alert('Action failed: ' + e.message);
      // Restore flags on failure
      fetchFlags();
    }
  }

  const filtered = useMemo(() => flags.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || (f.content || '').toLowerCase().includes(q) || (f.sender?.username || '').toLowerCase().includes(q);
    const matchReason = filters.reason.length === 0 || filters.reason.includes(f.reason);
    const matchSender = filters.sender.length === 0 || filters.sender.includes(f.sender?.username);
    return matchSearch && matchReason && matchSender;
  }), [flags, search, filters]);

  const activeFilterCount = filters.reason.length + filters.sender.length;

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-700 border-t-[#e6e6e6]" />
    </div>
  );
  if (error) return (
    <div className="rounded-2xl bg-neutral-900 border border-[#27272a] p-8 text-center">
      <Shield className="h-8 w-8 text-neutral-600 mx-auto mb-2" />
      <p className="text-sm text-neutral-400 font-medium">Cannot load flagged messages</p>
      <p className="text-xs text-red-400 mt-1">{error}</p>
      <button onClick={fetchFlags} className="mt-3 text-xs text-neutral-500 hover:text-white transition underline">Retry</button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#18181b] rounded-2xl overflow-hidden border border-[#27272a]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#27272a] space-y-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Flag className="h-4 w-4 text-red-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">Flagged Messages</h2>
            <p className="text-[11px] text-neutral-500">{filtered.length} of {flags.length} reports</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${flags.length > 0 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-neutral-800 border-neutral-700 text-neutral-500'}`}>
              {flags.length} pending
            </span>
            <button onClick={fetchFlags} title="Refresh" className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
        </div>

        {/* Search + filter toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by message or username..."
              className="w-full pl-8 pr-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition"
            />
          </div>
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${showFilters ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600'}`}
          >
            <Filter className="h-3.5 w-3.5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Filter panel */}
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              key="filter-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-r border-[#27272a] shrink-0"
            >
              <FilterPanel filters={filters} onChange={setFilters} flags={flags} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#27272a]">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center">
                <Flag className="h-8 w-8 text-neutral-800 mx-auto mb-3" />
                <p className="text-sm text-neutral-600">{flags.length === 0 ? 'All clear — nothing to review' : 'No reports match your search'}</p>
              </motion.div>
            ) : filtered.map((flag, i) => (
              <motion.div
                key={flag._id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, delay: i * 0.02 }}
              >
                <FlagRow
                  flag={flag}
                  expanded={expandedId === flag._id}
                  onToggle={() => setExpandedId(curr => curr === flag._id ? null : flag._id)}
                  onAction={handleAction}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default FlaggedMessagesTable;
