import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Still Lift — Mental Wellness & Mindful Micro-Habits',
        short_name: 'Still Lift',
        description:
            'Personalized mindfulness messages, guided breathing, and 60-second micro-habits for a calmer, more focused day.',
        start_url: '/landing',
        display: 'standalone',
        background_color: '#f6f9f9',
        theme_color: '#004851',
        orientation: 'portrait',
        categories: ['health', 'lifestyle', 'productivity', 'medical'],
        icons: [
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
                purpose: 'any',
            },
            {
                src: '/Logo-stilllift-new.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/Logo-stilllift-new.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    };
}
