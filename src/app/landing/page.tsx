'use client';

import Link from 'next/link';
import Image from 'next/image';
import logoStillLift from '@/../public/Logo stilllift new.svg';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Brain,
    Heart,
    Sparkles,
    Wind,
    BookOpen,
    Clock,
    ShieldCheck,
    Star,
    CheckCircle2,
    PlayCircle,
    LineChart,
    Moon,
    Sun,
    Headphones,
    Quote,
    Zap,
    Layers,
    Coffee,
    Briefcase,
    Bed,
    Users,
    FlaskConical,
    Lock,
    Crown,
    Calendar,
    Download,
    MessageCircleHeart,
    Infinity as InfinityIcon,
    Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SIGNUP_URL = 'https://stilllift.com';
const STILLZONE_URL = 'https://stilllift.com/still-zone/login?returnUrl=%2Fstill-zone';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
    }),
};

const features = [
    {
        icon: Brain,
        title: 'Personalized Mindfulness',
        body: 'Tell us how you feel. We craft a session shaped by your mood, context, and the time you have.',
    },
    {
        icon: Wind,
        title: 'Guided Breathing',
        body: 'Box-breathing, 4-7-8, and resonance breath — backed by research, narrated for calm.',
    },
    {
        icon: Sparkles,
        title: '60-Second Micro-Habits',
        body: 'Small, repeatable nudges that fit between meetings. Habits that compound into calm.',
    },
    {
        icon: BookOpen,
        title: 'Reflective Journal',
        body: 'A clean, private space to capture wins, worries, and gratitude — with thoughtful prompts.',
    },
    {
        icon: LineChart,
        title: 'Mood Insights',
        body: 'See patterns in how you feel. Understand triggers. Celebrate the streaks that matter.',
    },
    {
        icon: Headphones,
        title: 'Audio That Soothes',
        body: 'Therapist-narrated meditations and ambient soundscapes engineered to lower the noise.',
    },
];

const steps = [
    { n: '01', title: 'Tell us how you feel', body: 'Pick your mood, your context, and how much time you have.' },
    { n: '02', title: 'Receive a mindful prompt', body: 'A personalized message, breath, or visualisation chosen for this moment.' },
    { n: '03', title: 'Build the habit', body: 'Return daily. Watch your mood patterns shift over weeks, not years.' },
];

const testimonials = [
    {
        name: 'Aarav Mehta',
        role: 'Software Engineer',
        body: 'I used to scroll between meetings. Now I take 60 seconds with Still Lift and re-enter the next call actually present.',
    },
    {
        name: 'Priya Sharma',
        role: 'Therapist',
        body: 'The micro-habit approach is exactly what behaviour science recommends. My clients love using it between sessions.',
    },
    {
        name: 'Daniel Cole',
        role: 'Founder',
        body: 'It feels less like an app and more like a quiet friend. The breathing and journaling combo is gold.',
    },
];

const faqs = [
    {
        q: 'What is Still Lift?',
        a: 'Still Lift is a mental wellness platform offering personalized mindfulness messages and 60-second micro-habits based on how you feel — built with therapists, designed for daily life.',
    },
    {
        q: 'Is Still Lift free?',
        a: 'Yes. The core experience — mood check-ins, mindful prompts, and breathing — is free. Premium plans unlock guided audio, journaling history, and personalized programs.',
    },
    {
        q: 'How long does a session take?',
        a: 'Most sessions take 60 seconds. We believe consistency beats intensity — small, repeatable nudges that fit your day.',
    },
    {
        q: 'Is Still Lift a replacement for therapy?',
        a: 'No. Still Lift complements therapy and self-care. If you are in distress, please consult a qualified mental health professional.',
    },
    {
        q: 'How is my data protected?',
        a: 'Your reflections are private and encrypted. We never sell your data, and you can delete your account and data at any time.',
    },
];

export default function LandingPage() {
    return (
        <div
            data-landing-root
            className="relative min-h-screen overflow-hidden bg-[#f6f9f9] text-[#0f2326] selection:bg-[#88ADA8]/40 selection:text-[#003A40]"
        >
            {/* Ambient background gradients */}
            <BackgroundOrbs />

            {/* NAV */}
            <header className="relative z-30">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8 sm:py-4">
                    <Link href="/landing" className="flex items-center gap-2.5 group">
                        <LogoMark />
                        <span className="text-base font-semibold tracking-tight text-[#003A40] sm:text-lg">
                            Still Lift
                        </span>
                    </Link>
                    <div className="hidden items-center gap-8 md:flex">
                        <a href="#features" className="text-sm text-[#2E5653] hover:text-[#003A40] transition-colors">Features</a>
                        <a href="#experiences" className="text-sm text-[#2E5653] hover:text-[#003A40] transition-colors">Still Lift &amp; Zone</a>
                        <a href="#still-zone" className="text-sm text-[#2E5653] hover:text-[#003A40] transition-colors">Still Zone</a>
                        <a href="#premium" className="text-sm font-medium text-[#003A40] hover:text-[#00282E] transition-colors">Premium</a>
                        <a href="#faq" className="text-sm text-[#2E5653] hover:text-[#003A40] transition-colors">FAQ</a>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            asChild
                            className="bg-[#004851] text-white shadow-[0_8px_24px_-10px_rgba(0,72,81,0.6)] hover:bg-[#003A40]"
                        >
                            <a href={SIGNUP_URL} rel="noopener">
                                Join Still Lift <ArrowRight className="ml-1 h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </nav>
            </header>

            {/* HERO */}
            <section className="relative z-20">
                <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-4 sm:px-8 sm:pt-8 lg:grid-cols-2 lg:gap-8 lg:pb-28 lg:pt-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        className="flex flex-col justify-center"
                    >
                        <Badge
                            variant="outline"
                            className="mb-6 w-fit rounded-full border-[#88ADA8]/40 bg-white/80 px-3 py-1 text-[#2E5653] backdrop-blur-sm"
                        >
                            <Sparkles className="mr-1.5 h-3 w-3 text-[#629093]" />
                            Mindful tech, built with therapists
                        </Badge>

                        <h1 className="font-semibold tracking-tight text-[#003A40] text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
                            A mindful pause,
                            <br />
                            <span className="bg-gradient-to-r from-[#004851] via-[#3F6D6A] to-[#88ADA8] bg-clip-text text-transparent">
                                made for your day.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-relaxed text-[#2E5653] sm:text-lg">
                            Still Lift turns 60 seconds into a reset — personalized mindful
                            messages, guided breathing, and micro-habits that quietly build a
                            calmer, more focused you.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Button
                                asChild
                                size="lg"
                                className="h-12 bg-[#004851] px-7 text-base text-white shadow-[0_10px_30px_-12px_rgba(0,72,81,0.7)] hover:bg-[#003A40]"
                            >
                                <a href={SIGNUP_URL} rel="noopener">
                                    Join Still Lift <ArrowRight className="ml-1 h-4 w-4" />
                                </a>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-12 border-[#88ADA8]/50 bg-white/70 px-7 text-base text-[#003A40] backdrop-blur hover:bg-white"
                            >
                                <a href={STILLZONE_URL} rel="noopener">
                                    <PlayCircle className="mr-1 h-4 w-4" />
                                    Show Still Zone
                                </a>
                            </Button>
                        </div>

                        {/* Trust row */}
                        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#3F6D6A]">
                            <div className="flex items-center gap-1.5">
                                <div className="flex">
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <span className="font-medium text-[#003A40]">4.9</span>
                                <span>· 1,280+ reviews</span>
                            </div>
                            <span className="hidden h-4 w-px bg-[#88ADA8]/40 sm:block" />
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="h-4 w-4 text-[#629093]" />
                                Private & encrypted
                            </div>
                            <span className="hidden h-4 w-px bg-[#88ADA8]/40 sm:block" />
                            <div className="flex items-center gap-1.5">
                                <Heart className="h-4 w-4 text-[#629093]" />
                                Built with therapists
                            </div>
                        </div>
                    </motion.div>

                    {/* Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
                        className="relative flex items-center justify-center"
                    >
                        <HeroVisual />
                    </motion.div>
                </div>
            </section>

            {/* MARQUEE / SOCIAL PROOF STRIP */}
            <section className="relative z-20 border-y border-[#88ADA8]/20 bg-white/60 backdrop-blur-sm">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-x-10 gap-y-4 px-5 py-6 text-xs uppercase tracking-[0.18em] text-[#3F6D6A] sm:px-8">
                    <span>As featured for · Mindful Tech</span>
                    <span>· Wellness Daily</span>
                    <span>· The Calm Edit</span>
                    <span>· Founders & Focus</span>
                    <span>· Habit Lab</span>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="relative z-20 mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
                <div className="mx-auto max-w-2xl text-center">
                    <Badge variant="outline" className="rounded-full border-[#88ADA8]/40 bg-white/70 text-[#2E5653]">
                        Features
                    </Badge>
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#003A40] sm:text-4xl">
                        Small moments. Real shifts.
                    </h2>
                    <p className="mt-4 text-[#2E5653]">
                        Everything you need for a mindful day — without the overwhelm of a
                        meditation marathon.
                    </p>
                </div>

                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-80px' }}
                            variants={fadeUp}
                        >
                            <Card className="group h-full border-[#88ADA8]/25 bg-white/80 py-7 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-[#629093]/50 hover:shadow-[0_20px_40px_-20px_rgba(0,72,81,0.25)]">
                                <CardContent className="flex flex-col gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#004851] to-[#629093] text-white shadow-[0_8px_20px_-8px_rgba(0,72,81,0.5)]">
                                        <f.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-[#003A40]">{f.title}</h3>
                                    <p className="text-sm leading-relaxed text-[#3F6D6A]">{f.body}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how" className="relative z-20 bg-gradient-to-b from-transparent via-[#e9f2f2] to-transparent py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <Badge variant="outline" className="rounded-full border-[#88ADA8]/40 bg-white/70 text-[#2E5653]">
                            How it works
                        </Badge>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#003A40] sm:text-4xl">
                            Three steps to your reset
                        </h2>
                        <p className="mt-4 text-[#2E5653]">
                            Open the app. Take a breath. Carry the calm forward.
                        </p>
                    </div>

                    <div className="mt-14 grid gap-6 lg:grid-cols-3">
                        {steps.map((s, i) => (
                            <motion.div
                                key={s.n}
                                custom={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-80px' }}
                                variants={fadeUp}
                                className="relative rounded-2xl border border-[#88ADA8]/30 bg-white/85 p-7 backdrop-blur-sm"
                            >
                                <div className="absolute -top-4 left-7 rounded-full bg-gradient-to-br from-[#004851] to-[#3F6D6A] px-3 py-1 text-xs font-semibold tracking-wider text-white shadow-[0_8px_20px_-8px_rgba(0,72,81,0.5)]">
                                    STEP {s.n}
                                </div>
                                <h3 className="mt-3 text-xl font-semibold text-[#003A40]">{s.title}</h3>
                                <p className="mt-3 text-sm leading-relaxed text-[#3F6D6A]">{s.body}</p>
                                <CheckCircle2 className="mt-6 h-5 w-5 text-[#629093]" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TWO EXPERIENCES — STILL LIFT vs STILL ZONE */}
            <section id="experiences" className="relative z-20 mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
                <div className="mx-auto max-w-2xl text-center">
                    <Badge variant="outline" className="rounded-full border-[#88ADA8]/40 bg-white/70 text-[#2E5653]">
                        Two experiences, one mission
                    </Badge>
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#003A40] sm:text-4xl">
                        Still Lift &amp; Still Zone — built for different moments
                    </h2>
                    <p className="mt-4 text-[#2E5653]">
                        Quick reset when life is loud. Deeper practice when you have a few
                        more minutes. Use one, use both — they work beautifully together.
                    </p>
                </div>

                <div className="mt-14 grid gap-6 lg:grid-cols-2">
                    {/* STILL LIFT */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={fadeUp}
                    >
                        <Card className="h-full overflow-hidden border-[#88ADA8]/30 bg-white/90 py-0 backdrop-blur-sm">
                            <div className="bg-gradient-to-br from-[#e7f1f0] via-white to-[#f6f9f9] p-8 sm:p-10">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#88ADA8] to-[#3F6D6A] text-white shadow-[0_8px_20px_-8px_rgba(0,72,81,0.5)]">
                                        <Zap className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider text-[#629093]">Still Lift</div>
                                        <h3 className="text-xl font-semibold text-[#003A40]">For the 60-second reset</h3>
                                    </div>
                                </div>
                                <p className="mt-5 text-[15px] leading-relaxed text-[#2E5653]">
                                    Still Lift is your in-the-moment companion. Tell us how you
                                    feel and we deliver a single, perfectly-sized nudge —
                                    a mindful message, a breath cycle, a tiny visualisation —
                                    designed to fit between meetings, commutes, or late-night
                                    spirals.
                                </p>
                                <ul className="mt-6 space-y-3 text-sm text-[#2E5653]">
                                    <ProductBullet>Mood × context check-ins (sad, anxious, stuck, drained, restless)</ProductBullet>
                                    <ProductBullet>Personalized 60-second mindful messages</ProductBullet>
                                    <ProductBullet>Breath patterns: box-breath, 4-7-8, resonance</ProductBullet>
                                    <ProductBullet>Reveal animations that make the pause feel like play</ProductBullet>
                                    <ProductBullet>Therapist-narrated audio for hands-free moments</ProductBullet>
                                </ul>
                                <div className="mt-7 flex items-center gap-2 text-xs text-[#3F6D6A]">
                                    <Clock className="h-3.5 w-3.5" />
                                    Typical session: 30–90 seconds
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 border-t border-[#88ADA8]/25 bg-white/60 px-8 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
                                <p className="text-sm text-[#3F6D6A]">
                                    <span className="font-semibold text-[#003A40]">Best for:</span>{' '}
                                    overwhelm, decision fatigue, racing thoughts.
                                </p>
                                <Button
                                    asChild
                                    className="shrink-0 bg-[#004851] text-white shadow-[0_8px_24px_-10px_rgba(0,72,81,0.6)] hover:bg-[#003A40]"
                                >
                                    <a href={SIGNUP_URL} rel="noopener">
                                        Join Still Lift <ArrowRight className="ml-1 h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </Card>
                    </motion.div>

                    {/* STILL ZONE */}
                    <motion.div
                        custom={1}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={fadeUp}
                    >
                        <Card className="h-full overflow-hidden border-[#88ADA8]/30 bg-white/90 py-0 backdrop-blur-sm">
                            <div className="relative bg-gradient-to-br from-[#dceae8] via-[#bcd5d2] to-[#9bc0bc] p-8 text-[#003A40] sm:p-10">
                                <Badge className="absolute right-6 top-6 border-0 bg-[#003A40] text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                                    <Crown className="mr-1 h-3 w-3 text-amber-300" /> Premium
                                </Badge>
                                <div className="flex items-center gap-3">
                                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#003A40] text-white shadow-[0_8px_20px_-8px_rgba(0,72,81,0.4)]">
                                        <Layers className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider text-[#3F6D6A]">Still Zone</div>
                                        <h3 className="text-xl font-semibold text-[#003A40]">For the deeper practice</h3>
                                    </div>
                                </div>
                                <p className="mt-5 text-[15px] leading-relaxed text-[#2E5653]">
                                    Still Zone is your private inner studio. Multi-step
                                    sessions, structured journaling, mood history, and guided
                                    programs that compound over weeks. It is where the
                                    micro-habits become a quietly transformative practice.
                                </p>
                                <ul className="mt-6 space-y-3 text-sm text-[#2E5653]">
                                    <ProductBullet>Multi-day guided programs (focus, sleep, anxiety)</ProductBullet>
                                    <ProductBullet>Reflective journal with prompted questions &amp; PDF export</ProductBullet>
                                    <ProductBullet>Mood &amp; habit insights — see the patterns shift</ProductBullet>
                                    <ProductBullet>Custom support cards for your real-life triggers</ProductBullet>
                                    <ProductBullet>Dark mode + screenless mode for end-of-day calm</ProductBullet>
                                </ul>
                                <div className="mt-7 flex items-center gap-2 text-xs text-[#3F6D6A]">
                                    <Clock className="h-3.5 w-3.5" />
                                    Typical session: 5–15 minutes
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 border-t border-[#88ADA8]/25 bg-white/70 px-8 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
                                <p className="text-sm text-[#3F6D6A]">
                                    <span className="font-semibold text-[#003A40]">Best for:</span>{' '}
                                    end-of-day wind-down, weekly reflection, sustained habits.
                                </p>
                                <Button
                                    asChild
                                    className="shrink-0 bg-[#003A40] text-white shadow-[0_8px_24px_-10px_rgba(0,72,81,0.6)] hover:bg-[#00282E]"
                                >
                                    <a href={STILLZONE_URL} rel="noopener">
                                        Show Still Zone <ArrowRight className="ml-1 h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* STILL ZONE — DEEP DIVE */}
            <section id="still-zone" className="relative z-20 mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
                <div className="mx-auto max-w-2xl text-center">
                    <Badge className="border-0 bg-[#003A40] text-white">
                        <Layers className="mr-1 h-3 w-3 text-[#88ADA8]" /> Inside Still Zone
                    </Badge>
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#003A40] sm:text-4xl">
                        A quiet inner studio, designed to last
                    </h2>
                    <p className="mt-4 text-[#2E5653]">
                        While Still Lift is the 60-second nudge, Still Zone is the place
                        you return to. Track how you really feel, build rituals that stick,
                        and watch your patterns shift week over week.
                    </p>
                </div>

                <div className="mt-14 grid gap-6 lg:grid-cols-3">
                    <ZoneFeature
                        icon={Calendar}
                        title="Multi-day programs"
                        body="Structured 7, 14 and 30-day journeys for focus, sleep, anxiety and grief — co-built with licensed therapists."
                    />
                    <ZoneFeature
                        icon={BookOpen}
                        title="Reflective journal"
                        body="Prompted entries with mood tagging. Search past reflections, export to PDF, or keep them encrypted and offline."
                    />
                    <ZoneFeature
                        icon={LineChart}
                        title="Mood &amp; habit insights"
                        body="See trend lines for energy, anxiety, and gratitude. Learn what genuinely shifts your day."
                    />
                    <ZoneFeature
                        icon={MessageCircleHeart}
                        title="Custom support cards"
                        body="Build your own deck of mantras, micro-habits, and grounding cues for your real-life triggers."
                    />
                    <ZoneFeature
                        icon={Headphones}
                        title="Therapist-narrated audio"
                        body="A growing library of guided meditations, body scans, and ambient soundscapes for deeper sessions."
                    />
                    <ZoneFeature
                        icon={Moon}
                        title="Screenless &amp; dark mode"
                        body="Wind-down friendly. Audio-only experiences and OLED-friendly dark mode for late-night use."
                    />
                </div>
            </section>

            {/* PREMIUM / UPGRADE */}
            <section id="premium" className="relative z-20 mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
                <div className="relative overflow-hidden rounded-3xl border border-[#88ADA8]/40 bg-gradient-to-br from-[#f0f7f7] via-[#dceae8] to-[#bcd5d2] p-8 sm:p-12 lg:p-16">
                    {/* Glow accents */}
                    <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#88ADA8]/40 blur-3xl" />
                    <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#629093]/35 blur-3xl" />

                    <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
                        <div>
                            <Badge className="border-0 bg-[#003A40] text-white shadow-sm">
                                <Crown className="mr-1 h-3 w-3 text-amber-300" /> Want to upgrade?
                            </Badge>
                            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#003A40] sm:text-4xl">
                                Unlock Still Zone Premium
                            </h2>
                            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[#2E5653]">
                                Go beyond the 60-second reset. Premium opens up the full
                                Still Zone studio — every program, every guided audio, full
                                journaling history, and personalized insights that grow with
                                you.
                            </p>

                            <ul className="mt-7 grid gap-3 text-sm text-[#2E5653] sm:grid-cols-2">
                                <PremiumPerk icon={InfinityIcon} text="Unlimited journaling history" />
                                <PremiumPerk icon={Calendar} text="All multi-day programs" />
                                <PremiumPerk icon={Headphones} text="Full guided-audio library" />
                                <PremiumPerk icon={LineChart} text="Advanced mood insights" />
                                <PremiumPerk icon={Download} text="Export reflections to PDF" />
                                <PremiumPerk icon={Palette} text="Custom themes &amp; soundscapes" />
                            </ul>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Button
                                    asChild
                                    size="lg"
                                    className="h-12 bg-[#003A40] px-7 text-base font-semibold text-white shadow-[0_10px_30px_-12px_rgba(0,72,81,0.7)] hover:bg-[#00282E]"
                                >
                                    <a href={STILLZONE_URL} rel="noopener">
                                        <Crown className="mr-1 h-4 w-4 text-amber-300" />
                                        Upgrade to Premium
                                    </a>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="h-12 border-[#88ADA8]/60 bg-white/70 px-7 text-base text-[#003A40] backdrop-blur hover:bg-white"
                                >
                                    <a href={STILLZONE_URL} rel="noopener">Show Still Zone</a>
                                </Button>
                            </div>

                            <p className="mt-4 text-xs text-[#3F6D6A]">
                                Cancel anytime · 7-day free trial · No card required to start
                            </p>
                        </div>

                        {/* Pricing tile */}
                        <div className="relative">
                            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-[#88ADA8]/40 to-[#629093]/30 blur-2xl" />
                            <div className="relative rounded-3xl border border-[#88ADA8]/40 bg-white/95 p-7 shadow-[0_30px_60px_-30px_rgba(0,72,81,0.35)] backdrop-blur-sm sm:p-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider text-[#629093]">
                                            Still Zone Premium
                                        </div>
                                        <div className="mt-1 text-sm text-[#3F6D6A]">Annual billing</div>
                                    </div>
                                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#003A40] to-[#3F6D6A] text-white shadow-sm">
                                        <Crown className="h-5 w-5 text-amber-300" />
                                    </div>
                                </div>

                                <div className="mt-6 flex items-baseline gap-2">
                                    <span className="text-5xl font-semibold tracking-tight text-[#003A40]">
                                        ₹299
                                    </span>
                                    <span className="text-sm text-[#3F6D6A]">/ month, billed yearly</span>
                                </div>
                                <div className="mt-1 text-xs text-[#3F6D6A]">
                                    or ₹399/month, billed monthly
                                </div>

                                <div className="mt-6 space-y-3 border-t border-[#88ADA8]/30 pt-5 text-sm text-[#003A40]">
                                    <PerkRow>Everything in Still Lift Free</PerkRow>
                                    <PerkRow>Unlimited Still Zone access</PerkRow>
                                    <PerkRow>Premium audio &amp; programs</PerkRow>
                                    <PerkRow>Priority support</PerkRow>
                                </div>

                                <Button
                                    asChild
                                    className="mt-6 w-full bg-[#003A40] text-white hover:bg-[#00282E]"
                                >
                                    <a href={STILLZONE_URL} rel="noopener">
                                        Start 7-day free trial
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHEN TO USE — SCENARIOS */}
            <section className="relative z-20 bg-gradient-to-b from-transparent via-[#e9f2f2] to-transparent py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <Badge variant="outline" className="rounded-full border-[#88ADA8]/40 bg-white/70 text-[#2E5653]">
                            Made for real life
                        </Badge>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#003A40] sm:text-4xl">
                            The moments Still Lift was built for
                        </h2>
                        <p className="mt-4 text-[#2E5653]">
                            Mental wellness is not a 30-minute morning ritual. It is the
                            small recoveries you make through the day.
                        </p>
                    </div>

                    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <Scenario
                            icon={Briefcase}
                            title="Between meetings"
                            body="Reset attention in 60 seconds so the next conversation starts fresh."
                        />
                        <Scenario
                            icon={Coffee}
                            title="Morning anxiety"
                            body="A grounding breath and a single intention before the day starts pulling."
                        />
                        <Scenario
                            icon={Bed}
                            title="Late-night spirals"
                            body="A soft audio cue and a 4-7-8 breath cycle to slow a racing mind."
                        />
                        <Scenario
                            icon={Heart}
                            title="Hard emotions"
                            body="Personalized messages that meet sadness or frustration with steady presence."
                        />
                    </div>
                </div>
            </section>

            {/* SCIENCE & TRUST */}
            <section className="relative z-20 mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={fadeUp}
                    >
                        <Badge variant="outline" className="rounded-full border-[#88ADA8]/40 bg-white/70 text-[#2E5653]">
                            The science
                        </Badge>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#003A40] sm:text-4xl">
                            Tiny moments. Real neuroscience.
                        </h2>
                        <p className="mt-5 text-[15px] leading-relaxed text-[#2E5653]">
                            Still Lift draws on three decades of research in habit
                            formation, breath physiology, and acceptance-based therapy. We
                            do not believe a 30-minute meditation is the only path —
                            consistency beats intensity.
                        </p>
                        <ul className="mt-6 space-y-4 text-sm text-[#2E5653]">
                            <SciencePoint
                                icon={FlaskConical}
                                title="Box-breath lowers heart-rate variability stress markers"
                                body="Used by US Navy SEALs and validated in Frontiers in Human Neuroscience (2017)."
                            />
                            <SciencePoint
                                icon={Brain}
                                title="Tiny habits compound"
                                body="BJ Fogg's research shows 60-second behaviours stick 3.4× more than long ones."
                            />
                            <SciencePoint
                                icon={Users}
                                title="Co-designed with therapists"
                                body="Every prompt, breath, and message is reviewed by licensed mental-health professionals."
                            />
                        </ul>
                    </motion.div>

                    <motion.div
                        custom={1}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={fadeUp}
                        className="grid gap-4 sm:grid-cols-2"
                    >
                        <TrustCard
                            icon={Lock}
                            title="Private by design"
                            body="Your reflections are encrypted. We never sell your data — ever."
                        />
                        <TrustCard
                            icon={ShieldCheck}
                            title="HIPAA-aware"
                            body="Built with healthcare-grade data handling and Supabase row-level security."
                        />
                        <TrustCard
                            icon={Heart}
                            title="Therapist-reviewed"
                            body="Every message is co-authored with licensed mental-health professionals."
                        />
                        <TrustCard
                            icon={Sparkles}
                            title="No dark patterns"
                            body="No streaks that shame you. No notifications that hijack you. No noise."
                        />
                    </motion.div>
                </div>
            </section>

            {/* STATS */}
            <section className="relative z-20 mx-auto max-w-7xl px-5 py-16 sm:px-8">
                <div className="grid gap-6 rounded-3xl border border-[#88ADA8]/30 bg-gradient-to-br from-[#003A40] via-[#004851] to-[#3F6D6A] p-10 text-white sm:grid-cols-2 lg:grid-cols-4 lg:p-14">
                    <Stat value="60s" label="Average session length" icon={Clock} />
                    <Stat value="92%" label="Feel calmer after one session" icon={Heart} />
                    <Stat value="3.4×" label="More likely to keep a habit" icon={LineChart} />
                    <Stat value="24/7" label="Available whenever you need it" icon={Moon} />
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section id="stories" className="relative z-20 mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
                <div className="mx-auto max-w-2xl text-center">
                    <Badge variant="outline" className="rounded-full border-[#88ADA8]/40 bg-white/70 text-[#2E5653]">
                        Stories
                    </Badge>
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#003A40] sm:text-4xl">
                        Loved by quiet humans everywhere
                    </h2>
                </div>

                <div className="mt-14 grid gap-6 lg:grid-cols-3">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={t.name}
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-80px' }}
                            variants={fadeUp}
                        >
                            <Card className="h-full border-[#88ADA8]/25 bg-white/85 py-7 backdrop-blur-sm">
                                <CardContent className="flex h-full flex-col gap-4">
                                    <Quote className="h-7 w-7 text-[#88ADA8]" />
                                    <p className="text-[15px] leading-relaxed text-[#2E5653]">&ldquo;{t.body}&rdquo;</p>
                                    <div className="mt-auto flex items-center gap-3 pt-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#88ADA8] to-[#3F6D6A] text-sm font-semibold text-white">
                                            {t.name.split(' ').map((p) => p[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-[#003A40]">{t.name}</div>
                                            <div className="text-xs text-[#3F6D6A]">{t.role}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="relative z-20 bg-gradient-to-b from-transparent via-[#e9f2f2] to-transparent py-20 lg:py-28">
                <div className="mx-auto max-w-3xl px-5 sm:px-8">
                    <div className="text-center">
                        <Badge variant="outline" className="rounded-full border-[#88ADA8]/40 bg-white/70 text-[#2E5653]">
                            FAQ
                        </Badge>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#003A40] sm:text-4xl">
                            Questions, answered
                        </h2>
                    </div>

                    <div className="mt-12 space-y-4">
                        {faqs.map((f, i) => (
                            <motion.details
                                key={f.q}
                                custom={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-60px' }}
                                variants={fadeUp}
                                className="group rounded-2xl border border-[#88ADA8]/30 bg-white/85 p-5 backdrop-blur-sm open:shadow-[0_20px_40px_-20px_rgba(0,72,81,0.2)]"
                            >
                                <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-[#003A40]">
                                    {f.q}
                                    <span className="ml-4 grid h-7 w-7 place-items-center rounded-full bg-[#e9f2f2] text-[#3F6D6A] transition-transform group-open:rotate-45">
                                        +
                                    </span>
                                </summary>
                                <p className="mt-3 text-sm leading-relaxed text-[#3F6D6A]">{f.a}</p>
                            </motion.details>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="relative z-20 mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
                <div className="relative overflow-hidden rounded-3xl border border-[#88ADA8]/30 bg-gradient-to-br from-[#003A40] via-[#004851] to-[#3F6D6A] px-8 py-16 text-center text-white sm:px-14">
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#88ADA8]/20 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#629093]/30 blur-3xl" />

                    <div className="relative">
                        <Sun className="mx-auto h-9 w-9 text-[#88ADA8]" />
                        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                            Begin a calmer chapter — in 60 seconds.
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-white/80">
                            Free forever for the essentials. No credit card. No noise.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Button
                                asChild
                                size="lg"
                                className="h-12 bg-white px-7 text-base text-[#003A40] hover:bg-white/90"
                            >
                                <a href={SIGNUP_URL} rel="noopener">
                                    Join Still Lift <ArrowRight className="ml-1 h-4 w-4" />
                                </a>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-12 border-white/30 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white"
                            >
                                <a href={STILLZONE_URL} rel="noopener">Show Still Zone</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="relative z-20 border-t border-[#88ADA8]/25 bg-white/70 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
                    <div className="grid gap-8 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2.5">
                                <LogoMark />
                                <span className="text-lg font-semibold tracking-tight text-[#003A40]">Still Lift</span>
                            </div>
                            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#3F6D6A]">
                                Mindful tech, built with therapists. Personalized micro-habits
                                that help you feel calmer, focused, and emotionally balanced.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-[#003A40]">Product</h4>
                            <ul className="mt-3 space-y-2 text-sm text-[#3F6D6A]">
                                <li><a href="#features" className="hover:text-[#003A40]">Features</a></li>
                                <li><a href="#how" className="hover:text-[#003A40]">How it works</a></li>
                                <li><a href={SIGNUP_URL} rel="noopener" className="hover:text-[#003A40]">Join Still Lift</a></li>
                                <li><a href={STILLZONE_URL} rel="noopener" className="hover:text-[#003A40]">Show Still Zone</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-[#003A40]">Company</h4>
                            <ul className="mt-3 space-y-2 text-sm text-[#3F6D6A]">
                                <li><a href="#stories" className="hover:text-[#003A40]">Stories</a></li>
                                <li><a href="#faq" className="hover:text-[#003A40]">FAQ</a></li>
                                <li><a href="/sitemap.xml" className="hover:text-[#003A40]">Sitemap</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[#88ADA8]/25 pt-6 text-xs text-[#3F6D6A] sm:flex-row sm:items-center">
                        <p>© {new Date().getFullYear()} Still Lift. A mindful pause for everyday life.</p>
                        <p>Made with care · Not a substitute for medical advice.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function ZoneFeature({
    icon: Icon,
    title,
    body,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    body: string;
}) {
    return (
        <div className="group rounded-2xl border border-[#88ADA8]/30 bg-white/85 p-7 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-[#629093]/55 hover:shadow-[0_20px_40px_-22px_rgba(0,72,81,0.3)]">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#88ADA8] to-[#3F6D6A] text-white shadow-[0_8px_20px_-8px_rgba(0,72,81,0.5)]">
                <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[#003A40]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#3F6D6A]">{body}</p>
        </div>
    );
}

function PremiumPerk({
    icon: Icon,
    text,
}: {
    icon: React.ComponentType<{ className?: string }>;
    text: string;
}) {
    return (
        <li className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/80 text-[#003A40] ring-1 ring-[#88ADA8]/40">
                <Icon className="h-3.5 w-3.5" />
            </div>
            <span className="text-[13px]">{text}</span>
        </li>
    );
}

function PerkRow({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#629093]" />
            <span>{children}</span>
        </div>
    );
}

function ProductBullet({
    children,
    dark = false,
}: {
    children: React.ReactNode;
    dark?: boolean;
}) {
    return (
        <li className="flex items-start gap-2.5">
            <CheckCircle2
                className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? 'text-[#88ADA8]' : 'text-[#629093]'}`}
            />
            <span>{children}</span>
        </li>
    );
}

function Scenario({
    icon: Icon,
    title,
    body,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    body: string;
}) {
    return (
        <div className="rounded-2xl border border-[#88ADA8]/30 bg-white/85 p-6 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-[#629093]/50 hover:shadow-[0_18px_40px_-22px_rgba(0,72,81,0.3)]">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#88ADA8] to-[#3F6D6A] text-white">
                <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-[#003A40]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#3F6D6A]">{body}</p>
        </div>
    );
}

function SciencePoint({
    icon: Icon,
    title,
    body,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    body: string;
}) {
    return (
        <li className="flex items-start gap-3">
            <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#e9f2f2] text-[#3F6D6A]">
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <div className="font-semibold text-[#003A40]">{title}</div>
                <div className="mt-0.5 text-sm text-[#3F6D6A]">{body}</div>
            </div>
        </li>
    );
}

function TrustCard({
    icon: Icon,
    title,
    body,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    body: string;
}) {
    return (
        <div className="rounded-2xl border border-[#88ADA8]/30 bg-white/85 p-6 backdrop-blur-sm">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#004851] to-[#629093] text-white">
                <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-[#003A40]">{title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[#3F6D6A]">{body}</p>
        </div>
    );
}

function Stat({
    value,
    label,
    icon: Icon,
}: {
    value: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                <Icon className="h-5 w-5 text-[#88ADA8]" />
            </div>
            <div>
                <div className="text-3xl font-semibold tracking-tight">{value}</div>
                <div className="text-sm text-white/70">{label}</div>
            </div>
        </div>
    );
}

function LogoMark({ size = 40 }: { size?: number }) {
    return (
        <Image
            src={logoStillLift}
            alt="Still Lift logo"
            width={size}
            height={size}
            priority
            className="select-none"
        />
    );
}

function HeroVisual() {
    return (
        <div className="relative aspect-square w-full max-w-[520px]">
            {/* Floating orbs */}
            <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-2 top-4 z-10 hidden rounded-2xl border border-[#88ADA8]/40 bg-white/85 p-4 shadow-[0_20px_40px_-20px_rgba(0,72,81,0.3)] backdrop-blur-sm sm:block"
            >
                <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[#629093] to-[#88ADA8] text-white">
                        <Wind className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-[#3F6D6A]">Right now</div>
                        <div className="text-sm font-semibold text-[#003A40]">Box-breath · 4 rounds</div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -right-2 bottom-8 z-10 hidden rounded-2xl border border-[#88ADA8]/40 bg-white/85 p-4 shadow-[0_20px_40px_-20px_rgba(0,72,81,0.3)] backdrop-blur-sm sm:block"
            >
                <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[#3F6D6A] to-[#004851] text-white">
                        <Heart className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-[#3F6D6A]">Daily streak</div>
                        <div className="text-sm font-semibold text-[#003A40]">14 mindful days</div>
                    </div>
                </div>
            </motion.div>

            {/* Center disc */}
            <div className="absolute inset-0 grid place-items-center">
                <div className="relative">
                    {/* Pulsing rings */}
                    <motion.div
                        animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.15, 0.45] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 rounded-full border border-[#88ADA8]/60"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.22, 1], opacity: [0.3, 0.05, 0.3] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                        className="absolute inset-0 rounded-full border border-[#629093]/50"
                    />

                    <div className="relative grid h-72 w-72 place-items-center rounded-full bg-gradient-to-br from-white via-[#eef5f5] to-[#d8e8e7] shadow-[0_30px_80px_-30px_rgba(0,72,81,0.45)] ring-1 ring-[#88ADA8]/40 sm:h-80 sm:w-80">
                        <Image
                            src={logoStillLift}
                            alt="Still Lift logo"
                            width={260}
                            height={260}
                            priority
                            className="h-56 w-56 select-none sm:h-64 sm:w-64"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function BackgroundOrbs() {
    return (
        <>
            <div className="pointer-events-none absolute -top-24 -left-32 z-0 h-[420px] w-[420px] rounded-full bg-[#88ADA8]/30 blur-3xl" />
            <div className="pointer-events-none absolute top-40 right-[-160px] z-0 h-[480px] w-[480px] rounded-full bg-[#629093]/25 blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-160px] left-1/3 z-0 h-[520px] w-[520px] rounded-full bg-[#004851]/15 blur-3xl" />
            {/* Subtle dot pattern */}
            <div
                className="pointer-events-none absolute inset-0 z-0 opacity-[0.18]"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 1px 1px, rgba(0, 72, 81, 0.2) 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }}
            />
        </>
    );
}
