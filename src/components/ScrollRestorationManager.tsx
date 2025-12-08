'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function ScrollRestorationManagerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams?.toString();
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('scrollRestoration' in window.history) {
      const original = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';

      return () => {
        window.history.scrollRestoration = original;
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Only scroll on actual pathname changes, not on initial mount
    if (hasScrolledRef.current) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } else {
      hasScrolledRef.current = true;
    }
  }, [pathname, searchString]);

  return null;
}

export default function ScrollRestorationManager() {
  return (
    <Suspense fallback={null}>
      <ScrollRestorationManagerInner />
    </Suspense>
  );
}




