"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { supabase } from "@/lib/still-zone-supabase";
import { getSupportByKey, getTimeByKey } from "@/lib/still-zone-config";
import { useStillZoneContent } from "@/hooks/useStillZoneContent";
import ExperienceTimerCard from "@/components/still-zone/ExperienceTimerCard";
import { Loader2 } from "lucide-react";

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

  const supportType = params.supportType as string;
  const mood = sanitizeParam(searchParams.get('mood'));
  const context = sanitizeParam(searchParams.get('context'));
  const time = sanitizeParam(searchParams.get('time'));

  const supportConfig = getSupportByKey(supportType);
  const timeConfig = time ? getTimeByKey(time) : null;
  const totalDuration = timeConfig ? timeConfig.value * 60 : 60;

  // Fetch content from DB (with hardcoded fallback)
  const { message: dynamicContent, isLoading } = useStillZoneContent({
    mood: mood || '',
    context: context || '',
    supportType: supportType || '',
    timeKey: time || '',
  });

  const contentMessage = dynamicContent?.message
    || supportConfig?.message
    || 'You are stronger than you think. This moment will pass.';
  // Only show heading if admin explicitly set one — no hardcoded fallback
  const contentAction = dynamicContent?.heading || '';
  const contentActionType = supportConfig?.actionType || 'advice';
  const isCombo = dynamicContent?.isCombo || false;
  const comboSecondMessage = dynamicContent?.comboSecondMessage;
  const audioSrc = dynamicContent?.audioSrc;
  const comboFirstAudioSrc = dynamicContent?.comboFirstAudioSrc;
  const comboSecondAudioSrc = dynamicContent?.comboSecondAudioSrc;

  // Save mood entry to DB on page load
  useEffect(() => {
    if (hasSaved.current) return;

    const saveMoodEntry = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !mood || !context || !time || !supportType) return;

        hasSaved.current = true;

        await fetch('/still-zone/api/mood-entry', {
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
      } catch (err) {
        console.error('Failed to save mood entry:', err);
      }
    };

  const handleStartOver = () => {
    router.push('/still-zone');
  };
    saveMoodEntry();
  }, [mood, context, time, supportType, supportConfig]);

  // Save session duration on unmount
  useEffect(() => {
    const saveSessionDuration = async () => {
      const durationSec = Math.round((Date.now() - sessionStartRef.current) / 1000);
      if (durationSec < 2) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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

    return () => { saveSessionDuration(); };
  }, []);

  const handleStartOver = () => router.push('/still-zone');
  const handleTryAnother = () =>
    router.push(`/still-zone/support-selection?mood=${mood}&context=${context}&time=${time}`);
  const handleComplete = () => router.push('/still-zone');

  // Show loading state while fetching content from DB
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(145deg, #f0f4f8 0%, #e8edf5 50%, #f5f3ff 100%)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          <p className="text-sm text-slate-500">Preparing your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-inter flex items-center justify-center"
      style={{
        background: 'linear-gradient(145deg, #f0f4f8 0%, #e8edf5 50%, #f5f3ff 100%)',
        minHeight: '100vh',
      }}
    >
      <main className="w-full flex flex-col items-center justify-center px-4 py-8">
        <ExperienceTimerCard
          message={contentMessage}
          action={contentAction}
          actionType={contentActionType}
          totalDuration={totalDuration}
          isCombo={isCombo}
          comboSecondMessage={comboSecondMessage}
          audioSrc={audioSrc}
          comboFirstAudioSrc={comboFirstAudioSrc}
          comboSecondAudioSrc={comboSecondAudioSrc}
          onTryAnother={handleTryAnother}
          onStartOver={handleStartOver}
          onComplete={handleComplete}
        />
      </main>
    </div>
  );
}
