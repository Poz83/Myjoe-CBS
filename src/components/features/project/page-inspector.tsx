'use client';

import { Sparkles, Edit3, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionHeader, AccordionContent } from '@/components/ui/accordion';
import { BLOT_COSTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Database } from '@/lib/supabase/types';

type Page = Database['public']['Tables']['pages']['Row'];

interface PageInspectorProps {
  page: Page | null;
  onRegenerate?: () => void;
  onEdit?: () => void;
  onSimplify?: () => void;
}

const PAGE_TYPE_LABELS: Record<Page['page_type'], string> = {
  illustration: 'Illustration',
  'text-focus': 'Text Focus',
  pattern: 'Pattern',
  educational: 'Educational',
};

export function PageInspector({
  page,
  onRegenerate,
  onEdit,
  onSimplify,
}: PageInspectorProps) {
  // Empty state when no page is selected
  if (!page) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-900 border-l border-zinc-800 p-8">
        <div className="text-center">
          <p className="text-zinc-400">Select a page to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-l border-zinc-800">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <Accordion defaultValue="scene" className="border-0">
          {/* Scene Section */}
          <AccordionItem value="scene">
            <AccordionHeader>Scene</AccordionHeader>
            <AccordionContent>
              <div className="space-y-3">
                {/* Scene Brief */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-zinc-300">
                    {page.scene_brief || 'No scene description yet'}
                  </p>
                </div>

                {/* Page Type */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Page Type
                  </label>
                  <span className="inline-block px-2 py-1 bg-zinc-800 rounded text-xs font-medium text-zinc-300">
                    {PAGE_TYPE_LABELS[page.page_type]}
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Actions Section */}
          <AccordionItem value="actions">
            <AccordionHeader>Actions</AccordionHeader>
            <AccordionContent>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full justify-between"
                  onClick={onRegenerate}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  <span>Regenerate</span>
                  <span className="text-xs text-zinc-400">
                    {BLOT_COSTS.generate} Blots
                  </span>
                </Button>

                <Button
                  variant="secondary"
                  className="w-full justify-between"
                  onClick={onEdit}
                  icon={<Edit3 className="w-4 h-4" />}
                >
                  <span>Edit</span>
                  <span className="text-xs text-zinc-400">
                    {BLOT_COSTS.edit} Blots
                  </span>
                </Button>

                <Button
                  variant="secondary"
                  className="w-full justify-between"
                  onClick={onSimplify}
                  icon={<Minimize2 className="w-4 h-4" />}
                >
                  <span>Simplify</span>
                  <span className="text-xs text-zinc-400">
                    {BLOT_COSTS.edit} Blots
                  </span>
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Versions Section */}
          <AccordionItem value="versions">
            <AccordionHeader>Versions</AccordionHeader>
            <AccordionContent>
              <div className="space-y-2">
                {/* Current version placeholder */}
                <div className="flex items-center gap-2 p-2 bg-zinc-800 rounded">
                  <div className="w-12 h-12 bg-zinc-700 rounded flex items-center justify-center">
                    <span className="text-xs text-zinc-500">v{page.current_version}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      Version {page.current_version}
                    </p>
                    <p className="text-xs text-zinc-500">Current</p>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 text-center py-2">
                  No previous versions
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Sticky Footer with Primary Action */}
      <div className="flex-shrink-0 p-4 border-t border-zinc-800">
        <Button variant="primary" className="w-full" onClick={onRegenerate}>
          Generate Page
        </Button>
      </div>
    </div>
  );
}
