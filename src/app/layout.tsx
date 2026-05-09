import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Dancing_Script } from "next/font/google";
import "./globals.css";
import "@/components/3DComponents.css";
import Script from "next/script";
import ThemeProvider from "@/components/ThemeProvider";
import ScrollRestorationManager from "@/components/ScrollRestorationManager";
import { Suspense } from "react";
import { AudioControllerProvider } from "@/context/AudioControllerContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
  fallback: ["monospace"],
});

const dancingScript = Dancing_Script({
  variable: "--font-cursive",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  fallback: ["cursive"],
});

const SITE_URL = "https://stilllift.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Still Lift — Mental Wellness, Mindfulness & Micro-Habits",
    template: "%s | Still Lift",
  },
  description:
    "Still Lift is a science-backed mental wellness platform providing personalized mindfulness messages, guided breathing, and 60-second micro-habits for daily calm and emotional balance.",
  keywords: [
    "still lift",
    "stilllift",
    "still zone",
    "mental health app",
    "mental wellness",
    "mindfulness",
    "meditation app",
    "micro habits",
    "guided breathing",
    "anxiety relief",
    "stress relief",
    "self care",
    "mood tracker",
    "wellness journal",
    "breathing exercises",
    "calm app alternative",
    "mental fitness",
  ],
  applicationName: "Still Lift",
  authors: [{ name: "Still Lift" }],
  creator: "Still Lift",
  publisher: "Still Lift",
  category: "Health & Wellness",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Still Lift",
    title: "Still Lift — Mental Wellness, Mindfulness & Micro-Habits",
    description:
      "Personalized mindfulness messages, guided breathing, and 60-second micro-habits for a calmer, more focused day.",
    images: [
      {
        url: "/Logo-stilllift-new.png",
        width: 1200,
        height: 630,
        alt: "Still Lift — A mindful pause for everyday life",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Still Lift — Mental Wellness & Mindful Micro-Habits",
    description:
      "Personalized mindful messages and 60-second micro-habits to help you feel calm, focused, and balanced.",
    images: ["/Logo-stilllift-new.png"],
    creator: "@stilllift",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/Logo-stilllift-new.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#004851",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Remove known extension-injected classes before hydration to avoid mismatches */}
        <Script id="sanitize-extension-classes" strategy="beforeInteractive">{`
          try { document.documentElement.classList.remove('js-storylane-extension'); } catch (e) {}
        `}</Script>
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${dancingScript.variable} antialiased font-inter h-max`}
        style={
          {
            "--font-inter": inter.style.fontFamily,
            "--font-mono": jetbrainsMono.style.fontFamily,
            "--font-cursive": dancingScript.style.fontFamily,
          } as React.CSSProperties
        }
      >
        <ThemeProvider>
          <AudioControllerProvider>
            <ScrollRestorationManager />
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            <Toaster position="top-center" />
          </AudioControllerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
