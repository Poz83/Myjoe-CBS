'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import NextImage from 'next/image';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthHandler } from '@/components/auth-handler';
import { PricingSection } from '@/components/pricing-section';
import {
  Sparkles,
  Download,
  Shield,
  Zap,
  Clock,
  DollarSign,
  Check,
  ChevronRight,
  BookOpen,
  Palette,
  FileImage,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  BadgeCheck,
  Target,
  Layers,
  Image,
  Pencil
} from 'lucide-react';

function ColoringPencil({ color, tipColor = '#2a2a2a' }: { color: string; tipColor?: string }) {
  return (
    <svg viewBox="0 0 120 24" className="w-full h-full">
      {/* Pencil body */}
      <rect x="20" y="4" width="95" height="16" rx="2" fill={color} />
      {/* Stripe detail */}
      <rect x="20" y="4" width="95" height="4" rx="1" fill="rgba(255,255,255,0.2)" />
      {/* Pencil tip wood */}
      <polygon points="20,4 20,20 5,12" fill="#d4a574" />
      {/* Pencil tip graphite */}
      <polygon points="5,12 0,12 5,10 5,14" fill={tipColor} />
      {/* End cap */}
      <rect x="115" y="4" width="5" height="16" rx="1" fill="rgba(0,0,0,0.3)" />
    </svg>
  );
}

function FloatingPencils() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-[15%] w-24 h-6 animate-drift-right" style={{ opacity: 0.2 }}>
        <ColoringPencil color="#3de8ff" />
      </div>
      <div className="absolute top-[35%] w-20 h-5 animate-drift-left" style={{ opacity: 0.15 }}>
        <ColoringPencil color="#7c4dff" />
      </div>
      <div className="absolute top-[55%] w-28 h-7 animate-drift-right-slow" style={{ opacity: 0.12 }}>
        <ColoringPencil color="#ec4899" />
      </div>
      <div className="absolute top-[75%] w-16 h-4 animate-drift-left-slow" style={{ opacity: 0.18 }}>
        <ColoringPencil color="#4ade80" />
      </div>
      <div className="absolute top-[25%] w-20 h-5 animate-drift-right" style={{ opacity: 0.15, animationDelay: '5s' }}>
        <ColoringPencil color="#facc15" />
      </div>
      <div className="absolute top-[85%] w-24 h-6 animate-drift-left" style={{ opacity: 0.12, animationDelay: '3s' }}>
        <ColoringPencil color="#f97316" />
      </div>
    </div>
  );
}

const tilesData = [
  { id: 1, left: '0%', top: '15%', rotation: -12, label: "Dragon sketch", img: "https://placehold.co/160x180/1a1a2e/3de8ff?text=Dragon" },
  { id: 2, left: '22%', top: '0%', rotation: -5, label: "Page layout", img: "https://placehold.co/160x180/1a1a2e/7c4dff?text=Layout" },
  { id: 3, left: '44%', top: '20%', rotation: 3, label: "Preview", img: "https://placehold.co/180x220/1a1a2e/3de8ff?text=Preview", main: true },
  { id: 4, left: '68%', top: '5%', rotation: 8, label: "Styles", img: "https://placehold.co/160x180/1a1a2e/7c4dff?text=Styles" },
  { id: 5, left: '55%', top: '55%', rotation: -3, label: "Export", img: "https://placehold.co/160x180/1a1a2e/3de8ff?text=Export" },
];

function FloatingCards() {
  return (
    <div className="relative w-full h-[500px]">
      {tilesData.map((tile) => (
        <motion.div
          key={tile.id}
          className={`absolute ${tile.main ? 'w-[180px] h-[220px]' : 'w-[160px] h-[200px]'} rounded-2xl overflow-hidden cursor-pointer`}
          style={{
            left: tile.left,
            top: tile.top,
          }}
          initial={{ rotate: tile.rotation }}
          whileHover={{
            scale: 2.8,
            rotate: 0,
            y: -20,
            zIndex: 100,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="w-full h-full bg-bg-surface border border-zinc-700/50 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={tile.img}
              alt={tile.label}
              className="w-full h-3/4 object-cover"
            />
            <div className="p-3 bg-gradient-to-t from-zinc-900 to-zinc-800">
              <p className="text-xs text-zinc-300 text-center font-medium">{tile.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      router.replace(`/auth/callback?code=${code}`);
    }
  }, [searchParams, router]);

  return (
    <main className="min-h-screen text-[#EAF4F8] overflow-x-hidden relative">
      <FloatingPencils />
      <AuthHandler />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-base/80 backdrop-blur-lg border-b border-zinc-800/50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <NextImage
                src="/myjoe-logo.png"
                alt="Myjoe Coloring Studios"
                width={140}
                height={40}
                priority
                className="h-10 w-auto"
              />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-zinc-400 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-zinc-400 hover:text-white transition-colors">How It Works</a>
              <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors">Pricing</a>
              <a href="#faq" className="text-zinc-400 hover:text-white transition-colors">FAQ</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-zinc-400 hover:text-white transition-colors hidden sm:block">
                Sign In
              </Link>
              <Link
                href="/login"
                className="bg-accent-cyan hover:bg-accent-cyan/80 text-bg-base px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Create Free Book
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative min-h-[90vh]">
        <div className="max-w-[1200px] mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <NextImage src="/myjoe-logo.png" alt="Myjoe" width={32} height={32} className="w-8 h-8" />
                <span className="text-zinc-400 font-medium">Myjoe</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
                Turn simple ideas into
                <span className="block mt-2">
                  <span className="relative inline-block">
                    profitable
                    <svg className="absolute -bottom-1 left-0 w-full h-2" viewBox="0 0 100 8" fill="none" preserveAspectRatio="none">
                      <path d="M0 6C20 2 80 2 100 6" stroke="#3de8ff" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </span>
                  {' '}coloring books
                </span>
              </h1>

              <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-lg">
                AI-powered coloring book studio that helps you create professional,
                print-ready books in minutes.
              </p>

              {/* CTA Buttons - thumio style */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Link
                  href="/login"
                  className="bg-white hover:bg-zinc-100 text-black px-6 py-3 rounded-full font-medium transition-all hover:scale-105 flex items-center gap-2 group"
                >
                  Create your first book
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
                >
                  Sign in
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="space-y-2 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent-cyan" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent-cyan" />
                  <span>Free CTR Report</span>
                </div>
              </div>

              <a href="#how-it-works" className="inline-block mt-6 text-zinc-500 hover:text-white text-sm underline underline-offset-4 transition-colors">
                See how it works
              </a>
            </div>

            {/* Right side - Floating cards */}
            <div className="hidden lg:block">
              <FloatingCards />
            </div>
          </div>

          {/* Bottom badge */}
          <div className="absolute bottom-0 right-8 hidden lg:flex items-center gap-3 bg-zinc-800/80 backdrop-blur rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse" />
            <span className="text-zinc-400 text-sm">AI Coloring Book Studio</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-500 text-sm">Free To Use</span>
          </div>
        </div>
      </section>


      {/* Pain Points Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-surface/50">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Sound Familiar?
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Generic AI tools weren't built for coloring books. You end up spending more time fixing problems than creating.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                problem: "Your Characters Look Different on Every Page",
                description: "Most AI tools generate a new character every time. Readers notice inconsistency. Your book feels unprofessional.",
                solution: "Hero Reference Sheets lock in your character's exact look across every page"
              },
              {
                problem: "KDP Keeps Rejecting Your Files",
                description: "Wrong DPI. Margins too small. File too large. Bleed area missing. You've uploaded the same book 5 times.",
                solution: "One-click exports with perfect margins, 300 DPI, and KDP-validated formats"
              },
              {
                problem: "Toddler Books With Adult Complexity",
                description: "Tiny details that no 3-year-old could color. Or worse: adult books that look childish. Your customers want refunds.",
                solution: "Age-specific presets from Toddler to Adult automatically adjust line weight and detail"
              }
            ].map((item, i) => (
              <div key={i} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 hover:border-accent-cyan/20 transition-colors group">
                <div className="text-red-400 font-semibold mb-3 text-lg">{item.problem}</div>
                <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{item.description}</p>
                <div className="flex items-start gap-2 text-green-400 text-sm bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="font-medium">{item.solution}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Inline CTA */}
          <div className="text-center mt-12">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-accent-cyan hover:text-accent-cyan/80 font-medium transition-colors group"
            >
              Stop wasting time on tools that weren't built for this
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-accent-cyan font-medium mb-4">PURPOSE-BUILT FOR COLORING BOOKS</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Designed for Coloring Books
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Every feature designed specifically for KDP and Etsy coloring book publishers.
              Clean lines, consistent characters, print-ready exports.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "One-Click Batch Generation",
                description: "Generate your entire 40-page book in one session. No repetitive prompting. Just describe your theme and go.",
                highlight: "~$3-4 per complete book"
              },
              {
                icon: Users,
                title: "Hero Reference Sheets",
                description: "Create consistent characters across your entire book. Front, side, back, and 3/4 views locked in for every page.",
                highlight: "Character consistency"
              },
              {
                icon: Shield,
                title: "Content Moderation",
                description: "Every image scanned for inappropriate content before you download. Strict mode for children's books helps ensure age-appropriate results.",
                highlight: "Built-in safety filters"
              },
              {
                icon: Palette,
                title: "Style Lock Technology",
                description: "Preview 4 variations, pick your favorite, and every page matches. No more \"why does page 12 look different?\"",
                highlight: "5 presets + infinite custom"
              },
              {
                icon: FileImage,
                title: "True Print-Ready Exports",
                description: "300 DPI PNGs. PDFs with correct margins. SVG vectors for Cricut crafters. Everything KDP and IngramSpark need.",
                highlight: "Upload → Approve → Publish"
              },
              {
                icon: Target,
                title: "Age-Perfect Complexity",
                description: "Thick, simple lines for toddlers. Intricate mandalas for adults. The AI knows the difference and delivers accordingly.",
                highlight: "5 age presets built-in"
              }
            ].map((feature, i) => (
              <div key={i} className="group bg-bg-surface/50 border border-zinc-800 rounded-xl p-6 hover:border-accent-cyan/20 transition-all hover:bg-zinc-900">
                <div className="w-12 h-12 bg-accent-cyan/10 border border-accent-cyan/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent-cyan/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-accent-cyan" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm mb-3">{feature.description}</p>
                <span className="text-xs text-green-400 font-medium bg-green-500/10 px-2 py-1 rounded">{feature.highlight}</span>
              </div>
            ))}
          </div>

          {/* Feature CTA */}
          <div className="text-center mt-12">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-accent-cyan hover:bg-accent-cyan/80 text-bg-base px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            >
              See These Features in Action
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-surface/50">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-accent-cyan font-medium mb-4">STUPIDLY SIMPLE</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Idea → Published Book → Royalties
            </h2>
            <p className="text-zinc-400 text-lg">
              If you can type "cute dinosaur in a garden," you can publish a coloring book.
            </p>
          </div>

          <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
            {[
              {
                step: "01",
                title: "Describe Your Book",
                description: "Pick your audience (toddlers love thick lines, adults want detail). Choose a style. Create a Hero for character consistency. That's it.",
                detail: "2 minutes of setup"
              },
              {
                step: "02",
                title: "Generate All 40 Pages",
                description: "Type simple prompts like \"Luna the cat playing in leaves\" — the AI handles line art, complexity, and consistency automatically.",
                detail: "10 seconds per page"
              },
              {
                step: "03",
                title: "Export & Upload to KDP",
                description: "One click: PDF with perfect margins, 300 DPI, correct bleed. Upload to KDP. Hit publish. Start collecting royalties.",
                detail: "Live on Amazon today"
              }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-8 h-full hover:border-accent-cyan/20 transition-colors">
                  <div className="text-6xl font-bold text-accent-cyan/30 mb-4">{step.step}</div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-zinc-400 mb-4">{step.description}</p>
                  <span className="text-sm text-green-400 font-medium">{step.detail}</span>
                </div>
                {i < 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-zinc-700" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Time Comparison */}
          <div className="mt-16 bg-gradient-to-r from-accent-cyan/10 to-purple-600/10 border border-accent-cyan/20 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">The Old Way vs. The Myjoe Way</h3>
                <p className="text-zinc-400 mb-4">
                  Hiring artists, managing revisions, fixing file formats, re-uploading rejected PDFs...
                  or just typing what you want and clicking publish.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-zinc-400">
                    <Check className="w-4 h-4 text-green-500" />
                    No design software needed
                  </li>
                  <li className="flex items-center gap-2 text-zinc-400">
                    <Check className="w-4 h-4 text-green-500" />
                    No hiring freelance artists
                  </li>
                  <li className="flex items-center gap-2 text-zinc-400">
                    <Check className="w-4 h-4 text-green-500" />
                    No complex prompting to learn
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-red-400">40+ hrs</div>
                  <div className="text-zinc-400 text-sm mt-1">Traditional Method</div>
                  <div className="text-red-400/60 text-xs mt-2">+ $200-500 artist fees</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-green-400">2-4 hrs</div>
                  <div className="text-zinc-400 text-sm mt-1">With Myjoe</div>
                  <div className="text-green-400/60 text-xs mt-2">~$3-4 total cost</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA after how it works */}
          <div className="text-center mt-12">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-accent-cyan hover:text-accent-cyan/80 font-medium transition-colors group"
            >
              Try it yourself — your first book is free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <PricingSection />

      {/* What's Included Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-surface/50">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for Coloring Book Creators
            </h2>
            <p className="text-zinc-400">Everything you need to create and publish</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Character consistency with Hero Sheets",
              "Age-appropriate complexity presets",
              "300 DPI print-ready output",
              "KDP margin presets",
              "Content moderation for kids' books",
              "Batch page generation",
              "PNG, PDF & SVG export",
              "Commercial license included"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 bg-zinc-800/30 rounded-lg p-4">
                <Check className="w-5 h-5 text-accent-cyan shrink-0" />
                <span className="text-zinc-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-accent-cyan font-medium mb-4">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Common Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Can I sell the coloring books I create commercially?",
                a: "Yes! All paid plans include a full commercial license. You own 100% of the rights to sell on Amazon KDP, Etsy, your own website, or anywhere else. Free tier is for personal use only."
              },
              {
                q: "What resolution are the generated images?",
                a: "All images are generated at 300 DPI, which exceeds Amazon KDP's requirements for professional print quality. Pages are optimized for standard coloring book sizes (8.5×11, 8.5×8.5, and 6×9 inches)."
              },
              {
                q: "How does character consistency work?",
                a: "Our Hero Reference Sheet feature generates a 4-view character sheet (front, side, back, and 3/4 angle). When you add a Hero to your project, our AI uses these reference views to maintain consistent character appearance across all pages."
              },
              {
                q: "Is the content appropriate for children?",
                a: "We take content safety seriously. Every prompt and generated image goes through OpenAI's moderation system. For children's content, we apply strict thresholds and additional GPT-4 Vision scanning to ensure age-appropriate results."
              },
              {
                q: "What if I run out of Blots mid-project?",
                a: "You can purchase Blot Packs anytime — they never expire and stack with your subscription. We also check your full project requirements before starting generation, so you won't run out mid-batch."
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes, cancel anytime with no penalties. You'll keep access until your billing period ends, then downgrade to Free tier. Your projects and generated images remain accessible."
              },
              {
                q: "What file formats can I export?",
                a: "PNG for individual pages, PDF for complete books with proper margins, and SVG vector files (great for Cricut and other cutting machines). All formats are included in paid plans."
              }
            ].map((faq, i) => (
              <details key={i} className="group bg-bg-surface/50 border border-zinc-800 rounded-xl">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-medium pr-4">{faq.q}</span>
                  <ChevronRight className="w-5 h-5 text-zinc-500 group-open:rotate-90 transition-transform shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-zinc-400">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-gradient-to-r from-accent-cyan/20 via-accent-purple/20 to-accent-purple/10 border border-accent-cyan/20 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-green-400 text-sm font-medium">Free tier includes 75 Blots (~15 pages) to start</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Your First Coloring Book is Waiting
              </h2>
              <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
                Stop researching. Start publishing. Create your first professional
                coloring book today — completely free, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="w-full sm:w-auto bg-white hover:bg-zinc-100 text-black px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                >
                  Create Your First Book Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-400 mt-8">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Commercial license</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="inline-block mb-4">
                <NextImage
                  src="/myjoe-logo.png"
                  alt="Myjoe Coloring Studios"
                  width={140}
                  height={40}
                  className="h-10 w-auto"
                />
              </Link>
              <p className="text-zinc-500 text-sm">
                AI Coloring Book Studio for KDP publishers and Etsy sellers.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">KDP Publishing Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Etsy Seller Tips</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Style Gallery</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Commercial License</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} Myjoe. All rights reserved.
            </p>
            <p className="text-sm text-zinc-500">
              Made for KDP publishers who want to publish faster.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
