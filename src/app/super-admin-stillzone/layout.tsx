import React from 'react';
import type { Metadata } from 'next';
import Background from '@/components/Background';
import SuperAdminSidebar from '@/components/super-admin/Sidebar';

export const metadata: Metadata = {
    title: {
        default: 'Superadmin Portal',
        template: 'Superadmin Portal',
    },
    description: 'Super Admin Dashboard for monitoring StillZone operations.',
};

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300 relative text-slate-900 dark:text-slate-50 font-sans">
            <Background />
            <SuperAdminSidebar />
            {/*
              Sidebar is fixed: 260px wide on lg+, top mobile bar otherwise.
              Children get a left offset on lg+ and a top offset on mobile to clear them.
            */}
            <div className="relative lg:pl-[260px]">
                <div className="pt-14 lg:pt-0">{children}</div>
            </div>
        </div>
    );
}
