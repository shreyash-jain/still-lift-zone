"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { useRouter, useSearchParams } from "next/navigation";

type SupportType = 'visual-breathing' | 'audio-tool' | 'immediate-advice' | 'havening' | 'nlp-micro' | 'resources';

const SUPPORT_TYPES: { key: SupportType; label: string; emoji: string; description: string }[] = [
  { key: 'visual-breathing', label: 'Visual Breathing', emoji: '🌬️', description: 'Guided breathing exercises' },
  { key: 'audio-tool', label: 'Audio Tool', emoji: '🎧', description: 'Calming audio guidance' },
  { key: 'immediate-advice', label: 'Immediate Advice', emoji: '💡', description: 'Quick helpful tips' },
  { key: 'havening', label: 'Havening Technique', emoji: '🤲', description: 'Self-soothing practice' },
  { key: 'nlp-micro', label: 'NLP Micro Tool', emoji: '🧠', description: 'Mental reframing exercises' },
  { key: 'resources', label: 'Suggested Resources', emoji: '📚', description: 'Curated materials' },
];

export default function SupportSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSupport, setSelectedSupport] = useState<SupportType | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [screenlessMode, setScreenlessMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const supportButtonsRef = useRef<HTMLDivElement>(null);

  // Get user selections from URL params
  const mood = searchParams.get('mood');
  const context = searchParams.get('context');
  const time = searchParams.get('time');

  const handleSupportSelection = (supportType: SupportType) => {
    setSelectedSupport(supportType);
    // Navigate to the selected support experience
    setTimeout(() => {
      router.push(`/still-zone/experience/${supportType}?mood=${mood}&context=${context}&time=${time}`);
    }, 500);
  };

  const handleRandomSelection = () => {
    const randomIndex = Math.floor(Math.random() * SUPPORT_TYPES.length);
    const randomSupport = SUPPORT_TYPES[randomIndex].key;
    setSelectedSupport(randomSupport);
    
    // Navigate to random support experience
    setTimeout(() => {
      router.push(`/still-zone/experience/${randomSupport}?mood=${mood}&context=${context}&time=${time}`);
    }, 500);
  };

  const handleBackToHome = () => {
    router.push('/still-zone/home');
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
      <main className="flex-1 flex flex-col" style={{ position: 'relative', zIndex: 10 }}>
        <section className="screen active">
          <div className="container">
            {/* Instructions Section */}
            <div className="instructions-section">
              <h1 
                className="instruction-text"
                style={{
                  backgroundImage: 'linear-gradient(to right, rgb(13, 148, 136), rgb(16, 185, 129))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block',
                  width: '100%'
                }}
              >
                What type of support do you need?
              </h1>
              <p className="instruction-subtext">
                Choose the approach that feels right for you, or let us surprise you.
              </p>
            </div>

            {/* Support Types Grid */}
            <div className="support-selection-container">
              <div className="support-buttons" ref={supportButtonsRef}>
                {SUPPORT_TYPES.map((s) => {
                  const selected = selectedSupport === s.key;
                  return (
                    <button
                      key={s.key}
                      className={`support-btn glass-card ${selected ? 'selected' : s.key}`}
                      onClick={() => handleSupportSelection(s.key)}
                      data-support={s.key}
                      aria-pressed={selected}
                    >
                      <div className="support-content">
                        <span className="support-emoji">{s.emoji}</span>
                        <span className="support-text font-inter font-medium">{s.label}</span>
                        <span className="support-description font-inter text-sm">{s.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Random Selection Button */}
              <div className="random-selection-container">
                <button
                  onClick={handleRandomSelection}
                  className="random-btn glass-card"
                  aria-label="Give me a random support type"
                >
                  <span className="random-icon">🎲</span>
                  <span className="random-text font-inter font-semibold">Give it to me randomly</span>
                </button>
              </div>

              {/* Back Button */}
              <div className="back-button-container">
                <button 
                  onClick={handleBackToHome}
                  className="back-button-support glass-card"
                  aria-label="Go back to mood selection"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-inter font-medium">Back</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
