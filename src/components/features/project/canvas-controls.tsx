'use client';

import { Minus, Plus, Maximize, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';

interface CanvasControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitScreen: () => void;
  className?: string;
}

export function CanvasControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onFitScreen,
  className,
}: CanvasControlsProps) {
  return (
    <div className={cn(
      "flex items-center gap-1 p-1 bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-lg shadow-xl",
      className
    )}>
      <Tooltip content="Zoom Out" position="top" delay={300}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
          onClick={onZoomOut}
        >
          <Minus className="w-4 h-4" />
        </Button>
      </Tooltip>

      <span className="w-12 text-center text-xs font-mono text-zinc-400 select-none">
        {Math.round(zoom * 100)}%
      </span>

      <Tooltip content="Zoom In" position="top" delay={300}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
          onClick={onZoomIn}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </Tooltip>

      <div className="w-px h-4 bg-zinc-800 mx-1" />

      <Tooltip content="Reset Zoom" position="top" delay={300}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
          onClick={onReset}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </Tooltip>

      <Tooltip content="Fit to Screen" position="top" delay={300}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
          onClick={onFitScreen}
        >
          <Maximize className="w-3.5 h-3.5" />
        </Button>
      </Tooltip>
    </div>
  );
}
