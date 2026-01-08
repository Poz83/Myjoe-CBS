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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
    <div className="h-full flex flex-col bg-bg-surface overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="panel-header sticky top-0 bg-bg-surface/95 backdrop-blur z-sticky">
        <div>
          <h2 className="panel-header-title">Settings</h2>
          <p className="text-xs text-text-muted mt-0.5">Project Configuration</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1.5 text-text-muted">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1.5 text-success">
              <Cloud className="w-3 h-3" />
              <span>Saved</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-1.5 text-error">
              <CloudOff className="w-3 h-3" />
              <span>Error</span>
            </div>
          )}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 px-6 py-6 space-y-8">
        {/* Project Name */}
        <div className="space-y-3">
          <label className="form-label flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-accent-cyan" />
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

        <div className="divider" />

        {/* Page Count */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="form-label flex items-center gap-2 mb-0">
              <Layers className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Page Count</span>
            </div>
            <div className="text-xs font-bold text-accent-cyan bg-accent-cyan-muted px-2.5 py-1 rounded-md border border-accent-cyan/20">
              {settings.pageCount} pages
            </div>
          </div>
          <div className="bg-bg-elevated p-5 rounded-lg border border-border-subtle hover:border-border-default transition-colors duration-base">
            <Slider
              value={[settings.pageCount]}
              min={1}
              max={MAX_PAGES}
              step={1}
              disabled={disabled}
              onValueChange={([v]) => handleSettingChange('pageCount', v)}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-text-muted font-medium mt-3 uppercase tracking-wider">
              <span>1 Page</span>
              <span>{MAX_PAGES} Pages</span>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Trim Size */}
        <div className="space-y-3">
          <div className="form-label flex items-center gap-2 mb-0">
            <Ruler className="w-3.5 h-3.5 text-accent-cyan" />
            Trim Size
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {(Object.keys(TRIM_SIZES) as TrimSize[]).map((size) => (
              <button
                key={size}
                onClick={() => handleSettingChange('trimSize', size)}
                disabled={disabled}
                className={cn(
                  'px-3 py-3 rounded-lg border text-sm font-medium transition-all duration-base',
                  'bg-bg-elevated border-border-subtle hover:border-border-default',
                  settings.trimSize === size
                    ? 'border-accent-cyan/50 ring-1 ring-accent-cyan/20 bg-selected-bg text-text-primary shadow-glow-cyan'
                    : 'text-text-secondary',
                  disabled && 'opacity-60 cursor-not-allowed'
                )}
              >
                <div className="font-bold">{size}</div>
                <div className="text-[10px] text-text-muted mt-1 font-mono">
                  {TRIM_SIZES[size].aspectRatio}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Visual Style */}
        <div className="space-y-3">
          <div className="form-label flex items-center gap-2 mb-0">
            <Palette className="w-3.5 h-3.5 text-accent-cyan" />
            Visual Style
          </div>
          
          <div className="space-y-3">
            <Select 
              value={settings.stylePreset} 
              onValueChange={(val) => handleSettingChange('stylePreset', val as StylePreset)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                {STYLE_PRESETS.map((style) => (
                  <SelectItem key={style} value={style}>
                    <span className="font-medium">{STYLE_INFO[style].label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Selected Style Description */}
            <div className="bg-accent-cyan-muted border border-accent-cyan/10 rounded-lg p-3.5 text-xs text-text-secondary leading-relaxed">
              <span className="font-semibold text-accent-cyan mr-1.5">Info:</span>
              {STYLE_INFO[settings.stylePreset].desc}
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Target Audience */}
        <div className="space-y-3">
          <AudienceSelector
            selected={settings.audience}
            onChange={(audiences) => handleSettingChange('audience', audiences)}
            disabled={disabled}
          />
        </div>

        <div className="divider" />

        {/* Line Thickness */}
        <div className="space-y-3">
          <div className="form-label flex items-center gap-2 mb-0">
            <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
            Line Thickness
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

        <div className="divider" />

        {/* Idea Box */}
        <div className="space-y-3 pb-8">
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
