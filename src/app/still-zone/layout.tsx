import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        default: 'Still Zone - How are you feeling today?',
        template: 'Still Zone - How are you feeling today?',
    },
    description:
        'A mental health platform providing personalized wellness messages and micro-habits for immediate support.',
};

export default function StillZoneLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
