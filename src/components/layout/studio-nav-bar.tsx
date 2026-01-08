'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Palette, Library, Settings, User } from 'lucide-react';
import { UserMenu } from '@/components/features/auth/user-menu';
import { BlotDisplay } from '@/components/billing/blot-display';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/studio', label: 'Studio', icon: Palette },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
] as const;

export function StudioNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800">
      <div className="h-full flex items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center hover:opacity-80 transition-opacity"
            aria-label="Myjoe - Go to dashboard"
          >
            <Image
              src="/myjoe-logo.png"
              alt="Myjoe Coloring Studios"
              width={140}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href) || 
              (item.href === '/studio' && pathname?.includes('/studio'));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Blot balance, User menu */}
        <div className="flex items-center gap-4">
          <BlotDisplay onClick={() => router.push('/dashboard/billing')} />
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
