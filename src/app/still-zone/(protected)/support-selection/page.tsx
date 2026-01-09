"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Brain, Headphones, Lightbulb, User, BookOpen, Wind } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type SupportType = 'visual-breathing' | 'audio-tool' | 'immediate-advice' | 'havening' | 'nlp-micro' | 'resources';

const SUPPORT_TYPES: { key: SupportType; label: string; icon: React.ElementType; description: string; color: string; bg: string }[] = [
  { key: 'visual-breathing', label: 'Visual Breathing', icon: Wind, description: 'Guided breathing exercises', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  { key: 'audio-tool', label: 'Audio Tool', icon: Headphones, description: 'Calming audio guidance', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { key: 'immediate-advice', label: 'Immediate Advice', icon: Lightbulb, description: 'Quick helpful tips', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { key: 'havening', label: 'Havening Technique', icon: User, description: 'Self-soothing practice', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  { key: 'nlp-micro', label: 'NLP Micro Tool', icon: Brain, description: 'Mental reframing exercises', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  { key: 'resources', label: 'Suggested Resources', icon: BookOpen, description: 'Curated materials', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
];

export default function SupportSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSupport, setSelectedSupport] = useState<SupportType | null>(null);

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
    router.back();
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-12">
      {/* HEADER SECTION */}
      <section className="text-center space-y-3 max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
        >
          What type of support do you need?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 dark:text-slate-400 text-lg"
        >
          Choose the approach that feels right for you, or let us surprise you.
        </motion.p>
      </section>

      {/* SUPPORT GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 align-stretch">
        {SUPPORT_TYPES.map((s) => {
          const selected = selectedSupport === s.key;
          return (
            <motion.button
              key={s.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSupportSelection(s.key)}
              className={cn(
                "group relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-slate-900/60 shadow-sm hover:shadow-xl",
                selected
                  ? "border-teal-500 dark:border-teal-400 ring-4 ring-teal-500/20"
                  : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 duration-300 shadow-sm",
                s.bg,
                s.color
              )}>
                <s.icon className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 text-center leading-tight">{s.label}</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium text-center leading-relaxed line-clamp-2">{s.description}</p>
            </motion.button>
          );
        })}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row-reverse items-center justify-center gap-4 pt-8">
        <Button
          onClick={handleRandomSelection}
          className="w-full sm:w-auto px-8 h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30 gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <span className="text-lg">🎲</span>
          Surprise Me
        </Button>

        <Button
          onClick={handleBackToHome}
          variant="ghost"
          className="w-full sm:w-auto px-8 h-12 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 font-medium gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
    </main>
  );
}
