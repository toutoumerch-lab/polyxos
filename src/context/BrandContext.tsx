import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface BrandData {
  logoUrl: string | null;
  faviconUrl: string | null;
  settings: Record<string, string>;
}

const CACHE_KEY = 'polyxos_brand_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const FETCH_TIMEOUT = 4000; // 4 seconds max wait for API

/** Read cache from localStorage (returns null if stale or missing) */
function readCache(): BrandData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw) as { data: BrandData; ts: number };
    if (Date.now() - ts > CACHE_TTL) return null; // stale
    return data;
  } catch {
    return null;
  }
}

/** Persist to localStorage */
function writeCache(data: BrandData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* storage quota — ignore */ }
}

/** Apply favicon to the document */
function applyFavicon(url: string | null) {
  if (!url) return;
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}

const DEFAULT_SETTINGS: Record<string, string> = {
  ga4_measurement_id: '',
  contact_email: '',
  contact_phone: '',
  contact_location: '',
  social_github: '',
  social_twitter: '',
  social_linkedin: '',
  social_instagram: ''
};

const DEFAULT: BrandData = { logoUrl: null, faviconUrl: null, settings: DEFAULT_SETTINGS };
const BrandContext = createContext<BrandData>(DEFAULT);

export function BrandProvider({ children }: { children: ReactNode }) {
  // Initialise from cache synchronously — no layout flash
  const [brand, setBrand] = useState<BrandData>(() => readCache() ?? DEFAULT);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    (async () => {
      try {
        const [brandRes, settingsRes] = await Promise.all([
          fetch('/api/brand', { signal: controller.signal }),
          fetch('/api/settings', { signal: controller.signal })
        ]);

        if (!brandRes.ok || !settingsRes.ok) return;
        const [brandJson, settingsJson] = await Promise.all([
          brandRes.json(),
          settingsRes.json()
        ]);

        if (cancelled || !brandJson.success || !settingsJson.success) return;

        const fresh: BrandData = {
          logoUrl:    brandJson.data.logo?.exists    ? brandJson.data.logo.url    : null,
          faviconUrl: brandJson.data.favicon?.exists ? brandJson.data.favicon.url : null,
          settings:   settingsJson.data || DEFAULT_SETTINGS
        };

        // Only update state & cache when something actually changed
        setBrand(prev => {
          if (
            prev.logoUrl === fresh.logoUrl &&
            prev.faviconUrl === fresh.faviconUrl &&
            JSON.stringify(prev.settings) === JSON.stringify(fresh.settings)
          ) {
            return prev;
          }
          writeCache(fresh);
          applyFavicon(fresh.faviconUrl);
          return fresh;
        });
      } catch {
        // Timeout or network error — keep whatever is in state (cache or default)
      } finally {
        clearTimeout(timer);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, []);

  return (
    <BrandContext.Provider value={brand}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}

/** Call this from the Admin after a successful upload to immediately bust the cache */
export function invalidateBrandCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}
