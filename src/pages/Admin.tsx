import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Search, RefreshCw, Mail, Globe, Clock, CheckCircle2,
  MessageSquare, Tag, Trash2, ChevronDown, BarChart3, Eye,
  ImageIcon, Upload, RotateCcw, Save, X, Palette,
} from 'lucide-react';
import { useBrand } from '../context/BrandContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Contact {
  id: number; name: string; email: string;
  service: string | null; message: string;
  status: string; created_at: string;
}
interface AuditRequest {
  id: number; name: string; email: string;
  website_url: string; status: string;
  notes: string | null; created_at: string;
}
interface BrandAsset {
  exists: boolean; url: string | null; size: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  new: '#3B82F6', read: '#8B5CF6', replied: '#10B981',
  archived: '#6B7280', pending: '#F59E0B',
  in_progress: '#06B6D4', completed: '#10B981',
};

function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status] || '#6B7280';
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {status.replace('_', ' ')}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="glass rounded-2xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-sm">{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="font-display text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

// ─── Brand Asset Editor ───────────────────────────────────────────────────────
function BrandEditor({
  type, label, hint, currentUrl, onSaved,
}: {
  type: 'logo' | 'favicon';
  label: string;
  hint: string;
  currentUrl: string | null;
  onSaved: () => void;
}) {
  const [dragOver, setDragOver]   = useState(false);
  const [preview, setPreview]     = useState<string | null>(currentUrl);
  const [rawFile, setRawFile]     = useState<File | null>(null);
  const [width, setWidth]         = useState(type === 'favicon' ? 32 : 200);
  const [height, setHeight]       = useState(type === 'favicon' ? 32 : 60);
  const [lockAR, setLockAR]       = useState(true);
  const [origSize, setOrigSize]   = useState<{ w: number; h: number } | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const canvasRef                  = useRef<HTMLCanvasElement>(null);
  const inputRef                   = useRef<HTMLInputElement>(null);

  // When a new file is chosen, read it + get natural dimensions
  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a PNG, JPG, SVG, or WebP image.');
      return;
    }
    setError(null);
    setSaved(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setRawFile(file);
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth  || (type === 'favicon' ? 32 : 200);
        const h = img.naturalHeight || (type === 'favicon' ? 32 : 60);
        setOrigSize({ w, h });
        setWidth(w);
        setHeight(h);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const handleWidthChange = (v: number) => {
    setWidth(v);
    if (lockAR && origSize) {
      setHeight(Math.round(v * (origSize.h / origSize.w)));
    }
  };
  const handleHeightChange = (v: number) => {
    setHeight(v);
    if (lockAR && origSize) {
      setWidth(Math.round(v * (origSize.w / origSize.h)));
    }
  };

  // Draw resized image onto hidden canvas for export
  const getResizedBlob = (): Promise<Blob> => new Promise((resolve, reject) => {
    const canvas = canvasRef.current!;
    canvas.width  = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas export failed.'));
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('Image load failed.'));
    img.src = preview!;
  });

  const handleSave = async () => {
    if (!preview || !rawFile) return;
    setSaving(true);
    setError(null);
    try {
      const blob = await getResizedBlob();
      const form = new FormData();
      form.append('image', blob, `${type}.png`);
      const res = await fetch(`/api/brand/${type}`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed.');
      setSaved(true);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete the current ${label}?`)) return;
    await fetch(`/api/brand/${type}`, { method: 'DELETE' });
    setPreview(null);
    setRawFile(null);
    setOrigSize(null);
    setSaved(false);
    onSaved();
  };

  const previewBg = type === 'favicon'
    ? 'bg-gray-900 border border-white/10'
    : 'bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10';

  return (
    <div className="glass rounded-2xl border border-white/8 p-6">
      {/* Hidden canvas for resize export */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-display font-bold text-white text-base">{label}</p>
          <p className="text-gray-500 text-xs mt-0.5">{hint}</p>
        </div>
        {preview && (
          <button onClick={handleDelete}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all"
            title="Remove">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* ── Drop zone / preview ── */}
        <div>
          {preview ? (
            <div className={`relative rounded-xl ${previewBg} flex items-center justify-center overflow-hidden`}
              style={{ minHeight: 140 }}>
              <img
                src={preview}
                alt={label}
                style={{ width, height, objectFit: 'contain', maxWidth: '100%', maxHeight: 220 }}
                className="transition-all duration-200"
              />
              <button
                onClick={() => inputRef.current?.click()}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass border border-white/10 text-xs text-gray-300 hover:text-white transition-all">
                <Upload size={11} /> Replace
              </button>
            </div>
          ) : (
            <div
              className={`rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center py-10 cursor-pointer
                ${dragOver ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/2'}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                <Upload size={22} className="text-blue-400" />
              </div>
              <p className="text-white text-sm font-medium mb-1">Drop image here</p>
              <p className="text-gray-600 text-xs">PNG, JPG, SVG, WebP — max 5 MB</p>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
        </div>

        {/* ── Size controls ── */}
        <div className="flex flex-col gap-4">
          {/* Dimensions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dimensions</p>
              <button
                onClick={() => setLockAR(!lockAR)}
                className={`text-xs px-2 py-1 rounded-lg border transition-all ${lockAR
                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                  : 'bg-white/5 border-white/10 text-gray-500'}`}>
                {lockAR ? '🔒 Locked' : '🔓 Free'}
              </button>
            </div>

            {/* Width */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Width</span><span className="text-white font-mono">{width}px</span>
              </div>
              <input type="range" min={8} max={type === 'favicon' ? 256 : 800}
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="w-full h-1.5 rounded-full accent-blue-500 cursor-pointer" />
            </div>

            {/* Height */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Height</span><span className="text-white font-mono">{height}px</span>
              </div>
              <input type="range" min={8} max={type === 'favicon' ? 256 : 400}
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="w-full h-1.5 rounded-full accent-violet-500 cursor-pointer" />
            </div>

            {/* Manual inputs */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'W', val: width, onChange: handleWidthChange },
                { label: 'H', val: height, onChange: handleHeightChange },
              ].map(({ label: l, val, onChange }) => (
                <div key={l} className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-600 w-3">{l}</span>
                  <input
                    type="number" min={8} max={1000} value={val}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg text-xs text-white font-mono text-center outline-none focus:ring-1 focus:ring-blue-500/50"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                  <span className="text-xs text-gray-600">px</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reset to original */}
          {origSize && (
            <button
              onClick={() => { setWidth(origSize.w); setHeight(origSize.h); }}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
              <RotateCcw size={11} /> Reset to original ({origSize.w}×{origSize.h})
            </button>
          )}

          {/* Preset sizes */}
          <div>
            <p className="text-xs text-gray-600 mb-2">
              {type === 'favicon' ? 'Common favicon sizes:' : 'Common logo sizes:'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(type === 'favicon'
                ? [{ w: 16, h: 16 }, { w: 32, h: 32 }, { w: 48, h: 48 }, { w: 64, h: 64 }, { w: 128, h: 128 }]
                : [{ w: 120, h: 40 }, { w: 200, h: 60 }, { w: 300, h: 80 }, { w: 400, h: 120 }]
              ).map(({ w, h }) => (
                <button key={`${w}x${h}`}
                  onClick={() => { setWidth(w); setHeight(h); }}
                  className={`px-2 py-1 rounded text-xs font-mono transition-all border
                    ${width === w && height === h
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : 'bg-white/4 border-white/8 text-gray-500 hover:text-white hover:border-white/20'}`}>
                  {w}×{h}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <X size={12} /> {error}
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!preview || !rawFile || saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: saved ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg,#3B82F6,#8B5CF6)', color: '#fff', boxShadow: saved ? 'none' : '0 0 20px rgba(59,130,246,0.25)' }}>
            {saving ? (
              <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : saved ? (
              <><CheckCircle2 size={14} /> Saved!</>
            ) : (
              <><Save size={14} /> Save {label} ({width}×{height}px)</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Brand Tab ────────────────────────────────────────────────────────────────
function BrandTab() {
  const [brand, setBrand] = useState<{ logo: BrandAsset; favicon: BrandAsset } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBrand = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/brand');
      const data = await res.json();
      if (data.success) setBrand(data.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBrand(); }, [fetchBrand]);

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-gray-600">
      <RefreshCw size={18} className="animate-spin mr-3" /> Loading brand assets...
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/8 border border-blue-500/20">
        <ImageIcon size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <span className="font-semibold">Brand Assets Manager</span>
          <span className="text-blue-400/70"> — Upload and resize your site logo and browser favicon. Use the sliders or preset sizes, then click Save to publish.</span>
        </div>
      </div>

      {/* Editors */}
      <div className="grid lg:grid-cols-2 gap-6">
        <BrandEditor
          type="logo"
          label="Site Logo"
          hint="Displayed in the navbar and footer. Recommended: PNG with transparency."
          currentUrl={brand?.logo.url ?? null}
          onSaved={fetchBrand}
        />
        <BrandEditor
          type="favicon"
          label="Favicon"
          hint="Shown in browser tabs. Square image — common sizes: 32×32, 48×48, 64×64."
          currentUrl={brand?.favicon.url ?? null}
          onSaved={fetchBrand}
        />
      </div>

      {/* Current assets summary */}
      {brand && (
        <div className="glass rounded-2xl border border-white/5 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Saved Assets</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'logo', label: 'Logo', asset: brand.logo },
              { key: 'favicon', label: 'Favicon', asset: brand.favicon },
            ].map(({ key, label, asset }) => (
              <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                {asset.exists && asset.url ? (
                  <img src={`${asset.url}&bust=${Date.now()}`} alt={label}
                    className="w-8 h-8 object-contain rounded"
                    style={{ imageRendering: key === 'favicon' ? 'pixelated' : 'auto' }} />
                ) : (
                  <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                    <ImageIcon size={14} className="text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-gray-600 text-xs">
                    {asset.exists
                      ? `${((asset.size ?? 0) / 1024).toFixed(1)} KB saved`
                      : 'Not uploaded yet'}
                  </p>
                </div>
                <div className={`ml-auto w-2 h-2 rounded-full ${asset.exists ? 'bg-emerald-400' : 'bg-gray-700'}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function Admin() {
  const { logoUrl } = useBrand();
  const [activeTab, setActiveTab] = useState<'contacts' | 'audits' | 'brand'>('contacts');
  const [contacts, setContacts]   = useState<Contact[]>([]);
  const [audits, setAudits]       = useState<AuditRequest[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');
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
    await fetch(`/api/contacts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  };
  const updateAuditStatus = async (id: number, status: string) => {
    await fetch(`/api/audits/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
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
  const newContacts   = contacts.filter((c) => c.status === 'new').length;
  const pendingAudits = audits.filter((a) => a.status === 'pending').length;

  const tabs = [
    { id: 'contacts' as const, label: `Contacts (${contacts.length})` },
    { id: 'audits'   as const, label: `Audits (${audits.length})` },
    { id: 'brand'    as const, label: 'Brand Assets', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Sticky header */}
      <div className="border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center font-display font-bold text-sm">P</div>
                <span className="font-display font-bold text-white">Polyxos</span>
              </>
            )}
            <span className="text-gray-600 mx-2">/</span>
            <span className="text-gray-400 text-sm">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-xs text-gray-500 hover:text-white transition-colors">← Back to site</a>
            <button onClick={fetchData}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/5 text-sm text-gray-400 hover:text-white transition-all">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Contacts" value={contacts.length} icon={MessageSquare} color="#3B82F6" />
          <StatCard label="New Leads"      value={newContacts}      icon={Users}         color="#8B5CF6" />
          <StatCard label="Audit Requests" value={audits.length}   icon={BarChart3}     color="#06B6D4" />
          <StatCard label="Pending Audits" value={pendingAudits}   icon={Clock}         color="#F59E0B" />
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-1 p-1 glass rounded-xl border border-white/5">
            {tabs.map(({ id, label, icon: TabIcon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5
                  ${activeTab === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}>
                {TabIcon && <TabIcon size={13} />}
                {label}
              </button>
            ))}
          </div>

          {activeTab !== 'brand' && (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..." id="admin-search"
                className="pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 rounded-xl outline-none w-64 transition-all focus:ring-2 focus:ring-blue-500/30"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error} — Make sure the Express server is running: <code className="font-mono text-xs">npm run dev:server</code>
          </div>
        )}

        {/* ─── Brand Tab ───────────────────────────────────────────── */}
        {activeTab === 'brand' && <BrandTab />}

        {/* ─── Data Tabs ────────────────────────────────────────────── */}
        {activeTab !== 'brand' && (
          loading ? (
            <div className="flex items-center justify-center py-20 text-gray-600">
              <RefreshCw size={20} className="animate-spin mr-3" /> Loading data...
            </div>
          ) : (
            <>
              {/* Contacts Table */}
              {activeTab === 'contacts' && (
                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                  {filteredContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-600">
                      <MessageSquare size={32} className="mb-3 opacity-40" />
                      <p>{search ? 'No results found.' : 'No contact submissions yet.'}</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5 text-left">
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Service</th>
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredContacts.map((contact) => (
                          <>
                            <tr key={contact.id} className="hover:bg-white/2 transition-colors cursor-pointer"
                              onClick={() => setExpandedId(expandedId === contact.id ? null : contact.id)}>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {contact.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-white text-sm font-medium">{contact.name}</p>
                                    <p className="text-gray-500 text-xs">{contact.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 hidden md:table-cell">
                                <span className="text-gray-400 text-sm">{contact.service || '—'}</span>
                              </td>
                              <td className="px-5 py-4 hidden lg:table-cell">
                                <span className="text-gray-500 text-xs">{formatDate(contact.created_at)}</span>
                              </td>
                              <td className="px-5 py-4"><StatusBadge status={contact.status} /></td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <div className="relative group">
                                    <button className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all flex items-center gap-1 text-xs">
                                      <Tag size={13} /><ChevronDown size={10} />
                                    </button>
                                    <div className="absolute right-0 top-full mt-1 w-36 glass rounded-xl border border-white/10 shadow-xl z-10 hidden group-hover:block">
                                      {['new', 'read', 'replied', 'archived'].map((s) => (
                                        <button key={s} onClick={() => updateContactStatus(contact.id, s)}
                                          className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 capitalize transition-colors first:rounded-t-xl last:rounded-b-xl">
                                          {s}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <a href={`mailto:${contact.email}`}
                                    className="p-1.5 rounded-lg hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 transition-all" title="Reply">
                                    <Mail size={13} />
                                  </a>
                                  <button onClick={() => setExpandedId(expandedId === contact.id ? null : contact.id)}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all">
                                    <Eye size={13} />
                                  </button>
                                  <button onClick={() => deleteContact(contact.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all">
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {expandedId === contact.id && (
                              <tr key={`${contact.id}-msg`} className="bg-white/[0.02]">
                                <td colSpan={5} className="px-5 pb-4 pt-1">
                                  <div className="pl-11">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Message</p>
                                    <p className="text-gray-300 text-sm leading-relaxed bg-white/3 rounded-xl p-4 border border-white/5">
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

              {/* Audits Table */}
              {activeTab === 'audits' && (
                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                  {filteredAudits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-600">
                      <BarChart3 size={32} className="mb-3 opacity-40" />
                      <p>{search ? 'No results found.' : 'No audit requests yet.'}</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5 text-left">
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Requester</th>
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Website</th>
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Submitted</th>
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredAudits.map((audit) => (
                          <tr key={audit.id} className="hover:bg-white/2 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-400 flex-shrink-0">
                                  {audit.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-white text-sm font-medium">{audit.name}</p>
                                  <p className="text-gray-500 text-xs">{audit.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 hidden md:table-cell">
                              <a href={audit.website_url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                                <Globe size={12} />
                                {audit.website_url.replace(/^https?:\/\//, '')}
                              </a>
                            </td>
                            <td className="px-5 py-4 hidden lg:table-cell">
                              <span className="text-gray-500 text-xs">{formatDate(audit.created_at)}</span>
                            </td>
                            <td className="px-5 py-4"><StatusBadge status={audit.status} /></td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="relative group">
                                  <button className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all flex items-center gap-1 text-xs">
                                    <Tag size={13} /><ChevronDown size={10} />
                                  </button>
                                  <div className="absolute right-0 top-full mt-1 w-36 glass rounded-xl border border-white/10 shadow-xl z-10 hidden group-hover:block">
                                    {['pending', 'in_progress', 'completed', 'archived'].map((s) => (
                                      <button key={s} onClick={() => updateAuditStatus(audit.id, s)}
                                        className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 capitalize transition-colors first:rounded-t-xl last:rounded-b-xl">
                                        {s.replace('_', ' ')}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <a href={`mailto:${audit.email}`}
                                  className="p-1.5 rounded-lg hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 transition-all">
                                  <Mail size={13} />
                                </a>
                                <CheckCircle2 size={13} className={audit.status === 'completed' ? 'text-emerald-400' : 'text-gray-700'} />
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
          )
        )}
      </div>
    </div>
  );
}
