import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 AUTH TEST: Starting');
        
        // Check if authorization header exists
        const authorization = request.headers.get('authorization');
        console.log('🔍 AUTH TEST: Authorization header:', authorization ? 'Present' : 'Missing');
        
        if (!authorization) {
            return NextResponse.json({ 
                error: 'No authorization header',
                step: 'header_check'
            }, { status: 401 });
        }

        // Try to create Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        
        console.log('🔍 AUTH TEST: Supabase URL:', supabaseUrl);
        console.log('🔍 AUTH TEST: Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    authorization,
                },
            },
        });
        
        console.log('🔍 AUTH TEST: Supabase client created');
        
        // Try to get user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
            console.log('❌ AUTH TEST: Auth error:', authError);
            return NextResponse.json({ 
                error: 'Authentication failed',
                details: authError.message,
                step: 'auth_validation'
            }, { status: 401 });
        }
        
        if (!user) {
            console.log('❌ AUTH TEST: No user found');
            return NextResponse.json({ 
                error: 'No user found',
                step: 'user_retrieval'
            }, { status: 401 });
        }
        
        console.log('✅ AUTH TEST: User found:', user.id, user.email);
        
        return NextResponse.json({ 
            success: true, 
            user: {
                id: user.id,
                email: user.email
            },
            step: 'complete'
        });

    } catch (error) {
        console.error('❌ AUTH TEST: Unexpected error:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error',
            step: 'exception'
        }, { status: 500 });
    }
}