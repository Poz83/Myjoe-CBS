'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProject } from '@/hooks/use-projects';
import { StepBasics } from '@/components/features/project/wizard/step-basics';
import { StepAudience } from '@/components/features/project/wizard/step-audience';
import { StepStyle } from '@/components/features/project/wizard/step-style';
import { StepHero } from '@/components/features/project/wizard/step-hero';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Audience, StylePreset } from '@/types/domain';

interface WizardFormData {
  name: string;
  pageCount: number;
  audience: Audience | null;
  stylePreset: StylePreset | null;
  heroId: string | null;
}

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProject();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>({
    name: '',
    pageCount: 20,
    audience: null,
    stylePreset: null,
    heroId: null,
  });

  const totalSteps = 4;

  const updateFormData = (updates: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0 && formData.pageCount >= 1 && formData.pageCount <= 40;
      case 2:
        return formData.audience !== null;
      case 3:
        return formData.stylePreset !== null;
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed() || !formData.audience || !formData.stylePreset) {
      return;
    }

    try {
      const project = await createProject.mutateAsync({
        name: formData.name,
        pageCount: formData.pageCount,
        audience: [formData.audience],
        stylePreset: formData.stylePreset,
        heroId: formData.heroId,
      });

      router.push(`/studio/projects/${project.id}`);
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-start p-8 overflow-auto">
      <div className="w-full max-w-[600px] space-y-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const step = index + 1;
            const isActive = step === currentStep;
            const isCompleted = step < currentStep;

            return (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-blue-500 text-white'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {isCompleted ? '✓' : step}
                  </div>
                </div>
                {step < totalSteps && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-colors ${
                      isCompleted ? 'bg-blue-500' : 'bg-zinc-800'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8">
          {currentStep === 1 && (
            <StepBasics
              name={formData.name}
              pageCount={formData.pageCount}
              onUpdate={updateFormData}
            />
          )}
          {currentStep === 2 && (
            <StepAudience
              audience={formData.audience}
              onUpdate={updateFormData}
            />
          )}
          {currentStep === 3 && (
            <StepStyle
              stylePreset={formData.stylePreset}
              onUpdate={updateFormData}
            />
          )}
          {currentStep === 4 && (
            <StepHero
              heroId={formData.heroId}
              onUpdate={updateFormData}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!canProceed() || createProject.isPending}
              loading={createProject.isPending}
            >
              Create Project
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
