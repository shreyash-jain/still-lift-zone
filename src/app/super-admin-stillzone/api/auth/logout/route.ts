
import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

    // Clear the super admin session cookie with the exact same path
    response.cookies.set({
        name: 'super_admin_session',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // expire immediately
        path: '/super-admin-stillzone',
    });

    return response;
}
