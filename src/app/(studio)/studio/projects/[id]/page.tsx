'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useProject } from '@/hooks/use-projects';
import { useProfile } from '@/hooks/use-profile';
import { useUser } from '@/hooks/use-user';
import { useProjectSettings } from '@/hooks/use-project-settings';
import { ProjectSettingsPanel } from '@/components/features/project/project-settings-panel';
import { ThumbnailList } from '@/components/features/project/thumbnail-list';
import { ProjectToolbar } from '@/components/features/project/project-toolbar';
import { GenerationProgress } from '@/components/features/project/generation-progress';
import { CanvasControls } from '@/components/features/project/canvas-controls';
import { ExportDialog } from '@/components/features/export/export-dialog';
import { BillingModal } from '@/components/studio/billing-modal';
import { 
  Studio3Pane, 
  StudioSidebar, 
  StudioCanvas,
  StudioFloatingControls,
} from '@/components/layout/studio-layout';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { Audience } from '@/types/domain';

const VALID_AUDIENCES: readonly Audience[] = ['toddler', 'children', 'tween', 'teen', 'adult'];

function coerceAudience(input: unknown): Audience[] {
  const raw = Array.isArray(input) ? input : input ? [input] : [];
  const filtered = raw.filter((a): a is Audience => VALID_AUDIENCES.includes(a as Audience));
  return filtered.length ? filtered : ['children'];
}

export default function ProjectEditorPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  
  const { user } = useUser();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { profile } = useProfile(user?.id);
  const { settings, isLoading: settingsLoading } = useProjectSettings(projectId);

  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Canvas State
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Check if generation is in progress
  const isGeneratingStatus = project?.status === 'generating' || !!activeJobId || isGenerating;

  // Auto-select first page when project loads
  useEffect(() => {
    if (project?.pages && project.pages.length > 0 && !selectedPageId) {
      setSelectedPageId(project.pages[0].id);
    }
  }, [project, selectedPageId]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input is focused
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!project?.pages?.length) return;

      const currentIndex = project.pages.findIndex(p => p.id === selectedPageId);
      
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = Math.max(0, currentIndex - 1);
        setSelectedPageId(project.pages[prevIndex].id);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = Math.min(project.pages.length - 1, currentIndex + 1);
        setSelectedPageId(project.pages[nextIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project?.pages, selectedPageId]);

  // Loading state - using design tokens
  if (projectLoading || settingsLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-bg-base absolute inset-0 z-modal">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" variant="accent" />
          <p className="text-text-muted font-medium animate-pulse">Loading project...</p>
        </div>
      </div>
    );
  }

  // Error state - using design tokens
  if (!project) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-base">
        <EmptyState
          icon={Sparkles}
          title="Project not found"
          description="The project you're looking for doesn't exist or you don't have access to it."
          action={{
            label: 'Back to Dashboard',
            href: '/dashboard',
          }}
        />
      </div>
    );
  }

  // Default settings if not loaded yet
  const defaultSettings = {
    name: project.name,
    pageCount: project.page_count,
    trimSize: project.trim_size,
    stylePreset: project.style_preset,
    audience: coerceAudience((project as any).audience),
    lineThicknessPts: (project as any).line_thickness_pts ?? null,
    lineThicknessAuto: (project as any).line_thickness_auto ?? true,
    idea: project.description || '',
  };

  const currentSettings = settings || defaultSettings;

  // Handle generation
  const handleGenerate = async (idea: string) => {
    if (!idea.trim() || isGeneratingStatus) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          idea,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start generation');
      }

      const result = await response.json();
      setActiveJobId(result.jobId);
      
      // Refresh project data
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    } catch (error) {
      console.error('Generation error:', error);
      alert(error instanceof Error ? error.message : "Couldn't start creating pages");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle generation complete
  const handleGenerationComplete = () => {
    setActiveJobId(null);
    setIsGenerating(false);
    queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
  };

  // Handle generation cancelled
  const handleGenerationCancel = () => {
    setActiveJobId(null);
    setIsGenerating(false);
    queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
  };

  // Prepare thumbnails
  const thumbnailPages = (project.pages || [])
    .filter((page) => {
      // Show pages that have been generated or initialized
      return page.current_version > 0;
    })
    .map((page) => ({
      id: page.id,
      sortOrder: page.sort_order,
      imageUrl: null, // Will be resolved by getImageUrl
      isLoading: false,
    }));

  // Selected Page Preview Logic
  const selectedPage = project.pages?.find(p => p.id === selectedPageId);
  const selectedPageUrl = selectedPage ? `/api/r2/pages/${selectedPage.id}/current.png` : null;

  // Canvas Control Handlers
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));
  const handleResetZoom = () => setZoom(1);
  const handleFitScreen = () => {
    if (canvasRef.current) {
      // Logic to fit could be added here, for now reset to 1 (which fits by css max-h)
      setZoom(1); 
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-base overflow-hidden">
      {/* Top Toolbar */}
      <ProjectToolbar
        projectId={projectId}
        projectName={currentSettings.name}
        blotsBalance={profile?.blots || 0}
        onExport={() => setExportModalOpen(true)}
        onBilling={() => setBillingModalOpen(true)}
      />

      {/* Main Workspace - 3 Pane Layout */}
      <Studio3Pane className="flex-1">
        
        {/* Left Sidebar: Thumbnail List */}
        <StudioSidebar 
          side="left" 
          width={256} 
          isOpen={true}
          className="bg-bg-surface"
        >
          <ThumbnailList
            pages={thumbnailPages}
            selectedPageId={selectedPageId}
            onSelectPage={setSelectedPageId}
            getImageUrl={(page) => `/api/r2/pages/${page.id}/current.png`}
          />
        </StudioSidebar>

        {/* Center Canvas */}
        <StudioCanvas className="bg-bg-base" showGrid gridSize={24}>
          <div 
            ref={canvasRef}
            className="flex-1 flex items-center justify-center p-8 overflow-auto scrollbar-thin h-full"
          >
            {selectedPage ? (
              <div 
                className="relative transition-transform duration-slow ease-out"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              >
                <div className="relative shadow-lg bg-white aspect-[3/4] h-[calc(100vh-180px)] w-auto mx-auto ring-1 ring-border-subtle">
                  {/* Main Image */}
                  <Image
                    src={selectedPageUrl || ''}
                    alt={`Page ${selectedPage.sort_order + 1}`}
                    fill
                    className="object-contain"
                    priority
                    key={selectedPage.id}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 max-w-md mx-auto p-8 rounded-xl bg-bg-surface/50 border border-border-subtle backdrop-blur-sm">
                <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center mx-auto border border-border-subtle">
                  <Sparkles className="w-10 h-10 text-accent-cyan/50" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-heading-lg text-text-primary">Start Creating</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Select your style and audience on the right, describe your idea, and click Generate to create your first page.
                  </p>
                </div>
                <Button 
                  onClick={() => setSettingsPanelOpen(true)}
                  variant="secondary"
                >
                  Open Settings
                </Button>
              </div>
            )}
          </div>

          {/* Canvas Controls Overlay */}
          {selectedPage && (
            <StudioFloatingControls position="bottom-center">
              <CanvasControls
                zoom={zoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={handleResetZoom}
                onFitScreen={handleFitScreen}
              />
            </StudioFloatingControls>
          )}
        </StudioCanvas>

        {/* Right Sidebar: Settings Panel */}
        <StudioSidebar 
          side="right" 
          width={320} 
          isOpen={settingsPanelOpen}
          onToggle={() => setSettingsPanelOpen(!settingsPanelOpen)}
          toggleLabel={settingsPanelOpen ? "Collapse Settings" : "Open Settings"}
          className="bg-bg-surface"
        >
          <ProjectSettingsPanel
            projectId={projectId}
            initialSettings={currentSettings}
            onGenerate={handleGenerate}
            isGenerating={isGeneratingStatus}
          />
        </StudioSidebar>
      </Studio3Pane>

      {/* Generation Progress Overlay */}
      {activeJobId && (
        <GenerationProgress
          jobId={activeJobId}
          onComplete={handleGenerationComplete}
          onCancel={handleGenerationCancel}
        />
      )}

      {/* Dialogs */}
      <ExportDialog
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        projectId={projectId}
        projectName={project.name}
      />

      <BillingModal
        open={billingModalOpen}
        onOpenChange={setBillingModalOpen}
        currentBalance={profile?.blots || 0}
        plan={profile?.plan}
        hasStripeCustomer={!!profile?.stripe_customer_id}
      />
    </div>
  );
}
