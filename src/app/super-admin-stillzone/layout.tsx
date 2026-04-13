import React from 'react';
import type { Metadata } from 'next';
import Background from '@/components/Background';
import SuperAdminHeader from '@/components/super-admin/Header';

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
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden text-slate-900 dark:text-slate-50 flex flex-col font-sans">
            <Background />
            <SuperAdminHeader />
            {/* 
        Header is fixed and transparent, content needs to have pt-24 similarly to 
        the standard still-zone layout components. 
      */}
            {children}
        </div>
    );
}
