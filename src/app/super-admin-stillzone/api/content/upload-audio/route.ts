export const runtime = 'experimental-edge';

import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/super-admin/supabase';

const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/m4a', 'audio/mp4'];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const BUCKET = 'still-zone-content-audio';

// POST — upload audio file to Supabase storage, return public URL
export async function POST(request: Request) {
    try {
        const supabase = getAdminSupabase();
        const formData = await request.formData();
        const file = formData.get('audio') as File | null;
        const pathPrefix = (formData.get('path_prefix') as string) || 'general';

        if (!file) {
            return NextResponse.json({ success: false, message: 'No audio file provided' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { success: false, message: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(', ')}` },
                { status: 400 }
            );
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { success: false, message: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 20MB` },
                { status: 400 }
            );
        }

        const ext = file.name.split('.').pop() || 'mp3';
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `${pathPrefix}/${Date.now()}-${safeName}`;

        const arrayBuffer = await file.arrayBuffer();

        const { data, error } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, new Uint8Array(arrayBuffer), {
                contentType: file.type,
                upsert: false,
            });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(data.path);

        return NextResponse.json({
            success: true,
            data: {
                path: data.path,
                publicUrl: urlData.publicUrl,
                fileName: safeName,
                fileSize: file.size,
                mimeType: file.type,
            },
        });
    } catch (e: unknown) {
        return NextResponse.json({ success: false, message: (e as Error)?.message || 'Upload failed' }, { status: 500 });
    }
}
