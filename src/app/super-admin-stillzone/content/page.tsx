'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Plus, Pencil, Trash2, Check, X, Loader2, AlertCircle,
    ChevronDown, ToggleLeft, ToggleRight, Volume2, VolumeX, Upload, FileText, Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MOOD_OPTIONS, CONTEXT_OPTIONS, TIME_OPTIONS, SUPPORT_OPTIONS } from '@/lib/still-zone-config';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ContentEntry {
    id: string;
    mood: string;
    context: string;
    support_type: string;
    time_key: string;
    action_type: string;
    heading: string | null;
    message: string;
    display_time: number;
    audio_url: string | null;
    is_combo: boolean;
    combo_second_message: string | null;
    combo_first_audio_url: string | null;
    combo_second_audio_url: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

const ACTION_TYPES = ['BREATHE', 'LISTEN', 'ACTION', 'VISUALIZE', 'REPEAT'];

const ACTION_COLORS: Record<string, string> = {
    BREATHE: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    LISTEN: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    ACTION: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    VISUALIZE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    REPEAT: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const DISPLAY_TIMES: Record<string, number> = { '1min': 60, '2min': 120, '3min': 180, '5min': 300 };

// ─── Empty form ───────────────────────────────────────────────────────────────
const emptyForm = {
    mood: '',
    context: '',
    support_type: '',
    time_key: '',
    action_type: 'ACTION',
    heading: '',
    message: '',
    display_time: '60',
    audio_url: '',
    is_combo: false,
    combo_second_message: '',
    combo_first_audio_url: '',
    combo_second_audio_url: '',
    is_active: true,
    sort_order: '0',
};
type FormState = typeof emptyForm;

// ─── Reusable inputs ─────────────────────────────────────────────────────────
function SelectField({ label, value, onChange, options, placeholder }: {
    label: string; value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[]; placeholder?: string;
}) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full appearance-none border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-9 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
        </div>
    );
}

function InputField({ label, value, onChange, placeholder, type = 'text' }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; type?: string;
}) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">{label}</label>
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
        </div>
    );
}

// ─── Audio upload button ──────────────────────────────────────────────────────
function AudioUploadField({ label, value, onChange, pathPrefix, playingUrl, onPlay }: {
    label: string; value: string; onChange: (url: string) => void; pathPrefix: string;
    playingUrl: string | null; onPlay: (url: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const isPlaying = !!value && playingUrl === value;

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('audio', file);
            formData.append('path_prefix', pathPrefix);

            const res = await fetch('/super-admin-stillzone/api/content/upload-audio', {
                method: 'POST',
                body: formData,
            });
            const json = await res.json();
            if (json.success) {
                onChange(json.data.publicUrl);
            } else {
                alert(`Upload failed: ${json.message}`);
            }
        } catch {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Audio URL or upload..."
                    className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 truncate"
                />
                <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                    e.target.value = '';
                }} />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => inputRef.current?.click()}
                    className="shrink-0 gap-1"
                >
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    Upload
                </Button>
                {value && (
                    <button
                        type="button"
                        onClick={() => onPlay(value)}
                        className={`p-2 rounded-lg transition-colors ${isPlaying ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-teal-600'}`}
                        title={isPlaying ? 'Stop audio' : 'Preview audio'}
                    >
                        {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ContentManagementPage() {
    const [entries, setEntries] = useState<ContentEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const PAGE_SIZE = 10;

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>({ ...emptyForm });
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Filters
    const [filterMood, setFilterMood] = useState('');
    const [filterContext, setFilterContext] = useState('');
    const [filterSupport, setFilterSupport] = useState('');
    const [filterTime, setFilterTime] = useState('');

    // Shared audio preview — single instance, play/stop toggle
    const previewAudioRef = useRef<HTMLAudioElement | null>(null);
    const [playingUrl, setPlayingUrl] = useState<string | null>(null);

    const togglePreview = (url: string) => {
        const audio = previewAudioRef.current;
        if (!audio) return;

        if (playingUrl === url) {
            // Stop
            audio.pause();
            audio.currentTime = 0;
            setPlayingUrl(null);
        } else {
            // Play new (stop previous first)
            audio.pause();
            audio.src = url;
            audio.currentTime = 0;
            audio.play().catch(() => {});
            setPlayingUrl(url);
        }
    };

    // Clear playingUrl when audio ends naturally
    useEffect(() => {
        const audio = previewAudioRef.current;
        if (!audio) {
            previewAudioRef.current = new Audio();
        }
        const handleEnded = () => setPlayingUrl(null);
        previewAudioRef.current?.addEventListener('ended', handleEnded);
        return () => {
            previewAudioRef.current?.removeEventListener('ended', handleEnded);
            previewAudioRef.current?.pause();
        };
    }, []);

    const fetchEntries = async (page = currentPage) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', String(PAGE_SIZE));
            if (filterMood) params.set('mood', filterMood);
            if (filterContext) params.set('context', filterContext);
            if (filterSupport) params.set('support_type', filterSupport);
            if (filterTime) params.set('time_key', filterTime);

            const res = await fetch(`/super-admin-stillzone/api/content?${params}`);
            const json = await res.json();
            if (json.success) {
                setEntries(json.data);
                if (json.pagination) {
                    setTotalPages(json.pagination.totalPages);
                    setTotalCount(json.pagination.total);
                }
            } else {
                setError(json.message);
            }
        } catch { setError('Failed to load content'); }
        finally { setLoading(false); }
    };

    // Track filters as a single key
    const filterKey = `${filterMood}|${filterContext}|${filterSupport}|${filterTime}`;
    const prevFilterRef = useRef(filterKey);

    // Single fetch — reset page on filter change, then fetch
    useEffect(() => {
        const filtersChanged = prevFilterRef.current !== filterKey;
        prevFilterRef.current = filterKey;
        if (filtersChanged && currentPage !== 1) {
            setCurrentPage(1); // will re-trigger this effect with page=1
            return;
        }
        fetchEntries(filtersChanged ? 1 : currentPage);
    }, [currentPage, filterKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const field = <K extends keyof FormState>(key: K) => (v: string) =>
        setForm(f => ({ ...f, [key]: v }));

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm });
        setShowForm(true);
    };

    const openEdit = (entry: ContentEntry) => {
        setEditingId(entry.id);
        setForm({
            mood: entry.mood,
            context: entry.context,
            support_type: entry.support_type,
            time_key: entry.time_key,
            action_type: entry.action_type,
            heading: entry.heading || '',
            message: entry.message,
            display_time: String(entry.display_time),
            audio_url: entry.audio_url || '',
            is_combo: entry.is_combo,
            combo_second_message: entry.combo_second_message || '',
            combo_first_audio_url: entry.combo_first_audio_url || '',
            combo_second_audio_url: entry.combo_second_audio_url || '',
            is_active: entry.is_active,
            sort_order: String(entry.sort_order),
        });
        setShowForm(true);
    };

    const closeForm = () => { setShowForm(false); setEditingId(null); };

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleSave = async () => {
        const missing: string[] = [];
        if (!form.mood) missing.push('Mood');
        if (!form.context) missing.push('Context');
        if (!form.support_type) missing.push('Support Type');
        if (!form.time_key) missing.push('Time');
        if (!form.message.trim()) missing.push('Message');
        if (missing.length > 0) {
            setError(`${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} required.`);
            return;
        }
        setSaving(true);
        setError('');
        try {
            const payload = {
                mood: form.mood,
                context: form.context,
                support_type: form.support_type,
                time_key: form.time_key,
                action_type: form.action_type,
                heading: form.heading.trim() || null,
                message: form.message.trim(),
                display_time: Number(form.display_time) || DISPLAY_TIMES[form.time_key] || 60,
                audio_url: form.audio_url || null,
                is_combo: form.is_combo,
                combo_second_message: form.is_combo ? form.combo_second_message.trim() || null : null,
                combo_first_audio_url: form.is_combo ? form.combo_first_audio_url || null : null,
                combo_second_audio_url: form.is_combo ? form.combo_second_audio_url || null : null,
                is_active: form.is_active,
                sort_order: Number(form.sort_order) || 0,
            };

            const url = editingId
                ? `/super-admin-stillzone/api/content/${editingId}`
                : '/super-admin-stillzone/api/content';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);

            await fetchEntries();
            closeForm();
            showSuccess(editingId ? 'Content updated!' : 'Content created!');
        } catch (e: unknown) {
            setError((e as Error).message || 'Failed to save');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        setSaving(true);
        try {
            const res = await fetch(`/super-admin-stillzone/api/content/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            await fetchEntries();
            setDeletingId(null);
            showSuccess('Content deleted.');
        } catch (e: unknown) {
            setError((e as Error).message || 'Delete failed');
        } finally { setSaving(false); }
    };

    const handleToggleActive = async (entry: ContentEntry) => {
        try {
            const res = await fetch(`/super-admin-stillzone/api/content/${entry.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...entry, is_active: !entry.is_active }),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            await fetchEntries();
        } catch (e: unknown) { setError((e as Error).message || 'Toggle failed'); }
    };

    const handleSeed = async () => {
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/super-admin-stillzone/api/content/seed', { method: 'POST' });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            await fetchEntries();
            showSuccess(json.message);
        } catch (e: unknown) {
            setError((e as Error).message || 'Seed failed');
        } finally { setSaving(false); }
    };

    // Auto-set display_time when time_key changes
    const handleTimeKeyChange = (v: string) => {
        setForm(f => ({ ...f, time_key: v, display_time: String(DISPLAY_TIMES[v] || 60), is_combo: v === '5min' }));
    };

    const audioPathPrefix = form.mood && form.support_type ? `${form.mood}/${form.support_type}` : 'general';

    return (
        <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-6 w-full">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Content Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Manage guided session content — changes reflect instantly for users.
                    </p>
                </div>
                <div className="flex gap-2">
                    {entries.length === 0 && !loading && (
                        <Button onClick={handleSeed} disabled={saving} variant="outline" className="gap-2">
                            <Database className="w-4 h-4" /> Seed Defaults
                        </Button>
                    )}
                    <Button onClick={openCreate} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white">
                        <Plus className="w-4 h-4" /> Add Content
                    </Button>
                </div>
            </div>

            {/* Banners */}
            {successMsg && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl text-sm">
                    <Check className="w-4 h-4 shrink-0" /> {successMsg}
                </div>
            )}
            {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SelectField label="Mood" value={filterMood} onChange={setFilterMood}
                    options={MOOD_OPTIONS.map(m => ({ value: m.key, label: `${m.emoji} ${m.label}` }))} placeholder="All moods" />
                <SelectField label="Context" value={filterContext} onChange={setFilterContext}
                    options={CONTEXT_OPTIONS.map(c => ({ value: c.key, label: `${c.icon} ${c.label}` }))} placeholder="All contexts" />
                <SelectField label="Support Type" value={filterSupport} onChange={setFilterSupport}
                    options={SUPPORT_OPTIONS.map(s => ({ value: s.key, label: s.label }))} placeholder="All types" />
                <SelectField label="Time" value={filterTime} onChange={setFilterTime}
                    options={TIME_OPTIONS.map(t => ({ value: t.key, label: t.label }))} placeholder="All times" />
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <Card className="border-teal-200 dark:border-teal-800/50 shadow-md bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-top-2 duration-200">
                    <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="flex items-center gap-2 text-base">
                            {editingId ? <Pencil className="w-4 h-4 text-teal-500" /> : <Plus className="w-4 h-4 text-teal-500" />}
                            {editingId ? 'Edit Content' : 'New Content'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-5">
                        {/* Row 1: Classification */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <SelectField label="Mood *" value={form.mood} onChange={field('mood')}
                                options={MOOD_OPTIONS.map(m => ({ value: m.key, label: m.label }))} placeholder="Select mood" />
                            <SelectField label="Context *" value={form.context} onChange={field('context')}
                                options={CONTEXT_OPTIONS.map(c => ({ value: c.key, label: c.label }))} placeholder="Select context" />
                            <SelectField label="Support Type *" value={form.support_type} onChange={field('support_type')}
                                options={SUPPORT_OPTIONS.map(s => ({ value: s.key, label: s.label }))} placeholder="Select type" />
                            <SelectField label="Time *" value={form.time_key} onChange={handleTimeKeyChange}
                                options={TIME_OPTIONS.map(t => ({ value: t.key, label: t.label }))} placeholder="Select time" />
                        </div>

                        {/* Row 2: Action type + display time + sort */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <SelectField label="Action Type *" value={form.action_type} onChange={field('action_type')}
                                options={ACTION_TYPES.map(a => ({ value: a, label: a }))} />
                            <InputField label="Display Time (seconds)" value={form.display_time} onChange={field('display_time')} type="number" />
                            <InputField label="Sort Order" value={form.sort_order} onChange={field('sort_order')} type="number" placeholder="0" />
                        </div>

                        {/* Heading */}
                        <InputField label="Heading (shown above message)" value={form.heading} onChange={field('heading')} placeholder="e.g. Focus on your breath for 1 minute" />

                        {/* Message */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Message *</label>
                            <textarea
                                value={form.message}
                                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                rows={4}
                                placeholder="Enter the guided session message..."
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                            />
                        </div>

                        {/* Audio */}
                        <AudioUploadField label="Audio File" value={form.audio_url} onChange={v => setForm(f => ({ ...f, audio_url: v }))} pathPrefix={audioPathPrefix} playingUrl={playingUrl} onPlay={togglePreview} />

                        {/* Combo section (5min) */}
                        {form.is_combo && (
                            <div className="space-y-4 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10">
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">5-Minute Combo (3min + 2min)</p>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Second Part Message (2min)</label>
                                    <textarea
                                        value={form.combo_second_message}
                                        onChange={e => setForm(f => ({ ...f, combo_second_message: e.target.value }))}
                                        rows={3}
                                        placeholder="Message for the 2-minute second part..."
                                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                                    />
                                </div>
                                <AudioUploadField label="First Part Audio (3min)" value={form.combo_first_audio_url} onChange={v => setForm(f => ({ ...f, combo_first_audio_url: v }))} pathPrefix={`${audioPathPrefix}/combo-first`} playingUrl={playingUrl} onPlay={togglePreview} />
                                <AudioUploadField label="Second Part Audio (2min)" value={form.combo_second_audio_url} onChange={v => setForm(f => ({ ...f, combo_second_audio_url: v }))} pathPrefix={`${audioPathPrefix}/combo-second`} playingUrl={playingUrl} onPlay={togglePreview} />
                            </div>
                        )}

                        {/* Toggle */}
                        <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            {form.is_active ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                            {form.is_active ? 'Active' : 'Inactive'}
                        </button>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                            <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                {editingId ? 'Save Changes' : 'Create'}
                            </Button>
                            <Button variant="ghost" onClick={closeForm} disabled={saving}>Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Content List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
            ) : entries.length === 0 ? (
                <Card className="border-dashed border-slate-200 dark:border-slate-700 shadow-none bg-white dark:bg-slate-900">
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                        <div className="p-4 rounded-full bg-teal-50 dark:bg-teal-900/20">
                            <FileText className="w-8 h-8 text-teal-400" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">No content found</p>
                        <p className="text-sm text-slate-400">Click <strong>Seed Defaults</strong> to populate from hardcoded data, or <strong>Add Content</strong> to create new entries.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <p className="text-xs text-slate-400">{totalCount} entries (page {currentPage} of {totalPages})</p>
                    <div className="grid grid-cols-1 gap-3">
                        {entries.map(entry => (
                            <Card
                                key={entry.id}
                                className={`border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-all ${!entry.is_active ? 'opacity-50' : ''}`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        {/* Left: badges */}
                                        <div className="flex flex-col gap-1.5 shrink-0 min-w-[80px]">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-center ${ACTION_COLORS[entry.action_type] || ACTION_COLORS.ACTION}`}>
                                                {entry.action_type}
                                            </span>
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-center">
                                                {entry.time_key}
                                            </span>
                                            {entry.is_combo && (
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-center">
                                                    COMBO
                                                </span>
                                            )}
                                            {entry.audio_url && (
                                                <button
                                                    onClick={() => togglePreview(entry.audio_url!)}
                                                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full text-center flex items-center justify-center gap-1 transition-colors ${playingUrl === entry.audio_url ? 'bg-teal-600 text-white' : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 hover:bg-teal-200'}`}
                                                >
                                                    {playingUrl === entry.audio_url ? <><VolumeX className="w-3 h-3" /> Stop</> : <><Volume2 className="w-3 h-3" /> Audio</>}
                                                </button>
                                            )}
                                        </div>

                                        {/* Middle: message */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1.5 flex-wrap">
                                                <span>{MOOD_OPTIONS.find(m => m.key === entry.mood)?.emoji} {entry.mood}</span>
                                                <span>/</span>
                                                <span>{entry.context}</span>
                                                <span>/</span>
                                                <span>{entry.support_type}</span>
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2">
                                                {entry.message}
                                            </p>
                                            {entry.is_combo && entry.combo_second_message && (
                                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 line-clamp-1">
                                                    Part 2: {entry.combo_second_message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Right: actions */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => handleToggleActive(entry)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title={entry.is_active ? 'Deactivate' : 'Activate'}>
                                                {entry.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                                            </button>
                                            <button onClick={() => openEdit(entry)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white" title="Edit">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            {deletingId === entry.id ? (
                                                <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-2 py-1">
                                                    <span className="text-xs text-red-600 dark:text-red-400">Delete?</span>
                                                    <button onClick={() => handleDelete(entry.id)} disabled={saving} className="text-red-600 p-0.5">
                                                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                    </button>
                                                    <button onClick={() => setDeletingId(null)} className="text-slate-500 p-0.5"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setDeletingId(entry.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Showing <span className="font-medium text-slate-900 dark:text-slate-100">{((currentPage - 1) * PAGE_SIZE) + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-100">{Math.min(currentPage * PAGE_SIZE, totalCount)}</span> of <span className="font-medium text-slate-900 dark:text-slate-100">{totalCount}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1 || loading}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-slate-600 dark:text-slate-300 min-w-[60px] text-center">
                                    {currentPage} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || loading}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
