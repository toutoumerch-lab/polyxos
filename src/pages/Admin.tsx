import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Search, RefreshCw, Mail, Globe, Clock, CheckCircle2,
  MessageSquare, Tag, Trash2, ChevronDown, BarChart3, Eye, Upload,
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import { useSiteLogo, setSiteLogo } from '../hooks/useSiteLogo';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Contact {
  id: number;
  name: string;
  email: string;
  service: string | null;
  message: string;
  status: string;
  created_at: string;
}

interface AuditRequest {
  id: number;
  name: string;
  email: string;
  website_url: string;
  status: string;
  notes: string | null;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  new:         '#3B82F6',
  read:        '#8B5CF6',
  replied:     '#10B981',
  archived:    '#6B7280',
  pending:     '#F59E0B',
  in_progress: '#06B6D4',
  completed:   '#10B981',
};

function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status] || '#6B7280';
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {status.replace('_', ' ')}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Stats Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="glass rounded-2xl p-6 border border-app-border/5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-fg-muted text-sm">{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="font-display text-3xl font-bold text-fg">{value}</p>
    </div>
  );
}

// ─── Site Logo Uploader ───────────────────────────────────────────────────────
function LogoUploader() {
  const { logo } = useSiteLogo();
  const inputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMsg({ type: 'err', text: 'Please choose an image file (PNG, SVG, JPG…).' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMsg({ type: 'err', text: 'Image must be under 2MB.' });
      return;
    }

    setSaving(true);
    setMsg(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Could not read the file.'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/settings/logo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed.');

      setSiteLogo(dataUrl);
      setMsg({ type: 'ok', text: 'Logo updated — it now appears across the site.' });
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Upload failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/settings/logo', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error('Failed to remove logo.');
      setSiteLogo(null);
      setMsg({ type: 'ok', text: 'Reverted to the default logo.' });
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Failed to remove logo.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 border border-app-border/5 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex items-center gap-4">
          {/* Current logo preview */}
          <div className="w-16 h-16 rounded-xl bg-surface/5 border border-app-border/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {logo
              ? <img src={logo} alt="Current logo" className="max-h-full max-w-full object-contain p-1" />
              : <Logo showWordmark={false} badgeClassName="w-10 h-10" />}
          </div>
          <div>
            <h3 className="font-display font-bold text-fg">Site Logo</h3>
            <p className="text-fg-subtle text-xs mt-1 max-w-xs leading-relaxed">
              Shown in the navbar, footer and here. PNG, SVG or JPG, up to 2MB.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:ml-auto">
          <input ref={inputRef} type="file" accept="image/*" aria-label="Upload site logo" className="hidden" onChange={handleFile} />
          <button
            type="button"
            disabled={saving}
            onClick={() => inputRef.current?.click()}
            className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 disabled:opacity-60"
          >
            <Upload size={15} />
            {saving ? 'Saving…' : logo ? 'Replace' : 'Upload'}
          </button>
          {logo && (
            <button
              type="button"
              disabled={saving}
              onClick={handleRemove}
              className="px-4 py-2.5 rounded-xl text-sm text-fg-muted hover:text-fg border border-app-border/10 hover:border-app-border/20 transition-all disabled:opacity-60"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      {msg && (
        <p className={`mt-4 text-xs ${msg.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function Admin() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'audits'>('contacts');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [audits, setAudits] = useState<AuditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cRes, aRes] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/audits'),
      ]);

      if (!cRes.ok || !aRes.ok) throw new Error('Failed to fetch data from server.');

      const cData = await cRes.json();
      const aData = await aRes.json();

      setContacts(cData.data || []);
      setAudits(aData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateContactStatus = async (id: number, status: string) => {
    await fetch(`/api/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  };

  const updateAuditStatus = async (id: number, status: string) => {
    await fetch(`/api/audits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setAudits((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  };

  const deleteContact = async (id: number) => {
    if (!confirm('Delete this contact?')) return;
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const filteredContacts = contacts.filter((c) =>
    `${c.name} ${c.email} ${c.service || ''} ${c.message}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAudits = audits.filter((a) =>
    `${a.name} ${a.email} ${a.website_url}`.toLowerCase().includes(search.toLowerCase())
  );

  const newContacts  = contacts.filter((c) => c.status === 'new').length;
  const pendingAudits = audits.filter((a) => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-base text-fg">
      {/* Header */}
      <div className="border-b border-app-border/5 bg-base/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <a href="/" aria-label="Polyxos — back to site">
              <Logo badgeClassName="w-8 h-8" wordmarkClassName="text-lg" />
            </a>
            <span className="text-fg-subtle mx-2 hidden sm:inline">/</span>
            <span className="text-fg-muted text-sm hidden sm:inline">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-xs text-fg-subtle hover:text-fg transition-colors">← Back to site</a>
            <ThemeToggle />
            <button
              type="button"
              onClick={fetchData}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-app-border/5 text-sm text-fg-muted hover:text-fg transition-all"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Contacts"  value={contacts.length}  icon={MessageSquare} color="#3B82F6" />
          <StatCard label="New Leads"       value={newContacts}       icon={Users}         color="#8B5CF6" />
          <StatCard label="Audit Requests"  value={audits.length}    icon={BarChart3}     color="#06B6D4" />
          <StatCard label="Pending Audits"  value={pendingAudits}    icon={Clock}         color="#F59E0B" />
        </div>

        {/* Site logo uploader */}
        <LogoUploader />

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-1 p-1 glass rounded-xl border border-app-border/5">
            {(['contacts', 'audits'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                {tab === 'contacts' ? `Contacts (${contacts.length})` : `Audits (${audits.length})`}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-4 py-2.5 text-sm text-fg placeholder:text-fg-subtle rounded-xl outline-none w-full sm:w-64 transition-all focus:ring-2 focus:ring-blue-500/30"
              style={{ background: 'rgb(var(--c-surface) / 0.04)', border: '1px solid rgb(var(--c-border) / 0.08)' }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error} — Make sure the Express server is running: <code className="font-mono text-xs">npm run dev:server</code>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-fg-subtle">
            <RefreshCw size={20} className="animate-spin mr-3" /> Loading data...
          </div>
        ) : (
          <>
            {/* ─── Contacts Table ─────────────────────────────────────── */}
            {activeTab === 'contacts' && (
              <div className="glass rounded-2xl border border-app-border/5 overflow-hidden overflow-x-auto">
                {filteredContacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-fg-subtle">
                    <MessageSquare size={32} className="mb-3 opacity-40" />
                    <p>{search ? 'No results found.' : 'No contact submissions yet.'}</p>
                  </div>
                ) : (
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-app-border/5 text-left">
                        <th className="px-5 py-3.5 text-xs font-semibold text-fg-subtle uppercase tracking-wider">Contact</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-fg-subtle uppercase tracking-wider hidden md:table-cell">Service</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-fg-subtle uppercase tracking-wider hidden lg:table-cell">Date</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-fg-subtle uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-fg-subtle uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border/5">
                      {filteredContacts.map((contact) => (
                        <>
                          <tr
                            key={contact.id}
                            className="hover:bg-surface/[0.04] transition-colors cursor-pointer"
                            onClick={() => setExpandedId(expandedId === contact.id ? null : contact.id)}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                  {contact.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-fg text-sm font-medium">{contact.name}</p>
                                  <p className="text-fg-subtle text-xs">{contact.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 hidden md:table-cell">
                              <span className="text-fg-muted text-sm">{contact.service || '—'}</span>
                            </td>
                            <td className="px-5 py-4 hidden lg:table-cell">
                              <span className="text-fg-subtle text-xs">{formatDate(contact.created_at)}</span>
                            </td>
                            <td className="px-5 py-4">
                              <StatusBadge status={contact.status} />
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                {/* Status dropdown */}
                                <div className="relative group">
                                  <button type="button" className="p-1.5 rounded-lg hover:bg-surface/5 text-fg-subtle hover:text-fg transition-all flex items-center gap-1 text-xs">
                                    <Tag size={13} />
                                    <ChevronDown size={10} />
                                  </button>
                                  <div className="absolute right-0 top-full mt-1 w-36 glass-strong rounded-xl border border-app-border/10 shadow-xl z-10 hidden group-hover:block">
                                    {['new', 'read', 'replied', 'archived'].map((s) => (
                                      <button
                                        key={s}
                                        type="button"
                                        onClick={() => updateContactStatus(contact.id, s)}
                                        className="w-full text-left px-3 py-2 text-xs text-fg-muted hover:text-fg hover:bg-surface/5 capitalize transition-colors first:rounded-t-xl last:rounded-b-xl"
                                      >
                                        {s}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="p-1.5 rounded-lg hover:bg-blue-500/10 text-fg-subtle hover:text-blue-400 transition-all"
                                  title="Reply by email"
                                >
                                  <Mail size={13} />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setExpandedId(expandedId === contact.id ? null : contact.id)}
                                  className="p-1.5 rounded-lg hover:bg-surface/5 text-fg-subtle hover:text-fg transition-all"
                                  title="View message"
                                >
                                  <Eye size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteContact(contact.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-fg-subtle hover:text-red-400 transition-all"
                                  title="Delete"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded message row */}
                          {expandedId === contact.id && (
                            <tr key={`${contact.id}-expanded`} className="bg-surface/[0.03]">
                              <td colSpan={5} className="px-5 pb-4 pt-1">
                                <div className="pl-11">
                                  <p className="text-xs font-semibold text-fg-subtle uppercase tracking-wider mb-2">Message</p>
                                  <p className="text-fg-muted text-sm leading-relaxed bg-surface/[0.03] rounded-xl p-4 border border-app-border/5">
                                    {contact.message}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ─── Audits Table ────────────────────────────────────────── */}
            {activeTab === 'audits' && (
              <div className="glass rounded-2xl border border-app-border/5 overflow-hidden overflow-x-auto">
                {filteredAudits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-fg-subtle">
                    <BarChart3 size={32} className="mb-3 opacity-40" />
                    <p>{search ? 'No results found.' : 'No audit requests yet.'}</p>
                  </div>
                ) : (
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-app-border/5 text-left">
                        <th className="px-5 py-3.5 text-xs font-semibold text-fg-subtle uppercase tracking-wider">Requester</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-fg-subtle uppercase tracking-wider hidden md:table-cell">Website</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-fg-subtle uppercase tracking-wider hidden lg:table-cell">Submitted</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-fg-subtle uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3.5 text-xs font-semibold text-fg-subtle uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border/5">
                      {filteredAudits.map((audit) => (
                        <tr key={audit.id} className="hover:bg-surface/[0.04] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-400 flex-shrink-0">
                                {audit.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-fg text-sm font-medium">{audit.name}</p>
                                <p className="text-fg-subtle text-xs">{audit.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <a
                              href={audit.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                            >
                              <Globe size={12} />
                              {audit.website_url.replace(/^https?:\/\//, '')}
                            </a>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <span className="text-fg-subtle text-xs">{formatDate(audit.created_at)}</span>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={audit.status} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="relative group">
                                <button type="button" className="p-1.5 rounded-lg hover:bg-surface/5 text-fg-subtle hover:text-fg transition-all flex items-center gap-1 text-xs">
                                  <Tag size={13} />
                                  <ChevronDown size={10} />
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-36 glass-strong rounded-xl border border-app-border/10 shadow-xl z-10 hidden group-hover:block">
                                  {['pending', 'in_progress', 'completed', 'archived'].map((s) => (
                                    <button
                                      key={s}
                                      type="button"
                                      onClick={() => updateAuditStatus(audit.id, s)}
                                      className="w-full text-left px-3 py-2 text-xs text-fg-muted hover:text-fg hover:bg-surface/5 capitalize transition-colors first:rounded-t-xl last:rounded-b-xl"
                                    >
                                      {s.replace('_', ' ')}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <a
                                href={`mailto:${audit.email}`}
                                className="p-1.5 rounded-lg hover:bg-blue-500/10 text-fg-subtle hover:text-blue-400 transition-all"
                              >
                                <Mail size={13} />
                              </a>
                              <CheckCircle2 size={13} className={audit.status === 'completed' ? 'text-emerald-400' : 'text-fg-subtle opacity-50'} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
