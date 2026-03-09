'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

export default function SuperAdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/super-admin-stillzone/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(((data as Error).message) || 'Login failed');
            }

            router.push('/super-admin-stillzone');
        } catch (err: unknown) {
            setError(((err as Error).message) || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
            {/* Abstract Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-400/10 dark:bg-red-900/10 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob" />
                <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-amber-400/20 dark:bg-amber-900/10 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />
            </div>

            <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 ring-4 ring-white dark:ring-slate-950 shadow-sm">
                        <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">SuperAdmin Portal</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">Secure area for restricted access only.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Admin Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@stillzone.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter master password..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold rounded-lg py-3 transition shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? 'Authenticating...' : 'Access Portal'}
                    </button>
                </form>
            </div>
        </div>
    );
}
