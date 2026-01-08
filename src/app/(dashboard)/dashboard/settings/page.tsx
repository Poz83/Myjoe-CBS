'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, User, Shield, CreditCard, Sliders } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-user';
import { useProfile } from '@/hooks/use-profile';
import { SettingsProfile } from '@/components/features/settings/settings-profile';
import { SettingsAccount } from '@/components/features/settings/settings-account';
import { SettingsBilling } from '@/components/features/settings/settings-billing';
import { SettingsPreferences } from '@/components/features/settings/settings-preferences';
import { cn } from '@/lib/utils';

type Tab = 'profile' | 'account' | 'billing' | 'preferences';

const TABS: { value: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'profile', label: 'Profile', icon: User },
  { value: 'account', label: 'Account', icon: Shield },
  { value: 'billing', label: 'Billing', icon: CreditCard },
  { value: 'preferences', label: 'Preferences', icon: Sliders },
];

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') as Tab) || 'profile';
  const { user, isLoading: userLoading } = useUser();
  const { isLoading: profileLoading } = useProfile(user?.id);

  if (userLoading || profileLoading) {
    return <div className="max-w-2xl mx-auto p-8"><Skeleton variant="card" className="h-96" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      <div className="flex gap-1 p-1 bg-zinc-900 rounded-lg mb-8">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => router.push(`/dashboard/settings?tab=${t.value}`)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-all',
              tab === t.value ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-white/5 p-6">
        {tab === 'profile' && <SettingsProfile email={user?.email || ''} displayName="" onDisplayNameChange={async () => {}} />}
        {tab === 'account' && <SettingsAccount onExportData={async () => {}} onDeleteAccount={async () => {}} />}
        {tab === 'billing' && <SettingsBilling />}
        {tab === 'preferences' && <SettingsPreferences onSave={async () => {}} />}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto p-8"><Skeleton variant="card" className="h-96" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}
