'use client';

import { useEffect, useState, useRef } from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    
    setMounted(true);
    
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="light-mode">{children}</div>;
  }

  return <>{children}</>;
} 