"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export const BentoGrid = ({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "grid w-full auto-rows-[22rem] grid-cols-1 md:grid-cols-3 gap-4",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoCard = ({
    children,
    className,
    name,
    description,
    href,
    cta,
    background,
    Icon,
}: {
    children?: ReactNode;
    className?: string;
    name: string;
    description: string;
    href?: string;
    cta?: string;
    background?: ReactNode;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    Icon?: any;
}) => {
    return (
        <div
            key={name}
            className={cn(
                "group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-xl",
                "bg-white dark:bg-slate-900",
                "border border-slate-200 dark:border-slate-800", // border-muted replacement
                "shadow-sm transition-all hover:shadow-md",
                className
            )}
        >
            <div className="absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-105 opacity-50">
                {background}
            </div>

            <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-2">
                {Icon && (
                    <div className="mb-2 h-8 w-8 origin-left transform-gpu text-slate-700 dark:text-slate-300 transition-all duration-300 ease-in-out group-hover:scale-110">
                        <Icon className="h-full w-full" />
                    </div>
                )}
                <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
                    {name}
                </h3>
                <p className="max-w-lg text-slate-600 dark:text-slate-400">
                    {description}
                </p>
            </div>

            <div
                className={cn(
                    "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                )}
            >
                <span className="pointer-events-auto cursor-pointer rounded-lg bg-slate-900/5 dark:bg-slate-100/10 px-4 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 backdrop-blur-sm transition-colors hover:bg-slate-900/10 dark:hover:bg-slate-100/20">
                    {cta || "View"}
                </span>
            </div>
            <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-slate-900/5 dark:group-hover:bg-slate-100/5" />

            {children}
        </div>
    );
};

export const SimpleCard = ({
    children,
    className
}: { children: ReactNode, className?: string }) => {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6",
            className
        )}>
            {children}
        </div>
    )
}
