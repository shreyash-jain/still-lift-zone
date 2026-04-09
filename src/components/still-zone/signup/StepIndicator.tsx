'use client';

import { Check } from 'lucide-react';

const STEPS = [
  { num: 1, label: 'Details' },
  { num: 2, label: 'Plan' },
  { num: 3, label: 'Payment' },
  { num: 4, label: 'Done' },
];

export function StepIndicator({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-8">
      {STEPS.map((step, i) => {
        const done = current > step.num;
        const active = current === step.num;
        return (
          <div key={step.num} className="flex items-center gap-1.5 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                  done
                    ? 'bg-teal-600 text-white'
                    : active
                    ? 'bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-900/40'
                    : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : step.num}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-medium hidden sm:inline ${
                  done || active ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 sm:w-10 h-0.5 ${done ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
