
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simple test endpoint using service role (for debugging only)
export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        
        // Create client with service role key (bypasses RLS for testing)
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        
        // Test database connection by querying journal_notes table
        const { data, error } = await supabase
            .from('journal_notes')
            .select('count')
            .limit(1);
            
        if (error) {
            return NextResponse.json({ 
                error: 'Database query failed',
                details: error.message 
            }, { status: 500 });
        }
        
        return NextResponse.json({ 
            success: true,
            message: 'Database connection working',
            tableExists: true 
        });

    } catch (error) {
        return NextResponse.json({ 
            error: 'Server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}