'use client';

import { useState } from 'react';
import { User, Mail, Check, Loader, Sparkles, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SettingsProfileProps {
  email: string;
  displayName?: string;
  authorName?: string;
  onDisplayNameChange?: (name: string) => Promise<void>;
  onAuthorNameChange?: (name: string) => Promise<void>;
}

export function SettingsProfile({
  email,
  displayName = '',
  authorName = '',
  onDisplayNameChange,
  onAuthorNameChange,
}: SettingsProfileProps) {
  const [name, setName] = useState(displayName);
  const [author, setAuthor] = useState(authorName);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const nameChanged = name !== displayName && onDisplayNameChange;
    const authorChanged = author !== authorName && onAuthorNameChange;
    
    if (!nameChanged && !authorChanged) return;

    setIsSaving(true);
    try {
      if (nameChanged) await onDisplayNameChange(name);
      if (authorChanged) await onAuthorNameChange(author);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = name !== displayName || author !== authorName;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Personal Information</h2>
        <p className="text-sm text-zinc-400">
          Update your profile details and author information for publishing
        </p>
      </div>

      {/* Avatar Section */}
      <div className="p-6 bg-zinc-800/30 rounded-xl border border-zinc-700">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <User className="w-10 h-10 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-1">Profile Photo</h3>
            <p className="text-sm text-zinc-400 mb-3">
              Personalize your account with a profile picture
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled>
                <Sparkles className="w-4 h-4 mr-2" />
                Upload Photo (Coming Soon)
              </Button>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Recommended: Square image, at least 256x256px
            </p>
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <label htmlFor="displayName" className="block text-sm font-medium text-zinc-200">
          Display Name
        </label>
        <Input
          id="displayName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Sarah Johnson"
          maxLength={50}
        />
        <p className="text-xs text-zinc-500">
          Your display name appears in your dashboard and personal settings
        </p>
      </div>

      {/* Author Name for Publishing */}
      <div className="space-y-2 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <label htmlFor="authorName" className="block text-sm font-medium text-blue-200">
            Author Name (for Publishing)
          </label>
        </div>
        <Input
          id="authorName"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="e.g., S.J. Creative Studio"
          maxLength={100}
        />
        <p className="text-xs text-zinc-400">
          This name will appear on your book covers and copyright pages when exported to PDF.
          Use your publishing pen name or brand name (e.g., "Happy Kids Publishing").
        </p>
      </div>

      {/* Email (read-only) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          Email Address
        </label>
        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <Mail className="w-4 h-4 text-zinc-500" />
          <span className="text-zinc-300">{email}</span>
        </div>
        <p className="text-xs text-zinc-500">
          Your email is used for account access, notifications, and billing receipts
        </p>
      </div>

      {/* Account Stats */}
      <div className="p-6 bg-zinc-800/30 rounded-xl border border-zinc-700">
        <h3 className="text-base font-semibold text-white mb-4">Account Activity</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-zinc-900/50 rounded-lg">
            <p className="text-2xl font-bold text-blue-400">--</p>
            <p className="text-xs text-zinc-500 mt-1">Projects Created</p>
          </div>
          <div className="text-center p-3 bg-zinc-900/50 rounded-lg">
            <p className="text-2xl font-bold text-purple-400">--</p>
            <p className="text-xs text-zinc-500 mt-1">Pages Generated</p>
          </div>
          <div className="text-center p-3 bg-zinc-900/50 rounded-lg">
            <p className="text-2xl font-bold text-green-400">--</p>
            <p className="text-xs text-zinc-500 mt-1">Books Exported</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {(onDisplayNameChange || onAuthorNameChange) && (
        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <Loader className="w-4 h-4 animate-spin mr-2" />
            ) : saved ? (
              <Check className="w-4 h-4 mr-2" />
            ) : null}
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}
