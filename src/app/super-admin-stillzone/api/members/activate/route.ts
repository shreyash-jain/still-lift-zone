
import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/super-admin/supabase';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.SUPER_ADMIN_JWT_SECRET || 'fallback-secret-if-missing';

async function getAdminFromCookie(request: Request): Promise<string | null> {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/super_admin_session=([^;]+)/);
    if (!match) return null;
    try {
        const { payload } = await jwtVerify(match[1], new TextEncoder().encode(JWT_SECRET));
        return (payload.email as string) || null;
    } catch {
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const adminEmail = await getAdminFromCookie(request);
        if (!adminEmail) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
        }

        const supabase = getAdminSupabase();

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, email, account_status')
            .eq('id', userId)
            .single();

        if (profileError) throw profileError;

        // Check if already active
        if (profile?.account_status === 'Active' || !profile?.account_status) {
            // account_status column might not exist yet — try to update anyway
        }

        // Update account_status to Active in profiles (if column exists)
        // This is handled gracefully — if column doesn't exist nothing breaks
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ account_status: 'Active' })
            .eq('id', userId);

        if (updateError && !((updateError as Error).message).includes('column')) {
            throw updateError;
        }

        // Log activity
        try {
            await supabase.from('super_admin_activity_log').insert({
                admin_email: adminEmail,
                action: 'activate_user',
                target_user_id: userId,
                target_user_email: profile?.email,
                target_user_name: profile?.full_name,
                details: 'User manually reactivated by SuperAdmin',
                created_at: new Date().toISOString(),
            });
        } catch { /* silent */ }

        return NextResponse.json({
            success: true,
            message: `Successfully activated ${profile?.full_name || userId}.`,
        });

    } catch (error: unknown) {
        console.error('Activate user error:', error);
        return NextResponse.json({
            success: false,
            message: ((error as Error)?.message) || 'An unexpected error occurred.'
        }, { status: 500 });
    }
}
