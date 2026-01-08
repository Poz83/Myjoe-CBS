'use client';

import Link from 'next/link';
import { Palette, Users, BookOpen, Contrast, Grid3X3, Settings, CreditCard, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VaultTile } from '@/components/dashboard/vault-tile';

const studios = [
  { name: 'Coloring Book Studio', desc: 'Create stunning coloring pages', icon: Palette, href: '/studio', color: 'from-blue-500/20 to-blue-600/5', iconColor: 'text-blue-400', ready: true },
  { name: 'Hero Lab', desc: 'Design your characters', icon: Users, href: '/studio/library/heroes', color: 'from-purple-500/20 to-purple-600/5', iconColor: 'text-purple-400', ready: true },
  { name: 'Book Cover Creator', desc: 'Design book covers', icon: BookOpen, href: '#', color: 'from-amber-500/20 to-amber-600/5', iconColor: 'text-amber-400', ready: false },
  { name: 'Monochrome Maker', desc: 'Black & white magic', icon: Contrast, href: '#', color: 'from-zinc-400/20 to-zinc-500/5', iconColor: 'text-zinc-300', ready: false },
  { name: 'Paint by Numbers', desc: 'Generate number guides', icon: Grid3X3, href: '#', color: 'from-emerald-500/20 to-emerald-600/5', iconColor: 'text-emerald-400', ready: false },
  { name: 'Vault', desc: 'Your creative storage', icon: null, href: '/dashboard/vault', color: 'from-indigo-500/20 to-indigo-600/5', iconColor: 'text-indigo-400', ready: true, isVault: true },
];

const account = [
  { name: 'Settings', desc: 'Profile & account', icon: Settings, href: '/dashboard/settings' },
  { name: 'Billing', desc: 'Plans & usage', icon: CreditCard, href: '/dashboard/billing' },
  { name: 'Preferences', desc: 'Customize defaults', icon: Sliders, href: '/dashboard/settings?tab=preferences' },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
      <p className="text-zinc-500 mb-10">Choose a studio to start creating</p>

      {/* Studios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {studios.map((s) => {
          if (s.isVault) {
            return <VaultTile key={s.name} />;
          }

          return (
            <Link
              key={s.name}
              href={s.ready ? s.href : '#'}
              className={cn(
                'group relative p-6 rounded-2xl border border-white/5 bg-gradient-to-br transition-all duration-300',
                s.color,
                s.ready ? 'hover:border-white/10 hover:scale-[1.02] cursor-pointer' : 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className={cn('w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4', s.iconColor)}>
                <s.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{s.name}</h3>
              <p className="text-sm text-zinc-500">{s.desc}</p>
              {!s.ready && <span className="absolute top-4 right-4 text-xs text-zinc-600 bg-zinc-800/50 px-2 py-1 rounded-full">Coming soon</span>}
            </Link>
          );
        })}
      </div>

      {/* Account Section */}
      <h2 className="text-lg font-semibold text-zinc-400 mb-4">Account</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {account.map((a) => (
          <Link
            key={a.name}
            href={a.href}
            className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all"
          >
            <a.icon className="w-5 h-5 text-zinc-500" />
            <div>
              <p className="text-sm font-medium text-white">{a.name}</p>
              <p className="text-xs text-zinc-600">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
