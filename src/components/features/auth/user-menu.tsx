'use client';

import { useUser } from '@/hooks/use-user';
import { useProfile } from '@/hooks/use-profile';
import { signOut } from '@/lib/supabase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, CreditCard, BookOpen } from 'lucide-react';

export function UserMenu() {
  const { user, isLoading: userLoading } = useUser();
  const { profile, isLoading: profileLoading } = useProfile(user?.id);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Show loading skeleton
  if (userLoading) {
    return (
      <div className="h-10 w-10 rounded-full bg-zinc-800 animate-pulse" />
    );
  }

  // Show sign in button if not authenticated
  if (!user) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={() => router.push('/login')}
      >
        Sign In
      </Button>
    );
  }

  // Get first letter of email for avatar
  const avatarLetter = user.email?.charAt(0).toUpperCase() || 'U';
  const planBadge = profile?.plan || 'free';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="h-10 w-10 rounded-full bg-zinc-700 hover:bg-zinc-600 transition-colors flex items-center justify-center text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          {avatarLetter}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-zinc-900 border-zinc-800 rounded-lg shadow-lg"
      >
        {/* User info section */}
        <div className="px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-medium">
              {avatarLetter}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.email}
              </p>
              <p className="text-xs text-zinc-400 capitalize">
                {planBadge} plan
              </p>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="py-1">
          <DropdownMenuItem
            onClick={() => router.push('/dashboard/settings')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push('/dashboard/billing')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <CreditCard className="h-4 w-4" />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => window.open('https://docs.myjoe.app', '_blank')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            Documentation
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-zinc-800" />

        {/* Sign out */}
        <div className="py-1">
          <DropdownMenuItem
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
