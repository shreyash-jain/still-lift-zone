'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, Save, User, Mail, Loader2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { supabase } from '@/lib/still-zone-supabase';
import { FormFieldWithIcon } from '@/components/still-zone';

// Initial empty state
const INITIAL_USER = {
    name: '',
    email: '',
    phone: '',
    avatarUrl: '',
    bio: ''
};

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(INITIAL_USER);
    // Temporary state for form inputs
    const [formData, setFormData] = useState(INITIAL_USER);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) throw error;

                if (user) {
                    const userData = {
                        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                        email: user.email || '',
                        phone: user.phone || user.user_metadata?.phone || '',
                        avatarUrl: user.user_metadata?.avatar_url || '',
                        bio: user.user_metadata?.bio || 'Finding peace in the daily chaos. 🌱'
                    };
                    setUser(userData);
                    setFormData(userData);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                toast.error('Failed to load profile data');
            }
        };

        fetchUserData();
    }, []);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Update user metadata in Supabase
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: formData.name,
                    bio: formData.bio,
                    phone: formData.phone,
                    // Note: Email updates require a different flow usually (email confirmation), 
                    // so we might not be able to update email this easily just via metadata if it's the auth email.
                    // But for metadata fields it's fine.
                }
            });

            if (error) throw error;

            setUser(formData);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData(user);
        setIsEditing(false);
    };

    const handleAvatarClick = () => {
        if (!isEditing) return;
        toast.info('Avatar upload functionality would open here.');
    };

    return (
        <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-12">
            <div className="space-y-8">


                <Card className="border-slate-200 shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">Personal Information</CardTitle>
                                <CardDescription>Update your photo and personal details.</CardDescription>
                            </div>
                            {!isEditing ? (
                                <Button onClick={() => setIsEditing(true)} variant="outline">
                                    Edit Profile
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" onClick={handleCancel} disabled={isLoading}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} disabled={isLoading} className="gap-2 bg-sky-600 hover:bg-sky-700 text-white">
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="pt-8 space-y-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center sm:flex-row gap-6">
                            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-slate-100 dark:border-slate-800 shadow-sm">
                                    <AvatarImage src={formData.avatarUrl} />
                                    <AvatarFallback className="text-2xl sm:text-4xl bg-sky-100 text-sky-700 font-medium">
                                        {formData.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1 text-center sm:text-left flex-1">
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Profile Photo</h3>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto sm:mx-0">
                                    This will be displayed on your profile.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6 max-w-xl">
                            <FormFieldWithIcon
                                id="name"
                                label="Full Name"
                                value={formData.name}
                                onChange={(value) => setFormData({ ...formData, name: value })}
                                icon={User}
                                placeholder="Enter your name"
                                disabled={!isEditing}
                            />

                            <FormFieldWithIcon
                                id="email"
                                label="Email Address"
                                value={formData.email}
                                onChange={(value) => setFormData({ ...formData, email: value })}
                                icon={Mail}
                                placeholder="Enter your email"
                                disabled={!isEditing}
                                type="email"
                            />

                            <FormFieldWithIcon
                                id="phone"
                                label="Phone Number"
                                value={formData.phone}
                                onChange={(value) => setFormData({ ...formData, phone: value })}
                                icon={Phone}
                                placeholder="Enter your phone number"
                                disabled={!isEditing}
                                type="tel"
                            />

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Input
                                    id="bio"
                                    value={formData.bio}
                                    disabled={!isEditing}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell us a little about yourself"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
