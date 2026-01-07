'use client';

import { HeroCreator } from '@/components/features/hero/hero-creator';

export default function NewHeroPage() {
  return (
    <div className="h-full flex flex-col items-center justify-start p-8 overflow-auto">
      <div className="w-full max-w-[600px]">
        <HeroCreator />
      </div>
    </div>
  );
}
