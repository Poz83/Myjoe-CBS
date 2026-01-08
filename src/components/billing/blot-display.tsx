'use client';

import { useBalance } from '@/hooks/use-billing';
import { cn } from '@/lib/utils';

// Professional ink bottle icon component
function InkBottleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ink bottle body */}
      <path
        d="M8 4h8v12c0 1.1-.9 2-2 2H10c-1.1 0-2-.9-2-2V4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Bottle neck */}
      <path
        d="M10 2h4v2h-4V2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottle cap */}
      <path
        d="M9 2h6v1H9V2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ink level indicator */}
      <rect
        x="10.5"
        y="6"
        width="3"
        height="8"
        rx="0.5"
        fill="currentColor"
        fillOpacity="0.8"
      />
      {/* Drop of ink at bottom */}
      <ellipse
        cx="12"
        cy="15"
        rx="0.8"
        ry="1.2"
        fill="currentColor"
        fillOpacity="0.6"
      />
    </svg>
  );
}

interface BlotDisplayProps {
  onClick?: () => void;
  className?: string;
}

function getTextColor(blots: number): string {
  if (blots === 0) return 'text-red-400';
  if (blots < 50) return 'text-amber-400';
  return 'text-accent-cyan';
}

function formatRefreshTime(resetsAt: string | null): string {
  if (!resetsAt) return 'No reset scheduled';

  const resetDate = new Date(resetsAt);
  const now = new Date();
  const diffMs = resetDate.getTime() - now.getTime();

  if (diffMs <= 0) return 'Resets now';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `Resets in ${hours}h ${minutes}m`;
  } else {
    return `Resets in ${minutes}m`;
  }
}

export function BlotDisplay({ onClick, className }: BlotDisplayProps) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blot-display.tsx:94',message:'BlotDisplay mounted',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  const { data, isLoading } = useBalance();
  const blots = data?.blots ?? 0;
  const resetsAt = data?.resetsAt;

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/4b5f8db5-0ff7-4203-b2e4-06e25ade0057',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blot-display.tsx:99',message:'BlotDisplay data state',data:{blots,isLoading,hasData:!!data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  const textColor = getTextColor(blots);
  const iconColor = getTextColor(blots);

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 bg-bg-elevated rounded-md transition-all duration-200 border border-bg-surface',
          onClick && 'hover:bg-bg-surface hover:border-accent-cyan/20 cursor-pointer',
          !onClick && 'cursor-default',
          className
        )}
        role="status"
        aria-label={`Blot balance: ${blots.toLocaleString()} blots`}
      >
        <InkBottleIcon className={cn('h-4 w-4', iconColor)} aria-hidden="true" />
        {isLoading ? (
          <span className="text-sm font-medium text-zinc-400">...</span>
        ) : (
          <span className={cn('text-sm font-medium', textColor)}>
            {blots.toLocaleString()}
          </span>
        )}
      </button>

      {/* Tooltip for refresh time */}
      {resetsAt && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-bg-elevated border border-bg-surface rounded-md text-xs text-zinc-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
          {formatRefreshTime(resetsAt)}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-bg-elevated border-l border-t border-bg-surface rotate-45"></div>
        </div>
      )}
    </div>
  );
}
