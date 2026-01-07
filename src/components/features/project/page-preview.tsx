'use client';

import { useState } from 'react';
import { Image as ImageIcon, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Database } from '@/lib/supabase/types';

type Page = Database['public']['Tables']['pages']['Row'];

interface PagePreviewProps {
  page: Page | null;
  onGeneratePages?: () => void;
}

export function PagePreview({ page, onGeneratePages }: PagePreviewProps) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 25));
  };

  const handleFit = () => {
    setZoom(100);
  };

  // Empty state when no page is selected or no pages exist
  if (!page) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#171717] p-8">
        <ImageIcon className="w-16 h-16 text-zinc-600 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Generate pages to get started
        </h3>
        <p className="text-zinc-400 mb-6 text-center max-w-md">
          Create your coloring book pages with AI-powered generation
        </p>
        <Button variant="primary" onClick={onGeneratePages}>
          Generate Pages
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#171717]">
      {/* Preview Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8">
        <div
          className="transition-transform duration-200"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {/* Placeholder for page image */}
          <div className="w-[400px] h-[520px] bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center">
            <div className="text-center space-y-2">
              <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-500">Page preview</p>
              <p className="text-xs text-zinc-600">
                {page.scene_brief || 'No scene generated yet'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="flex-shrink-0 h-16 border-t border-zinc-800 flex items-center justify-center gap-4 px-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<ZoomOut className="w-4 h-4" />}
          onClick={handleZoomOut}
          disabled={zoom <= 25}
        />

        <input
          type="range"
          min="25"
          max="200"
          step="25"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-32 accent-blue-600"
        />

        <Button
          variant="ghost"
          size="sm"
          icon={<ZoomIn className="w-4 h-4" />}
          onClick={handleZoomIn}
          disabled={zoom >= 200}
        />

        <div className="w-px h-6 bg-zinc-700" />

        <span className="text-sm text-zinc-400 w-12 text-center">
          {zoom}%
        </span>

        <Button
          variant="ghost"
          size="sm"
          icon={<Maximize2 className="w-4 h-4" />}
          onClick={handleFit}
        >
          Fit
        </Button>
      </div>
    </div>
  );
}
