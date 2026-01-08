'use client';

import { useState } from 'react';
import { Check, Loader, Palette, BookOpen, Bell, Zap, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AUDIENCES, STYLE_PRESETS } from '@/lib/constants';
import type { Audience, StylePreset } from '@/types/domain';

interface SettingsPreferencesProps {
  defaultAudience?: Audience;
  defaultStylePreset?: StylePreset;
  defaultTrimSize?: '8.5x11' | '8.5x8.5' | '6x9';
  emailNotifications?: {
    generationComplete?: boolean;
    lowBlots?: boolean;
    productUpdates?: boolean;
    weeklyDigest?: boolean;
  };
  onSave?: (preferences: {
    audience?: Audience;
    stylePreset?: StylePreset;
    trimSize?: '8.5x11' | '8.5x8.5' | '6x9';
    emailNotifications?: Record<string, boolean>;
  }) => Promise<void>;
}

const AUDIENCE_INFO: Record<Audience, { label: string; ages: string; desc: string }> = {
  toddler: { label: 'Toddler', ages: '2-4 years', desc: 'Thick lines, simple shapes' },
  children: { label: 'Children', ages: '5-8 years', desc: 'Bold lines, moderate detail' },
  tween: { label: 'Tween', ages: '9-12 years', desc: 'Medium lines, more detail' },
  teen: { label: 'Teen', ages: '13-17 years', desc: 'Fine lines, complex scenes' },
  adult: { label: 'Adult', ages: '18+ years', desc: 'Intricate details, mandalas' },
};

const STYLE_INFO: Record<StylePreset, { label: string; desc: string }> = {
  'bold-simple': { label: 'Bold & Simple', desc: 'Clean, confident lines' },
  'kawaii': { label: 'Kawaii', desc: 'Cute Japanese style' },
  'whimsical': { label: 'Whimsical', desc: 'Playful and imaginative' },
  'cartoon': { label: 'Cartoon', desc: 'Fun animated style' },
  'botanical': { label: 'Botanical', desc: 'Nature and flowers' },
};

const TRIM_SIZES = [
  { value: '8.5x11' as const, label: '8.5" × 11"', desc: 'Standard US Letter' },
  { value: '8.5x8.5' as const, label: '8.5" × 8.5"', desc: 'Square format' },
  { value: '6x9' as const, label: '6" × 9"', desc: 'Compact size' },
];

export function SettingsPreferences({
  defaultAudience,
  defaultStylePreset,
  defaultTrimSize = '8.5x11',
  emailNotifications = {},
  onSave,
}: SettingsPreferencesProps) {
  const [audience, setAudience] = useState<Audience | undefined>(defaultAudience);
  const [stylePreset, setStylePreset] = useState<StylePreset | undefined>(defaultStylePreset);
  const [trimSize, setTrimSize] = useState(defaultTrimSize);
  const [notifications, setNotifications] = useState(emailNotifications);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasChanges = 
    audience !== defaultAudience || 
    stylePreset !== defaultStylePreset ||
    trimSize !== defaultTrimSize ||
    JSON.stringify(notifications) !== JSON.stringify(emailNotifications);

  const handleSave = async () => {
    if (!onSave || !hasChanges) return;

    setIsSaving(true);
    try {
      await onSave({ 
        audience, 
        stylePreset, 
        trimSize,
        emailNotifications: notifications 
      });
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
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Creative Preferences</h2>
        <p className="text-sm text-zinc-400">
          Set your default project settings to speed up your workflow
        </p>
      </div>

      {/* Default Audience */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-1">Default Target Audience</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Pre-select the age group for new projects. This affects line thickness and complexity.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {AUDIENCES.map((aud) => (
            <button
              key={aud}
              onClick={() => setAudience(aud)}
              className={cn(
                'p-3 rounded-lg border text-left transition-all',
                audience === aud
                  ? 'bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/30'
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800'
              )}
            >
              <p className={cn(
                'text-sm font-semibold mb-1',
                audience === aud ? 'text-blue-400' : 'text-zinc-200'
              )}>
                {AUDIENCE_INFO[aud].label}
              </p>
              <p className="text-xs text-zinc-500 mb-1">{AUDIENCE_INFO[aud].ages}</p>
              <p className="text-xs text-zinc-600">{AUDIENCE_INFO[aud].desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Default Style */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <Palette className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-1">Default Art Style</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Choose your preferred artistic style for new projects
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {STYLE_PRESETS.map((style) => (
            <button
              key={style}
              onClick={() => setStylePreset(style)}
              className={cn(
                'p-3 rounded-lg border text-left transition-all',
                stylePreset === style
                  ? 'bg-purple-500/10 border-purple-500/50 ring-1 ring-purple-500/30'
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800'
              )}
            >
              <p className={cn(
                'text-sm font-semibold mb-1',
                stylePreset === style ? 'text-purple-400' : 'text-zinc-200'
              )}>
                {STYLE_INFO[style].label}
              </p>
              <p className="text-xs text-zinc-600">{STYLE_INFO[style].desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Default Book Size */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-1">Default Book Size</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Set your preferred trim size for Amazon KDP publishing
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {TRIM_SIZES.map((size) => (
            <button
              key={size.value}
              onClick={() => setTrimSize(size.value)}
              className={cn(
                'p-4 rounded-lg border text-center transition-all',
                trimSize === size.value
                  ? 'bg-green-500/10 border-green-500/50 ring-1 ring-green-500/30'
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800'
              )}
            >
              <p className={cn(
                'text-lg font-bold mb-1',
                trimSize === size.value ? 'text-green-400' : 'text-zinc-200'
              )}>
                {size.label}
              </p>
              <p className="text-xs text-zinc-500">{size.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Start Tip */}
      <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-300 mb-1">Time-saving Tip</p>
            <p className="text-sm text-zinc-400">
              Setting your preferences here means you can skip these choices when creating new projects, 
              speeding up your workflow by 30 seconds per book!
            </p>
          </div>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-1">Email Notifications</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Choose what updates you want to receive via email
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700 hover:border-zinc-600 cursor-pointer transition-colors group">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-zinc-200 mb-1">Generation Complete</p>
                <p className="text-xs text-zinc-500">Get notified when your coloring pages finish generating</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.generationComplete ?? true}
              onChange={(e) => setNotifications({ ...notifications, generationComplete: e.target.checked })}
              className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-2 focus:ring-blue-500/40"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700 hover:border-zinc-600 cursor-pointer transition-colors group">
            <div className="flex items-start gap-3">
              <Palette className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-zinc-200 mb-1">Low Blots Warning</p>
                <p className="text-xs text-zinc-500">Alert me when my Blot balance is running low</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.lowBlots ?? true}
              onChange={(e) => setNotifications({ ...notifications, lowBlots: e.target.checked })}
              className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-2 focus:ring-blue-500/40"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700 hover:border-zinc-600 cursor-pointer transition-colors group">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-zinc-200 mb-1">Product Updates & Tips</p>
                <p className="text-xs text-zinc-500">Learn about new features and best practices for KDP publishing</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.productUpdates ?? false}
              onChange={(e) => setNotifications({ ...notifications, productUpdates: e.target.checked })}
              className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-2 focus:ring-blue-500/40"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700 hover:border-zinc-600 cursor-pointer transition-colors group">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-zinc-200 mb-1">Weekly Publishing Digest</p>
                <p className="text-xs text-zinc-500">Summary of your activity and KDP publishing tips every Monday</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.weeklyDigest ?? false}
              onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
              className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-2 focus:ring-blue-500/40"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      {onSave && (
        <div className="flex justify-end pt-6 border-t border-zinc-800">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            size="lg"
          >
            {isSaving ? (
              <Loader className="w-4 h-4 animate-spin mr-2" />
            ) : saved ? (
              <Check className="w-4 h-4 mr-2" />
            ) : null}
            {saved ? 'Preferences Saved!' : 'Save Preferences'}
          </Button>
        </div>
      )}
    </div>
  );
}
