// Types for Journal Notes feature

export interface JournalNote {
    id: string;
    user_id: string;
    title: string;
    content: string;
    mood?: 'great' | 'good' | 'okay' | 'bad' | 'awful' | null;
    tags: string[];
    audio_url?: string | null;
    audio_duration?: number | null;
    audio_mime_type?: string | null;
    audio_size?: number | null;
    is_private: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateJournalNoteData {
    title?: string;
    content?: string;
    mood?: JournalNote['mood'];
    tags?: string[];
    audio_url?: string;
    audio_duration?: number;
    audio_mime_type?: string;
    audio_size?: number;
}

export type UpdateJournalNoteData = Partial<CreateJournalNoteData>;

export interface JournalNotesResponse {
    success: boolean;
    data: JournalNote[];
    count: number;
}

export interface JournalNoteResponse {
    success: boolean;
    data: JournalNote;
}

export interface AudioUploadResponse {
    success: boolean;
    data: {
        url: string;
        path: string;
        size: number;
        mimeType: string;
        fileName: string;
    };
}

export interface JournalNotesFilters {
    mood?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

export const MOOD_OPTIONS = [
    { value: 'great', label: '😊 Great', color: 'bg-green-100 text-green-800' },
    { value: 'good', label: '🙂 Good', color: 'bg-blue-100 text-blue-800' },
    { value: 'okay', label: '😐 Okay', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'bad', label: '😔 Bad', color: 'bg-orange-100 text-orange-800' },
    { value: 'awful', label: '😢 Awful', color: 'bg-red-100 text-red-800' }
] as const;