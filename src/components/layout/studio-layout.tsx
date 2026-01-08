'use client';

import { useState, useRef, useCallback, useEffect, createContext, useContext } from 'react';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

/* =============================================================================
   STUDIO LAYOUT CONTEXT
   Manages panel states across the 3-pane layout
   ============================================================================= */

interface StudioLayoutContextValue {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  leftPanelWidth: number;
  rightPanelWidth: number;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
}

const StudioLayoutContext = createContext<StudioLayoutContextValue | undefined>(undefined);

export function useStudioLayout() {
  const context = useContext(StudioLayoutContext);
  if (!context) {
    throw new Error('useStudioLayout must be used within StudioLayoutProvider');
  }
  return context;
}

/* =============================================================================
   STUDIO LAYOUT PROVIDER
   Wrap your 3-pane layout with this provider to manage panel states
   ============================================================================= */

interface StudioLayoutProviderProps {
  children: React.ReactNode;
  defaultLeftOpen?: boolean;
  defaultRightOpen?: boolean;
  defaultLeftWidth?: number;
  defaultRightWidth?: number;
}

export function StudioLayoutProvider({
  children,
  defaultLeftOpen = true,
  defaultRightOpen = true,
  defaultLeftWidth = 256,  // w-64
  defaultRightWidth = 320, // w-80
}: StudioLayoutProviderProps) {
  const [leftPanelOpen, setLeftPanelOpen] = useState(defaultLeftOpen);
  const [rightPanelOpen, setRightPanelOpen] = useState(defaultRightOpen);
  const [leftPanelWidth, setLeftPanelWidth] = useState(defaultLeftWidth);
  const [rightPanelWidth, setRightPanelWidth] = useState(defaultRightWidth);

  return (
    <StudioLayoutContext.Provider
      value={{
        leftPanelOpen,
        rightPanelOpen,
        leftPanelWidth,
        rightPanelWidth,
        toggleLeftPanel: () => setLeftPanelOpen((v) => !v),
        toggleRightPanel: () => setRightPanelOpen((v) => !v),
        setLeftPanelWidth,
        setRightPanelWidth,
      }}
    >
      {children}
    </StudioLayoutContext.Provider>
  );
}

/* =============================================================================
   STUDIO 3-PANE CONTAINER
   Main container for the 3-pane layout
   ============================================================================= */

interface Studio3PaneProps {
  children: React.ReactNode;
  className?: string;
}

export function Studio3Pane({ children, className }: Studio3PaneProps) {
  return (
    <div className={cn('studio-3pane h-full', className)}>
      {children}
    </div>
  );
}

/* =============================================================================
   STUDIO SIDEBAR (Left or Right)
   Collapsible panel with optional resize handle
   ============================================================================= */

interface StudioSidebarProps {
  children: React.ReactNode;
  side: 'left' | 'right';
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  isOpen?: boolean;
  onToggle?: () => void;
  resizable?: boolean;
  onWidthChange?: (width: number) => void;
  className?: string;
  toggleLabel?: string;
}

export function StudioSidebar({
  children,
  side,
  width = 256,
  minWidth = 200,
  maxWidth = 400,
  isOpen = true,
  onToggle,
  resizable = false,
  onWidthChange,
  className,
  toggleLabel,
}: StudioSidebarProps) {
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle resize drag
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return;

      const rect = sidebarRef.current.getBoundingClientRect();
      let newWidth: number;

      if (side === 'left') {
        newWidth = e.clientX - rect.left;
      } else {
        newWidth = rect.right - e.clientX;
      }

      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      onWidthChange?.(newWidth);
    },
    [isResizing, side, minWidth, maxWidth, onWidthChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const isLeft = side === 'left';

  return (
    <div
      ref={sidebarRef}
      className={cn(
        'studio-sidebar relative flex flex-col transition-all duration-300 ease-in-out',
        isLeft ? 'studio-sidebar-left' : 'studio-sidebar-right',
        className
      )}
      style={{ width: isOpen ? width : 0 }}
    >
      {/* Toggle Button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 z-20',
            'w-6 h-12 bg-bg-surface border border-border-subtle',
            'flex items-center justify-center',
            'text-text-muted hover:text-text-primary hover:bg-hover-overlay',
            'transition-colors duration-base shadow-md',
            isLeft
              ? 'right-0 translate-x-full rounded-r-md border-l-0'
              : 'left-0 -translate-x-full rounded-l-md border-r-0'
          )}
          title={toggleLabel || (isOpen ? 'Collapse panel' : 'Expand panel')}
          aria-label={toggleLabel || (isOpen ? 'Collapse panel' : 'Expand panel')}
        >
          {isOpen ? (
            isLeft ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            isLeft ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Resize Handle */}
      {resizable && isOpen && (
        <div
          className={cn(
            'absolute top-0 bottom-0 w-1 cursor-col-resize z-10',
            'hover:bg-accent-cyan/30 transition-colors',
            isResizing && 'bg-accent-cyan/50',
            isLeft ? 'right-0' : 'left-0'
          )}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
            <GripVertical className="w-3 h-3 text-text-muted opacity-0 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          'flex-1 overflow-hidden',
          !isOpen && 'invisible'
        )}
        style={{ width }}
      >
        {children}
      </div>
    </div>
  );
}

/* =============================================================================
   STUDIO CANVAS (Center Area)
   Main content area between sidebars
   ============================================================================= */

interface StudioCanvasProps {
  children: React.ReactNode;
  className?: string;
  showGrid?: boolean;
  gridSize?: number;
}

export function StudioCanvas({
  children,
  className,
  showGrid = true,
  gridSize = 24,
}: StudioCanvasProps) {
  return (
    <div className={cn('studio-canvas relative', className)}>
      {/* Optional Grid Background */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}

/* =============================================================================
   STUDIO PANEL HEADER
   Sticky header for sidebar panels
   ============================================================================= */

interface StudioPanelHeaderProps {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function StudioPanelHeader({ children, className, actions }: StudioPanelHeaderProps) {
  return (
    <div className={cn('panel-header', className)}>
      <span className="panel-header-title">{children}</span>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* =============================================================================
   STUDIO PANEL SECTION
   Section within a sidebar panel
   ============================================================================= */

interface StudioPanelSectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  dense?: boolean;
}

export function StudioPanelSection({ children, title, className, dense }: StudioPanelSectionProps) {
  return (
    <div className={cn(dense ? 'panel-section' : 'panel-section-lg', className)}>
      {title && (
        <h3 className="form-label mb-3">{title}</h3>
      )}
      {children}
    </div>
  );
}

/* =============================================================================
   STUDIO PANEL DIVIDER
   Horizontal divider between sections
   ============================================================================= */

export function StudioPanelDivider({ className }: { className?: string }) {
  return <div className={cn('divider', className)} />;
}

/* =============================================================================
   STUDIO SCROLLABLE AREA
   Scrollable container with custom scrollbar
   ============================================================================= */

interface StudioScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

export function StudioScrollArea({ children, className }: StudioScrollAreaProps) {
  return (
    <div className={cn('flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin', className)}>
      {children}
    </div>
  );
}

/* =============================================================================
   STUDIO TOOLBAR
   Top toolbar container
   ============================================================================= */

interface StudioToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function StudioToolbar({ children, className }: StudioToolbarProps) {
  return (
    <div
      className={cn(
        'h-14 flex-shrink-0 flex items-center justify-between px-4',
        'bg-bg-surface border-b border-border-subtle',
        className
      )}
    >
      {children}
    </div>
  );
}

export function StudioToolbarSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center gap-3', className)}>{children}</div>;
}

/* =============================================================================
   STUDIO FLOATING CONTROLS
   Floating control overlay for canvas
   ============================================================================= */

interface StudioFloatingControlsProps {
  children: React.ReactNode;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  className?: string;
}

export function StudioFloatingControls({
  children,
  position = 'bottom-center',
  className,
}: StudioFloatingControlsProps) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div
      className={cn(
        'absolute z-10',
        'bg-bg-elevated/90 backdrop-blur-sm',
        'border border-border-subtle rounded-lg shadow-lg',
        'p-2',
        positionClasses[position],
        className
      )}
    >
      {children}
    </div>
  );
}
