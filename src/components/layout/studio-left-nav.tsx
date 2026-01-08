'use client';

import { useRouter } from 'next/navigation';
import { LayoutDashboard, Library, Settings, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
] as const;

export function StudioLeftNav() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col bg-zinc-900/50 border-r border-zinc-800 transition-all duration-200',
        collapsed ? 'w-12' : 'w-16'
      )}
    >
      {/* Exit Studio Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className={cn(
          'flex items-center justify-center gap-2 px-3 py-3 border-b border-zinc-800',
          'text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors',
          'group'
        )}
        title="Exit Studio"
      >
        <X className="w-5 h-5" />
        {!collapsed && (
          <span className="text-xs font-medium">Exit</span>
        )}
      </button>

      {/* Quick Links */}
      <div className="flex-1 flex flex-col py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'flex items-center gap-2 px-3 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800/50',
                'transition-colors group',
                collapsed ? 'justify-center' : 'justify-start'
              )}
              title={item.label}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-xs font-medium truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'flex items-center justify-center gap-2 px-3 py-3 border-t border-zinc-800',
          'text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors',
          collapsed ? 'justify-center' : 'justify-start'
        )}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <>
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs font-medium">Collapse</span>
          </>
        )}
      </button>
    </aside>
  );
}
