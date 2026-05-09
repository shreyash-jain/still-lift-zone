import type { MetadataRoute } from 'next';

const SITE_URL = 'https://stilllift.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/landing', '/still-zone', '/still-zone/signup', '/still-zone/login'],
                disallow: [
                    '/api/',
                    '/super-admin-stillzone/',
                    '/still-zone/(protected)/',
                    '/still-zone/dashboard/',
                    '/still-zone/journal/',
                    '/still-zone/profile/',
                    '/still-zone/payment/',
                    '/still-zone/my-plan/',
                    '/still-zone/onboarding/',
                    '/still-zone/experience/',
                    '/still-zone/support-selection/',
                    '/audio-test/',
                    '/message/',
                    '/message-balloon/',
                    '/message-card-focussed/',
                    '/message-card-moving/',
                    '/message-fortune/',
                    '/message-glassmorphic/',
                    '/message-revealed/',
                    '/message-scratch/',
                    '/message-tarot/',
                    '/scratch-card/',
                    '/cards/',
                    '/fortune-cookie/',
                    '/option2/',
                    '/option3/',
                    '/option4/',
                    '/still-lift-content-manager/',
                ],
            },
            {
                userAgent: 'GPTBot',
                disallow: '/',
            },
            {
                userAgent: 'CCBot',
                disallow: '/',
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
