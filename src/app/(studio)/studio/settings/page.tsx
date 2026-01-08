'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, User, Shield, CreditCard, Settings, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-user';
import { useProfile } from '@/hooks/use-profile';
import { SettingsProfile } from '@/components/features/settings/settings-profile';
import { SettingsAccount } from '@/components/features/settings/settings-account';
import { SettingsBilling } from '@/components/features/settings/settings-billing';
import { SettingsPreferences } from '@/components/features/settings/settings-preferences';
import { SettingsApi } from '@/components/features/settings/settings-api';
import { cn } from '@/lib/utils';

type SettingsTab = 'profile' | 'account' | 'billing' | 'preferences' | 'api';

const TABS: { value: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }>; disabled?: boolean }[] = [
  { value: 'profile', label: 'Profile', icon: User },
  { value: 'account', label: 'Account', icon: Shield },
  { value: 'billing', label: 'Billing', icon: CreditCard },
  { value: 'preferences', label: 'Preferences', icon: Settings },
  { value: 'api', label: 'API', icon: Code, disabled: true },
];

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') as SettingsTab) || 'profile';

  const { user, isLoading: userLoading } = useUser();
  const { isLoading: profileLoading } = useProfile(user?.id);

  const setTab = (newTab: SettingsTab) => {
    router.push(`/studio/settings?tab=${newTab}`);
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  // Loading state
  if (userLoading || profileLoading) {
    return (
      <div className="min-h-full p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <Skeleton variant="text" className="h-8 w-48" />
          <Skeleton variant="card" className="h-12 w-full" />
          <Skeleton variant="card" className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-lg border border-zinc-700 mb-8">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.value;

            return (
              <button
                key={t.value}
                onClick={() => !t.disabled && setTab(t.value)}
                disabled={t.disabled}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all',
                  isActive
                    ? 'bg-zinc-700 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50',
                  t.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-zinc-400'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
          {tab === 'profile' && (
            <SettingsProfile
              email={user?.email || ''}
              displayName=""
              onDisplayNameChange={async (name) => {
              }}
            />
          )}

          {tab === 'account' && (
            <SettingsAccount
              onExportData={async () => {
              }}
              onDeleteAccount={async () => {
              }}
            />
          )}

          {tab === 'billing' && <SettingsBilling />}

          {tab === 'preferences' && (
            <SettingsPreferences
              onSave={async (prefs) => {
              }}
            />
          )}

          {tab === 'api' && <SettingsApi />}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-full p-8">
          <div className="max-w-3xl mx-auto space-y-8">
            <Skeleton variant="text" className="h-8 w-48" />
            <Skeleton variant="card" className="h-12 w-full" />
            <Skeleton variant="card" className="h-64 w-full" />
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
