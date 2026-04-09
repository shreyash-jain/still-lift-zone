'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlansPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/still-zone/my-plan');
  }, [router]);

  return null;
}
