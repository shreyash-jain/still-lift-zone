'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
    JournalNote, 
    CreateJournalNoteData, 
    UpdateJournalNoteData,
    JournalNotesFilters 
} from '@/types/journal';
import { toast } from 'sonner';
import { supabase } from '@/lib/still-zone-supabase';

export function useJournalNotes(initialFilters?: JournalNotesFilters) {
    const [notes, setNotes] = useState<JournalNote[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<JournalNotesFilters>(initialFilters || {});

    // Fetch notes - using direct Supabase client instead of API route
    const fetchNotes = useCallback(async (newFilters?: JournalNotesFilters) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                throw new Error('User not authenticated');
            }

            const activeFilters = { ...filters, ...newFilters };
            
            let query = supabase
                .from('journal_notes')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            // Apply filters
            if (activeFilters.mood) {
                query = query.eq('mood', activeFilters.mood);
            }
            
            if (activeFilters.search) {
                query = query.or(`title.ilike.%${activeFilters.search}%,content.ilike.%${activeFilters.search}%`);
            }
            
            if (activeFilters.limit) {
                const offset = activeFilters.offset || 0;
                query = query.range(offset, offset + activeFilters.limit - 1);
            }

            const { data: notes, error } = await query;

            if (error) {
                throw new Error(error.message);
            }

            setNotes(notes || []);
            setFilters(activeFilters);
        } catch (error) {
            console.error('Error fetching journal notes:', error);
            setError('Failed to load journal notes');
            toast.error('Failed to load journal notes');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    // Create note - using direct Supabase client instead of API route
    const createNote = useCallback(async (data: CreateJournalNoteData): Promise<JournalNote | null> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                throw new Error('User not authenticated');
            }

            const noteData = {
                user_id: user.id,
                title: data.title || '',
                content: data.content || '',
                mood: data.mood || null,
                tags: data.tags || [],
                audio_url: data.audio_url || null,
                audio_duration: data.audio_duration || null,
                audio_mime_type: data.audio_mime_type || null,
                audio_size: data.audio_size || null,
                is_private: true,
            };

            const { data: newNote, error } = await supabase
                .from('journal_notes')
                .insert([noteData])
                .select()
                .single();

            if (error) {
                throw new Error(error.message);
            }

            setNotes(prev => [newNote, ...prev]);
            toast.success('Journal note created successfully');
            return newNote;
        } catch (error) {
            console.error('Error creating journal note:', error);
            toast.error('Failed to create journal note');
            return null;
        }
    }, []);

    // Update note - using direct Supabase client instead of API route
    const updateNote = useCallback(async (id: string, data: UpdateJournalNoteData): Promise<JournalNote | null> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                throw new Error('User not authenticated');
            }

            const updateData: Record<string, unknown> = {};
            if (data.title !== undefined) updateData.title = data.title;
            if (data.content !== undefined) updateData.content = data.content;
            if (data.mood !== undefined) updateData.mood = data.mood;
            if (data.tags !== undefined) updateData.tags = data.tags;
            if (data.audio_url !== undefined) updateData.audio_url = data.audio_url;
            if (data.audio_duration !== undefined) updateData.audio_duration = data.audio_duration;
            if (data.audio_mime_type !== undefined) updateData.audio_mime_type = data.audio_mime_type;
            if (data.audio_size !== undefined) updateData.audio_size = data.audio_size;

            const { data: updatedNote, error } = await supabase
                .from('journal_notes')
                .update(updateData)
                .eq('id', id)
                .eq('user_id', user.id) // Ensure user can only update their own notes
                .select()
                .single();

            if (error) {
                throw new Error(error.message);
            }

            setNotes(prev => prev.map(note => note.id === id ? updatedNote : note));
            toast.success('Journal note updated successfully');
            return updatedNote;
        } catch (error) {
            console.error('Error updating journal note:', error);
            toast.error('Failed to update journal note');
            return null;
        }
    }, []);

    // Delete note - using direct Supabase client instead of API route
    const deleteNote = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                throw new Error('User not authenticated');
            }

            const { error } = await supabase
                .from('journal_notes')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id); // Ensure user can only delete their own notes

            if (error) {
                throw new Error(error.message);
            }

            setNotes(prev => prev.filter(note => note.id !== id));
            toast.success('Journal note deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting journal note:', error);
            toast.error('Failed to delete journal note');
            return false;
        }
    }, []);

    // Get note by ID - using direct Supabase client instead of API route
    const getNote = useCallback(async (id: string): Promise<JournalNote | null> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                throw new Error('User not authenticated');
            }

            const { data: note, error } = await supabase
                .from('journal_notes')
                .select('*')
                .eq('id', id)
                .eq('user_id', user.id)
                .single();

            if (error) {
                throw new Error(error.message);
            }

            return note;
        } catch (error) {
            console.error('Error fetching journal note:', error);
            toast.error('Failed to load journal note');
            return null;
        }
    }, []);

    // Refresh notes
    const refresh = useCallback(() => {
        fetchNotes();
    }, [fetchNotes]);

    return {
        notes,
        isLoading,
        error,
        filters,
        fetchNotes,
        createNote,
        updateNote,
        deleteNote,
        getNote,
        refresh,
        setFilters
    };
}

// Hook for managing a single journal note
export function useJournalNote(id?: string) {
    const [note, setNote] = useState<JournalNote | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNote = useCallback(async (noteId: string) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                throw new Error('User not authenticated');
            }

            const { data: note, error } = await supabase
                .from('journal_notes')
                .select('*')
                .eq('id', noteId)
                .eq('user_id', user.id)
                .single();

            if (error) {
                throw new Error(error.message);
            }

            setNote(note);
        } catch (error) {
            console.error('Error fetching journal note:', error);
            setError('Failed to load journal note');
            toast.error('Failed to load journal note');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (id) {
            fetchNote(id);
        }
    }, [id, fetchNote]);

    return {
        note,
        isLoading,
        error,
        fetchNote,
        setNote
    };
}