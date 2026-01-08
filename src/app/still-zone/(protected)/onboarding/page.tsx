'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/still-zone-supabase';
import { toast } from 'sonner';

function OnboardingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialName = searchParams.get('name') || '';

    const [name, setName] = useState(initialName);
    const [isLoading, setIsLoading] = useState(false);

    const handleCompleteOnboarding = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("No user found. Please login again.");
                router.push('/still-zone/login');
                return;
            }

            // Update profile
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: name,
                    is_onboarded: true
                })
                .eq('id', user.id);

            if (error) {
                console.error('Error updating profile:', error);
                toast.error("Failed to update profile. Please try again.");
                return;
            }

            toast.success("Welcome aboard!");
            router.push('/still-zone/dashboard');
        } catch (error) {
            console.error('Unexpected error:', error);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome!</h1>
                    <p className="text-gray-500">Let&apos;s set up your profile to get started.</p>
                </div>

                <form onSubmit={handleCompleteOnboarding} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#006B7A] hover:bg-[#005561]"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Setting up...' : 'Get Started'}
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OnboardingContent />
        </Suspense>
    );
}
