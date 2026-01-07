'use client';

import { Code, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SettingsApi() {
  return (
    <div className="py-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800 mb-4">
        <Code className="w-8 h-8 text-zinc-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">API Access Coming Soon</h3>
      <p className="text-sm text-zinc-400 max-w-md mx-auto mb-8">
        Programmatic access to Myjoe&apos;s coloring book generation will be available in v1.1
      </p>

      {/* Mock UI (disabled) */}
      <div className="max-w-lg mx-auto text-left opacity-40 pointer-events-none">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">API Key</label>
            <div className="flex gap-2">
              <Input value="sk_live_••••••••••••••••" disabled className="flex-1" />
              <Button variant="secondary" size="icon" disabled>
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button disabled className="w-full">
            Generate New Key
          </Button>
        </div>
      </div>
    </div>
  );
}
