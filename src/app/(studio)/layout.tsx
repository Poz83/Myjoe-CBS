'use client';

import { StudioNavBar } from '@/components/layout/studio-nav-bar';
import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [windowWidth, setWindowWidth] = useState(0);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show "Desktop required" message for screens smaller than 1024px
  if (windowWidth > 0 && windowWidth < 1024) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Desktop Required</h1>
          <p className="text-zinc-400">
            Myjoe Studio requires a minimum screen width of 1024px for the best experience. 
            Please use a larger screen or increase your browser window size.
          </p>
          <p className="text-sm text-zinc-500">
            Current width: {windowWidth}px | Required: 1024px
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0D0D0D] overflow-hidden">
      {/* Top Navigation Bar */}
      <StudioNavBar />

      {/* Main Layout: Content */}
      <div className="flex-1 flex pt-14 overflow-hidden">
        {/* Main Content Area (will contain settings panel + canvas) */}
        <main className="flex-1 min-w-[400px] bg-[#171717] overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}