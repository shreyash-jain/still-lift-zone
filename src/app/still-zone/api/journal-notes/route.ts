export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create authenticated Supabase client from request
async function createAuthenticatedSupabaseClient(request: NextRequest) {
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return null;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Extract the token from "Bearer TOKEN"
    const token = authorization.replace('Bearer ', '');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
    
    // Set the access token directly
    await supabase.auth.setSession({
        access_token: token,
        refresh_token: '', // Not needed for our use case
    });
    
    return supabase;
}

// GET /api/journal-notes - Get all journal notes for the authenticated user
export async function GET(request: NextRequest) {
    try {
        const supabase = await createAuthenticatedSupabaseClient(request);
        
        if (!supabase) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const mood = searchParams.get('mood');
        const search = searchParams.get('search');

        let query = supabase
            .from('journal_notes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply filters
        if (mood) {
            query = query.eq('mood', mood);
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }

        const { data: notes, error } = await query;

        if (error) {
            console.error('Error fetching journal notes:', error);
            return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            data: notes,
            count: notes?.length || 0 
        });

    } catch (error) {
        console.error('Journal notes GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/journal-notes - Create a new journal note
export async function POST(request: NextRequest) {
    try {
        const supabase = await createAuthenticatedSupabaseClient(request);
        
        if (!supabase) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { 
            title, 
            content, 
            mood, 
            tags, 
            audio_url, 
            audio_duration, 
            audio_mime_type, 
            audio_size 
        } = body;

        // Validation
        if (!title?.trim() && !content?.trim() && !audio_url) {
            return NextResponse.json({ 
                error: 'At least one of title, content, or audio is required' 
            }, { status: 400 });
        }

        const { data: note, error } = await supabase
            .from('journal_notes')
            .insert({
                user_id: user.id,
                title: title?.trim() || '',
                content: content?.trim() || '',
                mood: mood || null,
                tags: tags || [],
                audio_url,
                audio_duration,
                audio_mime_type,
                audio_size
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating journal note:', error);
            return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            data: note 
        }, { status: 201 });

    } catch (error) {
        console.error('Journal notes POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}