'use client';

import { AlertTriangle } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  projectName,
  onConfirm,
  isDeleting = false,
}: DeleteProjectDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Project"
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* Warning Icon */}
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="text-sm text-red-300">
            <strong className="font-semibold">Warning:</strong> This action cannot be undone.
          </div>
        </div>

        {/* Warning Message */}
        <div className="space-y-2">
          <p className="text-zinc-300">
            Are you sure you want to delete <strong className="text-white">&quot;{projectName}&quot;</strong>?
          </p>
          <p className="text-sm text-zinc-400">
            All pages, images, and assets associated with this project will be permanently deleted. 
            This includes all generated content and cannot be recovered.
          </p>
        </div>

        {/* Best Practices Warning */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-300">
            <strong className="font-semibold">Best Practice:</strong> Consider exporting your project 
            before deleting if you may need it in the future.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
            loading={isDeleting}
          >
            Delete Project
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
