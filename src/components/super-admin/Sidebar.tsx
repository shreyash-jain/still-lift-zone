'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileText,
    CreditCard,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logoStillliftNew from '@/../public/Logo stilllift new.svg';

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    /** Tailwind colour key used for the active accent (text + soft tint background) */
    accent: 'violet' | 'blue' | 'teal' | 'amber';
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', href: '/super-admin-stillzone', icon: LayoutDashboard, accent: 'violet' },
    { label: 'Members', href: '/super-admin-stillzone/members', icon: Users, accent: 'blue' },
    { label: 'Content', href: '/super-admin-stillzone/content', icon: FileText, accent: 'teal' },
    { label: 'Plans', href: '/super-admin-stillzone/plans', icon: CreditCard, accent: 'amber' },
];

const ACCENT_STYLES: Record<NavItem['accent'], { active: string; idle: string }> = {
    violet: {
        active: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/70 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20',
        idle: 'text-violet-500 dark:text-violet-400',
    },
    blue: {
        active: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/70 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20',
        idle: 'text-blue-500 dark:text-blue-400',
    },
    teal: {
        active: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200/70 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-400/20',
        idle: 'text-teal-500 dark:text-teal-400',
    },
    amber: {
        active: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
        idle: 'text-amber-600 dark:text-amber-400',
    },
};

function isActive(pathname: string, href: string): boolean {
    if (href === '/super-admin-stillzone') return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarBodyProps {
    pathname: string;
    onNavigate?: () => void;
    onLogout: () => void;
}

function SidebarBody({ pathname, onNavigate, onLogout }: SidebarBodyProps) {
    return (
        <div className="flex h-full flex-col">
            {/* Brand */}
            <Link
                href="/super-admin-stillzone"
                onClick={onNavigate}
                className="group flex items-center gap-3 px-5 pt-6 pb-5"
            >
                <div className="relative h-10 w-10 shrink-0 transition-transform group-hover:scale-105">
                    <Image src={logoStillliftNew} alt="Still Lift" fill className="object-contain" priority />
                </div>
                <div className="flex flex-col leading-tight">
                    <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                        Still Zone
                    </span>
                    <span className="mt-0.5 inline-flex w-fit items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-600 ring-1 ring-red-100 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20">
                        SuperAdmin
                    </span>
                </div>
            </Link>

            <div className="mx-4 mb-3 h-px bg-slate-100 dark:bg-slate-800" />

            {/* Section label */}
            <p className="px-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                Workspace
            </p>

            {/* Nav */}
            <nav className="mt-2 flex-1 space-y-1 px-3">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(pathname, item.href);
                    const styles = ACCENT_STYLES[item.accent];

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                                active
                                    ? styles.active
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white',
                            )}
                        >
                            {/* Active indicator bar */}
                            {active && (
                                <span
                                    className={cn(
                                        'absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full',
                                        item.accent === 'violet' && 'bg-violet-500',
                                        item.accent === 'blue' && 'bg-blue-500',
                                        item.accent === 'teal' && 'bg-teal-500',
                                        item.accent === 'amber' && 'bg-amber-500',
                                    )}
                                />
                            )}
                            <Icon
                                className={cn(
                                    'h-[18px] w-[18px] shrink-0 transition-colors',
                                    active ? '' : styles.idle,
                                )}
                            />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / logout */}
            <div className="mt-2 border-t border-slate-100 px-3 py-3 dark:border-slate-800">
                <button
                    onClick={onLogout}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                    <LogOut className="h-[18px] w-[18px] shrink-0 transition-colors group-hover:text-red-500" />
                    Logout
                </button>
            </div>
        </div>
    );
}

export default function SuperAdminSidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isLoginPage = pathname === '/super-admin-stillzone/login';

    const handleLogout = async () => {
        try {
            await fetch('/super-admin-stillzone/api/auth/logout', { method: 'POST' });
            window.location.href = '/super-admin-stillzone/login';
        } catch (e) {
            console.error('Logout failed:', e);
            window.location.href = '/super-admin-stillzone/login';
        }
    };

    if (isLoginPage) return null;

    return (
        <>
            {/* Desktop: persistent left sidebar */}
            <aside
                aria-label="Admin sidebar"
                className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] border-r border-slate-200/80 bg-white/85 backdrop-blur-md shadow-[1px_0_0_0_rgba(15,23,42,0.02)] dark:border-slate-800 dark:bg-slate-950/80 lg:block"
            >
                <SidebarBody pathname={pathname} onLogout={handleLogout} />
            </aside>

            {/* Mobile: top bar with hamburger */}
            <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 lg:hidden">
                <Link href="/super-admin-stillzone" className="flex items-center gap-2.5">
                    <div className="relative h-8 w-8">
                        <Image src={logoStillliftNew} alt="Still Lift" fill className="object-contain" priority />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                        Still Zone
                        <span className="ml-1.5 rounded-full bg-red-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-red-600 ring-1 ring-red-100 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20">
                            Admin
                        </span>
                    </span>
                </Link>
                <button
                    onClick={() => setMobileOpen(true)}
                    className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    aria-label="Open menu"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* Mobile drawer */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside
                        aria-label="Admin sidebar"
                        className="fixed left-0 top-0 z-50 h-screen w-[280px] border-r border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 lg:hidden"
                    >
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                            aria-label="Close menu"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <SidebarBody
                            pathname={pathname}
                            onNavigate={() => setMobileOpen(false)}
                            onLogout={handleLogout}
                        />
                    </aside>
                </>
            )}
        </>
    );
}
