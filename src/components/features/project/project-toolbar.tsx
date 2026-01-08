'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Download, Palette, Pencil, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ProjectToolbarProps {
  projectId: string;
  projectName: string;
  blotsBalance?: number;
  onExport: () => void;
  onBilling: () => void;
}

export function ProjectToolbar({
  projectId,
  projectName: initialProjectName,
  blotsBalance = 0,
  onExport,
  onBilling,
}: ProjectToolbarProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(initialProjectName);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with prop
  useEffect(() => {
    setName(initialProjectName);
  }, [initialProjectName]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const updateNameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project name');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      setIsEditingName(false);
    },
    onError: () => {
      toast.error('Failed to update project name');
      setName(initialProjectName); // Revert
    },
  });

  const handleNameSave = () => {
    if (!name.trim()) {
      setName(initialProjectName);
      setIsEditingName(false);
      return;
    }

    if (name !== initialProjectName) {
      updateNameMutation.mutate(name);
    } else {
      setIsEditingName(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setName(initialProjectName);
      setIsEditingName(false);
    }
  };

  return (
    <div className="h-14 border-b border-border-subtle bg-bg-surface flex items-center justify-between px-4 shrink-0 z-sticky">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/studio/projects')}
          className="text-text-muted hover:text-text-primary"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="h-6 w-px bg-border-subtle" />

        <div className="flex items-center gap-2">
          {isEditingName ? (
            <div className="relative">
              <Input
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={handleKeyDown}
                disabled={updateNameMutation.isPending}
                inputSize="sm"
                className="w-64"
              />
              {updateNameMutation.isPending && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-3 h-3 animate-spin text-text-muted" />
                </div>
              )}
            </div>
          ) : (
            <div 
              className="group flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-hover-overlay transition-colors duration-base"
              onClick={() => setIsEditingName(true)}
            >
              <h1 className="text-sm font-medium text-text-primary truncate max-w-[200px] sm:max-w-md">
                {name}
              </h1>
              <Pencil className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Blots Balance */}
        <div 
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent-cyan-muted rounded-full border border-accent-cyan/20 cursor-pointer hover:bg-accent-cyan/20 transition-colors duration-base"
          onClick={onBilling}
        >
          <Palette className="w-3.5 h-3.5 text-accent-cyan" />
          <span className="text-xs font-medium text-accent-cyan">
            {blotsBalance.toLocaleString()} Blots
          </span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onExport}
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </div>
  );
}
