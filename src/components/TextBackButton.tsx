'use client';

import { useRouter, usePathname } from 'next/navigation';

interface TextBackButtonProps {
  className?: string;
}

export default function TextBackButton({ className }: TextBackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  if (!pathname || pathname === '/') return null;

  return (
    <button
      onClick={() => router.push('/')}
      aria-label="Back to home"
      className={className || ''}
      style={{
        background: 'transparent',
        border: 'none',
        color: 'var(--primary-blue)',
        fontWeight: 600,
        fontSize: '0.95rem',
        cursor: 'pointer',
        padding: '0.5rem 0',
      }}
    >
      ← Back to Home
    </button>
  );
}


