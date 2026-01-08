'use client';

import { useLayoutStore } from '@/stores/layout-store';
import { ChevronLeft, ChevronRight, Settings, Layers, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionHeader,
} from '@/components/ui/accordion';

export function Inspector() {
  const { inspectorCollapsed, toggleInspector } = useLayoutStore();

  if (inspectorCollapsed) {
    return (
      <aside className="relative bg-zinc-900 border-l border-zinc-800" aria-label="Inspector panel (collapsed)">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleInspector}
          className="absolute top-4 -left-3 z-10 h-6 w-6 rounded-full bg-zinc-800 hover:bg-zinc-700"
          aria-label="Expand inspector panel"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div className="w-12 h-full flex flex-col items-center pt-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleInspector}
            className="hover:bg-zinc-800"
            aria-label="Open inspector settings"
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="relative w-[360px] bg-zinc-900 border-l border-zinc-800 flex flex-col h-full" aria-label="Inspector panel">
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleInspector}
        className="absolute top-4 -left-3 z-10 h-6 w-6 rounded-full bg-zinc-800 hover:bg-zinc-700"
        aria-label="Collapse inspector panel"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>

      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-white">Inspector</h2>
      </div>

      {/* Scrollable accordion content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Accordion defaultValue="properties">
          <AccordionItem value="properties">
            <AccordionHeader className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Properties
              </div>
            </AccordionHeader>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                <div>
                  <label htmlFor="element-name" className="text-xs text-zinc-400 block mb-1">Name</label>
                  <input
                    id="element-name"
                    type="text"
                    placeholder="Element name"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="element-id" className="text-xs text-zinc-400 block mb-1">ID</label>
                  <input
                    id="element-id"
                    type="text"
                    placeholder="element-id"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="layout">
            <AccordionHeader className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Layout
              </div>
            </AccordionHeader>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                <div>
                  <label htmlFor="layout-display" className="text-xs text-zinc-400 block mb-1">Display</label>
                  <select id="layout-display" className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-purple-500">
                    <option>Block</option>
                    <option>Flex</option>
                    <option>Grid</option>
                    <option>Inline</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="layout-width" className="text-xs text-zinc-400 block mb-1">Width</label>
                    <input
                      id="layout-width"
                      type="text"
                      placeholder="auto"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="layout-height" className="text-xs text-zinc-400 block mb-1">Height</label>
                    <input
                      id="layout-height"
                      type="text"
                      placeholder="auto"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="style">
            <AccordionHeader className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Style
              </div>
            </AccordionHeader>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                <div>
                  <label htmlFor="style-bg-color" className="text-xs text-zinc-400 block mb-1">Background</label>
                  <div className="flex gap-2">
                    <input
                      id="style-bg-color"
                      type="color"
                      defaultValue="#000000"
                      className="w-10 h-10 rounded border border-zinc-700 cursor-pointer"
                      aria-label="Background color picker"
                    />
                    <input
                      id="style-bg-hex"
                      type="text"
                      defaultValue="#000000"
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-purple-500"
                      aria-label="Background color hex value"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="style-opacity" className="text-xs text-zinc-400 block mb-1">Opacity</label>
                  <input
                    id="style-opacity"
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="100"
                    className="w-full"
                    aria-label="Element opacity (0-100%)"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </aside>
  );
}
