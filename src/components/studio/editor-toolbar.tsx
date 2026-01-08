'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check, Loader, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BlotsBadge } from './blots-badge';
import { ViewModeTabs, type ViewMode } from './view-mode-tabs';
import { HelpButton } from './help-button';
import { UserMenu } from '@/components/features/auth/user-menu';
import { useLayoutStore } from '@/stores/layout-store';
import { cn } from '@/lib/utils';

type ProjectStatus = 'draft' | 'calibrating' | 'generating' | 'ready' | 'exported';

interface EditorToolbarProps {
  projectId: string;
  projectName: string;
  status: ProjectStatus;
  blotBalance: number;
  styleReady?: boolean;
  viewMode: ViewMode;
  onNameChange?: (name: string) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenBilling?: () => void;
  onHelp?: () => void;
}

const STATUS_STYLES: Record<ProjectStatus, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  calibrating: 'bg-amber-600 text-white',
  generating: 'bg-blue-600 text-white',
  ready: 'bg-green-600 text-white',
  exported: 'bg-purple-600 text-white',
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Draft',
  calibrating: 'Calibrating',
  generating: 'Generating',
  ready: 'Ready',
  exported: 'Exported',
};

export function EditorToolbar({
  projectId,
  projectName,
  status,
  blotBalance,
  styleReady,
  viewMode,
  onNameChange,
  onViewModeChange,
  onOpenBilling,
  onHelp,
}: EditorToolbarProps) {
  const router = useRouter();
  const { autoSaveStatus } = useLayoutStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(projectName);

  const handleNameClick = () => {
    setIsEditingName(true);
    setEditedName(projectName);
  };

  const handleNameSave = () => {
    if (editedName.trim() && editedName !== projectName) {
      onNameChange?.(editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setEditedName(projectName);
      setIsEditingName(false);
    }
  };

  const handleBack = () => {
    router.push('/studio/projects');
  };

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-50">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="text-zinc-400 hover:text-white"
          aria-label="Back to projects"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Logo */}
        <div className="text-lg font-bold text-white">
          myjoe
        </div>

        <div className="w-px h-6 bg-zinc-700" />

        {/* Project Name (editable) */}
        {isEditingName ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleNameKeyDown}
            className="w-56 h-8 bg-zinc-800 border-zinc-700"
            autoFocus
            maxLength={100}
          />
        ) : (
          <button
            onClick={handleNameClick}
            className="text-base font-medium text-white hover:text-blue-400 transition-colors max-w-[200px] truncate"
          >
            {projectName}
          </button>
        )}

        {/* Status Badge */}
        <span
          className={cn(
            'px-2 py-0.5 rounded text-xs font-medium',
            STATUS_STYLES[status]
          )}
        >
          {STATUS_LABELS[status]}
        </span>

        {/* Auto-save Indicator */}
        <div className="flex items-center gap-1.5 text-sm ml-2">
          {autoSaveStatus === 'saving' && (
            <>
              <Loader className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
              <span className="text-zinc-500">Saving...</span>
            </>
          )}
          {autoSaveStatus === 'saved' && (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-zinc-500">Saved</span>
            </>
          )}
          {autoSaveStatus === 'error' && (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400">Error</span>
            </>
          )}
        </div>
      </div>

      {/* Center Section */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <ViewModeTabs
          value={viewMode}
          onChange={onViewModeChange}
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <BlotsBadge
          balance={blotBalance}
          onClick={onOpenBilling}
        />
        <HelpButton onClick={onHelp} />
        <UserMenu />
      </div>
    </header>
  );
}
