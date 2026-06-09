import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface BrandData {
  logoUrl: string | null;
  faviconUrl: string | null;
}

const BrandContext = createContext<BrandData>({ logoUrl: null, faviconUrl: null });

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<BrandData>({ logoUrl: null, faviconUrl: null });

  useEffect(() => {
    fetch('/api/brand')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const newBrand = {
            logoUrl: data.data.logo.exists ? data.data.logo.url : null,
            faviconUrl: data.data.favicon.exists ? data.data.favicon.url : null,
          };
          setBrand(newBrand);
          
          // Dynamically update favicon if uploaded
          if (newBrand.faviconUrl) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = newBrand.faviconUrl;
          }
        }
      })
      .catch(() => {});
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
