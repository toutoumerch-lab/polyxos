import { useEffect, useState } from 'react';

/**
 * Shared site-logo store. The uploaded logo (a data URL) is fetched once from
 * the API and cached at module scope, so every <Logo /> instance — navbar,
 * footer, admin — reflects the same value and updates together when the admin
 * uploads or removes a logo via `setSiteLogo`.
 */

// undefined = not fetched yet, null = fetched but no custom logo, string = data URL
let cache: string | null | undefined;
let inflight: Promise<void> | null = null;
const listeners = new Set<(v: string | null) => void>();

function notify() {
  for (const listener of listeners) listener(cache ?? null);
}

function load(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch('/api/settings/logo');
      const data = await res.json();
      cache = data?.data?.logo ?? null;
    } catch {
      cache = null;
    } finally {
      notify();
    }
  })();
  return inflight;
}

/** Update the cached logo everywhere (call after a successful upload/remove). */
export function setSiteLogo(value: string | null) {
  cache = value;
  notify();
}

export function useSiteLogo() {
  const [logo, setLogo] = useState<string | null>(cache ?? null);
  const [loading, setLoading] = useState(cache === undefined);

  useEffect(() => {
    const listener = (v: string | null) => {
      setLogo(v);
      setLoading(false);
    };
    listeners.add(listener);

    if (cache === undefined) {
      load();
    } else {
      setLoading(false);
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { logo, loading };
}
