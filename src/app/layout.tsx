import * as Sentry from '@sentry/nextjs';
import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider } from "../components/PostHogProvider";
import { QueryProvider } from "../providers/query-provider";
import { Toaster } from "../components/ui/toast";

export function generateMetadata(): Metadata {
  return {
    title: "Myjoe - AI Coloring Book Studio",
    description: "AI coloring book studio for KDP publishers",
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
        <PostHogProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </PostHogProvider>
        <Toaster />
      </body>
    </html>
  );
}