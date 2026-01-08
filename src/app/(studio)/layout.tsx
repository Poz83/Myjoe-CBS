'use client';

import { StudioNavBar } from '@/components/layout/studio-nav-bar';
import { PageTransition } from '@/components/ui/page-transition';
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
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-warning-muted flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-warning" />
          </div>
          <h1 className="text-heading-xl text-text-primary">Desktop Required</h1>
          <p className="text-text-secondary">
            Myjoe Studio requires a minimum screen width of 1024px for the best experience. 
            Please use a larger screen or increase your browser window size.
          </p>
          <p className="text-sm text-text-muted">
            Current width: {windowWidth}px | Required: 1024px
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg-base overflow-hidden studio-layout">
      {/* Top Navigation Bar */}
      <StudioNavBar />

      {/* Main Layout: Content - account for 56px (h-14) nav bar */}
      <div className="flex-1 flex pt-14 overflow-hidden h-[calc(100vh-3.5rem)]">
        {/* Main Content Area (will contain 3-pane layout) */}
        <main className="flex-1 min-w-[400px] bg-bg-surface overflow-hidden h-full">
          <PageTransition className="h-full">
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
