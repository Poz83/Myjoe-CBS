'use client';

import { Suspense, useEffect } from 'react';
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

const TABS: { value: Tab; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'profile', label: 'Profile', desc: 'Manage your personal information', icon: User },
  { value: 'account', label: 'Account', desc: 'Security & data management', icon: Shield },
  { value: 'billing', label: 'Billing', desc: 'Plans & usage', icon: CreditCard },
  { value: 'preferences', label: 'Preferences', desc: 'Customize your experience', icon: Sliders },
];

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') as Tab) || 'profile';
  const { user, isLoading: userLoading } = useUser();
  const { isLoading: profileLoading } = useProfile(user?.id);

  // Redirect billing tab to dedicated billing page
  useEffect(() => {
    if (tab === 'billing') {
      router.replace('/dashboard/billing');
    }
  }, [tab, router]);

  if (userLoading || profileLoading) {
    return <div className="max-w-5xl mx-auto p-8"><Skeleton variant="card" className="h-96" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
      <p className="text-zinc-500 mb-10">Manage your account and preferences</p>

      {/* Tab Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {TABS.filter(t => t.value !== 'billing').map((t) => (
          <button
            key={t.value}
            onClick={() => router.push(`/dashboard/settings?tab=${t.value}`)}
            className={cn(
              'p-5 rounded-xl border text-left transition-all',
              tab === t.value 
                ? 'bg-blue-500/10 border-blue-500/30' 
                : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                tab === t.value ? 'bg-blue-500/20' : 'bg-white/5'
              )}>
                <t.icon className={cn('w-5 h-5', tab === t.value ? 'text-blue-400' : 'text-zinc-400')} />
              </div>
              <div className="flex-1">
                <h3 className={cn('font-semibold mb-1', tab === t.value ? 'text-white' : 'text-zinc-300')}>
                  {t.label}
                </h3>
                <p className="text-xs text-zinc-500">{t.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-zinc-900/50 rounded-xl border border-white/5 p-6">
        {tab === 'profile' && <SettingsProfile email={user?.email || ''} displayName="" onDisplayNameChange={async () => {}} />}
        {tab === 'account' && <SettingsAccount onExportData={async () => {}} onDeleteAccount={async () => {}} />}
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
