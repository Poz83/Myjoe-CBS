'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-zinc-900 group-[.toaster]:text-white group-[.toaster]:border-zinc-800 group-[.toaster]:rounded-lg',
          description: 'group-[.toast]:text-zinc-400',
          actionButton:
            'group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:hover:bg-blue-500',
          cancelButton:
            'group-[.toast]:bg-zinc-700 group-[.toast]:text-white group-[.toast]:hover:bg-zinc-600',
          success:
            'group-[.toaster]:bg-zinc-900 group-[.toaster]:border-green-500/50',
          error:
            'group-[.toaster]:bg-zinc-900 group-[.toaster]:border-red-500/50',
          info: 'group-[.toaster]:bg-zinc-900 group-[.toaster]:border-blue-500/50',
        },
      }}
    />
  );
}

export { toast } from 'sonner';
