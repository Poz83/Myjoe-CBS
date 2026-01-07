'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, FileText, FolderArchive, Clock, Download } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStartExport, useExportStatus, formatFileSize, type ExportFormat } from '@/hooks/use-export';
import { cn } from '@/lib/utils';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

type DialogState = 'options' | 'processing' | 'ready' | 'error';

interface FormatOption {
  value: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    value: 'pdf',
    label: 'PDF Document',
    description: 'Print-ready PDF for KDP or home printing',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    value: 'png_zip',
    label: 'PNG Images (ZIP)',
    description: 'Individual page images at 300 DPI',
    icon: <FolderArchive className="w-5 h-5" />,
  },
];

export function ExportDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
}: ExportDialogProps) {
  // State
  const [state, setState] = useState<DialogState>('options');
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [jobId, setJobId] = useState<string | null>(null);

  // Hooks
  const startExport = useStartExport();
  const exportStatus = useExportStatus(state === 'processing' ? jobId : null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setState('options');
      setFormat('pdf');
      setJobId(null);
    }
  }, [open]);

  // Watch for export completion
  useEffect(() => {
    if (exportStatus.status === 'completed') {
      setState('ready');
    } else if (exportStatus.status === 'failed') {
      setState('error');
    }
  }, [exportStatus.status]);

  // Handle start export
  const handleStartExport = async () => {
    try {
      const result = await startExport.mutateAsync({
        projectId,
        format,
      });
      setJobId(result.jobId);
      setState('processing');
    } catch {
      // Error handled by mutation
    }
  };

  // Handle download
  const handleDownload = () => {
    if (exportStatus.downloadUrl) {
      window.open(exportStatus.downloadUrl, '_blank');
    }
  };

  // Handle close
  const handleClose = () => {
    onOpenChange(false);
  };

  // Render content based on state
  const renderContent = () => {
    switch (state) {
      case 'options':
        return (
          <>
            <p className="text-zinc-400 mb-6">
              Export &quot;{projectName}&quot; for printing or sharing.
            </p>

            {/* Format selection */}
            <div className="space-y-3 mb-6">
              {FORMAT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormat(option.value)}
                  className={cn(
                    'w-full flex items-start gap-4 p-4 rounded-lg border transition-all text-left',
                    format === option.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                  )}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 mt-0.5',
                      format === option.value ? 'text-blue-400' : 'text-zinc-400'
                    )}
                  >
                    {option.icon}
                  </div>
                  <div>
                    <div className="font-medium text-white">{option.label}</div>
                    <div className="text-sm text-zinc-400">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Cost display */}
            <div className="flex items-center justify-between py-3 border-t border-zinc-800 mb-6">
              <span className="text-zinc-400">Cost</span>
              <span className="text-green-400 font-medium">Free</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStartExport}
                loading={startExport.isPending}
                className="flex-1"
              >
                Start Export
              </Button>
            </div>
          </>
        );

      case 'processing':
        return (
          <div className="py-8 text-center">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Preparing your files...
            </h3>
            <p className="text-zinc-400">
              This may take a minute for large projects.
            </p>
          </div>
        );

      case 'ready':
        return (
          <div className="py-4 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Export Ready!
            </h3>
            <p className="text-zinc-400 mb-2">
              Your {exportStatus.format === 'pdf' ? 'PDF' : 'ZIP'} is ready for download.
            </p>
            <p className="text-sm text-zinc-500 mb-6">
              {formatFileSize(exportStatus.fileSize)}
            </p>

            {/* Download button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleDownload}
              icon={<Download className="w-5 h-5" />}
              className="w-full mb-4"
            >
              Download
            </Button>

            {/* Expiry warning */}
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>Link expires in 1 hour</span>
            </div>

            {/* Close button */}
            <Button variant="ghost" onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">!</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Export Failed
            </h3>
            <p className="text-zinc-400 mb-6">
              {exportStatus.errorMessage || 'Something went wrong. Please try again.'}
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleClose} className="flex-1">
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => setState('options')}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={state === 'processing' ? () => {} : onOpenChange}
      title={state === 'options' ? 'Export Project' : undefined}
    >
      {renderContent()}
    </Dialog>
  );
}
