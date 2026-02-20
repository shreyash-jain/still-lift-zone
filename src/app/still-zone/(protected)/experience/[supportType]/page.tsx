"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { supabase } from "@/lib/still-zone-supabase";
import { getSupportByKey } from "@/lib/still-zone-config";
import ActionRevealCard from "@/components/ActionRevealCard";

// Sanitize URL params — treat "null"/"undefined"/empty as missing
function sanitizeParam(val: string | null): string | null {
  if (!val || val === 'null' || val === 'undefined' || val.trim() === '') return null;
  return val.trim();
}

export default function StillZoneExperiencePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const hasSaved = useRef(false);
  const sessionStartRef = useRef<number>(Date.now());

  // Get and sanitize parameters
  const supportType = params.supportType as string;
  const mood = sanitizeParam(searchParams.get('mood'));
  const context = sanitizeParam(searchParams.get('context'));
  const time = sanitizeParam(searchParams.get('time'));

  // Get support content from config (dynamic, not hardcoded)
  const supportConfig = getSupportByKey(supportType);
  const supportContent = supportConfig
    ? { message: supportConfig.message, action: supportConfig.action, actionType: supportConfig.actionType }
    : { message: 'You are stronger than you think. This moment will pass.', action: 'Remember: One step at a time', actionType: 'advice' };

  // Save mood entry to DB on page load (only if ALL 4 selections are valid)
  useEffect(() => {
    if (hasSaved.current) return;

    const saveMoodEntry = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // Only save if ALL params are valid — prevent saving "null" strings
        if (!user || !mood || !context || !time || !supportType) {
          console.warn('Skipping mood entry save — missing or invalid params:', { mood, context, time, supportType });
          return;
        }

        hasSaved.current = true;

        const res = await fetch('/still-zone/api/mood-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            moodKey: mood,
            contextKey: context,
            timeKey: time,
            supportKey: supportType,
            audioKey: supportConfig?.audioKey || null,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('Mood entry save failed:', errData);
        }
      } catch (err) {
        console.error('Failed to save mood entry:', err);
      }
    };

    saveMoodEntry();
  }, [mood, context, time, supportType, supportConfig]);

  // Track actual session duration — save on page leave
  useEffect(() => {
    const saveSessionDuration = async () => {
      const durationSec = Math.round((Date.now() - sessionStartRef.current) / 1000);
      if (durationSec < 2) return; // Ignore accidental quick visits

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Update today's entry with actual duration spent
        await fetch('/still-zone/api/mood-entry', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            sessionDurationSec: durationSec,
          }),
        });
      } catch {
        // Silent fail on unmount
      }
    };

    // Save duration when user leaves
    return () => {
      saveSessionDuration();
    };
  }, []);

  const handleStartOver = () => {
    router.push('/still-zone/home');
  };

  const handleTryAnother = () => {
    router.push(`/still-zone/support-selection?mood=${mood}&context=${context}&time=${time}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-inter">
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
