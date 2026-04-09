'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
    Search, Mail, Clock, Activity, Star,
    ShieldOff, AlertTriangle, ChevronLeft, ChevronRight, UserCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MoodTrackerGrid, type MoodDailyEntry, type MoodStreakSummary } from '@/components/still-zone/MoodTrackerGrid';

const MoodTrackingGraph = dynamic(
    () => import('@/components/still-zone/MoodTrackingGraph').then((m) => m.MoodTrackingGraph),
    { ssr: false, loading: () => <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Loading chart...</div> }
);

interface DailyActivity {
    date: string;
    tracked: boolean;
    mood?: string | null;
}

interface ToolUsage {
    name: string;
    count: number;
}

interface Member {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    joinDate: string;
    lastLogin: string | null;
    accountStatus: string;
    subscriptionPlan: string;
    billingEnd: string | null;
    provider: string;
    isCurrentlyActive: boolean;
    totalTimeSpentMins: number;
    totalSessions: number;
    avgSessionDurationMins: number;
    toolsUsed: ToolUsage[];
    dailyActivityChart: DailyActivity[];
}

// Map mood keys to emoji
const MOOD_EMOJI: Record<string, string> = {
    good: '😊',
    great: '😄',
    happy: '😁',
    calm: '😌',
    okay: '😐',
    neutral: '😶',
    bad: '😟',
    awful: '😢',
    anxious: '😰',
    angry: '😠',
    sad: '😔',
    curious: '🤔',
    energetic: '⚡',
    tired: '😴',
    stressed: '😖',
    relaxed: '🧘',
};
function getMoodEmoji(mood: string | null | undefined): string | null {
    if (!mood) return null;
    return MOOD_EMOJI[mood.toLowerCase()] || '🙂';
}

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [planFilter, setPlanFilter] = useState('All Plans');
    const [joinedFilter, setJoinedFilter] = useState('All Time');
    const [customDateFrom, setCustomDateFrom] = useState('');
    const [customDateTo, setCustomDateTo] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 10;

    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Remove plan confirmation dialog
    const [confirmMember, setConfirmMember] = useState<Member | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [removeError, setRemoveError] = useState('');
    const [removeSuccess, setRemoveSuccess] = useState('');

    // Activate user dialog
    const [activateMember, setActivateMember] = useState<Member | null>(null);
    const [activateOpen, setActivateOpen] = useState(false);
    const [activating, setActivating] = useState(false);
    const [activateError, setActivateError] = useState('');
    const [activateSuccess, setActivateSuccess] = useState('');

    const router = useRouter();

    const fetchMembers = async (page = currentPage, search = searchTerm) => {
        try {
            setLoading(true);
            setError('');
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', String(itemsPerPage));
            if (search) params.set('search', search);

            const response = await fetch(`/super-admin-stillzone/api/members?${params}`);
            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/super-admin-stillzone/login');
                    return;
                }
                throw new Error('Failed to fetch members data');
            }
            const result = await response.json();
            if (result.success) {
                setMembers(result.data);
                if (result.pagination) {
                    setTotalPages(result.pagination.totalPages);
                    setTotalCount(result.pagination.total);
                }
            } else {
                throw new Error(((result as Error).message));
            }
        } catch (err: unknown) {
            setError(((err as Error).message));
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const prevSearchRef = useRef(debouncedSearch);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Single fetch — reset page when search changes, then fetch
    useEffect(() => {
        const searchChanged = prevSearchRef.current !== debouncedSearch;
        prevSearchRef.current = debouncedSearch;
        const page = searchChanged ? 1 : currentPage;
        if (searchChanged && currentPage !== 1) {
            setCurrentPage(1); // will re-trigger this effect with page=1
            return;
        }
        fetchMembers(page, debouncedSearch);
    }, [currentPage, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

    // Client-side filters for plan and date (search is server-side)
    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const matchesPlan = planFilter === 'All Plans' ||
                member.subscriptionPlan.toLowerCase().includes(planFilter.toLowerCase());

            let matchesJoined = true;
            if (joinedFilter !== 'All Time') {
                const joinDate = new Date(member.joinDate);
                const now = new Date();
                if (joinedFilter === 'Last 24 Hours') {
                    matchesJoined = (now.getTime() - joinDate.getTime()) <= 24 * 60 * 60 * 1000;
                } else if (joinedFilter === 'Last 3 Days') {
                    matchesJoined = (now.getTime() - joinDate.getTime()) <= 3 * 24 * 60 * 60 * 1000;
                } else if (joinedFilter === 'Last 7 Days') {
                    matchesJoined = (now.getTime() - joinDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
                } else if (joinedFilter === 'Last 30 Days') {
                    matchesJoined = (now.getTime() - joinDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
                } else if (joinedFilter === 'Custom Range') {
                    if (customDateFrom) matchesJoined = joinDate >= new Date(customDateFrom);
                    if (customDateTo) matchesJoined = matchesJoined && joinDate <= new Date(customDateTo + 'T23:59:59');
                }
            }

            return matchesPlan && matchesJoined;
        });
    }, [members, planFilter, joinedFilter, customDateFrom, customDateTo]);

    // paginatedMembers is now just filteredMembers (pagination is server-side)
    const paginatedMembers = filteredMembers;

    const handleRowClick = (member: Member) => {
        setSelectedMember(member);
        setSheetOpen(true);
    };

    // Update a single member in state
    const updateMemberInState = (userId: string, changes: Partial<Member>) => {
        setMembers(prev => prev.map(m => m.id === userId ? { ...m, ...changes } : m));
        setSelectedMember(prev => prev?.id === userId ? { ...prev, ...changes } : prev);
    };

    // ── Remove from plan ──────────────────────────────────────
    const openRemoveConfirm = (member: Member) => {
        setConfirmMember(member);
        setRemoveError('');
        setRemoveSuccess('');
        setConfirmOpen(true);
    };

    const handleRemovePlan = async () => {
        if (!confirmMember) return;
        setRemoving(true);
        setRemoveError('');
        setRemoveSuccess('');
        try {
            const res = await fetch('/super-admin-stillzone/api/members/remove-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: confirmMember.id }),
            });
            const result = await res.json();
            if (!result.success) throw new Error(((result as Error).message));

            updateMemberInState(confirmMember.id, {
                subscriptionPlan: 'Free',
                billingEnd: null,
                accountStatus: 'Inactive',
            });

            let msg = ((result as Error).message);
            if (result.razorpayWarnings?.length) msg += ` (Note: ${result.razorpayWarnings[0]})`;
            setRemoveSuccess(msg);
            setTimeout(() => {
                setConfirmOpen(false);
                setConfirmMember(null);
                setRemoveSuccess('');
            }, 2000);
        } catch (err: unknown) {
            setRemoveError(((err as Error).message));
        } finally {
            setRemoving(false);
        }
    };

    // ── Activate user ─────────────────────────────────────────
    const openActivateDialog = (member: Member) => {
        setActivateMember(member);
        setActivateError('');
        setActivateSuccess('');
        setActivateOpen(true);
    };

    const handleActivateUser = async () => {
        if (!activateMember) return;
        setActivating(true);
        setActivateError('');
        setActivateSuccess('');
        try {
            const res = await fetch('/super-admin-stillzone/api/members/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: activateMember.id }),
            });
            const result = await res.json();
            if (!result.success) throw new Error(((result as Error).message));

            updateMemberInState(activateMember.id, { accountStatus: 'Active' });

            setActivateSuccess(((result as Error).message));
            setTimeout(() => {
                setActivateOpen(false);
                setActivateMember(null);
                setActivateSuccess('');
            }, 2000);
        } catch (err: unknown) {
            setActivateError(((err as Error).message));
        } finally {
            setActivating(false);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Shared confirmation dialog component
    const ConfirmDialog = ({
        open, onClose, title, subtitle, infoRows, warning,
        errorMsg, successMsg, loading: busy, confirmLabel, confirmClass,
        onConfirm, icon,
    }: {
        open: boolean; onClose: () => void; title: string; subtitle: string;
        infoRows: { label: string; value: string; valueClass?: string }[];
        warning: string; errorMsg: string; successMsg: string;
        loading: boolean; confirmLabel: string; confirmClass: string;
        onConfirm: () => void; icon: React.ReactNode;
    }) => {
        if (!open) return null;
        return (
            <div
                className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                style={{ zIndex: 99999 }}
                onClick={() => !busy && onClose()}
            >
                <div
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full mx-4 space-y-5"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl shrink-0">{icon}</div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-1.5 text-sm">
                        {infoRows.map(row => (
                            <div key={row.label} className="flex justify-between">
                                <span className="text-slate-500">{row.label}</span>
                                <span className={row.valueClass || 'font-semibold text-slate-800 dark:text-slate-200'}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3">{warning}</p>
                    {errorMsg && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{errorMsg}</p>}
                    {successMsg && <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">✓ {successMsg}</p>}
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" disabled={busy} onClick={onClose}>Cancel</Button>
                        <Button className={`flex-1 ${confirmClass}`} disabled={busy || !!successMsg} onClick={onConfirm}>
                            {busy ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : confirmLabel}
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-8 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            Members
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">
                            Manage and view all registered StillZone users.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center">
                        <span className="font-semibold mr-2">Error:</span> {error}
                        <button onClick={() => fetchMembers()} className="ml-auto underline">Retry</button>
                    </div>
                )}

                {/* Filters and Search */}
                <Card className="border-slate-200 shadow-sm bg-white dark:bg-slate-900">
                    <CardContent className="p-4 space-y-3">
                        {/* Desktop: single row | Mobile: search on top, filters below */}
                        <div className="flex flex-col md:flex-row md:items-end gap-3">
                            {/* Search — stretches on desktop */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Plan + Joined — side-by-side on mobile, inline on desktop */}
                            <div className="grid grid-cols-2 md:flex gap-3">
                                <div className="space-y-1 md:w-44">
                                    <span className="text-xs font-medium text-slate-500">Plan</span>
                                    <div className="relative">
                                        <select
                                            value={planFilter}
                                            onChange={(e) => setPlanFilter(e.target.value)}
                                            className="w-full appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-3 pr-9 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        >
                                            <option value="All Plans">All Plans</option>
                                            <option value="Free">Free</option>
                                            <option value="Mindful">Mindful (Monthly)</option>
                                            <option value="Serenity">Serenity (Yearly)</option>
                                            <option value="Founder">Founder (Lifetime)</option>
                                        </select>
                                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-1 md:w-44">
                                    <span className="text-xs font-medium text-slate-500">Joined</span>
                                    <div className="relative">
                                        <select
                                            value={joinedFilter}
                                            onChange={(e) => setJoinedFilter(e.target.value)}
                                            className="w-full appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-3 pr-9 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        >
                                            <option value="All Time">All Time</option>
                                            <option value="Last 24 Hours">Last 24 Hours</option>
                                            <option value="Last 3 Days">Last 3 Days</option>
                                            <option value="Last 7 Days">Last 7 Days</option>
                                            <option value="Last 30 Days">Last 30 Days</option>
                                            <option value="Custom Range">Custom Range</option>
                                        </select>
                                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Custom date range — full width row */}
                        {joinedFilter === 'Custom Range' && (
                            <div className="grid grid-cols-2 gap-3 animate-in fade-in zoom-in duration-200">
                                <input
                                    title="Start Date"
                                    type="date"
                                    value={customDateFrom}
                                    onChange={(e) => setCustomDateFrom(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    title="End Date"
                                    type="date"
                                    value={customDateTo}
                                    onChange={(e) => setCustomDateTo(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Members Table */}
                <Card className="border-slate-200 shadow-sm bg-white dark:bg-slate-900 overflow-hidden text-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                    <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Member</th>
                                    <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Plan</th>
                                    <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Time Spent</th>
                                    <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Last Login</th>
                                    <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading members...</td>
                                    </tr>
                                ) : paginatedMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No members found matching your criteria.</td>
                                    </tr>
                                ) : (
                                    paginatedMembers.map((member) => (
                                        <tr
                                            key={member.id}
                                            onClick={() => handleRowClick(member)}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0 overflow-hidden">
                                                        {member.avatarUrl ? (
                                                            <img /* eslint-disable-next-line @next/next/no-img-element */  src={member.avatarUrl} alt={member.fullName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            member.fullName.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[150px] sm:max-w-[200px]">{member.fullName}</p>
                                                        <p className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-[200px]">{member.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${member.subscriptionPlan !== 'Free' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500 border-amber-200 dark:border-amber-900/50' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                                                    {member.subscriptionPlan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">{member.totalTimeSpentMins} mins</span>
                                                    <span className="text-xs text-slate-500">{member.totalSessions} sessions</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-2 h-2 rounded-full ${member.isCurrentlyActive ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                                    <span className={`text-xs ${member.isCurrentlyActive ? 'text-green-600 dark:text-green-400 font-medium' : 'text-slate-500'}`}>
                                                        {member.isCurrentlyActive ? 'Online' : 'Offline'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                                                {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {/* FIX 1: Only View button in table — Remove from Plan is side sheet only */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                    onClick={(e) => { e.stopPropagation(); handleRowClick(member); }}
                                                >
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Showing <span className="font-medium text-slate-900 dark:text-slate-100">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-100">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="font-medium text-slate-900 dark:text-slate-100">{totalCount}</span> members
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 gap-1 text-slate-600 dark:text-slate-300"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </Button>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2">
                                    {currentPage} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-8 gap-1 text-slate-600 dark:text-slate-300"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Side Sheet for Member Details */}
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    {selectedMember && (
                        <SheetContent side="right" className="w-[100vw] sm:w-[500px] sm:max-w-[500px] overflow-y-auto outline-none border-l border-slate-200 dark:border-slate-800 p-0 flex flex-col">

                            {/* Header / Basic Info */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 p-6 pt-12 relative flex-shrink-0">
                                <div className="flex items-start gap-5">
                                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
                                        {selectedMember.avatarUrl ? (
                                            <img /* eslint-disable-next-line @next/next/no-img-element */  src={selectedMember.avatarUrl} alt={selectedMember.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            selectedMember.fullName.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                                            {selectedMember.fullName}
                                            {selectedMember.isCurrentlyActive && <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" title="Online now"></div>}
                                        </h2>
                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                                            <Mail className="w-3.5 h-3.5" />
                                            {selectedMember.email}
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            {/* FIX 3: accountStatus badge — shows Inactive when plan removed */}
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${selectedMember.accountStatus === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {selectedMember.accountStatus}
                                            </span>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${selectedMember.subscriptionPlan !== 'Free' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 dark:text-slate-300'}`}>
                                                {selectedMember.subscriptionPlan} Plan
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Content */}
                            <div className="p-6 space-y-8 flex-1">

                                {/* Engagement Stats */}
                                <section>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Engagement Overview</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                            <div className="text-slate-500 mb-1 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Time Spent</div>
                                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{selectedMember.totalTimeSpentMins} <span className="text-sm font-normal text-slate-500">mins</span></div>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                            <div className="text-slate-500 mb-1 flex items-center gap-1.5"><Activity className="w-4 h-4" /> Sessions</div>
                                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{selectedMember.totalSessions}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between text-sm border border-slate-100 dark:border-slate-800">
                                        <span className="text-slate-500">Average Session Duration</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedMember.avgSessionDurationMins} minutes</span>
                                    </div>
                                </section>

                                {/* Account History */}
                                <section>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Account Timeline</h3>
                                    <ul className="space-y-4">
                                        <li className="flex gap-4">
                                            <div className="mt-0.5"><Star className="w-4 h-4 text-amber-500" /></div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Joined StillZone</p>
                                                <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                                                    {formatDate(selectedMember.joinDate)} via
                                                    {selectedMember.provider?.toLowerCase() === 'google' ? (
                                                        <svg className="w-3.5 h-3.5 inline-block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                                    ) : (
                                                        <span>{selectedMember.provider}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </li>
                                        <li className="flex gap-4">
                                            <div className="mt-0.5"><Clock className="w-4 h-4 text-blue-500" /></div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Last Login <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${selectedMember.isCurrentlyActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{selectedMember.isCurrentlyActive ? 'Online' : 'Offline'}</span></p>
                                                <p className="text-xs text-slate-500">{formatDate(selectedMember.lastLogin)}</p>
                                            </div>
                                        </li>
                                    </ul>
                                </section>

                                {/* Tools Usage — Donut Pie Chart */}
                                <section>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Most Used Tools</h3>
                                    {selectedMember.toolsUsed.length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">No tools used yet.</p>
                                    ) : (
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                                            {(() => {
                                                const TOOL_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                                                const total = selectedMember.toolsUsed.reduce((s, t) => s + t.count, 0);
                                                // Build conic gradient stops
                                                let accumulated = 0;
                                                const stops = selectedMember.toolsUsed.map((tool, i) => {
                                                    const pct = (tool.count / total) * 100;
                                                    const start = accumulated;
                                                    accumulated += pct;
                                                    return `${TOOL_COLORS[i % TOOL_COLORS.length]} ${start}% ${accumulated}%`;
                                                });
                                                return (
                                                    <div className="flex items-center gap-6">
                                                        {/* Donut chart */}
                                                        <div className="relative w-28 h-28 shrink-0">
                                                            <div
                                                                className="w-full h-full rounded-full"
                                                                style={{ background: `conic-gradient(${stops.join(', ')})` }}
                                                            />
                                                            <div className="absolute inset-3 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                                                                <div className="text-center">
                                                                    <div className="text-lg font-bold text-slate-900 dark:text-white leading-none">{total}</div>
                                                                    <div className="text-[10px] text-slate-400">total</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Legend */}
                                                        <div className="flex-1 space-y-2">
                                                            {selectedMember.toolsUsed.map((tool, i) => {
                                                                const pct = Math.round((tool.count / total) * 100);
                                                                return (
                                                                    <div key={i} className="flex items-center gap-2">
                                                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: TOOL_COLORS[i % TOOL_COLORS.length] }} />
                                                                        <span className="text-xs text-slate-700 dark:text-slate-300 capitalize flex-1 truncate">{tool.name.replace(/-/g, ' ')}</span>
                                                                        <span className="text-xs font-semibold text-slate-500">{pct}%</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </section>

                                {/* Month-wise Mood Calendar — from join date */}
                                <section>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Mood Tracking</h3>
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                                        {(() => {
                                            const moodEntries: MoodDailyEntry[] = selectedMember.dailyActivityChart.map(d => ({
                                                date: d.date,
                                                mood_type: d.mood || null,
                                                time_key: null,
                                                tracked: d.tracked,
                                                sessions: d.tracked ? 1 : 0,
                                            }));
                                            return (
                                                <MoodTrackerGrid
                                                    dailyData={moodEntries}
                                                    summary={null}
                                                    monthView
                                                    joinDate={selectedMember.joinDate}
                                                />
                                            );
                                        })()}
                                    </div>
                                </section>

                                {/* Mood Journey Graph */}
                                <section>
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                        {(() => {
                                            const moodEntries: MoodDailyEntry[] = selectedMember.dailyActivityChart.map(d => ({
                                                date: d.date,
                                                mood_type: d.mood || null,
                                                time_key: null,
                                                tracked: d.tracked,
                                                sessions: d.tracked ? 1 : 0,
                                            }));

                                            const tracked = moodEntries.filter(d => d.tracked);
                                            const moodCounts: Record<string, number> = {};
                                            tracked.forEach(d => { if (d.mood_type) moodCounts[d.mood_type] = (moodCounts[d.mood_type] || 0) + 1; });
                                            const mostFrequentMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

                                            let currentStreak = 0;
                                            for (let i = moodEntries.length - 1; i >= 0; i--) {
                                                if (moodEntries[i].tracked) currentStreak++;
                                                else break;
                                            }
                                            let bestStreak = 0, tempStreak = 0;
                                            moodEntries.forEach(d => { if (d.tracked) { tempStreak++; bestStreak = Math.max(bestStreak, tempStreak); } else tempStreak = 0; });

                                            const summary: MoodStreakSummary = {
                                                totalDaysTracked: tracked.length,
                                                totalDays: moodEntries.length,
                                                mostFrequentMood,
                                                mostFrequentMoodCount: moodCounts[mostFrequentMood] || 0,
                                                moodDistribution: moodCounts,
                                                bestStreak,
                                                bestStreakStart: '',
                                                bestStreakEnd: '',
                                                currentStreak,
                                            };

                                            return (
                                                <MoodTrackingGraph
                                                    dailyData={moodEntries}
                                                    summary={summary}
                                                />
                                            );
                                        })()}
                                    </div>
                                </section>

                                <div className="pb-2" />

                                {/* Admin Actions Section */}
                                <section className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        Admin Actions
                                    </h3>

                                    {/* FIX 4: Activate User button when Inactive */}
                                    {selectedMember.accountStatus !== 'Active' && (
                                        <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">This user is currently <strong className="text-red-500">Inactive</strong>. You can reactivate their account.</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-green-400 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30 w-full"
                                                onClick={() => openActivateDialog(selectedMember)}
                                            >
                                                <UserCheck className="w-4 h-4 mr-2" />
                                                Activate User
                                            </Button>
                                        </div>
                                    )}

                                    {/* Remove from Plan — only in side sheet */}
                                    <div className="p-3 bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/40 rounded-lg">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Removing a subscription immediately cancels it and revokes all plan benefits.</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-red-300 text-red-600 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 w-full"
                                            onClick={() => openRemoveConfirm(selectedMember)}
                                        >
                                            <ShieldOff className="w-4 h-4 mr-2" />
                                            Remove from Plan
                                        </Button>
                                    </div>
                                </section>

                                <div className="pb-8" />
                            </div>
                        </SheetContent>
                    )}
                </Sheet>
            </main >

            {/* FIX 2: Confirmation dialog at z-[99999] — always above side sheet */}
            < ConfirmDialog
                open={confirmOpen}
                onClose={() => { setConfirmOpen(false); setConfirmMember(null); }
                }
                title="Remove from Plan?"
                subtitle="This action cannot be undone."
                infoRows={
                    [
                        { label: 'Member', value: confirmMember?.fullName || '' },
                        { label: 'Email', value: confirmMember?.email || '' },
                        { label: 'Current Plan', value: confirmMember?.subscriptionPlan || '', valueClass: 'font-bold text-amber-600 dark:text-amber-400' },
                    ]}
                warning="Removing this member from their plan will immediately cancel their subscription and revoke all plan benefits. Their account will be set to Inactive."
                errorMsg={removeError}
                successMsg={removeSuccess}
                loading={removing}
                confirmLabel="Confirm Remove"
                confirmClass="bg-red-600 hover:bg-red-700 text-white border-0"
                onConfirm={handleRemovePlan}
                icon={< AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />}
            />

            < ConfirmDialog
                open={activateOpen}
                onClose={() => { setActivateOpen(false); setActivateMember(null); }}
                title="Activate User?"
                subtitle="This will restore the user's account access."
                infoRows={
                    [
                        { label: 'Member', value: activateMember?.fullName || '' },
                        { label: 'Email', value: activateMember?.email || '' },
                        { label: 'Current Status', value: activateMember?.accountStatus || '', valueClass: 'font-bold text-red-500' },
                    ]}
                warning="Activating this user will restore their account but will NOT automatically reassign a paid plan. You must assign a plan separately if needed."
                errorMsg={activateError}
                successMsg={activateSuccess}
                loading={activating}
                confirmLabel="Confirm Activate"
                confirmClass="bg-green-600 hover:bg-green-700 text-white border-0"
                onConfirm={handleActivateUser}
                icon={< UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />}
            />
        </>
    );
}
