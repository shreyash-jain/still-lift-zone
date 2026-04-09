'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, BarChart3, User, LogOut, Home, CreditCard } from 'lucide-react';
import { Menu, BarChart3, User, Settings, LogOut, Home, CreditCard, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/lib/still-zone-supabase';
import { toast } from 'sonner';
import { TokenKey, removeAuthorizationCookie } from '@/lib/auth-utils';
import logoStillliftNew from '@/../public/Logo stilllift new.svg';
import logoStillliftDark from '@/../public/Logo stilllift - dark theme.png';

export default function StillZoneHeader() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            removeAuthorizationCookie(TokenKey.access_token);
            removeAuthorizationCookie(TokenKey.refresh_token);
            const { error } = await supabase.auth.signOut();
            if (error) console.error('Error signing out:', error);
            router.replace('/still-zone/login');
            toast.success('Logged out successfully');
        } catch (e) {
            console.error('Logout failed:', e);
            router.replace('/still-zone/login');
        }
    };

    const navItems = [
        { label: 'Home', icon: Home, href: '/still-zone', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/40' },
        { label: 'Dashboard', icon: BarChart3, href: '/still-zone/dashboard', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/40' },
        { label: 'Journal', icon: BookOpen, href: '/still-zone/journal', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/40' },
        { label: 'Active Plan', icon: CreditCard, href: '/still-zone/my-plan', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
        { label: 'Profile', icon: User, href: '/still-zone/profile', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40' },
    ];

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            scrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800" : "bg-transparent"
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
                {/* Left: Logo + Title */}
                <Link href="/still-zone/dashboard" className="flex items-center gap-3 group">
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
                    <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                        Still Zone
                    </span>
                </Link>

                {/* Right: Hamburger -> Sheet */}
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
                                Menu
                            </SheetTitle>
                        </SheetHeader>
                        <nav className="mt-2 flex flex-col gap-1 flex-1 px-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setSheetOpen(false)}
                                    className="group flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                                >
                                    <div className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 border border-transparent group-hover:scale-105",
                                        item.bg,
                                        item.color
                                    )}>
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium text-[14px]">{item.label}</span>
                                </Link>
                            ))}

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
            </div>
        </header>
    );
}
