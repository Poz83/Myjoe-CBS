'use client';

import { useState } from 'react';
import { Check, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AUDIENCES, STYLE_PRESETS } from '@/lib/constants';
import type { Audience, StylePreset } from '@/types/domain';

interface SettingsPreferencesProps {
  defaultAudience?: Audience;
  defaultStylePreset?: StylePreset;
  onSave?: (preferences: { audience?: Audience; stylePreset?: StylePreset }) => Promise<void>;
}

const AUDIENCE_LABELS: Record<Audience, string> = {
  toddler: 'Toddler (2-4)',
  children: 'Children (5-8)',
  tween: 'Tween (9-12)',
  teen: 'Teen (13-17)',
  adult: 'Adult (18+)',
};

const STYLE_LABELS: Record<StylePreset, string> = {
  'bold-simple': 'Bold & Simple',
  'kawaii': 'Kawaii',
  'whimsical': 'Whimsical',
  'cartoon': 'Cartoon',
  'botanical': 'Botanical',
};

export function SettingsPreferences({
  defaultAudience,
  defaultStylePreset,
  onSave,
}: SettingsPreferencesProps) {
  const [audience, setAudience] = useState<Audience | undefined>(defaultAudience);
  const [stylePreset, setStylePreset] = useState<StylePreset | undefined>(defaultStylePreset);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasChanges = audience !== defaultAudience || stylePreset !== defaultStylePreset;

  const handleSave = async () => {
    if (!onSave || !hasChanges) return;

    setIsSaving(true);
    try {
      await onSave({ audience, stylePreset });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Default Audience */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-medium text-white">Default Audience</h3>
          <p className="text-sm text-zinc-400 mt-1">
            This will be pre-selected when creating new projects.
          </p>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {AUDIENCES.map((aud) => (
            <button
              key={aud}
              onClick={() => setAudience(aud)}
              className={cn(
                'px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                audience === aud
                  ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                  : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
              )}
            >
              {AUDIENCE_LABELS[aud].split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Default Style Preset */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-medium text-white">Default Style</h3>
          <p className="text-sm text-zinc-400 mt-1">
            This will be pre-selected when creating new projects.
          </p>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {STYLE_PRESETS.map((style) => (
            <button
              key={style}
              onClick={() => setStylePreset(style)}
              className={cn(
                'px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                stylePreset === style
                  ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                  : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
              )}
            >
              {STYLE_LABELS[style]}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications (Future) */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div>
          <h3 className="text-base font-medium text-white">Notifications</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Email notification preferences coming soon.
          </p>
        </div>
        <div className="space-y-3 opacity-50">
          <label className="flex items-center gap-3 cursor-not-allowed">
            <input
              type="checkbox"
              disabled
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800"
            />
            <span className="text-sm text-zinc-400">Generation complete notifications</span>
          </label>
          <label className="flex items-center gap-3 cursor-not-allowed">
            <input
              type="checkbox"
              disabled
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800"
            />
            <span className="text-sm text-zinc-400">Low blots warnings</span>
          </label>
          <label className="flex items-center gap-3 cursor-not-allowed">
            <input
              type="checkbox"
              disabled
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800"
            />
            <span className="text-sm text-zinc-400">Product updates and tips</span>
          </label>
        </div>
      </div>

      {/* Save Button */}
      {onSave && (
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
            {saved ? 'Saved' : 'Save Preferences'}
          </Button>
        </div>
      )}
    </div>
  );
}
