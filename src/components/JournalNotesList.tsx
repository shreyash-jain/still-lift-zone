'use client';

import { useState, useEffect } from 'react';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Edit, 
    Trash2, 
    Pause, 
    Volume2,
    Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { JournalNote, MOOD_OPTIONS, UpdateJournalNoteData } from '@/types/journal';
// MOOD_OPTIONS still used in getMoodOption below
import { useJournalNotes } from '@/hooks/useJournalNotes';
import JournalDialog from './JournalDialog';
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface JournalNotesListProps {
    maxHeight?: string;
    refreshKey?: number;
}

export default function JournalNotesList({ 
    maxHeight = 'max-h-96',
    refreshKey = 0
}: JournalNotesListProps) {
    const { notes, isLoading, fetchNotes, updateNote, deleteNote } = useJournalNotes();
    const [editingNote, setEditingNote] = useState<JournalNote | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [deleteConfirmNote, setDeleteConfirmNote] = useState<JournalNote | null>(null);
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const [audioElements] = useState(new Map<string, HTMLAudioElement>());

    // Load notes on mount and when refreshKey changes
    useEffect(() => {
        fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey]);

    // Handle edit
    const handleEdit = (note: JournalNote) => {
        setEditingNote(note);
        setIsEditDialogOpen(true);
    };

    // Handle update
    const handleUpdateNote = async (data: UpdateJournalNoteData) => {
        if (editingNote) {
            await updateNote(editingNote.id, data);
            setEditingNote(null);
        }
    };

    // Handle delete
    const handleDeleteConfirm = async () => {
        if (deleteConfirmNote) {
            await deleteNote(deleteConfirmNote.id);
            setDeleteConfirmNote(null);
        }
    };

    // Handle audio play/pause
    const handleAudioToggle = (note: JournalNote) => {
        if (!note.audio_url) return;

        const audioId = note.id;
        let audio = audioElements.get(audioId);

        if (!audio) {
            audio = new Audio(note.audio_url);
            audio.addEventListener('ended', () => setPlayingAudio(null));
            audioElements.set(audioId, audio);
        }

        if (playingAudio === audioId) {
            audio.pause();
            setPlayingAudio(null);
        } else {
            // Pause any currently playing audio
            audioElements.forEach((el, id) => {
                if (id !== audioId) el.pause();
            });
            
            audio.play();
            setPlayingAudio(audioId);
        }
    };

    // Get mood option
    const getMoodOption = (mood: string) => {
        return MOOD_OPTIONS.find(option => option.value === mood);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-slate-500">Loading journal notes...</div>
            </div>
        );
    }

    return (
        <>
            <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <Calendar className="h-5 w-5" />
                        Your Journal Notes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Notes List */}
                    <div className={`space-y-4 overflow-y-auto ${maxHeight}`}>
                        {notes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-6">
                                {/* Decorative illustration */}
                                <div className="relative mb-6">
                                    <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/40 dark:to-teal-800/20 flex items-center justify-center shadow-inner">
                                        <span className="text-5xl">📝</span>
                                    </div>
                                    <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-teal-500 flex items-center justify-center shadow-md">
                                        <span className="text-white text-xs font-bold">+</span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
                                    Your journal is empty
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs mb-1">
                                    Start capturing your thoughts, feelings, and reflections.
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                                    Tap <span className="font-semibold text-teal-600 dark:text-teal-400">Add Note</span> above to get started ✨
                                </p>
                            </div>
                        ) : (
                            notes.map((note) => {
                                const moodOption = note.mood ? getMoodOption(note.mood) : null;
                                
                                return (
                                    <div key={note.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-600 p-4 shadow-sm hover:shadow-md transition-shadow">
                                        {/* Content */}
                                        {note.content && (
                                            <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed mb-3">
                                                {note.content}
                                            </p>
                                        )}

                                        {/* Audio indicator */}
                                        {note.audio_url && (
                                            <button
                                                onClick={() => handleAudioToggle(note)}
                                                className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-medium hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
                                            >
                                                {playingAudio === note.id ? (
                                                    <>
                                                        <Pause className="h-3.5 w-3.5" />
                                                        Pause audio
                                                    </>
                                                ) : (
                                                    <>
                                                        <Volume2 className="h-3.5 w-3.5" />
                                                        Play audio
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {/* Footer: mood, time, actions */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                                                <span>
                                                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                                                </span>
                                                {moodOption && (
                                                    <Badge variant="secondary" className={`text-[11px] px-1.5 py-0 ${moodOption.color}`}>
                                                        {moodOption.label}
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleEdit(note)}
                                                    className="p-1.5 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmNote(note)}
                                                    className="p-1.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <JournalDialog
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSave={handleUpdateNote}
                initialData={editingNote}
                mode="edit"
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteConfirmNote} onOpenChange={() => setDeleteConfirmNote(null)}>
                <AlertDialogContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-900 dark:text-white text-lg font-semibold">
                            Delete Journal Note
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                            Are you sure you want to delete this note? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}