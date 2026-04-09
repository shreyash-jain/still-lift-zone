'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Mic, 
    Square, 
    Play,
    Pause,
    X, 
    Loader2,
    Send
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateJournalNoteData, UpdateJournalNoteData, JournalNote, MOOD_OPTIONS } from '@/types/journal';
import { supabase } from '@/lib/still-zone-supabase';

interface JournalDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: CreateJournalNoteData | UpdateJournalNoteData) => Promise<void>;
    initialData?: JournalNote | null;
    mode?: 'create' | 'edit';
}

export default function JournalDialog({
    isOpen,
    onOpenChange,
    onSave,
    initialData = null,
    mode = 'create'
}: JournalDialogProps) {
    const [content, setContent] = useState(initialData?.content || '');
    const [mood, setMood] = useState(initialData?.mood || '');
    
    // Audio states
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string>(initialData?.audio_url || '');
    const [audioDuration, setAudioDuration] = useState<number>(initialData?.audio_duration || 0);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackTime, setPlaybackTime] = useState(0);
    
    // Loading states
    const [isSaving, setIsSaving] = useState(false);
    
    // Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const blobUrlRef = useRef<string | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const progressBarRef = useRef<HTMLDivElement | null>(null);
    const isRecordingRef = useRef(false); // tracks recording state without render lag

    // Smooth playback progress via requestAnimationFrame
    const updateProgress = useCallback(() => {
        if (audioElementRef.current && !audioElementRef.current.paused) {
            setPlaybackTime(audioElementRef.current.currentTime);
            animFrameRef.current = requestAnimationFrame(updateProgress);
        }
    }, []);

    const stopProgressLoop = useCallback(() => {
        if (animFrameRef.current !== null) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isRecordingRef.current = false;
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
            }
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            if (animFrameRef.current !== null) {
                cancelAnimationFrame(animFrameRef.current);
            }
            if (audioElementRef.current) {
                audioElementRef.current.pause();
                audioElementRef.current = null;
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Sync state when dialog opens or initialData changes
    useEffect(() => {
        if (!isOpen) return;

        // Don't reset state if a recording is actively in progress
        if (isRecordingRef.current) return;

        // Reset playback state
        if (audioElementRef.current) {
            audioElementRef.current.pause();
            audioElementRef.current = null;
        }
        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
        }
        stopProgressLoop();
        setIsPlaying(false);
        setPlaybackTime(0);
        setIsRecording(false);
        setRecordingTime(0);
        setAudioBlob(null);
        setIsSaving(false);

        setContent(initialData?.content || '');
        setMood(initialData?.mood || '');

        const existingAudioUrl = initialData?.audio_url || '';
        setAudioUrl(existingAudioUrl);
        setAudioDuration(initialData?.audio_duration || 0);

        // If editing a note with an existing audio URL, set up the Audio element for playback
        if (existingAudioUrl && existingAudioUrl.startsWith('http')) {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.crossOrigin = 'anonymous';
            audio.src = existingAudioUrl;
            audio.onloadedmetadata = () => {
                const dur = Math.round(audio.duration);
                if (isFinite(dur) && dur > 0) {
                    setAudioDuration(dur);
                }
            };
            audio.onended = () => {
                setIsPlaying(false);
                setPlaybackTime(0);
                stopProgressLoop();
            };
            audio.onerror = () => {
                console.error('Failed to load existing audio for playback');
            };
            audioElementRef.current = audio;
        }
    }, [isOpen, initialData, stopProgressLoop]);

    // Start recording
    const startRecording = useCallback(async () => {
        try {
            // Clean up any previous recording
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
            if (audioElementRef.current) {
                audioElementRef.current.pause();
                audioElementRef.current = null;
            }
            setAudioUrl('');
            setAudioBlob(null);
            setIsPlaying(false);
            setPlaybackTime(0);

            // Mark recording intent BEFORE the async permission prompt
            // This prevents the sync useEffect from resetting state during the prompt
            isRecordingRef.current = true;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // If dialog was closed while waiting for permission, clean up and abort
            if (!isRecordingRef.current) {
                stream.getTracks().forEach(t => t.stop());
                return;
            }

            streamRef.current = stream;

            // Log mic info
            const track = stream.getAudioTracks()[0];
            console.log('Mic:', track?.label, 'enabled:', track?.enabled);

            // Figure out what MIME type the browser supports
            const mimeTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/mp4',
                'audio/ogg;codecs=opus',
            ];
            let selectedMime = '';
            for (const mt of mimeTypes) {
                if (MediaRecorder.isTypeSupported(mt)) {
                    selectedMime = mt;
                    break;
                }
            }
            console.log('Selected MIME:', selectedMime || 'default');

            const recorderOptions: MediaRecorderOptions = {};
            if (selectedMime) recorderOptions.mimeType = selectedMime;

            const recorder = new MediaRecorder(stream, recorderOptions);
            chunksRef.current = [];

            recorder.ondataavailable = (e: BlobEvent) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                // Build the blob from chunks
                const mimeType = recorder.mimeType || selectedMime || 'audio/webm';
                const blob = new Blob(chunksRef.current, { type: mimeType });
                console.log('Final blob:', blob.size, 'bytes, type:', blob.type);

                if (blob.size < 500) {
                    toast.error('Recording failed. Please check your microphone.');
                    return;
                }

                setAudioBlob(blob);

                // Create blob URL
                const url = URL.createObjectURL(blob);
                blobUrlRef.current = url;
                setAudioUrl(url);

                // Create a standalone Audio element for reliable playback
                const audio = new Audio();
                audio.preload = 'auto';
                audio.src = url;

                // Chrome/WebM bug: audio.duration is often Infinity for
                // MediaRecorder blobs because the WebM container lacks
                // proper duration metadata. We use the recording timer
                // value instead (already set by stopRecording).
                audio.onloadedmetadata = () => {
                    console.log('Audio loaded, raw duration:', audio.duration, 'sec');

                    if (!isFinite(audio.duration) || audio.duration === 0) {
                        // Workaround: seek to a very large time to force
                        // the browser to calculate the real duration.
                        audio.currentTime = 1e10;
                        audio.addEventListener('timeupdate', function seekBack() {
                            audio.removeEventListener('timeupdate', seekBack);
                            if (isFinite(audio.duration) && audio.duration > 0) {
                                setAudioDuration(Math.round(audio.duration));
                                console.log('Resolved duration:', audio.duration, 'sec');
                            }
                            audio.currentTime = 0;
                        });
                    } else {
                        const dur = Math.round(audio.duration);
                        if (dur > 0) setAudioDuration(dur);
                    }
                };

                audio.onended = () => {
                    setIsPlaying(false);
                    setPlaybackTime(0);
                    stopProgressLoop();
                };
                audio.onerror = (err) => {
                    console.error('Audio element error:', err);
                };
                audioElementRef.current = audio;

                // Release mic
                stream.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            };

            mediaRecorderRef.current = recorder;

            // On macOS the first getUserMedia call needs time for the audio
            // hardware to initialise. Without a delay the MediaRecorder
            // captures an almost-empty blob (just container headers).
            // We create an AudioContext and poll an AnalyserNode until we
            // detect real audio energy, with a hard 500 ms cap.
            await new Promise<void>((resolve) => {
                try {
                    const ctx = new AudioContext();
                    const source = ctx.createMediaStreamSource(stream);
                    const analyser = ctx.createAnalyser();
                    analyser.fftSize = 256;
                    source.connect(analyser);
                    const buf = new Uint8Array(analyser.frequencyBinCount);

                    const start = Date.now();
                    const poll = () => {
                        analyser.getByteFrequencyData(buf);
                        const hasSignal = buf.some(v => v > 0);
                        if (hasSignal || Date.now() - start > 500) {
                            source.disconnect();
                            ctx.close().catch(() => {});
                            resolve();
                        } else {
                            requestAnimationFrame(poll);
                        }
                    };
                    poll();
                } catch {
                    // Fallback: simple delay if AudioContext is unavailable
                    setTimeout(resolve, 400);
                }
            });

            // If dialog was closed during the warm-up delay, abort
            if (!isRecordingRef.current) {
                stream.getTracks().forEach(t => t.stop());
                streamRef.current = null;
                return;
            }

            // Use a timeslice so ondataavailable fires periodically.
            recorder.start(250);
            setIsRecording(true);
            setRecordingTime(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            isRecordingRef.current = false;
            console.error('Recording error:', error);
            toast.error('Microphone access denied. Please allow microphone permissions.');
        }
    }, [stopProgressLoop]);

    // Stop recording
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            isRecordingRef.current = false;
            setIsRecording(false);
            setAudioDuration(recordingTime);

            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
                recordingIntervalRef.current = null;
            }
        }
    }, [recordingTime]);

    // Play / Pause recorded audio
    const togglePlayback = useCallback(() => {
        const audio = audioElementRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
            setPlaybackTime(audio.currentTime);
            stopProgressLoop();
        } else {
            audio.play().then(() => {
                setIsPlaying(true);
                animFrameRef.current = requestAnimationFrame(updateProgress);
            }).catch(err => {
                console.error('Playback failed:', err);
                toast.error('Could not play audio');
            });
        }
    }, [isPlaying, updateProgress, stopProgressLoop]);

    // Seek by clicking on the progress bar
    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const bar = progressBarRef.current;
        const audio = audioElementRef.current;
        if (!bar || !audio || !audioDuration) return;

        const rect = bar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, clickX / rect.width));
        const newTime = ratio * audioDuration;

        audio.currentTime = newTime;
        setPlaybackTime(newTime);
    }, [audioDuration]);

    // Remove audio
    const removeAudio = useCallback(() => {
        if (audioElementRef.current) {
            audioElementRef.current.pause();
            audioElementRef.current = null;
        }
        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
        }
        stopProgressLoop();
        setAudioUrl('');
        setAudioBlob(null);
        setAudioDuration(0);
        setIsPlaying(false);
        setPlaybackTime(0);
    }, [stopProgressLoop]);

    // Format recording time
    const formatTime = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    // Handle save
    const handleSave = useCallback(async () => {
        if (!content.trim() && !audioUrl) {
            toast.error('Please add a message or audio recording');
            return;
        }

        setIsSaving(true);
        try {
            let finalAudioUrl = audioUrl;
            const finalAudioDuration = audioDuration;
            let audioMimeType = initialData?.audio_mime_type || '';
            let audioSize = initialData?.audio_size || 0;

            // If we have a recorded blob (new recording), upload it
            if (audioBlob && !audioUrl.startsWith('http')) {
                const { data: { user } } = await supabase.auth.getUser();
                
                if (user) {
                    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webm`;
                    const filePath = `${user.id}/${fileName}`;

                    const { data, error } = await supabase.storage
                        .from('journal-audio')
                        .upload(filePath, audioBlob);

                    if (!error && data) {
                        // Create signed URL for private bucket
                        const { data: signedData, error: signedError } = await supabase.storage
                            .from('journal-audio')
                            .createSignedUrl(data.path, 3600); // 1 hour expiry

                        if (!signedError && signedData?.signedUrl) {
                            finalAudioUrl = signedData.signedUrl;
                            audioMimeType = audioBlob.type;
                            audioSize = audioBlob.size;
                        }
                    }
                }
            }

            // If audio was removed, clear audio fields
            if (!audioUrl) {
                finalAudioUrl = '';
                audioMimeType = '';
                audioSize = 0;
            }

            const data: CreateJournalNoteData | UpdateJournalNoteData = {
                title: '',
                content: content.trim(),
                mood: (mood as 'great' | 'good' | 'okay' | 'bad' | 'awful' | null | undefined) || undefined,
                tags: [],
                audio_url: finalAudioUrl || undefined,
                audio_duration: finalAudioUrl ? finalAudioDuration : undefined,
                audio_mime_type: audioMimeType || undefined,
                audio_size: audioSize || undefined
            };

            await onSave(data);
            
            // Reset form
            setContent('');
            setMood('');
            removeAudio();
            
            onOpenChange(false);

        } catch (error) {
            console.error('Error saving journal note:', error);
            toast.error(`Failed to ${mode} journal note`);
        } finally {
            setIsSaving(false);
        }
    }, [content, mood, audioUrl, audioDuration, audioBlob, initialData, onSave, mode, onOpenChange, removeAudio]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                        {mode === 'create' ? 'New Journal Entry' : 'Edit Entry'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                        What&apos;s on your mind?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Mood */}
                    <Select value={mood} onValueChange={setMood}>
                        <SelectTrigger className="w-full border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-9 text-sm">
                            <SelectValue placeholder="How are you feeling?" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                            {MOOD_OPTIONS.map((option) => (
                                <SelectItem 
                                    key={option.value} 
                                    value={option.value}
                                    className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Audio Player (shown when audio is recorded) */}
                    {audioUrl && (
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl px-3 py-3 flex items-center gap-3">
                            {/* Play / Pause */}
                            <button
                                type="button"
                                onClick={togglePlayback}
                                className="h-10 w-10 rounded-full bg-sky-600 hover:bg-sky-700 active:scale-95 text-white flex items-center justify-center shrink-0 transition-transform"
                            >
                                {isPlaying ? (
                                    <Pause className="h-5 w-5" />
                                ) : (
                                    <Play className="h-5 w-5 ml-0.5" />
                                )}
                            </button>

                            {/* Progress bar + time */}
                            <div className="flex-1 min-w-0">
                                {/* Seekable track */}
                                <div 
                                    ref={progressBarRef}
                                    onClick={handleSeek}
                                    className="relative h-6 flex items-center cursor-pointer group"
                                >
                                    {/* Track background */}
                                    <div className="absolute inset-x-0 h-1 bg-slate-200 dark:bg-slate-600 rounded-full" />
                                    {/* Filled portion */}
                                    <div 
                                        className="absolute left-0 h-1 bg-sky-600 rounded-full"
                                        style={{ 
                                            width: audioDuration > 0 
                                                ? `${(playbackTime / audioDuration) * 100}%` 
                                                : '0%' 
                                        }}
                                    />
                                    {/* Thumb / knob */}
                                    <div
                                        className="absolute h-3.5 w-3.5 bg-sky-600 rounded-full shadow-md border-2 border-white dark:border-slate-900 -translate-x-1/2 group-hover:scale-125 transition-transform"
                                        style={{ 
                                            left: audioDuration > 0 
                                                ? `${(playbackTime / audioDuration) * 100}%` 
                                                : '0%' 
                                        }}
                                    />
                                </div>
                                {/* Time labels */}
                                <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 tabular-nums">
                                    <span>{formatTime(Math.floor(playbackTime))}</span>
                                    <span>{formatTime(audioDuration)}</span>
                                </div>
                            </div>

                            {/* Remove */}
                            <button
                                type="button"
                                onClick={removeAudio}
                                className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 shrink-0 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Recording indicator */}
                    {isRecording && (
                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg px-3 py-2 text-sm">
                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            Recording... {formatTime(recordingTime)}
                            <button
                                type="button"
                                onClick={stopRecording}
                                className="ml-auto p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                            >
                                <Square className="h-4 w-4 fill-current" />
                            </button>
                        </div>
                    )}

                    {/* Message input bar */}
                    <div className="flex items-end gap-2">
                        <Textarea
                            placeholder="Type a message..."
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value);
                                // Auto-resize the textarea
                                const el = e.target;
                                el.style.height = 'auto';
                                el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                            }}
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSave();
                                }
                            }}
                            className="flex-1 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none rounded-2xl px-4 py-2.5 text-sm min-h-[42px] max-h-[160px] overflow-y-auto"
                        />

                        {/* Mic / Send button */}
                        {content.trim() || audioUrl ? (
                            <Button
                                type="button"
                                size="icon"
                                onClick={handleSave}
                                disabled={isSaving || isRecording}
                                className="rounded-full h-[42px] w-[42px] min-h-[42px] min-w-[42px] bg-sky-600 hover:bg-sky-700 text-white shrink-0"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                size="icon"
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`rounded-full h-[42px] w-[42px] min-h-[42px] min-w-[42px] shrink-0 ${
                                    isRecording 
                                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                                        : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                                }`}
                            >
                                {isRecording ? (
                                    <Square className="h-5 w-5 fill-current" />
                                ) : (
                                    <Mic className="h-5 w-5" />
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}