export const runtime = 'edge';

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

// POST /api/journal-notes/upload-audio - Upload audio file for journal note
export async function POST(request: NextRequest) {
    try {
        const supabase = createAuthenticatedSupabaseClient(request);
        
        if (!supabase) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'];
        if (!allowedTypes.includes(audioFile.type)) {
            return NextResponse.json({ 
                error: 'Invalid file type. Allowed types: webm, mp3, wav, m4a, ogg' 
            }, { status: 400 });
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (audioFile.size > maxSize) {
            return NextResponse.json({ 
                error: 'File size too large. Maximum size: 10MB' 
            }, { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileName = `${timestamp}-${audioFile.name}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('journal-audio')
            .upload(filePath, audioFile, {
                contentType: audioFile.type,
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading audio file:', uploadError);
            return NextResponse.json({ error: 'Failed to upload audio file' }, { status: 500 });
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('journal-audio')
            .getPublicUrl(filePath);

        return NextResponse.json({
            success: true,
            data: {
                url: publicUrl,
                path: filePath,
                size: audioFile.size,
                mimeType: audioFile.type,
                fileName: fileName
            }
        });

    } catch (error) {
        console.error('Audio upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}