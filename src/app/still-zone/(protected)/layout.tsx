'use client';

import AuthWrapper from '@/components/AuthWrapper';
import StillZoneHeader from '@/components/still-zone/Header';
import Background from '@/components/Background';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthWrapper>
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
                <Background />
                <StillZoneHeader />
                {children}
            </div>
        </AuthWrapper>
    );
}
