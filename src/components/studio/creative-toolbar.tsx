'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Edit3,
  Minimize2,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Wand2,
  Paintbrush,
  Eraser,
  Circle,
  Square,
  MousePointer,
  Eye,
  Layers,
  Grid3X3,
  Download,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Grip,
  Palette,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BLOT_COSTS } from '@/lib/constants';

// Tool types for the toolbar
type ToolId =
  | 'select'
  | 'brush'
  | 'eraser'
  | 'circle'
  | 'rectangle'
  | 'generate'
  | 'regenerate'
  | 'edit'
  | 'simplify'
  | 'detail';

interface CreativeToolbarProps {
  // View controls
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onResetZoom: () => void;

  // Tool selection (for edit mode)
  activeTool?: ToolId;
  onToolChange?: (tool: ToolId) => void;
  isEditMode?: boolean;

  // Actions
  onGenerate?: () => void;
  onRegenerate?: () => void;
  onEdit?: () => void;
  onSimplify?: () => void;
  onAddDetail?: () => void;
  onExport?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;

  // Brush settings (for edit mode)
  brushSize?: number;
  onBrushSizeChange?: (size: number) => void;

  // State
  hasSelectedPage?: boolean;
  isGenerating?: boolean;
  blotBalance?: number;
  styleReady?: boolean;

  // Positioning
  position?: 'bottom' | 'top' | 'floating';
  className?: string;
}

const ZOOM_PRESETS = [25, 50, 75, 100, 125, 150, 200];

export function CreativeToolbar({
  zoom,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onResetZoom,
  activeTool = 'select',
  onToolChange,
  isEditMode = false,
  onGenerate,
  onRegenerate,
  onEdit,
  onSimplify,
  onAddDetail,
  onExport,
  onDuplicate,
  onDelete,
  brushSize = 20,
  onBrushSizeChange,
  hasSelectedPage = false,
  isGenerating = false,
  blotBalance = 0,
  styleReady = true,
  position = 'bottom',
  className,
}: CreativeToolbarProps) {
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const zoomMenuRef = useRef<HTMLDivElement>(null);

  // Close zoom menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (zoomMenuRef.current && !zoomMenuRef.current.contains(e.target as Node)) {
        setShowZoomMenu(false);
      }
    };

    if (showZoomMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showZoomMenu]);

  const canAffordAction = (cost: number) => blotBalance >= cost;

  const positionStyles = {
    bottom: 'fixed bottom-6 left-1/2 -translate-x-1/2',
    top: 'fixed top-20 left-1/2 -translate-x-1/2',
    floating: 'absolute bottom-6 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={cn(
        'z-40 flex flex-col items-center gap-2',
        positionStyles[position],
        className
      )}
    >
      {/* Main Toolbar */}
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1.5',
          'bg-zinc-900/95 backdrop-blur-xl',
          'border border-zinc-700/80 rounded-2xl',
          'shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)_inset]',
          'transition-all duration-200'
        )}
      >
        {/* Collapse/Expand Toggle */}
        <ToolbarButton
          icon={isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          onClick={() => setIsExpanded(!isExpanded)}
          tooltip={isExpanded ? 'Collapse toolbar' : 'Expand toolbar'}
          size="sm"
        />

        <ToolbarDivider />

        {/* Zoom Controls Section */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={<ZoomOut className="w-4 h-4" />}
            onClick={onZoomOut}
            tooltip="Zoom out"
            disabled={zoom <= 25}
          />

          {/* Zoom Level Dropdown */}
          <div className="relative" ref={zoomMenuRef}>
            <button
              onClick={() => setShowZoomMenu(!showZoomMenu)}
              className={cn(
                'h-8 min-w-[60px] px-2 flex items-center justify-center gap-1',
                'text-sm font-medium text-zinc-300',
                'bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg',
                'transition-colors'
              )}
            >
              {zoom}%
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {/* Zoom Menu */}
            {showZoomMenu && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 py-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden min-w-[100px]">
                {ZOOM_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      onZoomChange(preset);
                      setShowZoomMenu(false);
                    }}
                    className={cn(
                      'w-full px-3 py-1.5 text-sm text-left',
                      'hover:bg-zinc-700 transition-colors',
                      zoom === preset ? 'text-blue-400 bg-zinc-700/50' : 'text-zinc-300'
                    )}
                  >
                    {preset}%
                  </button>
                ))}
                <div className="border-t border-zinc-700 mt-1 pt-1">
                  <button
                    onClick={() => {
                      onFitToScreen();
                      setShowZoomMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-sm text-left text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    Fit to screen
                  </button>
                </div>
              </div>
            )}
          </div>

          <ToolbarButton
            icon={<ZoomIn className="w-4 h-4" />}
            onClick={onZoomIn}
            tooltip="Zoom in"
            disabled={zoom >= 200}
          />

          <ToolbarButton
            icon={<Maximize className="w-4 h-4" />}
            onClick={onFitToScreen}
            tooltip="Fit to screen"
          />
        </div>

        {isExpanded && (
          <>
            <ToolbarDivider />

            {/* Edit Mode Tools */}
            {isEditMode && onToolChange && (
              <>
                <div className="flex items-center gap-0.5">
                  <ToolbarButton
                    icon={<MousePointer className="w-4 h-4" />}
                    onClick={() => onToolChange('select')}
                    tooltip="Select"
                    active={activeTool === 'select'}
                  />
                  <ToolbarButton
                    icon={<Paintbrush className="w-4 h-4" />}
                    onClick={() => onToolChange('brush')}
                    tooltip="Brush"
                    active={activeTool === 'brush'}
                  />
                  <ToolbarButton
                    icon={<Circle className="w-4 h-4" />}
                    onClick={() => onToolChange('circle')}
                    tooltip="Circle"
                    active={activeTool === 'circle'}
                  />
                  <ToolbarButton
                    icon={<Square className="w-4 h-4" />}
                    onClick={() => onToolChange('rectangle')}
                    tooltip="Rectangle"
                    active={activeTool === 'rectangle'}
                  />
                  <ToolbarButton
                    icon={<Eraser className="w-4 h-4" />}
                    onClick={() => onToolChange('eraser')}
                    tooltip="Eraser"
                    active={activeTool === 'eraser'}
                  />
                </div>

                {/* Brush Size (when brush or eraser selected) */}
                {(activeTool === 'brush' || activeTool === 'eraser') && onBrushSizeChange && (
                  <>
                    <ToolbarDivider />
                    <div className="flex items-center gap-2 px-2">
                      <span className="text-xs text-zinc-500">Size</span>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={brushSize}
                        onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                        className="w-20 h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                      <span className="text-xs text-zinc-400 w-6">{brushSize}</span>
                    </div>
                  </>
                )}

                <ToolbarDivider />
              </>
            )}

            {/* Creation & Edit Actions */}
            {!isEditMode && (
              <div className="flex items-center gap-0.5">
                {/* Generate New Pages */}
                {onGenerate && styleReady && (
                  <ToolbarActionButton
                    icon={<Sparkles className="w-4 h-4" />}
                    label="Generate"
                    onClick={onGenerate}
                    tooltip="Generate coloring pages"
                    primary
                    disabled={isGenerating || !styleReady}
                  />
                )}

                {/* Page Actions - only show when a page is selected */}
                {hasSelectedPage && (
                  <>
                    <ToolbarActionButton
                      icon={<RotateCcw className="w-4 h-4" />}
                      label="Regenerate"
                      onClick={onRegenerate}
                      tooltip={`Regenerate page (${BLOT_COSTS.regeneratePage} Blots)`}
                      disabled={!canAffordAction(BLOT_COSTS.regeneratePage) || isGenerating}
                      cost={BLOT_COSTS.regeneratePage}
                    />

                    <ToolbarActionButton
                      icon={<Edit3 className="w-4 h-4" />}
                      label="Edit"
                      onClick={onEdit}
                      tooltip={`Edit with brush (${BLOT_COSTS.edit} Blots)`}
                      disabled={!canAffordAction(BLOT_COSTS.edit) || isGenerating}
                      cost={BLOT_COSTS.edit}
                    />

                    <ToolbarActionButton
                      icon={<Minimize2 className="w-4 h-4" />}
                      label="Simplify"
                      onClick={onSimplify}
                      tooltip={`Simplify details (${BLOT_COSTS.edit} Blots)`}
                      disabled={!canAffordAction(BLOT_COSTS.edit) || isGenerating}
                      cost={BLOT_COSTS.edit}
                    />

                    <ToolbarActionButton
                      icon={<Plus className="w-4 h-4" />}
                      label="Add Detail"
                      onClick={onAddDetail}
                      tooltip={`Add more detail (${BLOT_COSTS.edit} Blots)`}
                      disabled={!canAffordAction(BLOT_COSTS.edit) || isGenerating}
                      cost={BLOT_COSTS.edit}
                    />
                  </>
                )}
              </div>
            )}

            <ToolbarDivider />

            {/* Additional Actions */}
            <div className="flex items-center gap-0.5">
              {hasSelectedPage && (
                <>
                  <ToolbarButton
                    icon={<Copy className="w-4 h-4" />}
                    onClick={onDuplicate}
                    tooltip="Duplicate page"
                    disabled={!onDuplicate}
                  />
                  <ToolbarButton
                    icon={<Download className="w-4 h-4" />}
                    onClick={onExport}
                    tooltip="Export page"
                    disabled={!onExport}
                  />
                  <ToolbarButton
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={onDelete}
                    tooltip="Delete page"
                    disabled={!onDelete}
                    variant="danger"
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      {isExpanded && (
        <div className="flex items-center gap-4 text-[10px] text-zinc-600">
          <span>
            <kbd className="px-1 bg-zinc-800 rounded">+/-</kbd> Zoom
          </span>
          <span>
            <kbd className="px-1 bg-zinc-800 rounded">0</kbd> Reset
          </span>
          <span>
            <kbd className="px-1 bg-zinc-800 rounded">F</kbd> Fit
          </span>
        </div>
      )}
    </div>
  );
}

// Individual toolbar button component
interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  tooltip?: string;
  active?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  variant?: 'default' | 'danger';
  className?: string;
}

export function ToolbarButton({
  icon,
  onClick,
  tooltip,
  active,
  disabled,
  size = 'md',
  variant = 'default',
  className,
}: ToolbarButtonProps) {
  const sizeStyles = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
  };

  const variantStyles = {
    default: active
      ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
      : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50 border-transparent',
    danger: 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border-transparent',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={cn(
        'flex items-center justify-center rounded-lg border',
        'transition-all duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {icon}
    </button>
  );
}

// Action button with label
interface ToolbarActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  tooltip?: string;
  primary?: boolean;
  disabled?: boolean;
  cost?: number;
}

function ToolbarActionButton({
  icon,
  label,
  onClick,
  tooltip,
  primary,
  disabled,
  cost,
}: ToolbarActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={cn(
        'flex items-center gap-1.5 h-8 px-3 rounded-lg',
        'text-sm font-medium transition-all duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        primary
          ? 'bg-blue-600 text-white hover:bg-blue-500'
          : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white'
      )}
    >
      {icon}
      <span>{label}</span>
      {cost !== undefined && (
        <span
          className={cn(
            'text-xs px-1.5 py-0.5 rounded-full ml-0.5',
            primary ? 'bg-blue-500/30' : 'bg-zinc-700 text-zinc-400'
          )}
        >
          {cost}
        </span>
      )}
    </button>
  );
}

// Divider component
function ToolbarDivider() {
  return <div className="w-px h-6 bg-zinc-700/50 mx-1" />;
}

// Floating mini toolbar for quick actions
interface QuickActionBarProps {
  onRegenerate?: () => void;
  onEdit?: () => void;
  onSimplify?: () => void;
  onAddDetail?: () => void;
  disabled?: boolean;
  blotBalance?: number;
}

export function QuickActionBar({
  onRegenerate,
  onEdit,
  onSimplify,
  onAddDetail,
  disabled,
  blotBalance = 0,
}: QuickActionBarProps) {
  const canAfford = blotBalance >= BLOT_COSTS.edit;

  return (
    <div className="flex items-center gap-1 p-1 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 rounded-xl shadow-lg">
      <QuickActionButton
        icon={<RotateCcw className="w-3.5 h-3.5" />}
        label="Regenerate"
        onClick={onRegenerate}
        disabled={disabled || !canAfford}
      />
      <QuickActionButton
        icon={<Edit3 className="w-3.5 h-3.5" />}
        label="Edit"
        onClick={onEdit}
        disabled={disabled || !canAfford}
      />
      <QuickActionButton
        icon={<Minimize2 className="w-3.5 h-3.5" />}
        label="Simplify"
        onClick={onSimplify}
        disabled={disabled || !canAfford}
      />
      <QuickActionButton
        icon={<Plus className="w-3.5 h-3.5" />}
        label="Detail"
        onClick={onAddDetail}
        disabled={disabled || !canAfford}
      />
    </div>
  );
}

function QuickActionButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg',
        'text-zinc-400 hover:text-white hover:bg-zinc-700/50',
        'transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
      )}
    >
      {icon}
      <span className="text-[10px]">{label}</span>
    </button>
  );
}
