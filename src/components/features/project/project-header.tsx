'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check, Loader, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StyleReadyBadge } from './style-calibration';
import { useLayoutStore } from '@/stores/layout-store';
import { cn } from '@/lib/utils';

interface ProjectHeaderProps {
  projectId: string;
  projectName: string;
  status: 'draft' | 'generating' | 'ready' | 'exported';
  blotBalance: number;
  styleReady?: boolean;
  onNameChange?: (name: string) => void;
  onExport?: () => void;
}

const STATUS_STYLES = {
  draft: 'bg-zinc-700 text-zinc-300',
  generating: 'bg-blue-600 text-white',
  ready: 'bg-green-600 text-white',
  exported: 'bg-purple-600 text-white',
};

const STATUS_LABELS = {
  draft: 'Draft',
  generating: 'Generating',
  ready: 'Ready',
  exported: 'Exported',
};

export function ProjectHeader({
  projectId,
  projectName,
  status,
  blotBalance,
  styleReady,
  onNameChange,
  onExport,
}: ProjectHeaderProps) {
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

  return (
    <div className="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronLeft className="w-4 h-4" />}
          onClick={() => router.push('/studio/projects')}
        >
          Back
        </Button>

        {isEditingName ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleNameKeyDown}
            className="w-64 h-8"
            autoFocus
            maxLength={100}
          />
        ) : (
          <button
            onClick={handleNameClick}
            className="text-lg font-semibold text-white hover:text-blue-400 transition-colors"
          >
            {projectName}
          </button>
        )}

        <span
          className={cn(
            'px-2 py-1 rounded text-xs font-medium',
            STATUS_STYLES[status]
          )}
        >
          {STATUS_LABELS[status]}
        </span>

        {/* Style Ready Badge */}
        {styleReady && <StyleReadyBadge />}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Auto-save Indicator */}
        <div className="flex items-center gap-2 text-sm">
          {autoSaveStatus === 'saving' && (
            <>
              <Loader className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-zinc-400">Saving...</span>
            </>
          )}
          {autoSaveStatus === 'saved' && (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-zinc-400">Saved</span>
            </>
          )}
          {autoSaveStatus === 'error' && (
            <>
              <AlertCircle className="w-4 h-4 text-red-400" />
              <button className="text-red-400 hover:text-red-300 transition-colors">
                Save failed · Retry
              </button>
            </>
          )}
        </div>

        {/* Blot Balance */}
        <div className="flex items-center gap-1 px-3 py-1 bg-zinc-800 rounded-md">
          <span className="text-lg">🎨</span>
          <span className="font-semibold text-white">{blotBalance}</span>
        </div>

        {/* Export Button */}
        <Button variant="primary" size="sm" onClick={onExport}>
          Export
        </Button>
      </div>
    </div>
  );
}
