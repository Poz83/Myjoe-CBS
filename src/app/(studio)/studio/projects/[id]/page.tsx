'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useProject } from '@/hooks/use-projects';
import { useProfile } from '@/hooks/use-profile';
import { useUser } from '@/hooks/use-user';
import { useProjectSettings } from '@/hooks/use-project-settings';
import { ProjectSettingsPanel } from '@/components/features/project/project-settings-panel';
import { ThumbnailGrid } from '@/components/features/project/thumbnail-grid';
import { PageInspector } from '@/components/features/project/page-inspector';
import {
  StyleCalibrationModal,
  CalibrationBanner,
} from '@/components/features/project/style-calibration';
import { GenerationProgress } from '@/components/features/project/generation-progress';
import { ExportDialog } from '@/components/features/export/export-dialog';
import { BillingModal } from '@/components/studio/billing-modal';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProjectEditorPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  
  const { user } = useUser();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { profile } = useProfile(user?.id);
  const { settings, isLoading: settingsLoading } = useProjectSettings(projectId);

  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [settingsPanelCollapsed, setSettingsPanelCollapsed] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [calibrationModalOpen, setCalibrationModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if project needs calibration
  const needsCalibration = project && !project.style_anchor_key;

  // Check if generation is in progress
  const isGeneratingStatus = project?.status === 'generating' || !!activeJobId || isGenerating;

  // Auto-select first page when project loads
  useEffect(() => {
    if (project?.pages && project.pages.length > 0 && !selectedPageId) {
      setSelectedPageId(project.pages[0].id);
    }
  }, [project, selectedPageId]);

  // Get the currently selected page
  const selectedPage = project?.pages?.find((p) => p.id === selectedPageId) || null;

  // Loading state
  if (projectLoading || settingsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-zinc-400">Loading project...</p>
      </div>
    );
  }

  // Error state
  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-red-400">Project not found</p>
      </div>
    );
  }

  // Default settings if not loaded yet
  const defaultSettings = {
    name: project.name,
    pageCount: project.page_count,
    trimSize: project.trim_size,
    stylePreset: project.style_preset,
    audience: project.audience,
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
      alert(error instanceof Error ? error.message : 'Failed to start generation');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle calibration completion
  const handleCalibrationComplete = () => {
    setCalibrationModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
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

  // Calculate grid template columns
  const getGridColumns = () => {
    if (settingsPanelCollapsed && inspectorCollapsed) {
      return '0px 1fr 0px';
    } else if (settingsPanelCollapsed) {
      return '0px 1fr 360px';
    } else if (inspectorCollapsed) {
      return '300px 1fr 0px';
    }
    return '300px 1fr 360px';
  };

  // Convert pages to thumbnail format
  const thumbnailPages = (project.pages || []).map((page) => ({
    id: page.id,
    sortOrder: page.sort_order,
    imageUrl: null,
    isLoading: false,
  }));

  return (
    <div className="h-full flex flex-col">
      {/* Calibration Banner - show if not calibrated */}
      {needsCalibration && (
        <div className="px-4 py-3 border-b border-zinc-800">
          <CalibrationBanner
            blotBalance={profile?.blots || 0}
            onClick={() => setCalibrationModalOpen(true)}
          />
        </div>
      )}

      {/* 3-Column Grid Layout: Settings Panel | Canvas | Inspector */}
      <div
        className="flex-1 overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: getGridColumns(),
          transition: 'grid-template-columns 0.2s ease-in-out',
        }}
      >
        {/* Left Panel - Project Settings */}
        <div className={cn('relative overflow-hidden', settingsPanelCollapsed && 'w-0')}>
          <ProjectSettingsPanel
            projectId={projectId}
            initialSettings={currentSettings}
            onGenerate={handleGenerate}
            isGenerating={isGeneratingStatus}
            disabled={needsCalibration}
          />

          {/* Collapse Toggle */}
          {!settingsPanelCollapsed && (
            <button
              onClick={() => setSettingsPanelCollapsed(true)}
              className="absolute top-1/2 -translate-y-1/2 -right-3 z-10 w-6 h-12 bg-zinc-800 border border-zinc-700 rounded-r flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>
          )}
        </div>

        {/* Center Panel - Thumbnail Grid */}
        <div className="overflow-hidden min-w-[400px] bg-[#171717]">
          {settingsPanelCollapsed && (
            <button
              onClick={() => setSettingsPanelCollapsed(false)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-12 bg-zinc-800 border border-zinc-700 rounded-r flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-zinc-400 rotate-180" />
            </button>
          )}
          <ThumbnailGrid
            pages={thumbnailPages}
            selectedPageId={selectedPageId}
            onSelectPage={setSelectedPageId}
            getImageUrl={(page) => `/api/r2/pages/${page.id}/current.png`}
            emptyMessage="Your canvas is ready"
          />
        </div>

        {/* Right Panel - Inspector */}
        <div className={cn('relative overflow-hidden', inspectorCollapsed && 'w-0')}>
          <PageInspector
            page={selectedPage}
            onRegenerate={() => {
              // TODO: Implement regenerate
            }}
            onEdit={() => {
              // TODO: Implement edit
            }}
            onSimplify={() => {
              // TODO: Implement simplify
            }}
          />

          {/* Collapse Toggle */}
          {!inspectorCollapsed && (
            <button
              onClick={() => setInspectorCollapsed(true)}
              className="absolute top-1/2 -translate-y-1/2 -left-3 z-10 w-6 h-12 bg-zinc-800 border border-zinc-700 rounded-l flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-zinc-400 rotate-180" />
            </button>
          )}
        </div>
      </div>

      {/* Style Calibration Modal */}
      <StyleCalibrationModal
        open={calibrationModalOpen}
        onOpenChange={setCalibrationModalOpen}
        projectId={projectId}
        blotBalance={profile?.blots || 0}
        onComplete={handleCalibrationComplete}
      />

      {/* Generation Progress Overlay */}
      {activeJobId && (
        <GenerationProgress
          jobId={activeJobId}
          onComplete={handleGenerationComplete}
          onCancel={handleGenerationCancel}
        />
      )}

      {/* Export Dialog */}
      <ExportDialog
        open={exportModalOpen}
        onOpenChange={(open) => {
          setExportModalOpen(open);
        }}
        projectId={projectId}
        projectName={project.name}
      />

      {/* Billing Modal */}
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
