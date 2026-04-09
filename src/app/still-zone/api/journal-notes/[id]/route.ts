export const runtime = 'experimental-edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create authenticated Supabase client from request
function createAuthenticatedSupabaseClient(request: NextRequest) {
    const authorization = request.headers.get('authorization');
    if (!authorization) {
        return null;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                authorization,
            },
        },
    });
}

// GET /api/journal-notes/[id] - Get a specific journal note
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = createAuthenticatedSupabaseClient(request);

        if (!supabase) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: note, error } = await supabase
            .from('journal_notes')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Note not found' }, { status: 404 });
            }
            console.error('Error fetching journal note:', error);
            return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: note
        });

    } catch (error) {
        console.error('Journal note GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/journal-notes/[id] - Update a specific journal note
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = createAuthenticatedSupabaseClient(request);

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
            .update({
                title: title?.trim() || '',
                content: content?.trim() || '',
                mood: mood || null,
                tags: tags || [],
                audio_url,
                audio_duration,
                audio_mime_type,
                audio_size
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Note not found' }, { status: 404 });
            }
            console.error('Error updating journal note:', error);
            return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: note
        });

    } catch (error) {
        console.error('Journal note PUT error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/journal-notes/[id] - Delete a specific journal note
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = createAuthenticatedSupabaseClient(request);

        if (!supabase) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // First, get the note to check if it has an audio file
        const { data: existingNote, error: fetchError } = await supabase
            .from('journal_notes')
            .select('audio_url')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching note for deletion:', fetchError);
            return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
        }

        // Delete the audio file from storage if it exists
        if (existingNote?.audio_url) {
            const fileName = existingNote.audio_url.split('/').pop();
            if (fileName) {
                const { error: storageError } = await supabase.storage
                    .from('journal-audio')
                    .remove([`${user.id}/${fileName}`]);

                if (storageError) {
                    console.warn('Error deleting audio file:', storageError);
                }
            }
        }

        // Delete the note from database
        const { error } = await supabase
            .from('journal_notes')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting journal note:', error);
            return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Note deleted successfully'
        });

    } catch (error) {
        console.error('Journal note DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}