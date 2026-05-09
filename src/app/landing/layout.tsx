import type { Metadata } from 'next';
import './landing.css';

const siteUrl = 'https://stilllift.com';

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: 'Still Lift — Mental Wellness, Mindfulness & Micro-Habits for Daily Calm',
        template: '%s | Still Lift',
    },
    description:
        'Still Lift is a science-backed mental wellness platform offering personalized mindfulness messages, guided breathing, and 60-second micro-habits to help you feel calmer, focused and emotionally balanced.',
    keywords: [
        'still lift',
        'stilllift',
        'still zone',
        'mental health app',
        'mental wellness platform',
        'mindfulness app',
        'meditation app',
        'micro habits',
        'guided breathing',
        'anxiety relief',
        'stress relief app',
        'emotional wellness',
        'self care app',
        'mindful moments',
        'mood tracker',
        'wellness journal',
        'daily affirmations',
        'mental fitness',
        'calm app alternative',
        'headspace alternative',
        'mindfulness for beginners',
        'work stress relief',
        'sleep meditation',
        'breathing exercises',
        'mental health support',
        'positive psychology',
    ],
    authors: [{ name: 'Still Lift' }],
    creator: 'Still Lift',
    publisher: 'Still Lift',
    applicationName: 'Still Lift',
    category: 'Health & Wellness',
    alternates: {
        canonical: '/landing',
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: `${siteUrl}/landing`,
        siteName: 'Still Lift',
        title: 'Still Lift — Mental Wellness, Mindfulness & Micro-Habits for Daily Calm',
        description:
            'Personalized mindfulness messages, guided breathing, and 60-second micro-habits — designed by therapists to fit into your day.',
        images: [
            {
                url: '/Logo-stilllift-new.png',
                width: 1200,
                height: 630,
                alt: 'Still Lift — A mindful pause for everyday life',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Still Lift — Mental Wellness & Mindful Micro-Habits',
        description:
            'Personalized mindful messages and 60-second micro-habits to help you feel calm, focused, and balanced.',
        images: ['/Logo-stilllift-new.png'],
        creator: '@stilllift',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: [
            { url: '/icon.svg', type: 'image/svg+xml' },
        ],
        apple: '/Logo-stilllift-new.png',
    },
    verification: {
        // Replace with real verification tokens when available
        // google: 'your-google-verification-code',
    },
    other: {
        'theme-color': '#004851',
    },
};

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': `${siteUrl}/#organization`,
                name: 'Still Lift',
                url: siteUrl,
                logo: `${siteUrl}/Logo-stilllift-new.png`,
                sameAs: [
                    'https://twitter.com/stilllift',
                    'https://instagram.com/stilllift',
                ],
            },
            {
                '@type': 'WebSite',
                '@id': `${siteUrl}/#website`,
                url: siteUrl,
                name: 'Still Lift',
                description:
                    'Mental wellness platform with personalized mindfulness and micro-habits.',
                publisher: { '@id': `${siteUrl}/#organization` },
                inLanguage: 'en-US',
            },
            {
                '@type': 'WebApplication',
                name: 'Still Lift',
                operatingSystem: 'Web, iOS, Android',
                applicationCategory: 'HealthApplication',
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                },
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '4.9',
                    ratingCount: '1280',
                },
            },
            {
                '@type': 'FAQPage',
                mainEntity: [
                    {
                        '@type': 'Question',
                        name: 'What is Still Lift?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Still Lift is a mental wellness platform that delivers personalized mindfulness messages and 60-second micro-habits based on how you feel.',
                        },
                    },
                    {
                        '@type': 'Question',
                        name: 'Is Still Lift free to use?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Yes — the core experience is free. Premium plans unlock guided audio, journaling, and personalized programs.',
                        },
                    },
                    {
                        '@type': 'Question',
                        name: 'How long does a Still Lift session take?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Most sessions take 60 seconds — designed to fit between meetings, before sleep, or whenever you need a reset.',
                        },
                    },
                ],
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </>
    );
}
