'use client';

import Link from 'next/link';
import { Palette, Users, BookOpen, Contrast, Grid3X3, Settings, CreditCard, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VaultTile } from '@/components/dashboard/vault-tile';
import type { LucideIcon } from 'lucide-react';

type StudioItem = {
  name: string;
  desc: string;
  icon: LucideIcon | null;
  href: string;
  color: string;
  iconColor: string;
  ready: boolean;
  isVault?: boolean;
};

type AccountItem = {
  name: string;
  desc: string;
  icon: LucideIcon;
  href: string;
};

const studios: StudioItem[] = [
  { name: 'Coloring Book Studio', desc: 'Create stunning coloring pages', icon: Palette, href: '/studio/projects', color: 'bg-accent-cyan-muted', iconColor: 'text-accent-cyan', ready: true },
  { name: 'Hero Lab', desc: 'Design your characters', icon: Users, href: '/studio/library/heroes', color: 'bg-accent-purple-muted', iconColor: 'text-accent-purple', ready: true },
  { name: 'Book Cover Creator', desc: 'Design book covers', icon: BookOpen, href: '#', color: 'bg-warning-muted', iconColor: 'text-warning', ready: false },
  { name: 'Monochrome Maker', desc: 'Black & white magic', icon: Contrast, href: '#', color: 'bg-hover-overlay', iconColor: 'text-text-muted', ready: false },
  { name: 'Paint by Numbers', desc: 'Generate number guides', icon: Grid3X3, href: '#', color: 'bg-success-muted', iconColor: 'text-success', ready: false },
  { name: 'Vault', desc: 'Your creative storage', icon: null, href: '/dashboard/vault', color: 'bg-info-muted', iconColor: 'text-info', ready: true, isVault: true },
];

const account: AccountItem[] = [
  { name: 'Settings', desc: 'Profile & account', icon: Settings, href: '/dashboard/settings' },
  { name: 'Billing', desc: 'Plans & usage', icon: CreditCard, href: '/dashboard/billing' },
  { name: 'Preferences', desc: 'Customize defaults', icon: Sliders, href: '/dashboard/settings?tab=preferences' },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-heading-xl text-text-primary mb-2">Welcome back</h1>
      <p className="text-text-secondary mb-10">Choose a studio to start creating</p>

      {/* Studios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {studios.map((s) => {
          if (s.isVault) {
            return <VaultTile key={s.name} />;
          }

          const Icon = s.icon;
          if (!Icon) {
            return null;
          }

          return (
            <Link
              key={s.name}
              href={s.ready ? s.href : '#'}
              className={cn(
                'group relative p-6 rounded-xl border border-border-subtle',
                'bg-bg-surface transition-all duration-base',
                s.ready 
                  ? 'hover:border-border-default hover:bg-hover-overlay cursor-pointer focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base' 
                  : 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center mb-4', s.color, s.iconColor)}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-heading text-text-primary mb-1">{s.name}</h3>
              <p className="text-sm text-text-secondary">{s.desc}</p>
              {!s.ready && (
                <span className="absolute top-4 right-4 text-xs text-text-muted bg-bg-elevated px-2 py-1 rounded-full border border-border-subtle">
                  Coming soon
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Account Section */}
      <h2 className="text-heading text-text-secondary mb-4">Account</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {account.map((a) => (
          <Link
            key={a.name}
            href={a.href}
            className={cn(
              'flex items-center gap-4 p-4 rounded-lg',
              'border border-border-subtle bg-bg-surface',
              'hover:bg-hover-overlay hover:border-border-default',
              'transition-all duration-base',
              'focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base'
            )}
          >
            <a.icon className="w-5 h-5 text-text-muted" />
            <div>
              <p className="text-sm font-medium text-text-primary">{a.name}</p>
              <p className="text-xs text-text-muted">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
