'use client';

import { useLayoutStore } from '@/stores/layout-store';
import { ChevronLeft, ChevronRight, FileText, Image, History } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useLayoutStore();
  const [activeTab, setActiveTab] = useState('pages');

  if (sidebarCollapsed) {
    return (
      <div className="relative bg-zinc-900 border-r border-zinc-800">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute top-4 -right-3 z-10 h-6 w-6 rounded-full bg-zinc-800 hover:bg-zinc-700"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="w-12 h-full flex flex-col items-center pt-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              toggleSidebar();
              setActiveTab('pages');
            }}
            className="hover:bg-zinc-800"
          >
            <FileText className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              toggleSidebar();
              setActiveTab('assets');
            }}
            className="hover:bg-zinc-800"
          >
            <Image className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              toggleSidebar();
              setActiveTab('history');
            }}
            className="hover:bg-zinc-800"
          >
            <History className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[300px] bg-zinc-900 border-r border-zinc-800 flex flex-col h-full">
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="absolute top-4 -right-3 z-10 h-6 w-6 rounded-full bg-zinc-800 hover:bg-zinc-700"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList className="w-full justify-start rounded-none border-b border-zinc-800 bg-transparent p-0">
          <TabsTrigger
            value="pages"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent"
          >
            <FileText className="h-4 w-4 mr-2" />
            Pages
          </TabsTrigger>
          <TabsTrigger
            value="assets"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent"
          >
            <Image className="h-4 w-4 mr-2" />
            Assets
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent"
          >
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="pages" className="p-4 mt-0">
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">No pages yet</p>
              <Button variant="outline" size="sm" className="w-full">
                Create Page
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="p-4 mt-0">
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">No assets yet</p>
              <Button variant="outline" size="sm" className="w-full">
                Upload Asset
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-4 mt-0">
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">No history yet</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
