'use client';

import { useState } from 'react';
import { Sparkles, AlertCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BLOT_COSTS } from '@/lib/constants';
import { useStartGeneration, type GenerationError } from '@/hooks/use-generation';
import { cn } from '@/lib/utils';
import type { Database } from '@/lib/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'] & {
  pages?: Database['public']['Tables']['pages']['Row'][];
};

interface GenerationStartProps {
  project: Project;
  onStarted: (jobId: string) => void;
}

const AUDIENCE_LABELS: Record<string, string> = {
  toddler: 'toddlers',
  children: 'children',
  tween: 'tweens',
  teen: 'teens',
  adult: 'adults',
};

export function GenerationStart({ project, onStarted }: GenerationStartProps) {
  const [idea, setIdea] = useState('');
  const [safetyError, setSafetyError] = useState<GenerationError | null>(null);

  const startGeneration = useStartGeneration();

  const pageCount = project.pages?.length || project.page_count;
  const blotCost = pageCount * BLOT_COSTS.generatePage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSafetyError(null);

    try {
      const result = await startGeneration.mutateAsync({
        projectId: project.id,
        idea: idea.trim(),
      });
      onStarted(result.jobId);
    } catch (error) {
      const genError = error as GenerationError;
      // Check if it's a safety or blot error (show inline)
      if (genError.blocked || genError.shortfall) {
        setSafetyError(genError);
      }
      // Other errors are handled by toast in the hook
    }
  };

  const hasSafetyError = safetyError?.blocked && safetyError.blocked.length > 0;
  const hasBlotError = safetyError?.shortfall && safetyError.shortfall > 0;

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-l border-zinc-800">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            Generate Pages
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            Describe your coloring book theme
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Idea Input */}
          <div>
            <label
              htmlFor="idea"
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              What&apos;s your coloring book about?
            </label>
            <textarea
              id="idea"
              value={idea}
              onChange={(e) => {
                setIdea(e.target.value);
                if (safetyError) setSafetyError(null);
              }}
              placeholder="e.g., A day at the farm with friendly animals, tractors, and a big red barn..."
              className={cn(
                'w-full h-32 px-4 py-3 bg-zinc-800 rounded-lg text-white placeholder:text-zinc-500',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none',
                'transition-colors',
                hasSafetyError
                  ? 'border-2 border-red-500 focus:border-red-500 focus:ring-red-500/40'
                  : 'border border-zinc-700 focus:border-blue-500'
              )}
              minLength={3}
              maxLength={500}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-zinc-500">
                {idea.length < 3 ? 'At least 3 characters' : ''}
              </span>
              <span className="text-xs text-zinc-500">
                {idea.length}/500
              </span>
            </div>
          </div>

          {/* Safety Error */}
          {hasSafetyError && (
            <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-lg space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-400">
                    This content isn&apos;t suitable for {AUDIENCE_LABELS[project.audience] || project.audience}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Blocked: {safetyError.blocked?.join(', ')}
                  </p>
                </div>
              </div>

              {safetyError.suggestions && safetyError.suggestions.length > 0 && (
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
                            setIdea(suggestion);
                            setSafetyError(null);
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

          {/* Project Info */}
          <div className="p-4 bg-zinc-800/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Pages to generate</span>
              <span className="text-white font-medium">{pageCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Audience</span>
              <span className="text-white font-medium capitalize">{project.audience}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Style</span>
              <span className="text-white font-medium capitalize">
                {project.style_preset.replace('-', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-zinc-800 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Cost</span>
            <span className="text-white font-semibold">
              {blotCost} Blots
            </span>
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={startGeneration.isPending}
            disabled={idea.trim().length < 3 || startGeneration.isPending}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Generate {pageCount} Pages
          </Button>
        </div>
      </form>
    </div>
  );
}
