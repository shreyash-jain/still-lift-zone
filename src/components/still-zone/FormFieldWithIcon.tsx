'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldWithIconProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon: LucideIcon;
    placeholder?: string;
    disabled?: boolean;
    type?: string;
    className?: string;
}

/**
 * Reusable form field component with icon
 * Used in profile and other forms
 */
export function FormFieldWithIcon({
    id,
    label,
    value,
    onChange,
    icon: Icon,
    placeholder,
    disabled = false,
    type = 'text',
    className,
}: FormFieldWithIconProps) {
    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor={id}>{label}</Label>
            <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                    <Icon className="w-4 h-4" />
                </div>
                <Input
                    id={id}
                    type={type}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-10"
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}
