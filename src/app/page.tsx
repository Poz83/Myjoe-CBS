import Link from 'next/link';
import { redirect } from 'next/navigation';
import NextImage from 'next/image';
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
  Image
} from 'lucide-react';

interface LandingPageProps {
  searchParams: { code?: string | string[]; [key: string]: string | string[] | undefined };
}

export default function LandingPage({ searchParams }: LandingPageProps) {
  // If OAuth code is present, redirect to auth callback handler
  const code = searchParams.code;
  if (code) {
    const codeValue = Array.isArray(code) ? code[0] : code;
    redirect(`/auth/callback?code=${codeValue}`);
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-lg border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Create Free Book
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          {/* Market Opportunity Badge */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-full px-5 py-2.5 mb-8">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">$3.2 Billion Industry Growing 65% Year-Over-Year</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Turn Simple Ideas Into
            <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Profitable Coloring Books
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            The only AI coloring book generator built specifically for Amazon KDP and Etsy sellers.
            Create a complete 40-page book in one afternoon — with consistent characters,
            clean line art, and print-ready exports.
          </p>

          {/* Quick Value Statement */}
          <p className="text-lg text-zinc-500 mb-8">
            No design skills. No expensive software. No KDP rejections.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/login"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 group shadow-lg shadow-blue-600/25"
            >
              Create Your First Book Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto border border-zinc-700 hover:border-zinc-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
            >
              Watch It Work
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500 mb-4">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Commercial license included</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>300 DPI print quality</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 border-2 border-[#0D0D0D] flex items-center justify-center text-xs font-medium">
                  {['S', 'M', 'E', 'J', 'A'][i-1]}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            <span className="text-zinc-400 text-sm">Trusted by 2,500+ KDP publishers</span>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl border border-zinc-700/50 aspect-video flex items-center justify-center overflow-hidden shadow-2xl shadow-blue-500/10">
            <div className="grid grid-cols-4 gap-4 p-8 w-full h-full">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-zinc-700/30 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-zinc-400 text-lg">Product Preview</span>
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl -z-10" />
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
        <div className="max-w-5xl mx-auto">
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
                problem: "Your Dragon Looks Different on Every Page",
                description: "Midjourney gives you a new character every time. Kids notice. Parents leave 1-star reviews. Your book sales tank.",
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
              <div key={i} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-colors group">
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
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors group"
            >
              Stop wasting time on tools that weren't built for this
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-blue-400 font-medium mb-4">PURPOSE-BUILT FOR COLORING BOOKS</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Not Another Generic AI Image Tool
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
                highlight: "~$2 per complete book"
              },
              {
                icon: Users,
                title: "Hero Reference Sheets",
                description: "Create consistent characters that kids actually recognize. Front, side, back, and 3/4 views locked in forever.",
                highlight: "Used by series creators"
              },
              {
                icon: Shield,
                title: "KDP-Safe Content Filter",
                description: "Every image scanned for inappropriate content before you download. Strict mode for children's books means zero nasty surprises.",
                highlight: "Zero KDP content rejections"
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
              <div key={i} className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:bg-zinc-900">
                <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-blue-400" />
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
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            >
              See These Features in Action
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-blue-400 font-medium mb-4">STUPIDLY SIMPLE</span>
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
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-8 h-full hover:border-blue-500/30 transition-colors">
                  <div className="text-6xl font-bold text-blue-600/30 mb-4">{step.step}</div>
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
          <div className="mt-16 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-8">
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
                    No Photoshop or Illustrator needed
                  </li>
                  <li className="flex items-center gap-2 text-zinc-400">
                    <Check className="w-4 h-4 text-green-500" />
                    No hiring freelancers on Fiverr
                  </li>
                  <li className="flex items-center gap-2 text-zinc-400">
                    <Check className="w-4 h-4 text-green-500" />
                    No learning complex prompting
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
                  <div className="text-green-400/60 text-xs mt-2">~$2 total cost</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA after how it works */}
          <div className="text-center mt-12">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors group"
            >
              Try it yourself — your first book is free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-blue-400 font-medium mb-4">BY THE NUMBERS</span>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Join Thousands of Successful KDP Publishers
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { stat: "2,500+", label: "Active Publishers", subtext: "growing daily" },
              { stat: "150K+", label: "Pages Generated", subtext: "this month alone" },
              { stat: "0%", label: "KDP Rejection Rate", subtext: "when using our exports" },
              { stat: "100%", label: "Commercial Rights", subtext: "you own everything" }
            ].map((item, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {item.stat}
                </div>
                <div className="text-white font-medium">{item.label}</div>
                <div className="text-zinc-500 text-sm">{item.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-blue-400 font-medium mb-4">SUCCESS STORIES</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              From Side Hustle to Real Income
            </h2>
            <p className="text-zinc-400 text-lg">
              See how publishers are building profitable coloring book businesses
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "What started as a hobby became a surprising source of income. I published my first 5 books in one month and they're now generating $800/month in passive royalties.",
                name: "Sarah M.",
                role: "Former Teacher, Now Full-time Publisher",
                result: "$800+/month passive income",
                books: "47 books published"
              },
              {
                quote: "The Hero Reference Sheet feature is a game-changer. My 'Adventures with Luna' series has consistent characters across 12 books. Kids recognize her instantly.",
                name: "Marcus T.",
                role: "Children's Book Series Creator",
                result: "12-book series with loyal readers",
                books: "23 books published"
              },
              {
                quote: "I used to spend $50-100 per book on Fiverr artists. Now I create better quality books myself for pennies. My profit margins went from 30% to 85%.",
                name: "Emily R.",
                role: "Etsy & KDP Entrepreneur",
                result: "85% profit margins",
                books: "89 books published"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-6 flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-zinc-300 mb-6 flex-grow">&quot;{testimonial.quote}&quot;</p>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 mb-4">
                  <span className="text-green-400 font-semibold text-sm">{testimonial.result}</span>
                </div>
                <div className="border-t border-zinc-700/50 pt-4">
                  <div className="font-medium">{testimonial.name}</div>
                  <div className="text-sm text-zinc-500">{testimonial.role}</div>
                  <div className="text-xs text-blue-400 mt-1">{testimonial.books}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA after testimonials */}
          <div className="text-center mt-12">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            >
              Start Your Publishing Journey
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-blue-400 font-medium mb-4">PRICING</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-zinc-400 text-lg">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          {/* Blot Explanation */}
          <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-6 mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🎨</span>
              <span className="font-semibold">Blots = Your Creative Currency</span>
            </div>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto">
              1 coloring page = 5 Blots (~$0.01). A complete 40-page book uses about 212 Blots including setup.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Free Tier */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <div className="text-zinc-400 font-medium mb-2">Free</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-zinc-500">/month</span>
              </div>
              <div className="text-blue-400 font-medium mb-6">50 Blots/month</div>
              <ul className="space-y-3 mb-8">
                {[
                  "~10 coloring pages/month",
                  "3 projects max",
                  "25 GB storage",
                  "PNG + PDF export",
                  "All 5 style presets"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block w-full text-center border border-zinc-700 hover:border-zinc-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* Creator Tier */}
            <div className="bg-gradient-to-b from-blue-600/10 to-transparent border-2 border-blue-500/50 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="text-blue-400 font-medium mb-2">Creator</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold">$15</span>
                <span className="text-zinc-500">/month</span>
              </div>
              <div className="text-xs text-zinc-500 mb-2">or $150/year (2 months free)</div>
              <div className="text-blue-400 font-medium mb-6">500 Blots/month</div>
              <ul className="space-y-3 mb-8">
                {[
                  "~2 complete books/month",
                  "Unlimited projects",
                  "25 GB storage",
                  "Commercial license",
                  "Hero Reference Sheets",
                  "PNG + PDF + SVG export"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Start Creating
              </Link>
            </div>

            {/* Studio Tier */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <div className="text-purple-400 font-medium mb-2">Studio</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-zinc-500">/month</span>
              </div>
              <div className="text-xs text-zinc-500 mb-2">or $490/year (2 months free)</div>
              <div className="text-purple-400 font-medium mb-6">2,000 Blots/month</div>
              <ul className="space-y-3 mb-8">
                {[
                  "~9 complete books/month",
                  "Unlimited projects",
                  "50 GB storage",
                  "Commercial license",
                  "Priority support",
                  "Everything in Creator"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block w-full text-center border border-zinc-700 hover:border-zinc-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Go Studio
              </Link>
            </div>
          </div>

          {/* Need More Section */}
          <div className="mt-8 text-center">
            <p className="text-zinc-400">
              Need more Blots? Add a <span className="text-white font-medium">Top-Up Pack (100 Blots / $5)</span> or
              <span className="text-white font-medium"> Boost Pack (500 Blots / $20)</span> anytime. Packs never expire.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Myjoe vs. Generic AI Tools
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-4 px-4 text-zinc-400 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-zinc-400 font-medium">Generic AI</th>
                  <th className="text-center py-4 px-4 font-medium text-blue-400">Myjoe</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { feature: "Character Consistency", generic: false, myjoe: true },
                  { feature: "Age-Appropriate Complexity", generic: false, myjoe: true },
                  { feature: "300 DPI Output", generic: false, myjoe: true },
                  { feature: "KDP Margin Presets", generic: false, myjoe: true },
                  { feature: "Content Safety for Kids", generic: false, myjoe: true },
                  { feature: "Batch Generation", generic: false, myjoe: true },
                  { feature: "SVG Vector Export", generic: false, myjoe: true },
                  { feature: "Commercial License", generic: "Varies", myjoe: true }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-zinc-800">
                    <td className="py-4 px-4 text-zinc-300">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {row.generic === true ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : row.generic === false ? (
                        <span className="text-red-400">✕</span>
                      ) : (
                        <span className="text-yellow-500">{row.generic}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-blue-400 font-medium mb-4">FAQ</span>
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
              <details key={i} className="group bg-zinc-900/50 border border-zinc-800 rounded-xl">
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

      {/* Market Opportunity Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-blue-400 font-medium mb-4">THE OPPORTUNITY</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Coloring Books? Why Now?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">$3.2 Billion Market</h3>
                  <p className="text-zinc-400 text-sm">The coloring book industry is massive and growing 65% year-over-year on Amazon. The market isn't saturated — it's expanding.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Zero Upfront Costs with KDP</h3>
                  <p className="text-zinc-400 text-sm">Print-on-demand means no inventory, no printing costs, no risk. Amazon handles fulfillment. You collect royalties.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <Layers className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Evergreen Passive Income</h3>
                  <p className="text-zinc-400 text-sm">Coloring books sell year-round. Create once, earn forever. Publishers with 20+ titles report $2-5K/month in royalties.</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-8">
              <h3 className="font-semibold text-xl mb-4 text-center">Quick Math: Your First Book</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-zinc-700/50">
                  <span className="text-zinc-400">Average coloring book price</span>
                  <span className="font-medium">$8.99</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-700/50">
                  <span className="text-zinc-400">Your royalty per sale (60%)</span>
                  <span className="font-medium text-green-400">$2.50</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-700/50">
                  <span className="text-zinc-400">Sales needed to cover Creator plan</span>
                  <span className="font-medium">6 books/month</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-green-500/10 rounded-lg px-3">
                  <span className="text-zinc-300">Sell 100/month across all titles</span>
                  <span className="font-bold text-green-400">$250/month</span>
                </div>
              </div>
              <p className="text-zinc-500 text-xs mt-4 text-center">
                Most publishers reach 100 sales/month within 6 months with 5+ titles
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-blue-500/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-green-400 text-sm font-medium">Free tier includes 10 pages to start</span>
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
        <div className="max-w-6xl mx-auto">
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
