'use client';

import { useState } from 'react';
import { AlertTriangle, Download, Trash2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

interface SettingsAccountProps {
  onExportData?: () => Promise<void>;
  onDeleteAccount?: () => Promise<void>;
}

export function SettingsAccount({
  onExportData,
  onDeleteAccount,
}: SettingsAccountProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleExport = async () => {
    if (!onExportData) return;

    setIsExporting(true);
    try {
      await onExportData();
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteAccount || deleteConfirmation !== 'DELETE') return;

    setIsDeleting(true);
    try {
      await onDeleteAccount();
    } catch (error) {
      console.error('Failed to delete account:', error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Password Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-medium text-white">Password</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Change your password or reset it via email.
          </p>
        </div>
        <Button variant="secondary" disabled>
          Change Password (Coming Soon)
        </Button>
      </div>

      {/* Export Data */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div>
          <h3 className="text-base font-medium text-white">Export Your Data</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Download a copy of all your data including projects, heroes, and settings.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleExport}
          disabled={isExporting || !onExportData}
        >
          {isExporting ? (
            <Loader className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export Data
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-medium text-red-400">Danger Zone</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="danger"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Account"
        className="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-950/30 border border-red-900/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-300 font-medium">
                  This action is permanent and cannot be undone.
                </p>
                <p className="text-sm text-zinc-400 mt-1">
                  All your projects, heroes, and data will be permanently deleted.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-zinc-300">
              Type <span className="font-mono text-red-400">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/40"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmation('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteConfirmation !== 'DELETE' || isDeleting}
              className="flex-1"
            >
              {isDeleting ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                'Delete Forever'
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
