"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Header from "@/components/Header";
import ActionRevealCard from "@/components/ActionRevealCard";

// Support type messages
const SUPPORT_MESSAGES: Record<string, { message: string; action: string; actionType: string }> = {
  'visual-breathing': {
    message: 'Take a deep breath. Inhale calm, exhale tension.',
    action: 'Practice deep breathing for 2 minutes',
    actionType: 'breathing',
  },
  'audio-tool': {
    message: 'Listen mindfully. Let the sounds guide you to peace.',
    action: 'Listen to calming audio guidance',
    actionType: 'audio',
  },
  'immediate-advice': {
    message: 'You are stronger than you think. This moment will pass.',
    action: 'Remember: One step at a time',
    actionType: 'advice',
  },
  'havening': {
    message: 'Gently touch your arms. Feel safe and grounded.',
    action: 'Practice havening technique for comfort',
    actionType: 'havening',
  },
  'nlp-micro': {
    message: 'Reframe this thought: What would my best self say?',
    action: 'Challenge and reframe your current thought',
    actionType: 'nlp',
  },
  'resources': {
    message: 'Knowledge is power. Explore resources that can help.',
    action: 'Discover helpful articles and tools',
    actionType: 'resources',
  },
};

export default function StillZoneExperiencePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [screenlessMode, setScreenlessMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Get parameters
  const supportType = params.supportType as string;
  const mood = searchParams.get('mood');
  const context = searchParams.get('context');
  const time = searchParams.get('time');

  const supportContent = SUPPORT_MESSAGES[supportType] || SUPPORT_MESSAGES['immediate-advice'];

  const handleStartOver = () => {
    router.push('/still-zone/home');
  };

  const handleTryAnother = () => {
    router.push(`/still-zone/support-selection?mood=${mood}&context=${context}&time=${time}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-inter">
      {/* Background gradient - Still Zone teal theme */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, #f0fdfa 0%, rgba(207, 250, 254, 0.3) 50%, rgba(240, 253, 250, 0.5) 100%)',
          zIndex: 0
        }}
      />
      
      {/* Subtle background glows */}
      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 1 }}>
        <motion.div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'rgba(0, 72, 81, 0.2)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6, scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-24 -right-16 w-[28rem] h-[28rem] rounded-full blur-3xl"
          style={{ background: 'rgba(0, 107, 122, 0.15)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5, scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* NAVBAR */}
      <Header
        isDarkMode={isDarkMode}
        audioEnabled={audioEnabled}
        screenlessMode={screenlessMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onToggleReadAloud={() => setAudioEnabled(!audioEnabled)}
        onToggleScreenless={() => setScreenlessMode(!screenlessMode)}
        appName="Still Zone"
        brandColor="#004851"
        showThemeToggle={false}
        customControls={
          <>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`control-btn glass-control ${audioEnabled ? 'active' : ''}`}
              aria-label="Toggle audio"
            >
              <span className="control-icon">🔊</span>
            </button>
            <button
              onClick={() => setScreenlessMode(!screenlessMode)}
              className={`control-btn glass-control ${screenlessMode ? 'active' : ''}`}
              aria-label={screenlessMode ? 'Exit screenless mode' : 'Enter screenless mode'}
            >
              <span className="control-icon" aria-hidden="true">
                {screenlessMode ? '🙈' : '👁️'}
              </span>
            </button>
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((v) => !v)}
              className={`control-btn glass-control ${menuOpen ? 'active' : ''}`}
            >
              <span className="control-icon" aria-hidden="true">
                {menuOpen ? '✕' : '☰'}
              </span>
            </button>
          </>
        }
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-center" style={{ position: 'relative', zIndex: 10, minHeight: 'calc(100vh - 80px)' }}>
        <div className="container max-w-4xl mx-auto px-4">
          {/* Action Reveal Card */}
          <ActionRevealCard
            message={supportContent.message}
            action={supportContent.action}
            actionType={supportContent.actionType}
            onStartOver={handleStartOver}
            onTryAnother={handleTryAnother}
            showCard={true}
            isEmerging={false}
            isFullyRevealed={true}
            isStatic={true}
          />
        </div>
      </main>
    </div>
  );
}
