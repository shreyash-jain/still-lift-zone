"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams, useParams } from "next/navigation";

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
