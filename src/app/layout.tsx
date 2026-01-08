import * as Sentry from '@sentry/nextjs';
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PostHogProvider } from "../components/PostHogProvider";
import { QueryProvider } from "../providers/query-provider";
import { LoadingProvider } from "../components/ui/loading-provider";
import { Toaster } from "../components/ui/toast";
import { CookieConsentBanner } from "../components/cookie-consent-banner";
import { ChunkLoadErrorBoundary } from "../components/errors/chunk-load-error-boundary";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D0D0D',
};

export function generateMetadata(): Metadata {
  return {
    title: {
      default: "Myjoe - AI Coloring Book Studio",
      template: "%s | Myjoe",
    },
    description: "Create professional coloring books with AI. Generate consistent characters, beautiful line art, and export print-ready PDFs for Amazon KDP publishing.",
    keywords: ["AI coloring book", "KDP publishing", "coloring book generator", "line art", "Amazon KDP", "print on demand"],
    authors: [{ name: "Myjoe" }],
    creator: "Myjoe",
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://myjoe.app'),
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "Myjoe",
      title: "Myjoe - AI Coloring Book Studio",
      description: "Create professional coloring books with AI. Generate consistent characters, beautiful line art, and export print-ready PDFs.",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Myjoe - AI Coloring Book Studio",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Myjoe - AI Coloring Book Studio",
      description: "Create professional coloring books with AI for Amazon KDP publishing.",
      images: ["/og-image.png"],
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      ...Sentry.getTraceData()
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-base text-white antialiased">
        <ChunkLoadErrorBoundary>
          <PostHogProvider>
            <QueryProvider>
              <LoadingProvider>
                {children}
              </LoadingProvider>
            </QueryProvider>
          </PostHogProvider>
          <CookieConsentBanner />
          <Toaster />
        </ChunkLoadErrorBoundary>
      </body>
    </html>
  );
}