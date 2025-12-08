'use client';

import Image from 'next/image';
import logoStillliftNew from '@/../public/Logo stilllift new.svg';
import logoStillliftDark from '@/../public/Logo stilllift - dark theme.png';
import { useEffect, useState, ReactNode } from 'react';
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler';

declare global {
  interface Window {
    playCurrentActionAudio?: () => void;
  }
}

interface HeaderProps {
  isDarkMode: boolean;
  audioEnabled: boolean;
  screenlessMode: boolean;
  onToggleTheme: () => void;
  onToggleReadAloud: () => void;
  onToggleScreenless: () => void;
  appName?: 'StillLift' | 'Still Zone';
  brandColor?: string;
  showThemeToggle?: boolean;
  customControls?: ReactNode;
}

export default function Header({
  isDarkMode,
  audioEnabled,
  screenlessMode,
  onToggleTheme,
  onToggleReadAloud,
  onToggleScreenless,
  appName = 'StillLift',
  brandColor,
  showThemeToggle = true,
  customControls
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  
  return (
    <header className={`glass-header${scrolled ? ' scrolled' : ''}`}>
      <div className="header-content">
        <div className="logo" aria-label={appName}>
          <Image
            src={isDarkMode ? logoStillliftDark : logoStillliftNew}
            alt={`${appName} logo`}
            width={48}
            height={48}
            priority
          />
          <span className="logo-text font-inter" style={brandColor ? { color: brandColor } : undefined}>
            {appName}
          </span>
        </div>
        <div className="controls" style={{ gap: '0.75rem' }}>
          {customControls || (
            <>
              {showThemeToggle && (
                <AnimatedThemeToggler isDark={isDarkMode} onToggle={onToggleTheme} ariaLabel="Toggle theme" />
              )}
              <button
                onClick={() => {
                  // If there's a global play function available, use it to play current audio
                  if (typeof window !== 'undefined' && window.playCurrentActionAudio) {
                    window.playCurrentActionAudio();
                  } else {
                    // Otherwise toggle audio on/off
                    onToggleReadAloud();
                  }
                }}
                className={`control-btn glass-control ${audioEnabled ? 'active' : ''}`}
                aria-label="Read aloud messages"
              >
                <span className="control-icon">🔊</span>
              </button>
              <button 
                onClick={onToggleScreenless}
                className={`control-btn glass-control ${screenlessMode ? 'active' : ''}`}
                aria-label={screenlessMode ? 'Exit screenless mode' : 'Enter screenless mode'}
              >
                <span className="control-icon" aria-hidden="true">
                  {screenlessMode ? '🙈' : '👁️'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}