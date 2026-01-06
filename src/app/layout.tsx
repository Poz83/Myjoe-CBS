import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider } from "../components/PostHogProvider";

export const metadata: Metadata = {
  title: "Myjoe - AI Coloring Book Studio",
  description: "AI coloring book studio for KDP publishers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-base text-white antialiased">
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}