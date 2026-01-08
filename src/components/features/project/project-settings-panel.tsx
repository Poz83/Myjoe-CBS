'use client';

import { useEffect, useState } from 'react';
import { 
  FileText, 
  Layers, 
  Ruler, 
  Palette, 
  Users, 
  Sparkles,
  Save,
  Cloud,
  CloudOff,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LineThicknessSelector } from './line-thickness-selector';
import { IdeaBox } from './idea-box';
import { AUDIENCES, STYLE_PRESETS, TRIM_SIZES, MAX_PAGES } from '@/lib/constants';
import type { Audience, StylePreset, TrimSize } from '@/types/domain';
import { cn } from '@/lib/utils';
import { useProjectAutoSave } from '@/hooks/use-project-auto-save';

export interface ProjectSettings {
  name: string;
  pageCount: number;
  trimSize: TrimSize;
  stylePreset: StylePreset;
  audience: Audience;
  lineThicknessPts: number | null; // null means auto
  lineThicknessAuto: boolean;
  idea: string;
}

export interface ProjectSettingsPanelProps {
  projectId: string;
  initialSettings: ProjectSettings;
  onGenerate?: (idea: string) => void;
  isGenerating?: boolean;
  disabled?: boolean;
}

const PAGE_COUNT_PRESETS = [8, 12, 16, 20, 24, 30, 36, 45] as const;

const STYLE_INFO: Record<StylePreset, { label: string; desc: string }> = {
  'bold-simple': { label: 'Bold & Simple', desc: 'Clean, chunky shapes' },
  'kawaii': { label: 'Kawaii', desc: 'Cute, Japanese-inspired' },
  'whimsical': { label: 'Whimsical', desc: 'Playful, fantasy elements' },
  'cartoon': { label: 'Cartoon', desc: 'Classic cartoon style' },
  'botanical': { label: 'Botanical', desc: 'Nature, plants, flowers' },
};

const AUDIENCE_INFO: Record<Audience, { label: string; ages: string; desc: string }> = {
  toddler: { label: 'Toddler', ages: '2-4', desc: 'Simple shapes' },
  children: { label: 'Children', ages: '5-8', desc: 'Moderate detail' },
  tween: { label: 'Tween', ages: '9-12', desc: 'Balanced' },
  teen: { label: 'Teen', ages: '13-17', desc: 'Detailed' },
  adult: { label: 'Adult', ages: '18+', desc: 'Intricate' },
};

export function ProjectSettingsPanel({
  projectId,
  initialSettings,
  onGenerate,
  isGenerating = false,
  disabled = false,
}: ProjectSettingsPanelProps) {
  const [settings, setSettings] = useState<ProjectSettings>(initialSettings);
  const { saveStatus, save } = useProjectAutoSave(projectId, settings);

  // Update local state when initialSettings change
  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleSettingChange = <K extends keyof ProjectSettings>(
    key: K,
    value: ProjectSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    save(newSettings);
  };

  const handleGenerate = () => {
    if (onGenerate && settings.idea.trim().length >= 3) {
      onGenerate(settings.idea);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900/50 border-r border-zinc-800 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-1">Project Settings</h2>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Cloud className="w-3 h-3 text-green-500" />
              <span className="text-green-500">Saved</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <CloudOff className="w-3 h-3 text-red-500" />
              <span className="text-red-500">Error</span>
            </>
          )}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Project Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <FileText className="w-4 h-4" />
            Project Name
          </label>
          <Input
            value={settings.name}
            onChange={(e) => handleSettingChange('name', e.target.value)}
            disabled={disabled}
            placeholder="My Coloring Book"
            maxLength={100}
          />
        </div>

        {/* Page Count */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Layers className="w-4 h-4" />
            Page Count
          </label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {PAGE_COUNT_PRESETS.map((count) => (
              <button
                key={count}
                onClick={() => handleSettingChange('pageCount', count)}
                disabled={disabled}
                className={cn(
                  'px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                  settings.pageCount === count
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-300'
                    : 'bg-zinc-800/30 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                )}
              >
                {count}
              </button>
            ))}
          </div>
          <Input
            type="number"
            min={1}
            max={MAX_PAGES}
            value={settings.pageCount}
            onChange={(e) => handleSettingChange('pageCount', parseInt(e.target.value) || 1)}
            disabled={disabled}
            className="w-full"
          />
        </div>

        {/* Trim Size */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Ruler className="w-4 h-4" />
            Trim Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(TRIM_SIZES) as TrimSize[]).map((size) => (
              <button
                key={size}
                onClick={() => handleSettingChange('trimSize', size)}
                disabled={disabled}
                className={cn(
                  'px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                  settings.trimSize === size
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-300'
                    : 'bg-zinc-800/30 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                )}
              >
                <div className="font-semibold">{size}</div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {TRIM_SIZES[size].aspectRatio}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Style */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Palette className="w-4 h-4" />
            Visual Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STYLE_PRESETS.map((style) => (
              <button
                key={style}
                onClick={() => handleSettingChange('stylePreset', style)}
                disabled={disabled}
                className={cn(
                  'px-3 py-2 rounded-lg border text-sm font-medium transition-colors text-left',
                  settings.stylePreset === style
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-300'
                    : 'bg-zinc-800/30 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                )}
              >
                <div className="font-semibold">{STYLE_INFO[style].label}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{STYLE_INFO[style].desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Users className="w-4 h-4" />
            Target Audience
          </label>
          <div className="grid grid-cols-5 gap-2">
            {AUDIENCES.map((audience) => (
              <button
                key={audience}
                onClick={() => handleSettingChange('audience', audience)}
                disabled={disabled}
                className={cn(
                  'px-2 py-2 rounded-lg border text-xs font-medium transition-colors',
                  settings.audience === audience
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-300'
                    : 'bg-zinc-800/30 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                )}
              >
                <div className="font-semibold">{AUDIENCE_INFO[audience].label}</div>
                <div className="text-zinc-500 mt-0.5">{AUDIENCE_INFO[audience].ages}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Line Thickness */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Sparkles className="w-4 h-4" />
            Line Thickness (pts)
          </label>
          <LineThicknessSelector
            value={settings.lineThicknessPts}
            auto={settings.lineThicknessAuto}
            onChange={(value, auto) => {
              handleSettingChange('lineThicknessPts', value);
              handleSettingChange('lineThicknessAuto', auto);
            }}
            disabled={disabled}
          />
        </div>

        {/* Idea Box */}
        <div className="space-y-2">
          <IdeaBox
            value={settings.idea}
            onChange={(value) => handleSettingChange('idea', value)}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
