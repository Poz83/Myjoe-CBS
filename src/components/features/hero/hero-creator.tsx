'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BLOT_COSTS } from '@/lib/constants';
import { useCreateHero, useHeroJob, type HeroCreationError } from '@/hooks/use-heroes';
import type { Audience } from '@/types/domain';

interface HeroFormData {
  name: string;
  description: string;
  audience: Audience | null;
}

const AUDIENCE_OPTIONS: Array<{
  value: Audience;
  emoji: string;
  label: string;
  ageRange: string;
  description: string;
}> = [
  {
    value: 'toddler',
    emoji: '👶',
    label: 'Toddler',
    ageRange: 'Ages 2-4',
    description: 'Simple, bold shapes. Thick outlines that are easy to see and color.',
  },
  {
    value: 'children',
    emoji: '🧒',
    label: 'Children',
    ageRange: 'Ages 5-8',
    description: 'Fun characters with moderate detail. Thick, friendly outlines.',
  },
  {
    value: 'tween',
    emoji: '🧑',
    label: 'Tween',
    ageRange: 'Ages 9-12',
    description: 'Balanced complexity with medium line weight. Engaging designs.',
  },
  {
    value: 'teen',
    emoji: '👩',
    label: 'Teen',
    ageRange: 'Ages 13-17',
    description: 'Detailed illustrations with medium-fine lines. Creative challenges.',
  },
  {
    value: 'adult',
    emoji: '🎨',
    label: 'Adult',
    ageRange: 'Ages 18+',
    description: 'Intricate details with fine outlines. Sophisticated patterns.',
  },
];

const AUDIENCE_LABELS: Record<string, string> = {
  toddler: 'toddlers',
  children: 'children',
  tween: 'tweens',
  teen: 'teens',
  adult: 'adults',
};

export function HeroCreator() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<HeroFormData>({
    name: '',
    description: '',
    audience: null,
  });
  const [safetyError, setSafetyError] = useState<HeroCreationError | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const createHero = useCreateHero();
  const { data: jobStatus } = useHeroJob(jobId);

  const job = jobStatus?.job;
  const isJobComplete = job?.status === 'completed';
  const isJobFailed = job?.status === 'failed';

  const blotCost = BLOT_COSTS.heroReferenceSheet;

  const canProceed = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length >= 1 && formData.description.trim().length >= 10;
      case 2:
        return formData.audience !== null;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 3 && canProceed(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setSafetyError(null);
      setStep(step - 1);
    }
  };

  const handleGenerate = async () => {
    if (!formData.audience) return;

    setSafetyError(null);

    try {
      const result = await createHero.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim(),
        audience: formData.audience,
      });

      setJobId(result.jobId);
      setStep(4);
    } catch (error) {
      const genError = error as HeroCreationError;
      if (genError.blocked || genError.shortfall) {
        setSafetyError(genError);
      }
    }
  };

  const handleTryAgain = () => {
    setJobId(null);
    setStep(3);
  };

  const handleApprove = () => {
    // Invalidate heroes query and navigate to library
    queryClient.invalidateQueries({ queryKey: ['heroes'] });
    router.push('/studio/library');
  };

  const hasSafetyError = safetyError?.blocked && safetyError.blocked.length > 0;
  const hasBlotError = safetyError?.shortfall && safetyError.shortfall > 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      {step < 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'flex-1 h-1 mx-1 rounded-full transition-colors',
                  s <= step ? 'bg-blue-500' : 'bg-zinc-700'
                )}
              />
            ))}
          </div>
          <p className="text-sm text-zinc-400 text-center">
            Step {step} of 3
          </p>
        </div>
      )}

      {/* Step 1: Name + Description */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Create Your Hero
            </h2>
            <p className="text-zinc-400 text-sm">
              Describe your character in detail. Rich descriptions help the AI generate better reference sheets.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Character Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Captain Whiskers, Luna the Fairy..."
                maxLength={100}
                className="w-full px-4 py-3 bg-zinc-800 rounded-lg border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-zinc-500">
                  {formData.name.length}/100
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Character Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your character's appearance, clothing, accessories, and any distinctive features..."
                maxLength={500}
                rows={6}
                className="w-full px-4 py-3 bg-zinc-800 rounded-lg border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-zinc-500">
                  {formData.description.length < 10 ? 'At least 10 characters' : ''}
                </span>
                <span className="text-xs text-zinc-500">
                  {formData.description.length}/500
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Audience */}
      {step === 2 && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Who is this hero for?
            </h2>
            <p className="text-zinc-400 text-sm">
              Select the target age group. This affects line weight and style.
            </p>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {AUDIENCE_OPTIONS.map((option) => {
              const isSelected = formData.audience === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, audience: option.value })}
                  className={cn(
                    'flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all',
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                  )}
                >
                  <span className="text-4xl mb-2">{option.emoji}</span>
                  <span
                    className={cn(
                      'font-semibold mb-1',
                      isSelected ? 'text-white' : 'text-zinc-300'
                    )}
                  >
                    {option.label}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      isSelected ? 'text-blue-300' : 'text-zinc-500'
                    )}
                  >
                    {option.ageRange}
                  </span>
                </button>
              );
            })}
          </div>

          {formData.audience && (
            <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <p className="text-sm text-zinc-300">
                {AUDIENCE_OPTIONS.find((opt) => opt.value === formData.audience)?.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review + Generate */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Review & Generate
            </h2>
            <p className="text-zinc-400 text-sm">
              Review your hero details before generating the reference sheet.
            </p>
          </div>

          {/* Summary */}
          <div className="p-4 bg-zinc-800/50 rounded-lg space-y-3">
            <div>
              <span className="text-sm text-zinc-400">Name</span>
              <p className="text-white font-medium">{formData.name}</p>
            </div>
            <div>
              <span className="text-sm text-zinc-400">Description</span>
              <p className="text-white text-sm line-clamp-3">{formData.description}</p>
            </div>
            <div>
              <span className="text-sm text-zinc-400">Audience</span>
              <p className="text-white font-medium capitalize">{formData.audience}</p>
            </div>
          </div>

          {/* Safety Error */}
          {hasSafetyError && (
            <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-lg space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-400">
                    This description isn&apos;t suitable for {AUDIENCE_LABELS[formData.audience || ''] || formData.audience}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Blocked: {safetyError?.blocked?.join(', ')}
                  </p>
                </div>
              </div>

              {safetyError?.suggestions && safetyError.suggestions.length > 0 && (
                <div className="pt-2 border-t border-red-500/20">
                  <p className="text-xs font-medium text-zinc-400 flex items-center gap-1 mb-2">
                    <Lightbulb className="w-3 h-3" />
                    Try instead:
                  </p>
                  <ul className="space-y-1">
                    {safetyError.suggestions.map((suggestion, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, description: suggestion });
                            setSafetyError(null);
                            setStep(1);
                          }}
                          className="text-sm text-blue-400 hover:text-blue-300 hover:underline text-left"
                        >
                          &quot;{suggestion}&quot;
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Insufficient Blots Error */}
          {hasBlotError && (
            <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-400">
                    Insufficient blots
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Need {safetyError?.required} blots, but you have {safetyError?.available}.
                    You need {safetyError?.shortfall} more blots.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cost display */}
          <div className="flex justify-between items-center p-4 bg-zinc-800 rounded-lg">
            <span className="text-zinc-400">Generation Cost</span>
            <span className="text-white font-semibold">{blotCost} Blots</span>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {step === 4 && (
        <div className="space-y-6">
          {/* Processing state */}
          {!isJobComplete && !isJobFailed && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Generating Reference Sheet
              </h2>
              <p className="text-zinc-400 text-sm">
                Creating a 2×2 reference sheet with front, side, back, and 3/4 views...
              </p>
            </div>
          )}

          {/* Failed state */}
          {isJobFailed && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Generation Failed
              </h2>
              <p className="text-zinc-400 text-sm mb-4">
                {job?.errorMessage || 'Something went wrong during generation.'}
              </p>
              <Button
                variant="secondary"
                onClick={handleTryAgain}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Success state */}
          {isJobComplete && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Reference Sheet Ready!
                </h2>
                <p className="text-zinc-400 text-sm">
                  Your hero &quot;{formData.name}&quot; has been created.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  onClick={handleTryAgain}
                  icon={<RefreshCw className="w-4 h-4" />}
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApprove}
                  icon={<CheckCircle className="w-4 h-4" />}
                  className="flex-1"
                >
                  Approve
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      {step < 4 && (
        <div className="flex justify-between mt-8 pt-6 border-t border-zinc-800">
          <Button
            variant="ghost"
            onClick={step === 1 ? () => router.back() : handleBack}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          {step < 3 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed(step)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={!canProceed(step) || createHero.isPending}
              loading={createHero.isPending}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Generate Reference Sheet
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
