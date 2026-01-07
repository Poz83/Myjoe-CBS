'use client';

import { useState } from 'react';
import { User, Mail, Check, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SettingsProfileProps {
  email: string;
  displayName?: string;
  onDisplayNameChange?: (name: string) => Promise<void>;
}

export function SettingsProfile({
  email,
  displayName = '',
  onDisplayNameChange,
}: SettingsProfileProps) {
  const [name, setName] = useState(displayName);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!onDisplayNameChange || name === displayName) return;

    setIsSaving(true);
    try {
      await onDisplayNameChange(name);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save display name:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = name !== displayName;

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <User className="w-10 h-10 text-zinc-500" />
        </div>
        <div>
          <p className="text-sm text-zinc-400">Profile Photo</p>
          <p className="text-xs text-zinc-500 mt-1">Avatar upload coming soon</p>
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <label htmlFor="displayName" className="block text-sm font-medium text-zinc-300">
          Display Name
        </label>
        <div className="flex gap-3">
          <Input
            id="displayName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your display name"
            className="flex-1"
            maxLength={50}
          />
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              'Save'
            )}
          </Button>
        </div>
        <p className="text-xs text-zinc-500">
          This name will be displayed in your profile and on exported documents.
        </p>
      </div>

      {/* Email (read-only) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-300">
          Email Address
        </label>
        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <Mail className="w-4 h-4 text-zinc-500" />
          <span className="text-zinc-300">{email}</span>
        </div>
        <p className="text-xs text-zinc-500">
          Your email address is managed by your authentication provider.
        </p>
      </div>
    </div>
  );
}
