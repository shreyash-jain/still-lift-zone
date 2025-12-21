import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "StillLift - How are you feeling today?",
  description:
    "A mental health platform providing personalized wellness messages and micro-habits for immediate support.",
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
