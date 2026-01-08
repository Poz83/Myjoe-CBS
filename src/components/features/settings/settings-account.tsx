'use client';

import { useState } from 'react';
import { AlertTriangle, Download, Trash2, Loader, Shield, Key, Clock, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

interface SettingsAccountProps {
  onExportData?: () => Promise<void>;
  onDeleteAccount?: () => Promise<void>;
  lastPasswordChange?: string;
  twoFactorEnabled?: boolean;
}

export function SettingsAccount({
  onExportData,
  onDeleteAccount,
  lastPasswordChange,
  twoFactorEnabled = false,
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
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Security & Privacy</h2>
        <p className="text-sm text-zinc-400">
          Manage your account security, data exports, and privacy settings
        </p>
      </div>

      {/* Security Overview */}
      <div className="p-6 bg-zinc-800/30 rounded-xl border border-zinc-700">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-1">Security Status</h3>
            <p className="text-sm text-zinc-400">Your account security is in good shape</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-zinc-900/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-xs text-zinc-400">Email Verified</span>
            </div>
          </div>
          <div className="p-3 bg-zinc-900/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              {twoFactorEnabled ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-zinc-400">2FA Enabled</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-zinc-400">2FA Disabled</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Management */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Key className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-1">Password & Authentication</h3>
            <p className="text-sm text-zinc-400 mb-3">
              Secure your account with a strong password and two-factor authentication
            </p>
            {lastPasswordChange && (
              <p className="text-xs text-zinc-500 mb-3">
                Last changed: {new Date(lastPasswordChange).toLocaleDateString()}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" disabled>
                Change Password (Coming Soon)
              </Button>
              <Button variant="ghost" size="sm" disabled>
                Enable 2FA (Coming Soon)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-1">Active Sessions</h3>
            <p className="text-sm text-zinc-400 mb-3">
              Monitor and manage devices where you're signed in
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-zinc-700 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Current Session</p>
                      <p className="text-xs text-zinc-500">Your current browser</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">Active</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="mt-2" disabled>
              View All Sessions (Coming Soon)
            </Button>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-1">Export Your Data</h3>
            <p className="text-sm text-zinc-400 mb-3">
              Download a complete copy of your data including:
            </p>
            <ul className="text-sm text-zinc-400 space-y-1 mb-4 ml-2">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                All projects and coloring pages
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                Hero reference sheets and library
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                Account settings and preferences
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                Billing and transaction history
              </li>
            </ul>
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
              {isExporting ? 'Preparing Export...' : 'Export All Data'}
            </Button>
            <p className="text-xs text-zinc-500 mt-2">
              You'll receive an email with a download link within a few minutes
            </p>
          </div>
        </div>
      </div>

      {/* Connected Apps (Future) */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div>
          <h3 className="text-base font-semibold text-white mb-1">Connected Apps & Services</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Manage third-party integrations and API access
          </p>
          <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
            <p className="text-sm text-zinc-500 text-center">No connected apps yet</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="p-6 bg-red-950/10 border border-red-900/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-3 flex-1">
              <div>
                <h3 className="text-base font-semibold text-red-400 mb-1">Delete Account</h3>
                <p className="text-sm text-zinc-400">
                  Permanently delete your account and all data. This action is irreversible.
                </p>
              </div>
              <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3">
                <p className="text-xs text-zinc-400 mb-2">What gets deleted:</p>
                <ul className="text-xs text-zinc-500 space-y-1">
                  <li>• All projects, pages, and exports</li>
                  <li>• Hero library and reference sheets</li>
                  <li>• Subscription will be cancelled</li>
                  <li>• Account settings and preferences</li>
                </ul>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Account Permanently"
        className="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-950/30 border border-red-900/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-300 font-semibold mb-2">
                  This action cannot be undone
                </p>
                <p className="text-sm text-zinc-400">
                  Your account and all associated data will be permanently deleted. You will lose access to:
                </p>
                <ul className="text-sm text-zinc-400 mt-2 space-y-1">
                  <li>• All {/*project count*/} projects and pages</li>
                  <li>• Your hero library</li>
                  <li>• Remaining Blots balance</li>
                  <li>• Export history</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-zinc-300">
              Type <span className="font-mono text-red-400 font-semibold">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              autoFocus
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
