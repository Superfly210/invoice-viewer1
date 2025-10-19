import { useEffect, useRef } from 'react';
import { pdfCache } from '@/utils/pdfCache';
import { supabase } from '@/integrations/supabase/client';

interface PreloadOptions {
  currentIndex: number;
  pdfUrls: (string | null | undefined)[];
  preloadCount?: number;
  enabled?: boolean;
}

export const usePdfPreloader = ({
  currentIndex,
  pdfUrls,
  preloadCount = 2,
  enabled = true,
}: PreloadOptions) => {
  const preloadQueueRef = useRef<Set<string>>(new Set());
  const activePreloadsRef = useRef<Set<string>>(new Set());
  const previousUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!enabled) return;

    // 🎯 Detect if the pdfUrls list changed (filter change)
    const urlsChanged = JSON.stringify(pdfUrls) !== JSON.stringify(previousUrlsRef.current);
    
    if (urlsChanged) {
      console.log('🔄 Filter changed - canceling old preloads');
      // Cancel any in-progress preloads from old filter
      activePreloadsRef.current.clear();
      preloadQueueRef.current.clear();
      previousUrlsRef.current = [...pdfUrls];
    }

    const preloadAdjacentPdfs = async () => {
      const toPreload: Array<{ url: string; priority: number; direction: string }> = [];

      // Preload ahead (higher priority)
      for (let i = 1; i <= preloadCount; i++) {
        const index = currentIndex + i;
        if (index < pdfUrls.length && pdfUrls[index]) {
          toPreload.push({
            url: pdfUrls[index]!,
            priority: i,
            direction: `+${i}`,
          });
        }
      }

      // Preload behind (lower priority)
      for (let i = 1; i <= preloadCount; i++) {
        const index = currentIndex - i;
        if (index >= 0 && pdfUrls[index]) {
          toPreload.push({
            url: pdfUrls[index]!,
            priority: preloadCount + i,
            direction: `-${i}`,
          });
        }
      }

      toPreload.sort((a, b) => a.priority - b.priority);

      console.log(
        `📦 Preload queue [index ${currentIndex}/${pdfUrls.length - 1}]:`,
        toPreload.map(p => `${p.direction} (priority ${p.priority})`).join(', ')
      );

      // Preload with staggered timing
      for (let i = 0; i < toPreload.length; i++) {
        const { url, direction } = toPreload[i];
        
        if (activePreloadsRef.current.has(url) || preloadQueueRef.current.has(url)) {
          continue;
        }

        const delay = i === 0 ? 0 : i * 500;
        
        setTimeout(() => {
          // Check if still enabled (user might have navigated away)
          if (enabled && pdfUrls.includes(url)) {
            preloadPdf(url, direction);
          }
        }, delay);
      }
    };

    const preloadPdf = async (url: string, direction: string) => {
      const cleanUrl = url.trim();

      if (!isGoogleDriveUrl(cleanUrl)) {
        return;
      }

      // Check cache first
      try {
        const cachedBlob = await pdfCache.get(cleanUrl);
        if (cachedBlob) {
          console.log(`✓ PDF ${direction} already cached`);
          return;
        }
      } catch (error) {
        console.warn('Cache check failed:', error);
      }

      activePreloadsRef.current.add(cleanUrl);
      preloadQueueRef.current.add(cleanUrl);

      console.log(`⬇️ Preloading PDF ${direction}...`);

      try {
        const { data: { session } } = await supabase.auth.getSession();

        const response = await fetch(
          import.meta.env.VITE_SUPABASE_URL + '/functions/v1/pdf-proxy',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token || ''}`,
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ url: cleanUrl }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to preload: ${response.status}`);
        }

        const blob = await response.blob();
        await pdfCache.set(cleanUrl, blob);
        
        console.log(
          `✅ PDF ${direction} preloaded (${(blob.size / 1024 / 1024).toFixed(2)} MB)`
        );
      } catch (error) {
        console.warn(`❌ Failed to preload PDF ${direction}:`, error);
      } finally {
        activePreloadsRef.current.delete(cleanUrl);
        preloadQueueRef.current.delete(cleanUrl);
      }
    };

    preloadAdjacentPdfs();

    return () => {
      activePreloadsRef.current.clear();
      preloadQueueRef.current.clear();
    };
  }, [currentIndex, pdfUrls, preloadCount, enabled]);
};

const isGoogleDriveUrl = (url: string): boolean => {
  return url?.includes('drive.google.com') || false;
};
