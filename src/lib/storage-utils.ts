import { toast } from 'sonner';

interface StorageQuotaCheck {
  hasSpace: boolean;
  used: number;
  limit: number;
  available: number;
  percentUsed: number;
}

/**
 * Check if user has enough storage space for an upload
 * 
 * @param storageUsed - Current storage used in bytes
 * @param storageLimit - Storage limit in bytes
 * @param fileSize - Size of file to upload in bytes
 * @returns Storage quota check result
 */
export function checkStorageQuota(
  storageUsed: number,
  storageLimit: number,
  fileSize: number
): StorageQuotaCheck {
  const available = storageLimit - storageUsed;
  const percentUsed = (storageUsed / storageLimit) * 100;
  const hasSpace = fileSize <= available;

  return {
    hasSpace,
    used: storageUsed,
    limit: storageLimit,
    available,
    percentUsed,
  };
}

/**
 * Show appropriate storage warning/error toasts
 * 
 * @param check - Storage quota check result
 * @param onUpgrade - Callback to open upgrade modal
 * @returns true if upload should proceed, false if blocked
 */
export function handleStorageCheck(
  check: StorageQuotaCheck,
  onUpgrade?: () => void
): boolean {
  if (!check.hasSpace) {
    toast.error("You're running low on storage space. Upgrade your plan to get more room.", {
      action: onUpgrade ? {
        label: 'Upgrade',
        onClick: onUpgrade,
      } : undefined,
    });
    return false;
  }

  // Warn if over 90% used
  if (check.percentUsed >= 90) {
    toast.warning(`Your storage is almost full (${check.percentUsed.toFixed(0)}% used)`);
  }

  return true;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  
  return `${value.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}
