'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus, Pencil, Trash2, Check, X, CreditCard, Sparkles,
    ToggleLeft, ToggleRight, Loader2, AlertCircle, ChevronDown, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Plan {
    id: string;
    plan_key: string;
    plan_name: string;
    description: string;
    price_inr: number;
    price_usd: number;
    duration_type: string;
    duration_days: number;
    trial_days: number;
    features: string[];
    is_active: boolean;
    is_highlighted: boolean;
    highlight_text: string;
    icon_name: string;
    sort_order: number;
    razorpay_plan_id_inr: string;
    razorpay_plan_id_usd: string;
    created_at: string;
    updated_at: string;
}

const DURATION_LABELS: Record<string, string> = {
    monthly: 'Monthly',
    yearly: 'Yearly',
    lifetime: 'Lifetime',
    free: 'Free',
    weekly: 'Weekly',
};

const DURATION_COLORS: Record<string, string> = {
    monthly: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    yearly: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    lifetime: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    free: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    weekly: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

// Prices in DB are stored as integers in paise/cents (e.g. 99900 = ₹999.00)
const toHuman = (paise: number) => (paise / 100).toFixed(2);
const toPaise = (human: string) => Math.round(parseFloat(human || '0') * 100);

const emptyForm = {
    plan_name: '',
    plan_key: '',
    description: '',
    price_inr: '',
    price_usd: '',
    duration_type: 'monthly',
    duration_days: '30',
    trial_days: '0',
    features: '',
    is_active: true,
    is_highlighted: false,
    highlight_text: '',
    icon_name: '',
    sort_order: '0',
    razorpay_plan_id_inr: '',
    razorpay_plan_id_usd: '',
};

type FormState = typeof emptyForm;

function InputField({ label, value, onChange, placeholder, mono = false, type = 'text' }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; mono?: boolean; type?: string;
}) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">{label}</label>
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                className={`w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${mono ? 'font-mono' : ''}`}
            />
        </div>
    );
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>({ ...emptyForm });
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await fetch('/super-admin-stillzone/api/plans');
            const json = await res.json();
            if (json.success) setPlans(json.data);
            else setError(json.message);
        } catch { setError('Failed to load plans'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPlans(); }, []);

    const field = <K extends keyof FormState>(key: K) => (v: string) =>
        setForm(f => ({ ...f, [key]: v }));

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm });
        setShowForm(true);
        setExpandedId(null);
    };

    const openEdit = (plan: Plan) => {
        setEditingId(plan.id);
        setForm({
            plan_name: plan.plan_name,
            plan_key: plan.plan_key,
            description: plan.description || '',
            price_inr: toHuman(plan.price_inr),
            price_usd: toHuman(plan.price_usd),
            duration_type: plan.duration_type,
            duration_days: String(plan.duration_days),
            trial_days: String(plan.trial_days),
            features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
            is_active: plan.is_active,
            is_highlighted: plan.is_highlighted,
            highlight_text: plan.highlight_text || '',
            icon_name: plan.icon_name || '',
            sort_order: String(plan.sort_order),
            razorpay_plan_id_inr: plan.razorpay_plan_id_inr || '',
            razorpay_plan_id_usd: plan.razorpay_plan_id_usd || '',
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
    };

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleSave = async () => {
        if (!form.plan_name.trim() || !form.plan_key.trim()) {
            setError('Plan Name and Plan Key are required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const payload = {
                plan_name: form.plan_name.trim(),
                plan_key: form.plan_key.trim().toLowerCase().replace(/\s+/g, '-'),
                description: form.description.trim(),
                price_inr: toPaise(form.price_inr),
                price_usd: toPaise(form.price_usd),
                duration_type: form.duration_type,
                duration_days: Number(form.duration_days) || 30,
                trial_days: Number(form.trial_days) || 0,
                features: form.features.split('\n').map(f => f.trim()).filter(Boolean),
                is_active: form.is_active,
                is_highlighted: form.is_highlighted,
                highlight_text: form.highlight_text.trim(),
                icon_name: form.icon_name.trim(),
                sort_order: Number(form.sort_order) || 0,
                razorpay_plan_id_inr: form.razorpay_plan_id_inr.trim(),
                razorpay_plan_id_usd: form.razorpay_plan_id_usd.trim(),
            };

            const url = editingId
                ? `/super-admin-stillzone/api/plans/${editingId}`
                : '/super-admin-stillzone/api/plans';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);

            await fetchPlans();
            closeForm();
            showSuccess(editingId ? 'Plan updated!' : 'Plan created!');
        } catch (e: unknown) {
            setError((e as Error).message || 'Failed to save plan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setSaving(true);
        try {
            const res = await fetch(`/super-admin-stillzone/api/plans/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            await fetchPlans();
            setDeletingId(null);
            showSuccess('Plan deleted.');
        } catch (e: unknown) {
            setError((e as Error).message || 'Failed to delete');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (plan: Plan, field: 'is_active' | 'is_highlighted') => {
        try {
            const res = await fetch(`/super-admin-stillzone/api/plans/${plan.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...plan, [field]: !plan[field] }),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            await fetchPlans();
        } catch (e: unknown) { setError((e as Error).message || 'Update failed'); }
    };

    return (
        <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-6 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Subscription Plans
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Manage payment plans — changes reflect in the live database.
                    </p>
                </div>
                <Button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    <Plus className="w-4 h-4" /> Add Plan
                </Button>
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

            {/* Form */}
            {showForm && (
                <Card className="border-indigo-200 dark:border-indigo-800/50 shadow-md bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-top-2 duration-200">
                    <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="flex items-center gap-2 text-base">
                            {editingId ? <Pencil className="w-4 h-4 text-indigo-500" /> : <Plus className="w-4 h-4 text-indigo-500" />}
                            {editingId ? 'Edit Plan' : 'New Plan'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-5">
                        {/* Row 1: name, key */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Plan Name *" value={form.plan_name} onChange={field('plan_name')} placeholder="e.g. Serenity" />
                            <InputField label="Plan Key * (slug)" value={form.plan_key} onChange={v => field('plan_key')(v.toLowerCase().replace(/\s+/g, '-'))} placeholder="e.g. serenity" mono />
                        </div>

                        {/* Description */}
                        <InputField label="Description" value={form.description} onChange={field('description')} placeholder="Short plan description..." />

                        {/* Row 2: prices */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <InputField label="Price INR (₹) — e.g. 999.00" value={form.price_inr} onChange={field('price_inr')} placeholder="999.00" type="number" />
                            <InputField label="Price USD ($) — e.g. 9.99" value={form.price_usd} onChange={field('price_usd')} placeholder="9.99" type="number" />
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Duration Type</label>
                                <div className="relative">
                                    <select
                                        value={form.duration_type}
                                        onChange={e => setForm(f => ({ ...f, duration_type: e.target.value }))}
                                        className="w-full appearance-none border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-9 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                    >
                                        <option value="free">Free</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="lifetime">Lifetime</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Row 3: duration, trial, sort */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <InputField label="Duration Days" value={form.duration_days} onChange={field('duration_days')} placeholder="30" type="number" />
                            <InputField label="Trial Days" value={form.trial_days} onChange={field('trial_days')} placeholder="0" type="number" />
                            <InputField label="Sort Order" value={form.sort_order} onChange={field('sort_order')} placeholder="0" type="number" />
                        </div>

                        {/* Features */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Features (one per line)</label>
                            <textarea
                                value={form.features}
                                placeholder={"Unlimited sessions\nMood tracking\nAudio tools"}
                                rows={4}
                                onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            />
                        </div>

                        {/* Highlight */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Highlight Text (e.g. Most Popular)" value={form.highlight_text} onChange={field('highlight_text')} placeholder="Most Popular" />
                            <InputField label="Icon Name" value={form.icon_name} onChange={field('icon_name')} placeholder="e.g. star" />
                        </div>

                        {/* Razorpay */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Razorpay Plan ID (INR)" value={form.razorpay_plan_id_inr} onChange={field('razorpay_plan_id_inr')} placeholder="plan_xxx" mono />
                            <InputField label="Razorpay Plan ID (USD)" value={form.razorpay_plan_id_usd} onChange={field('razorpay_plan_id_usd')} placeholder="plan_xxx" mono />
                        </div>

                        {/* Toggle flags */}
                        <div className="flex flex-wrap items-center gap-6">
                            <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                {form.is_active ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                                {form.is_active ? 'Active' : 'Inactive'}
                            </button>
                            <button type="button" onClick={() => setForm(f => ({ ...f, is_highlighted: !f.is_highlighted }))} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                {form.is_highlighted ? <ToggleRight className="w-6 h-6 text-amber-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                                {form.is_highlighted ? '⭐ Highlighted' : 'Not Highlighted'}
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                {editingId ? 'Save Changes' : 'Create Plan'}
                            </Button>
                            <Button variant="ghost" onClick={closeForm} disabled={saving}>Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Plans list */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
            ) : plans.length === 0 ? (
                <Card className="border-dashed border-slate-200 dark:border-slate-700 shadow-none bg-white dark:bg-slate-900">
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                        <div className="p-4 rounded-full bg-indigo-50 dark:bg-indigo-900/20">
                            <CreditCard className="w-8 h-8 text-indigo-400" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">No plans found</p>
                        <p className="text-sm text-slate-400">Click <strong>Add Plan</strong> to create a new subscription plan.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.map(plan => (
                        <Card
                            key={plan.id}
                            className={`border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-all duration-200 ${!plan.is_active ? 'opacity-60' : ''} ${plan.is_highlighted ? 'ring-2 ring-amber-400/50' : ''}`}
                        >
                            <CardContent className="p-5">
                                {/* Top row */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                                            <Sparkles className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-slate-900 dark:text-white">{plan.plan_name}</h3>
                                                {plan.is_highlighted && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${DURATION_COLORS[plan.duration_type] || DURATION_COLORS.monthly}`}>
                                                    {DURATION_LABELS[plan.duration_type] || plan.duration_type}
                                                </span>
                                                {!plan.is_active && (
                                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Inactive</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 font-mono mt-0.5">{plan.plan_key}</p>
                                            {plan.highlight_text && <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{plan.highlight_text}</p>}
                                        </div>
                                    </div>
                                    {/* Price */}
                                    <div className="text-right shrink-0">
                                        <div className="text-xl font-bold text-slate-900 dark:text-white">
                                            {plan.price_usd === 0 ? 'Free' : `$${toHuman(plan.price_usd)}`}
                                        </div>
                                        {plan.price_inr > 0 && <div className="text-xs text-slate-400">₹{toHuman(plan.price_inr)}</div>}
                                    </div>
                                </div>

                                {/* Description */}
                                {plan.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">{plan.description}</p>}

                                {/* Expandable details */}
                                <button
                                    onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
                                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mt-3 transition-colors"
                                >
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedId === plan.id ? 'rotate-180' : ''}`} />
                                    {expandedId === plan.id ? 'Hide details' : 'Show details'}
                                </button>

                                {expandedId === plan.id && (
                                    <div className="mt-3 space-y-3 animate-in fade-in duration-150">
                                        {/* Features */}
                                        {plan.features && plan.features.length > 0 && (
                                            <ul className="space-y-1.5">
                                                {plan.features.map((f, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                        <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />{f}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {/* Meta info */}
                                        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                                            <div><span className="block font-medium text-slate-700 dark:text-slate-200">{plan.duration_days}d</span>Duration</div>
                                            <div><span className="block font-medium text-slate-700 dark:text-slate-200">{plan.trial_days}d</span>Trial</div>
                                            <div><span className="block font-medium text-slate-700 dark:text-slate-200">#{plan.sort_order}</span>Order</div>
                                        </div>
                                        {/* Razorpay IDs */}
                                        {(plan.razorpay_plan_id_inr || plan.razorpay_plan_id_usd) && (
                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 font-mono text-xs text-slate-400">
                                                {plan.razorpay_plan_id_inr && <div>INR: {plan.razorpay_plan_id_inr}</div>}
                                                {plan.razorpay_plan_id_usd && <div>USD: {plan.razorpay_plan_id_usd}</div>}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action row */}
                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button onClick={() => handleToggle(plan, 'is_active')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" title={plan.is_active ? 'Deactivate' : 'Activate'}>
                                        {plan.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                                        {plan.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                    <button onClick={() => handleToggle(plan, 'is_highlighted')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 transition-colors" title="Toggle highlight">
                                        <Star className={`w-4 h-4 ${plan.is_highlighted ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                                    </button>

                                    <div className="ml-auto flex items-center gap-1">
                                        <button onClick={() => openEdit(plan)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" title="Edit">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        {deletingId === plan.id ? (
                                            <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-2 py-1">
                                                <span className="text-xs text-red-600 dark:text-red-400">Delete?</span>
                                                <button onClick={() => handleDelete(plan.id)} disabled={saving} className="text-red-600 hover:text-red-700 dark:text-red-400 p-0.5">
                                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                </button>
                                                <button onClick={() => setDeletingId(null)} className="text-slate-500 p-0.5"><X className="w-3.5 h-3.5" /></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setDeletingId(plan.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </main>
    );
}
