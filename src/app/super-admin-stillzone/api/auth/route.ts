
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const adminEmail = process.env.SUPER_ADMIN_EMAIL;
        const adminPassword = process.env.SUPER_ADMIN_PASSWORD;
        const jwtSecret = process.env.SUPER_ADMIN_JWT_SECRET;

        const missing = [
            !adminEmail && 'SUPER_ADMIN_EMAIL',
            !adminPassword && 'SUPER_ADMIN_PASSWORD',
            !jwtSecret && 'SUPER_ADMIN_JWT_SECRET',
        ].filter(Boolean);

        if (missing.length > 0) {
            return NextResponse.json(
                { message: `Missing env vars on server: ${missing.join(', ')}` },
                { status: 500 }
            );
        }

        if (email === adminEmail && password === adminPassword) {
            // Create token
            const iat = Math.floor(Date.now() / 1000);
            const exp = iat + 60 * 60 * 24; // 24 hours typical session

            const token = await new SignJWT({
                email,
                role: 'superadmin',
            })
                .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
                .setExpirationTime(exp)
                .setIssuedAt(iat)
                .setNotBefore(iat)
                .sign(new TextEncoder().encode(jwtSecret));

            // Build response and set HTTP-only cookie
            const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });

            response.cookies.set({
                name: 'super_admin_session',
                value: token,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24,
                path: '/super-admin-stillzone',
            });

            return response;
        }

        return NextResponse.json(
            { message: 'Invalid credentials' },
            { status: 401 }
        );
    } catch (error: unknown) {
        return NextResponse.json(
            { message: ((error as Error)?.message) || 'Server error' },
            { status: 500 }
        );
    }
}
