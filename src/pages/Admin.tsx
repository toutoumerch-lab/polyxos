import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Search, RefreshCw, Mail, Globe, Clock, CheckCircle2,
  MessageSquare, Tag, Trash2, ChevronDown, BarChart3, Eye,
  ImageIcon, Upload, RotateCcw, Save, X, Palette, Lock, Plus,
  Edit, ArrowUp, ArrowDown, Folder, Briefcase, Cpu, Settings, LineChart
} from 'lucide-react';
import { useBrand, invalidateBrandCache } from '../context/BrandContext';

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
interface Service {
  id: number; title: string; short_description: string;
  detailed_description: string | null; icon_name: string;
  display_order: number; active: boolean; features: string[];
  color: string; gradient: string;
}
interface Project {
  id: number; title: string; category: string; description: string;
  cover_image: string; gallery_images: string[]; tags: string[];
  live_url: string | null; github_url: string | null;
  completion_date: string | null; featured: boolean; display_order: number;
}
interface Technology {
  id: number; name: string; logo_icon: string;
  category: string; proficiency: string | null; display_order: number;
}
interface AnalyticsSummary {
  totalViews: number; uniqueVisitors: number;
  totalSessions: number; avgDuration: string; realtimeVisitors: number;
}
interface AnalyticsTrend {
  date: string; views: number; visitors: number;
}
interface AnalyticsData {
  isGoogleAnalytics: boolean; isGaConfigured: boolean; googleError: string | null;
  summary: AnalyticsSummary;
  topPages: { path: string; views: number }[];
  devices: { name: string; percentage: number }[];
  trafficSources: { source: string; count: number }[];
  trends: AnalyticsTrend[];
}

const statusColors: Record<string, string> = {
  new: '#3B82F6', read: '#8B5CF6', replied: '#10B981',
  archived: '#6B7280', pending: '#F59E0B',
  in_progress: '#06B6D4', completed: '#10B981',
};

// ─── Helper components ────────────────────────────────────────────────────────
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

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <p className="text-gray-400 text-sm">{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: `${color}20` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="font-display text-3xl font-bold text-white relative z-10">{value}</p>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/[0.01] pointer-events-none" />
    </div>
  );
}

// ─── Brand Asset Editor ───────────────────────────────────────────────────────
function BrandEditor({
  type, label, hint, currentUrl, onSaved, token
}: {
  type: 'logo' | 'favicon';
  label: string;
  hint: string;
  currentUrl: string | null;
  onSaved: () => void;
  token: string;
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
      const res = await fetch(`/api/brand/${type}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed.');
      setSaved(true);
      invalidateBrandCache();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete the current ${label}?`)) return;
    await fetch(`/api/brand/${type}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setPreview(null);
    setRawFile(null);
    setOrigSize(null);
    setSaved(false);
    invalidateBrandCache();
    onSaved();
  };

  const previewBg = type === 'favicon'
    ? 'bg-gray-900 border border-white/10'
    : 'bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10';

  return (
    <div className="glass rounded-2xl border border-white/8 p-6">
      <canvas ref={canvasRef} className="hidden" />
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

        <div className="flex flex-col gap-4">
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

            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Width</span><span className="text-white font-mono">{width}px</span>
              </div>
              <input type="range" min={8} max={type === 'favicon' ? 256 : 800}
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="w-full h-1.5 rounded-full accent-blue-500 cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Height</span><span className="text-white font-mono">{height}px</span>
              </div>
              <input type="range" min={8} max={type === 'favicon' ? 256 : 400}
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="w-full h-1.5 rounded-full accent-violet-500 cursor-pointer" />
            </div>

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

          {origSize && (
            <button
              onClick={() => { setWidth(origSize.w); setHeight(origSize.h); }}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
              <RotateCcw size={11} /> Reset to original ({origSize.w}×{origSize.h})
            </button>
          )}

          <div>
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

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <X size={12} /> {error}
            </div>
          )}

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
function BrandTab({ token }: { token: string }) {
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
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/8 border border-blue-500/20">
        <ImageIcon size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <span className="font-semibold">Brand Assets Manager</span>
          <span className="text-blue-400/70"> — Upload and resize your site logo and browser favicon. Use the sliders or preset sizes, then click Save to publish.</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <BrandEditor
          type="logo"
          label="Site Logo"
          hint="Displayed in the navbar and footer. Recommended: PNG with transparency."
          currentUrl={brand?.logo.url ?? null}
          onSaved={fetchBrand}
          token={token}
        />
        <BrandEditor
          type="favicon"
          label="Favicon"
          hint="Shown in browser tabs. Square image — common sizes: 32×32, 48×48, 64×64."
          currentUrl={brand?.favicon.url ?? null}
          onSaved={fetchBrand}
          token={token}
        />
      </div>

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

// ─── SERVICES CMS TAB ─────────────────────────────────────────────────────────
function ServicesTab({ token }: { token: string }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [detailedDesc, setDetailedDesc] = useState('');
  const [iconName, setIconName] = useState('Globe');
  const [features, setFeatures] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [active, setActive] = useState(true);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services?all=true');
      const data = await res.json();
      if (data.success) setServices(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const openForm = (s?: Service) => {
    if (s) {
      setEditingId(s.id);
      setTitle(s.title);
      setShortDesc(s.short_description);
      setDetailedDesc(s.detailed_description || '');
      setIconName(s.icon_name);
      setFeatures(s.features.join(', '));
      setColor(s.color);
      setActive(s.active);
    } else {
      setEditingId('new');
      setTitle('');
      setShortDesc('');
      setDetailedDesc('');
      setIconName('Globe');
      setFeatures('');
      setColor('#3B82F6');
      setActive(true);
    }
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !shortDesc) {
      setError('Title and short description are required.');
      return;
    }

    const payload = {
      title,
      short_description: shortDesc,
      detailed_description: detailedDesc || null,
      icon_name: iconName,
      features: features.split(',').map(f => f.trim()).filter(Boolean),
      color,
      active,
      gradient: color === '#8B5CF6' ? 'from-violet-500/20 to-violet-600/5' :
                color === '#06B6D4' ? 'from-cyan-500/20 to-cyan-600/5' :
                color === '#EC4899' ? 'from-pink-500/20 to-pink-600/5' :
                color === '#F59E0B' ? 'from-amber-500/20 to-amber-600/5' :
                'from-blue-500/20 to-blue-600/5'
    };

    try {
      let res;
      if (editingId === 'new') {
        res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ...payload, display_order: services.length })
        });
      } else {
        res = await fetch(`/api/services/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save service.');

      setEditingId(null);
      fetchServices();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this service?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= services.length) return;

    const items = [...services];
    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    // Build orders list
    const orders = items.map((item, idx) => ({ id: item.id, display_order: idx }));

    setServices(items);

    try {
      await fetch('/api/services/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ orders })
      });
    } catch (err) {
      console.error(err);
      fetchServices();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-white">Services CMS</h2>
          <p className="text-gray-500 text-xs mt-0.5">Manage services offered on the home page.</p>
        </div>
        {!editingId && (
          <button onClick={() => openForm()}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-semibold rounded-xl transition-all">
            <Plus size={16} /> Add Service
          </button>
        )}
      </div>

      {editingId ? (
        <form onSubmit={handleSave} className="glass border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="font-display font-bold text-white text-base">{editingId === 'new' ? 'New Service' : 'Edit Service'}</h3>
            <button type="button" onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white"><X size={16} /></button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Service Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Lucide Icon Name</label>
              <select value={iconName} onChange={(e) => setIconName(e.target.value)}
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                {['Globe', 'Smartphone', 'Search', 'Palette', 'Code2', 'Cpu', 'Database', 'Cloud', 'Lock'].map(i => (
                  <option key={i} value={i} className="bg-gray-950">{i}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">Short Description (1-2 sentences)</label>
            <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} rows={2}
              className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">Detailed Description (Optional)</label>
            <textarea value={detailedDesc} onChange={(e) => setDetailedDesc(e.target.value)} rows={3}
              className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">Features / Stack chips (comma-separated)</label>
            <input type="text" value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="e.g. Next.js, Fast Load, SEO optimized"
              className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Theme Color</label>
              <select value={color} onChange={(e) => setColor(e.target.value)}
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="#3B82F6" className="bg-gray-950">Blue (#3B82F6)</option>
                <option value="#8B5CF6" className="bg-gray-950">Violet (#8B5CF6)</option>
                <option value="#06B6D4" className="bg-gray-950">Cyan (#06B6D4)</option>
                <option value="#EC4899" className="bg-gray-950">Pink (#EC4899)</option>
                <option value="#F59E0B" className="bg-gray-950">Amber (#F59E0B)</option>
              </select>
            </div>

            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-white/15 bg-white/5 text-blue-600 focus:ring-0 focus:ring-offset-0 w-4 h-4" />
                Active / Visible on website
              </label>
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditingId(null)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-sm font-semibold transition-all">Cancel</button>
            <button type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all">Save</button>
          </div>
        </form>
      ) : loading ? (
        <div className="flex items-center justify-center py-20 text-gray-600">
          <RefreshCw size={20} className="animate-spin mr-3" /> Loading services...
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          {services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-600">
              <Briefcase size={32} className="mb-3 opacity-40" />
              <p>No services registered yet.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Features</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {services.map((service, i) => (
                  <tr key={service.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ background: `${service.color}20`, border: `1px solid ${service.color}40`, color: service.color }}>
                          {service.icon_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{service.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{service.short_description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {service.features.map(f => (
                          <span key={f} className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: `${service.color}15`, color: service.color }}>{f}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        service.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                        {service.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => handleMove(i, 'up')} disabled={i === 0}
                          className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-20 transition-all"><ArrowUp size={13} /></button>
                        <button onClick={() => handleMove(i, 'down')} disabled={i === services.length - 1}
                          className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-20 transition-all"><ArrowDown size={13} /></button>
                        <button onClick={() => openForm(service)}
                          className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-blue-400 transition-all"><Edit size={13} /></button>
                        <button onClick={() => handleDelete(service.id)}
                          className="p-1.5 rounded hover:bg-white/5 text-gray-600 hover:text-red-400 transition-all"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PORTFOLIO CMS TAB ────────────────────────────────────────────────────────
function PortfolioTab({ token }: { token: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Application');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [featured, setFeatured] = useState(false);

  const [uploading, setUploading] = useState<string | null>(null); // 'cover' or index

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/portfolio?all=true');
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openForm = (p?: Project) => {
    if (p) {
      setEditingId(p.id);
      setTitle(p.title);
      setCategory(p.category);
      setDescription(p.description);
      setCoverImage(p.cover_image);
      setGalleryImages(p.gallery_images || []);
      setTags(p.tags.join(', '));
      setLiveUrl(p.live_url || '');
      setGithubUrl(p.github_url || '');
      setCompletionDate(p.completion_date ? p.completion_date.split('T')[0] : '');
      setFeatured(p.featured);
    } else {
      setEditingId('new');
      setTitle('');
      setCategory('Web Application');
      setDescription('');
      setCoverImage('');
      setGalleryImages([]);
      setTags('');
      setLiveUrl('');
      setGithubUrl('');
      setCompletionDate('');
      setFeatured(false);
    }
    setError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cover' | number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field === 'cover' ? 'cover' : `gallery-${field}`);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/portfolio/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');

      if (field === 'cover') {
        setCoverImage(data.url);
      } else {
        const list = [...galleryImages];
        list[field] = data.url;
        setGalleryImages(list);
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !description || !coverImage) {
      setError('Title, category, description, and cover image are required.');
      return;
    }

    const payload = {
      title,
      category,
      description,
      cover_image: coverImage,
      gallery_images: galleryImages.filter(Boolean),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      live_url: liveUrl || null,
      github_url: githubUrl || null,
      completion_date: completionDate || null,
      featured
    };

    try {
      let res;
      if (editingId === 'new') {
        res = await fetch('/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ...payload, display_order: projects.length })
        });
      } else {
        res = await fetch(`/api/portfolio/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save project.');

      setEditingId(null);
      fetchProjects();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project?')) return;
    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= projects.length) return;

    const items = [...projects];
    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    const orders = items.map((item, idx) => ({ id: item.id, display_order: idx }));
    setProjects(items);

    try {
      await fetch('/api/portfolio/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ orders })
      });
    } catch (err) {
      console.error(err);
      fetchProjects();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-white">Portfolio CMS</h2>
          <p className="text-gray-500 text-xs mt-0.5">Manage case studies and client projects.</p>
        </div>
        {!editingId && (
          <button onClick={() => openForm()}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-semibold rounded-xl transition-all">
            <Plus size={16} /> Add Project
          </button>
        )}
      </div>

      {editingId ? (
        <form onSubmit={handleSave} className="glass border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="font-display font-bold text-white text-base">{editingId === 'new' ? 'New Project' : 'Edit Project'}</h3>
            <button type="button" onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white"><X size={16} /></button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Project Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Project Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                {['Web Application', 'Mobile App', 'Custom Software', 'UI/UX Design', 'Branding'].map(c => (
                  <option key={c} value={c} className="bg-gray-950">{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">Project Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>

          {/* Images uploaders */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Cover Image URL / Upload</label>
              <div className="flex gap-2">
                <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://example.com/cover.png"
                  className="flex-1 bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
                <label className="p-2.5 bg-white/5 border border-white/8 rounded-xl text-gray-300 hover:text-white cursor-pointer hover:bg-white/10 transition-all flex items-center justify-center">
                  <input type="file" onChange={(e) => handleFileUpload(e, 'cover')} className="hidden" accept="image/*" />
                  {uploading === 'cover' ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Upload size={16} />}
                </label>
              </div>
              {coverImage && (
                <img src={coverImage} alt="Cover" className="mt-2 h-24 rounded-lg object-cover border border-white/10" />
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Gallery Images (Optional)</label>
              <div className="space-y-2">
                {[0, 1].map(idx => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" value={galleryImages[idx] || ''}
                      onChange={(e) => {
                        const list = [...galleryImages];
                        list[idx] = e.target.value;
                        setGalleryImages(list);
                      }}
                      placeholder={`Gallery URL #${idx + 1}`}
                      className="flex-1 bg-white/4 border border-white/8 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
                    <label className="p-2 bg-white/5 border border-white/8 rounded-xl text-gray-300 hover:text-white cursor-pointer hover:bg-white/10 transition-all flex items-center justify-center">
                      <input type="file" onChange={(e) => handleFileUpload(e, idx)} className="hidden" accept="image/*" />
                      {uploading === `gallery-${idx}` ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Upload size={14} />}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">Technologies Used (comma-separated)</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="React, Node.js, Cloudinary"
              className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Live Website URL</label>
              <input type="text" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://live-app.com"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">GitHub / Repository URL</label>
              <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..."
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Completion Date</label>
              <input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="flex items-center pb-2">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)}
                className="rounded border-white/15 bg-white/5 text-blue-600 focus:ring-0 focus:ring-offset-0 w-4 h-4" />
              Featured Project (gains styling accent)
            </label>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditingId(null)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-sm font-semibold transition-all">Cancel</button>
            <button type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all">Save</button>
          </div>
        </form>
      ) : loading ? (
        <div className="flex items-center justify-center py-20 text-gray-600">
          <RefreshCw size={20} className="animate-spin mr-3" /> Loading portfolio...
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-600">
              <Folder size={32} className="mb-3 opacity-40" />
              <p>No projects registered yet.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Featured</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.map((project, i) => (
                  <tr key={project.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={project.cover_image} alt={project.title} className="w-10 h-10 object-cover rounded-lg border border-white/5 flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm font-semibold">{project.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5 max-w-sm line-clamp-1">{project.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-gray-400 text-sm">{project.category}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        project.featured ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-white/5 text-gray-500'}`}>
                        {project.featured ? '★ Featured' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => handleMove(i, 'up')} disabled={i === 0}
                          className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-20 transition-all"><ArrowUp size={13} /></button>
                        <button onClick={() => handleMove(i, 'down')} disabled={i === projects.length - 1}
                          className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-20 transition-all"><ArrowDown size={13} /></button>
                        <button onClick={() => openForm(project)}
                          className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-blue-400 transition-all"><Edit size={13} /></button>
                        <button onClick={() => handleDelete(project.id)}
                          className="p-1.5 rounded hover:bg-white/5 text-gray-600 hover:text-red-400 transition-all"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TECHNOLOGIES CMS TAB ────────────────────────────────────────────────────
function TechnologiesTab({ token }: { token: string }) {
  const [techs, setTechs] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [logoIcon, setLogoIcon] = useState('⚛');
  const [category, setCategory] = useState('Frontend');
  const [proficiency, setProficiency] = useState('');

  const fetchTechs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/technologies');
      const data = await res.json();
      if (data.success) setTechs(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTechs(); }, [fetchTechs]);

  const openForm = (t?: Technology) => {
    if (t) {
      setEditingId(t.id);
      setName(t.name);
      setLogoIcon(t.logo_icon);
      setCategory(t.category);
      setProficiency(t.proficiency || '');
    } else {
      setEditingId('new');
      setName('');
      setLogoIcon('⚛');
      setCategory('Frontend');
      setProficiency('');
    }
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) {
      setError('Name and category are required.');
      return;
    }

    const payload = {
      name,
      logo_icon: logoIcon,
      category,
      proficiency: proficiency || null
    };

    try {
      let res;
      if (editingId === 'new') {
        res = await fetch('/api/technologies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ...payload, display_order: techs.length })
        });
      } else {
        res = await fetch(`/api/technologies/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save technology.');

      setEditingId(null);
      fetchTechs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this technology?')) return;
    try {
      const res = await fetch(`/api/technologies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchTechs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= techs.length) return;

    const items = [...techs];
    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    const orders = items.map((item, idx) => ({ id: item.id, display_order: idx }));
    setTechs(items);

    try {
      await fetch('/api/technologies/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ orders })
      });
    } catch (err) {
      console.error(err);
      fetchTechs();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-white">Technologies CMS</h2>
          <p className="text-gray-500 text-xs mt-0.5">Manage tags and items in the tech stack grid.</p>
        </div>
        {!editingId && (
          <button onClick={() => openForm()}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-semibold rounded-xl transition-all">
            <Plus size={16} /> Add Tech
          </button>
        )}
      </div>

      {editingId ? (
        <form onSubmit={handleSave} className="glass border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="font-display font-bold text-white text-base">{editingId === 'new' ? 'New Technology' : 'Edit Technology'}</h3>
            <button type="button" onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white"><X size={16} /></button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Tech Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Next.js"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                {['Frontend', 'Backend', 'Mobile', 'Database', 'Cloud', 'DevOps', 'AI', 'Other'].map(c => (
                  <option key={c} value={c} className="bg-gray-950">{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Logo / Icon (Emoji / Character)</label>
              <input type="text" value={logoIcon} onChange={(e) => setLogoIcon(e.target.value)} placeholder="e.g. ▲, ⚛, 🐳"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Proficiency / Description (Optional)</label>
              <input type="text" value={proficiency} onChange={(e) => setProficiency(e.target.value)} placeholder="e.g. Expert, 3 Years"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditingId(null)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-sm font-semibold transition-all">Cancel</button>
            <button type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all">Save</button>
          </div>
        </form>
      ) : loading ? (
        <div className="flex items-center justify-center py-20 text-gray-600">
          <RefreshCw size={20} className="animate-spin mr-3" /> Loading technologies...
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          {techs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-600">
              <Cpu size={32} className="mb-3 opacity-40" />
              <p>No technologies registered yet.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Technology</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proficiency</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {techs.map((tech, i) => (
                  <tr key={tech.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl w-8 h-8 rounded bg-white/5 flex items-center justify-center flex-shrink-0">{tech.logo_icon}</span>
                        <span className="text-white text-sm font-semibold">{tech.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-gray-400 text-sm">{tech.category}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-sm">
                      {tech.proficiency || '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => handleMove(i, 'up')} disabled={i === 0}
                          className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-20 transition-all"><ArrowUp size={13} /></button>
                        <button onClick={() => handleMove(i, 'down')} disabled={i === techs.length - 1}
                          className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-20 transition-all"><ArrowDown size={13} /></button>
                        <button onClick={() => openForm(tech)}
                          className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-blue-400 transition-all"><Edit size={13} /></button>
                        <button onClick={() => handleDelete(tech.id)}
                          className="p-1.5 rounded hover:bg-white/5 text-gray-600 hover:text-red-400 transition-all"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ANALYTICS & SETTINGS TAB ────────────────────────────────────────────────
function AnalyticsTab({ token }: { token: string }) {
  const [settings, setSettings] = useState({
    ga4_measurement_id: '',
    ga4_property_id: '',
    ga4_client_email: '',
    ga4_private_key: '',
  });

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoadingData(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      } else {
        setErrorMsg(data.error || 'Failed to fetch analytics data.');
      }
    } catch {
      setErrorMsg('Network error fetching analytics.');
    } finally {
      setLoadingData(false);
    }
  }, [token]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error('Fetch settings fail:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
    fetchAnalytics();
  }, [fetchSettings, fetchAnalytics]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage(null);
    try {
      const res = await fetch('/api/settings/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSettingsMessage('Settings saved successfully!');
        fetchAnalytics(); // Refresh analytics after credential save
      } else {
        setSettingsMessage(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setSettingsMessage(`Network error: ${err.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  // SVG Chart builder helper
  const renderTrendsChart = (trends: AnalyticsTrend[]) => {
    if (!trends || trends.length === 0) return <div className="text-gray-600 text-center py-10">No trend data available</div>;

    const maxViews = Math.max(...trends.map(t => t.views), 10);
    const height = 140;
    const width = 600;
    const padding = 20;

    // Convert trends to SVG points
    const points = trends.map((t, idx) => {
      const x = padding + (idx / (trends.length - 1)) * (width - padding * 2);
      const y = height - padding - (t.views / maxViews) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    const visitorPoints = trends.map((t, idx) => {
      const x = padding + (idx / (trends.length - 1)) * (width - padding * 2);
      const y = height - padding - (t.visitors / maxViews) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-blue-500">
        {/* Grids */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

        {/* Lines */}
        <polyline fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" points={points} />
        <polyline fill="none" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" points={visitorPoints} />

        {/* Dots */}
        {trends.map((t, idx) => {
          const x = padding + (idx / (trends.length - 1)) * (width - padding * 2);
          const y = height - padding - (t.views / maxViews) * (height - padding * 2);
          return (
            <circle key={idx} cx={x} cy={y} r="3.5" fill="#3B82F6" className="cursor-pointer">
              <title>{`${t.date}: ${t.views} views`}</title>
            </circle>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-8">
      {/* Settings Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* GA4 Setup Form */}
        <div className="lg:col-span-1 glass border border-white/5 rounded-2xl p-6 h-fit space-y-4">
          <div>
            <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
              <Settings size={18} className="text-gray-400" />
              Analytics Settings
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">Configure GA4 Tracking IDs & Credentials.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-semibold uppercase">Measurement ID (G-XXXXXXXXXX)</label>
              <input type="text" value={settings.ga4_measurement_id}
                onChange={(e) => setSettings({ ...settings, ga4_measurement_id: e.target.value })}
                placeholder="G-XXXXXX"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-semibold uppercase">GA4 Property ID (Data API)</label>
              <input type="text" value={settings.ga4_property_id}
                onChange={(e) => setSettings({ ...settings, ga4_property_id: e.target.value })}
                placeholder="e.g. 320984920"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-semibold uppercase">Service Account Email</label>
              <input type="text" value={settings.ga4_client_email}
                onChange={(e) => setSettings({ ...settings, ga4_client_email: e.target.value })}
                placeholder="something@project.iam.gserviceaccount.com"
                className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-semibold uppercase">Private Key (PEM format)</label>
              <textarea value={settings.ga4_private_key}
                onChange={(e) => setSettings({ ...settings, ga4_private_key: e.target.value })}
                placeholder="-----BEGIN PRIVATE KEY-----\n..." rows={4}
                className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500" />
            </div>

            {settingsMessage && (
              <p className="text-[11px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg">{settingsMessage}</p>
            )}

            <button type="submit" disabled={savingSettings}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all">
              {savingSettings ? 'Saving...' : 'Save Analytics Credentials'}
            </button>
          </form>
        </div>

        {/* Dashboard report */}
        <div className="lg:col-span-2 space-y-6">
          {loadingData ? (
            <div className="flex items-center justify-center py-20 text-gray-600 glass rounded-2xl border border-white/5">
              <RefreshCw size={20} className="animate-spin mr-3" /> Fetching visitor statistics...
            </div>
          ) : errorMsg ? (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm glass">
              {errorMsg}
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Analytics Source Tag */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5">
                <div className="flex items-center gap-2">
                  <LineChart size={16} className="text-cyan-400 animate-pulse" />
                  <span className="text-xs text-gray-400">
                    Source:{' '}
                    <span className="font-semibold text-white">
                      {analytics.isGoogleAnalytics ? 'Google Analytics 4 API' : 'App Internal Database (Fallback)'}
                    </span>
                  </span>
                </div>
                {!analytics.isGaConfigured && (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">Simulated data active</span>
                )}
              </div>

              {/* Grid Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Views" value={analytics.summary.totalViews} icon={Eye} color="#3B82F6" />
                <StatCard label="Unique Visitors" value={analytics.summary.uniqueVisitors} icon={Users} color="#06B6D4" />
                <StatCard label="Sessions" value={analytics.summary.totalSessions} icon={BarChart3} color="#8B5CF6" />
                <StatCard label="Avg Session" value={analytics.summary.avgDuration} icon={Clock} color="#EC4899" />
              </div>

              {/* Trend charts */}
              <div className="glass border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display font-bold text-white text-base">Traffic Over Time</h3>
                    <p className="text-gray-500 text-xs">Visits breakdown (views: solid blue, visitors: dotted cyan)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      {analytics.summary.realtimeVisitors} active users (5m)
                    </span>
                  </div>
                </div>
                <div className="h-40 w-full">
                  {renderTrendsChart(analytics.trends)}
                </div>
                {/* Labels */}
                <div className="flex justify-between text-[10px] text-gray-600 px-3 mt-2">
                  <span>{analytics.trends[0]?.date || 'Start'}</span>
                  <span>{analytics.trends[analytics.trends.length - 1]?.date || 'End'}</span>
                </div>
              </div>

              {/* Lists details */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Top pages */}
                <div className="glass border border-white/5 rounded-2xl p-5">
                  <h4 className="font-display font-bold text-white text-sm mb-4">Most Visited Pages</h4>
                  <div className="space-y-3">
                    {analytics.topPages.map((page, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-mono">{page.path}</span>
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (page.views / (analytics.topPages[0]?.views || 1)) * 100)}%` }} />
                          </div>
                          <span className="text-white font-semibold">{page.views}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Devices & Referrer */}
                <div className="space-y-6">
                  {/* Device breakdown */}
                  <div className="glass border border-white/5 rounded-2xl p-5">
                    <h4 className="font-display font-bold text-white text-sm mb-4">Device Category</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {analytics.devices.map(d => (
                        <div key={d.name} className="text-center p-3 bg-white/3 border border-white/5 rounded-xl">
                          <p className="text-gray-500 text-xs mb-1 capitalize">{d.name}</p>
                          <p className="text-white font-mono font-bold text-lg">{d.percentage}%</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Referrals */}
                  <div className="glass border border-white/5 rounded-2xl p-5">
                    <h4 className="font-display font-bold text-white text-sm mb-4">Top Referrers</h4>
                    <div className="space-y-2.5">
                      {analytics.trafficSources.map((src, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-gray-400 truncate max-w-[160px]">{src.source}</span>
                          <span className="text-white font-mono">{src.count} sessions</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN OVERLAY ────────────────────────────────────────────────────────────
function LoginOverlay({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/settings/verify-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('polyxos_admin_token', data.token);
        onLogin(data.token);
      } else {
        setError(data.error || 'Invalid password.');
      }
    } catch {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-2xl flex items-center justify-center px-4">
      {/* 3D background visual */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <form onSubmit={handleSubmit} className="w-full max-w-md glass border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl relative z-10">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Lock className="text-white" size={24} />
          </div>
          <h1 className="font-display font-black text-2xl text-white">Polyxos Dashboard</h1>
          <p className="text-gray-500 text-xs mt-1">Enter administrative password to proceed</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Dashboard Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm text-center tracking-widest text-white focus:outline-none focus:border-blue-500 transition-colors" />
          </div>

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25">
            {loading ? 'Authenticating...' : 'Unlock Dashboard'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────
export default function Admin() {
  const { logoUrl } = useBrand();
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'contacts' | 'audits' | 'brand' | 'services' | 'portfolio' | 'technologies' | 'analytics'>('contacts');
  
  const [contacts, setContacts]   = useState<Contact[]>([]);
  const [audits, setAudits]       = useState<AuditRequest[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Check token on mount
  useEffect(() => {
    const saved = localStorage.getItem('polyxos_admin_token');
    if (saved) setToken(saved);
  }, []);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [cRes, aRes] = await Promise.all([
        fetch('/api/contacts', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/audits', { headers: { 'Authorization': `Bearer ${token}` } }),
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
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateContactStatus = async (id: number, status: string) => {
    await fetch(`/api/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  };

  const updateAuditStatus = async (id: number, status: string) => {
    await fetch(`/api/audits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    setAudits((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  };

  const deleteContact = async (id: number) => {
    if (!confirm('Delete this contact?')) return;
    await fetch(`/api/contacts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const logout = () => {
    localStorage.removeItem('polyxos_admin_token');
    setToken(null);
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
    { id: 'services' as const, label: 'Services', icon: Briefcase },
    { id: 'portfolio' as const, label: 'Portfolio', icon: Folder },
    { id: 'technologies' as const, label: 'Technologies', icon: Cpu },
    { id: 'brand'    as const, label: 'Brand Assets', icon: Palette },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 }
  ];

  if (!token) {
    return <LoginOverlay onLogin={(t) => setToken(t)} />;
  }

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
            <button onClick={logout}
              className="text-xs text-red-500 hover:text-red-400 transition-colors">Logout</button>
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
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-1 p-1 glass rounded-xl border border-white/5">
            {tabs.map(({ id, label, icon: TabIcon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5
                  ${activeTab === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}>
                {TabIcon && <TabIcon size={13} />}
                {label}
              </button>
            ))}
          </div>

          {!['brand', 'services', 'portfolio', 'technologies', 'analytics'].includes(activeTab) && (
            <div className="relative w-full xl:w-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..." id="admin-search"
                className="pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 rounded-xl outline-none w-full xl:w-64 transition-all focus:ring-2 focus:ring-blue-500/30"
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

        {/* ─── CMS tabs ─── */}
        {activeTab === 'brand' && <BrandTab token={token} />}
        {activeTab === 'services' && <ServicesTab token={token} />}
        {activeTab === 'portfolio' && <PortfolioTab token={token} />}
        {activeTab === 'technologies' && <TechnologiesTab token={token} />}
        {activeTab === 'analytics' && <AnalyticsTab token={token} />}

        {/* ─── Data Tabs ────────────────────────────────────────────── */}
        {!['brand', 'services', 'portfolio', 'technologies', 'analytics'].includes(activeTab) && (
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
