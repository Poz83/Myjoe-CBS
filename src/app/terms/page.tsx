import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Myjoe Terms of Service',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>

        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-zinc-400 text-lg mb-8">
            Last updated: January 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-zinc-400">
              By accessing and using Myjoe (&quot;the Service&quot;), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p className="text-zinc-400">
              Myjoe is an AI-powered coloring book creation studio that allows users to generate, 
              edit, and export coloring book pages for personal and commercial use.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">3. User Accounts</h2>
            <p className="text-zinc-400">
              You are responsible for maintaining the confidentiality of your account credentials 
              and for all activities that occur under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">4. Intellectual Property</h2>
            <p className="text-zinc-400">
              Content you create using Myjoe belongs to you, subject to your subscription tier&apos;s 
              commercial usage rights. Free tier exports are for personal use only.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">5. Acceptable Use</h2>
            <p className="text-zinc-400">
              You agree not to use the Service to generate content that is illegal, harmful, 
              or violates the rights of others. We reserve the right to refuse service for 
              any reason.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">6. Payment and Subscriptions</h2>
            <p className="text-zinc-400">
              Paid subscriptions are billed according to the plan you select. 
              You may cancel at any time, and your subscription will remain active until 
              the end of the current billing period.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">7. Contact</h2>
            <p className="text-zinc-400">
              For questions about these Terms, please contact us at support@myjoe.app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
