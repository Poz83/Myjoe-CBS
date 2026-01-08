'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserMenu } from '@/components/features/auth/user-menu';
import { BlotDisplay } from '@/components/billing/blot-display';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
            <Image src="/myjoe-logo.png" alt="Myjoe" width={120} height={36} className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <BlotDisplay onClick={() => router.push('/dashboard/billing')} />
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="pt-16">{children}</main>
    </div>
  );
}
