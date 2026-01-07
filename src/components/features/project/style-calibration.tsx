'use client';

import { useState } from 'react';
import { Loader, Check, Sparkles, Palette } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGenerateCalibration, useSelectStyleAnchor } from '@/hooks/use-calibration';
import type { CalibrationSample } from '@/hooks/use-calibration';
import { BLOT_COSTS } from '@/lib/constants';
import { cn } from '@/lib/utils';

type CalibrationState = 'input' | 'generating' | 'select' | 'confirming';

interface StyleCalibrationProps {
  projectId: string;
  blotBalance: number;
  onComplete: () => void;
}

export function StyleCalibration({ 
  projectId, 
  blotBalance, 
  onComplete 
}: StyleCalibrationProps) {
  const [state, setState] = useState<CalibrationState>('input');
  const [subject, setSubject] = useState('');
  const [samples, setSamples] = useState<CalibrationSample[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const generateMutation = useGenerateCalibration(projectId);
  const selectMutation = useSelectStyleAnchor(projectId);

  const requiredBlots = BLOT_COSTS.styleCalibration;
  const hasEnoughBlots = blotBalance >= requiredBlots;

  const handleGenerate = async () => {
    if (!subject.trim() || !hasEnoughBlots) return;

    setState('generating');
    
    try {
      const result = await generateMutation.mutateAsync();
      setSamples(result.samples);
      setState('select');
    } catch {
      // Error handled by mutation, reset to input
      setState('input');
    }
  };

  const handleSelect = async () => {
    if (!selectedId) return;

    setState('confirming');
    
    try {
      await selectMutation.mutateAsync(selectedId);
      onComplete();
    } catch {
      // Error handled by mutation, go back to select
      setState('select');
    }
  };

  return (
    <div className="space-y-6">
      {/* INPUT STATE */}
      {state === 'input' && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center">
              <Palette className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Calibrate Your Style
            </h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              We&apos;ll generate 4 sample images so you can choose the look you like best.
            </p>
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="subject" 
              className="block text-sm font-medium text-zinc-300"
            >
              What subject should we use to calibrate your style?
            </label>
            <textarea
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., a friendly cat sitting"
              className="w-full h-24 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Cost:</span>
              <span className={cn(
                "font-medium",
                hasEnoughBlots ? "text-blue-400" : "text-red-400"
              )}>
                {requiredBlots} Blots
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Balance:</span>
              <span className={cn(
                "font-medium",
                hasEnoughBlots ? "text-white" : "text-red-400"
              )}>
                {blotBalance} Blots
              </span>
            </div>
          </div>

          {!hasEnoughBlots && (
            <p className="text-red-400 text-sm text-center">
              You need {requiredBlots - blotBalance} more blots to calibrate.
            </p>
          )}

          <Button
            onClick={handleGenerate}
            disabled={!subject.trim() || !hasEnoughBlots}
            className="w-full"
            icon={<Sparkles className="w-4 h-4" />}
          >
            Generate Samples
          </Button>
        </div>
      )}

      {/* GENERATING STATE */}
      {state === 'generating' && (
        <div className="py-12 text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <Loader className="w-16 h-16 text-blue-400 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              Generating 4 style samples...
            </h3>
            <p className="text-zinc-400 text-sm">
              This may take a minute. We&apos;re creating unique variations for you.
            </p>
          </div>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* SELECT STATE */}
      {state === 'select' && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-white">
              Choose your preferred style
            </h2>
            <p className="text-zinc-400 text-sm">
              Select the sample that best matches your vision
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {samples.map((sample) => {
              const isSelected = selectedId === sample.id;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => setSelectedId(sample.id)}
                  className={cn(
                    "relative aspect-square rounded-lg border-2 overflow-hidden transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/40",
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-zinc-700 hover:border-zinc-500"
                  )}
                >
                  {/* Sample Image */}
                  <img
                    src={sample.url}
                    alt={`Style sample ${sample.id}`}
                    className="w-full h-full object-cover bg-zinc-800"
                  />

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className={cn(
                    "absolute inset-0 transition-opacity",
                    isSelected ? "bg-blue-500/10" : "bg-transparent hover:bg-white/5"
                  )} />
                </button>
              );
            })}
          </div>

          <Button
            onClick={handleSelect}
            disabled={!selectedId}
            className="w-full"
          >
            Use This Style
          </Button>
        </div>
      )}

      {/* CONFIRMING STATE */}
      {state === 'confirming' && (
        <div className="py-12 text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <Loader className="w-16 h-16 text-blue-400 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              Setting up your style...
            </h3>
            <p className="text-zinc-400 text-sm">
              Almost done! Saving your style preferences.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Modal wrapper for StyleCalibration
 * Use this when showing calibration as an overlay
 */
interface StyleCalibrationModalProps extends StyleCalibrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StyleCalibrationModal({
  open,
  onOpenChange,
  ...props
}: StyleCalibrationModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Style Calibration"
      className="max-w-2xl"
    >
      <StyleCalibration {...props} />
    </Dialog>
  );
}

/**
 * Badge indicator for when style is ready
 */
export function StyleReadyBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-medium">
      <Check className="w-3.5 h-3.5" />
      <span>Style Ready</span>
    </div>
  );
}

/**
 * Banner prompting user to calibrate their style
 */
interface CalibrationBannerProps {
  blotBalance: number;
  onClick: () => void;
}

export function CalibrationBanner({ blotBalance, onClick }: CalibrationBannerProps) {
  const requiredBlots = BLOT_COSTS.styleCalibration;
  const hasEnoughBlots = blotBalance >= requiredBlots;

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Palette className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-white">Calibrate your style</h3>
            <p className="text-sm text-zinc-400">
              Set up your unique visual style before generating pages
            </p>
          </div>
        </div>
        <Button
          onClick={onClick}
          disabled={!hasEnoughBlots}
          size="sm"
          icon={<Sparkles className="w-4 h-4" />}
        >
          Calibrate ({requiredBlots} Blots)
        </Button>
      </div>
    </div>
  );
}
