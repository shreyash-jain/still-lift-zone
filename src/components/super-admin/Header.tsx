'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, LogOut, ShieldAlert, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import logoStillliftNew from '@/../public/Logo stilllift new.svg';
import logoStillliftDark from '@/../public/Logo stilllift - dark theme.png';

export default function SuperAdminHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);

    const isLoginPage = pathname === '/super-admin-stillzone/login';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/super-admin-stillzone/api/auth/logout', { method: 'POST' });
            window.location.href = '/super-admin-stillzone/login';
        } catch (e) {
            console.error('Logout failed:', e);
            window.location.href = '/super-admin-stillzone/login';
        }
    };

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            scrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800" : "bg-transparent"
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
                {/* Left: Logo + Title */}
                <Link href="/super-admin-stillzone" className="flex items-center gap-3 group">
                    <div className="relative w-9 h-9 transition-transform group-hover:scale-105">
                        <Image
                            src={logoStillliftNew}
                            alt="Still Lift Logo"
                            fill
                            className="object-contain dark:hidden"
                            priority
                        />
                        <Image
                            src={logoStillliftDark}
                            alt="Still Lift Logo"
                            fill
                            className="object-contain hidden dark:block"
                            priority
                        />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        Still Zone <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs uppercase tracking-wider font-semibold">SuperAdmin</span>
                    </span>
                </Link>

                {/* Right: Hamburger -> Sheet */}
                {!isLoginPage && (
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col h-full">
                            <SheetHeader>
                                <SheetTitle className="text-left flex items-center gap-2">
                                    Admin Menu
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="mt-2 flex flex-col gap-1 flex-1 px-2">
                                <Link
                                    href="/super-admin-stillzone"
                                    onClick={() => setSheetOpen(false)}
                                    className="group flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 border border-transparent bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 group-hover:scale-105">
                                        <ShieldAlert className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium text-[14px]">Dashboard</span>
                                </Link>
                                <Link
                                    href="/super-admin-stillzone/members"
                                    onClick={() => setSheetOpen(false)}
                                    className="group flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 border border-transparent bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:scale-105">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                    </div>
                                    <span className="font-medium text-[14px]">Members</span>
                                </Link>

                                <Link
                                    href="/super-admin-stillzone/content"
                                    onClick={() => setSheetOpen(false)}
                                    className="group flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 border border-transparent bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 group-hover:scale-105">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium text-[14px]">Content</span>
                                </Link>

                                <Link
                                    href="/super-admin-stillzone/plans"
                                    onClick={() => setSheetOpen(false)}
                                    className="group flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 border border-transparent bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 group-hover:scale-105">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                                    </div>
                                    <span className="font-medium text-[14px]">Plans</span>
                                </Link>

                                <div className="mt-auto pb-4">
                                    <div className="mx-3 h-px bg-slate-100 dark:bg-slate-800 my-2" />

                                    <button
                                        onClick={handleLogout}
                                        className="group flex items-center gap-3 w-full text-left px-3 py-2 rounded-xl text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-all duration-200 hover:bg-red-50/50 dark:hover:bg-red-900/10"
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                            <LogOut className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium text-[14px]">Logout</span>
                                    </button>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                )}
            </div>
        </header>
    );
}
