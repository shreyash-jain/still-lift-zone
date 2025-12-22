// auth-utils.ts

import { supabase } from '@/lib/still-zone-supabase';

export enum TokenKey {
    access_token = 'access_token',
    refresh_token = 'refresh_token',
}

export function setAuthorizationCookie(key: TokenKey, value: string) {
    const date = new Date();
    date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    // SameSite=Lax zaroori hai redirect ke baad cookie set hone ke liye
    const expires = '; expires=' + date.toUTCString();
    document.cookie = key + '=' + (value || '') + expires + '; path=/; SameSite=Lax; Secure';
}

// Ye naya function add karo logout ke liye
export function removeAuthorizationCookie(key: TokenKey) {
    document.cookie = key + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


export function getReturnUrl(): string {
    return '/still-zone/dashboard';
}
/**
 * Checks if a user with the given email exists in the system.
 * Uses the profiles table as a proxy for user existence.
 */
export async function checkUserExists(email: string): Promise<boolean> {
    try {
        // Use the secure RPC function to check existence bypassing RLS
        const { data, error } = await supabase.rpc('check_email_exists', {
            email_address: email
        });

        if (error) {
            console.warn('Error checking user existence via RPC:', error);
            // Fallback: If RPC fails (e.g. not created yet), return false to allow flow to proceed 
            // (Standard auth will handle 'user not found' or 'user already exists' eventually)
            return false;
        }

        return !!data;
    } catch (e) {
        console.error('Unexpected error checking user:', e);
        return false;
    }
}