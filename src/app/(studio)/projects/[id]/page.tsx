'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useProject } from '@/hooks/use-projects';
import { useProfile } from '@/hooks/use-profile';
import { useUser } from '@/hooks/use-user';
import { ProjectHeader } from '@/components/features/project/project-header';
import { PageThumbnails } from '@/components/features/project/page-thumbnails';
import { PagePreview } from '@/components/features/project/page-preview';
import { PageInspector } from '@/components/features/project/page-inspector';
import {
  StyleCalibrationModal,
  CalibrationBanner,
  StyleReadyBadge
} from '@/components/features/project/style-calibration';
import { GenerationStart } from '@/components/features/project/generation-start';
import { GenerationProgress } from '@/components/features/project/generation-progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProjectEditorPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  
  const { user } = useUser();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { profile } = useProfile(user?.id);

  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [calibrationModalOpen, setCalibrationModalOpen] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Check if project needs calibration
  const needsCalibration = project && !project.style_anchor_key;

  // Check if project needs generation (calibrated but no pages generated yet)
  const needsGeneration = project &&
    project.style_anchor_key &&
    project.status === 'draft';

  // Check if generation is in progress
  const isGenerating = project?.status === 'generating' || !!activeJobId;

  // Auto-select first page when project loads
  useEffect(() => {
    if (project?.pages && project.pages.length > 0 && !selectedPageId) {
      setSelectedPageId(project.pages[0].id);
    }
  }, [project, selectedPageId]);

  // Get the currently selected page
  const selectedPage = project?.pages?.find((p) => p.id === selectedPageId) || null;

  // Loading state
  if (projectLoading) {
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

  // Calculate grid template columns based on collapse states
  const getGridColumns = () => {
    if (leftPanelCollapsed && rightPanelCollapsed) {
      return '0px 1fr 0px';
    } else if (leftPanelCollapsed) {
      return '0px 1fr 360px';
    } else if (rightPanelCollapsed) {
      return '300px 1fr 0px';
    }
    return '300px 1fr 360px';
  };

  // Handle calibration completion
  const handleCalibrationComplete = () => {
    setCalibrationModalOpen(false);
    // Refresh project data to get updated style_anchor_key
    queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
  };

  // Handle generation started
  const handleGenerationStarted = (jobId: string) => {
    setActiveJobId(jobId);
  };

  // Handle generation complete
  const handleGenerationComplete = () => {
    setActiveJobId(null);
    // Refresh project data to get new pages
    queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
  };

  // Handle generation cancelled
  const handleGenerationCancel = () => {
    setActiveJobId(null);
    // Refresh project data
    queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <ProjectHeader
        projectId={project.id}
        projectName={project.name}
        status={project.status}
        blotBalance={profile?.blots || 0}
        styleReady={!needsCalibration}
        onNameChange={(name) => {
          // TODO: Implement name update mutation
          console.log('Update project name:', name);
        }}
        onExport={() => {
          // TODO: Implement export functionality
          console.log('Export project');
        }}
      />

      {/* Calibration Banner - show if not calibrated */}
      {needsCalibration && (
        <div className="px-4 py-3 border-b border-zinc-800">
          <CalibrationBanner
            blotBalance={profile?.blots || 0}
            onClick={() => setCalibrationModalOpen(true)}
          />
        </div>
      )}

      {/* 3-Column Grid Layout */}
      <div
        className="flex-1 overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: getGridColumns(),
          transition: 'grid-template-columns 0.2s ease-in-out',
        }}
      >
        {/* Left Panel - Page Thumbnails */}
        <div className={cn('relative overflow-hidden', leftPanelCollapsed && 'w-0')}>
          <PageThumbnails
            pages={project.pages || []}
            selectedPageId={selectedPageId}
            onSelectPage={setSelectedPageId}
            onGeneratePages={() => {
              // TODO: Implement page generation
              console.log('Generate pages');
            }}
            isLoading={projectLoading}
          />

          {/* Collapse Toggle */}
          <button
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            className="absolute top-1/2 -translate-y-1/2 -right-3 z-10 w-6 h-12 bg-zinc-800 border border-zinc-700 rounded-r flex items-center justify-center hover:bg-zinc-700 transition-colors"
          >
            {leftPanelCollapsed ? (
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-zinc-400" />
            )}
          </button>
        </div>

        {/* Center Panel - Page Preview */}
        <div className="overflow-hidden min-w-[400px]">
          <PagePreview
            page={selectedPage}
            onGeneratePages={() => {
              // TODO: Implement page generation
              console.log('Generate pages');
            }}
          />
        </div>

        {/* Right Panel - Inspector or Generation Start */}
        <div className={cn('relative overflow-hidden', rightPanelCollapsed && 'w-0')}>
          {needsGeneration ? (
            <GenerationStart
              project={project}
              onStarted={handleGenerationStarted}
            />
          ) : (
            <PageInspector
              page={selectedPage}
              onRegenerate={() => {
                // TODO: Implement regenerate
                console.log('Regenerate page');
              }}
              onEdit={() => {
                // TODO: Implement edit
                console.log('Edit page');
              }}
              onSimplify={() => {
                // TODO: Implement simplify
                console.log('Simplify page');
              }}
            />
          )}

          {/* Collapse Toggle */}
          <button
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            className="absolute top-1/2 -translate-y-1/2 -left-3 z-10 w-6 h-12 bg-zinc-800 border border-zinc-700 rounded-l flex items-center justify-center hover:bg-zinc-700 transition-colors"
          >
            {rightPanelCollapsed ? (
              <ChevronLeft className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            )}
          </button>
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
    </div>
  );
}
