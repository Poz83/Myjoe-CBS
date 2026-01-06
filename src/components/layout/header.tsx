'use client';

import { useLayoutStore } from '@/stores/layout-store';
import { Cloud, CloudOff, Loader2, Palette, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { autoSaveStatus, blotBalance } = useLayoutStore();

  const getAutoSaveIndicator = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <Cloud className="h-4 w-4" />
            <span>Saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <CloudOff className="h-4 w-4" />
            <span>Error saving</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800">
      <div className="h-full flex items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-zinc-300 transition-colors">
            Myjoe
          </Link>
        </div>

        {/* Center: Navigation (optional) */}
        <nav className="hidden md:flex items-center gap-6">
          {/* Add navigation links here if needed */}
        </nav>

        {/* Right: Auto-save, Blot balance, User menu */}
        <div className="flex items-center gap-4">
          {/* Auto-save indicator */}
          <div className="min-w-[100px]">
            {getAutoSaveIndicator()}
          </div>

          {/* Blot balance */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-md">
            <Palette className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-white">
              {blotBalance.toLocaleString()}
            </span>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-zinc-800"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
