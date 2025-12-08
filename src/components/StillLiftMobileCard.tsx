"use client";

import { useEffect, useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface StillLiftMobileCardProps {
  message: string;
  actionType: 'ACTION' | 'VISUALIZE' | 'REPEAT';
}

export default function StillLiftMobileCard({ message, actionType }: StillLiftMobileCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { isDarkMode } = useUserPreferences();

  useEffect(() => {
    // Start showing back side (logo) first
    setIsFlipped(false);

    // Trigger flip after delay to show text
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [message, actionType, isDarkMode]);

  return (
    <div className={`flashcard-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className={`flashcard ${isFlipped ? "flipped" : ""}`}>
        <div className="flashcard__front">
          <h3>{actionType || 'ACTION'}</h3>
          <p>{message}</p>
        </div>
        <div className="flashcard__back">
          <img
            src={isDarkMode ? "/Logo stilllift - dark theme.png" : "/Logo stilllift.svg"}
            alt="Still Lift Logo"
            className="flashcard__logo"
          />
        </div>
      </div>
    </div>
  );
}
