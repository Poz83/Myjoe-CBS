'use client';

import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Inspector } from '@/components/layout/inspector';
import { useLayoutStore } from '@/stores/layout-store';
import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed, inspectorCollapsed, setInspectorCollapsed } = useLayoutStore();
  const [windowWidth, setWindowWidth] = useState(0);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      
      // Auto-collapse inspector on smaller screens
      if (window.innerWidth < 1280 && !inspectorCollapsed) {
        setInspectorCollapsed(true);
      }
    };

    // Set initial width
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [inspectorCollapsed, setInspectorCollapsed]);

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
      {/* Fixed Header */}
      <Header />

      {/* Main 3-column layout */}
      <div className="flex-1 flex pt-14 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="flex-shrink-0 h-full overflow-hidden">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-[400px] bg-[#171717] overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>

        {/* Right Inspector */}
        <aside className="flex-shrink-0 h-full overflow-hidden">
          <Inspector />
        </aside>
      </div>
    </div>
  );
}