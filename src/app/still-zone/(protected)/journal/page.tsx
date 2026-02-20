'use client';

import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JournalDialog from '@/components/JournalDialog';
import JournalNotesList from '@/components/JournalNotesList';
import { useJournalNotes } from '@/hooks/useJournalNotes';
import { CreateJournalNoteData } from '@/types/journal';

export default function JournalPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const { createNote } = useJournalNotes();

    const handleCreateNote = useCallback(async (data: CreateJournalNoteData) => {
        await createNote(data);
        // Trigger refresh of the notes list
        setRefreshKey(prev => prev + 1);
    }, [createNote]);

    return (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Journal Notes
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Capture your thoughts, feelings, and reflections
                    </p>
                </div>
                <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-md font-semibold px-5 py-2.5 rounded-xl text-sm transition-all border-transparent"
                >
                    <Plus className="h-5 w-5 mr-1.5" />
                    Add Note
                </Button>
            </div>

            {/* Notes List */}
            <JournalNotesList maxHeight="max-h-none" refreshKey={refreshKey} />

            {/* Create Dialog */}
            <JournalDialog
                isOpen={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSave={handleCreateNote}
                mode="create"
            />
        </main>
    );
}