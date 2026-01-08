'use client';

import { useEffect, useState } from 'react';
import { 
  FileText, 
  Layers, 
  Ruler, 
  Palette, 
  Sparkles,
  Cloud,
  CloudOff,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AudienceSelector } from './audience-selector';
import { LineThicknessSelector } from './line-thickness-selector';
import { IdeaBox } from './idea-box';
import { STYLE_PRESETS, TRIM_SIZES, MAX_PAGES } from '@/lib/constants';
import type { Audience, StylePreset, TrimSize } from '@/types/domain';
import { cn } from '@/lib/utils';
import { useProjectAutoSave } from '@/hooks/use-project-auto-save';

export interface ProjectSettings {
  name: string;
  pageCount: number;
  trimSize: TrimSize;
  stylePreset: StylePreset;
  audience: Audience[];
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
  mandala: { label: 'Mandala', desc: 'Intricate patterns for mindfulness' },
  fantasy: { label: 'Fantasy', desc: 'Dragons, magic, and mythical worlds' },
  gothic: { label: 'Gothic', desc: 'Dark, moody, horror-inspired art' },
  cozy: { label: 'Cozy', desc: 'Warm hygge scenes and interiors' },
  geometric: { label: 'Geometric', desc: 'Bold geometric and abstract shapes' },
  wildlife: { label: 'Wildlife', desc: 'Realistic animals and nature scenes' },
  floral: { label: 'Floral', desc: 'Lush flowers and garden motifs' },
  abstract: { label: 'Abstract', desc: 'Modern artistic patterns' },
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
    <div className="h-full flex flex-col bg-gradient-to-b from-zinc-900/80 to-[#0D0D0D] border-r border-white/5 overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Project Settings</h2>
          <p className="text-xs text-zinc-500">Fine-tune your book setup</p>
        </div>
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
      <div className="flex-1 p-5 space-y-6">
        {/* Project Name */}
        <div className="space-y-2 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-white">
            <FileText className="w-4 h-4 text-blue-300" />
            Project Name
          </label>
          <Input
            value={settings.name}
            onChange={(e) => handleSettingChange('name', e.target.value)}
            disabled={disabled}
            placeholder="My Coloring Book"
            maxLength={100}
            className="bg-zinc-900/80 border-white/10"
          />
        </div>

        {/* Page Count */}
        <div className="space-y-3 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Layers className="w-4 h-4 text-blue-300" />
              <span>Page Count</span>
            </div>
            <div className="text-sm font-semibold text-blue-200">{settings.pageCount} pages</div>
          </div>
          <Slider
            value={[settings.pageCount]}
            min={1}
            max={MAX_PAGES}
            step={1}
            disabled={disabled}
            onValueChange={([v]) => handleSettingChange('pageCount', v)}
            className="pt-2"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>1</span>
            <span>{MAX_PAGES}</span>
          </div>
        </div>

        {/* Trim Size */}
        <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Ruler className="w-4 h-4 text-blue-300" />
            Trim Size
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(TRIM_SIZES) as TrimSize[]).map((size) => (
              <button
                key={size}
                onClick={() => handleSettingChange('trimSize', size)}
                disabled={disabled}
                className={cn(
                  'px-3 py-3 rounded-xl border text-sm font-medium transition-all',
                  'bg-white/[0.02] border-white/5 hover:border-white/10 hover:scale-[1.01]',
                  settings.trimSize === size
                    ? 'border-blue-500/60 ring-1 ring-blue-500/30 bg-blue-500/5'
                    : '',
                  disabled && 'opacity-60 cursor-not-allowed'
                )}
              >
                <div className="font-semibold text-white">{size}</div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {TRIM_SIZES[size].aspectRatio}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Style */}
        <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Palette className="w-4 h-4 text-blue-300" />
            Visual Style
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STYLE_PRESETS.map((style) => (
              <button
                key={style}
                onClick={() => handleSettingChange('stylePreset', style)}
                disabled={disabled}
                className={cn(
                  'p-3 rounded-xl border text-sm font-medium transition-all text-left',
                  'bg-white/[0.02] border-white/5 hover:border-white/10 hover:scale-[1.01]',
                  settings.stylePreset === style
                    ? 'border-blue-500/50 ring-1 ring-blue-500/30 bg-blue-500/5'
                    : '',
                  disabled && 'opacity-60 cursor-not-allowed'
                )}
              >
                <div className="font-semibold text-white">{STYLE_INFO[style].label}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{STYLE_INFO[style].desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <AudienceSelector
            selected={settings.audience}
            onChange={(audiences) => handleSettingChange('audience', audiences)}
            disabled={disabled}
          />
        </div>

        {/* Line Thickness */}
        <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="w-4 h-4 text-blue-300" />
            Line Thickness (pts)
          </div>
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
        <div className="space-y-2 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
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
