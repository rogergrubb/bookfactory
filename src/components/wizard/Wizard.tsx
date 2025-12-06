'use client';

import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

// Wizard Context
interface WizardContextType {
  currentStep: number;
  totalSteps: number;
  data: Record<string, unknown>;
  setData: (key: string, value: unknown) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  canProceed: boolean;
  setCanProceed: (can: boolean) => void;
}

const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a Wizard component');
  }
  return context;
}

// Main Wizard Component
interface WizardProps {
  children: React.ReactNode;
  onComplete?: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
  title: string;
  description?: string;
}

export function Wizard({ children, onComplete, onCancel, title, description }: WizardProps) {
  const steps = React.Children.toArray(children);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setDataState] = useState<Record<string, unknown>>({});
  const [canProceed, setCanProceed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setData = (key: string, value: unknown) => {
    setDataState(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setCanProceed(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };

  const handleComplete = async () => {
    if (onComplete) {
      setIsSubmitting(true);
      try {
        await onComplete(data);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const contextValue: WizardContextType = {
    currentStep,
    totalSteps: steps.length,
    data,
    setData,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    canProceed,
    setCanProceed,
  };

  return (
    <WizardContext.Provider value={contextValue}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
              {description && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
              )}
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Progress Steps */}
          <div className="mt-6">
            <WizardProgress steps={steps} currentStep={currentStep} onStepClick={goToStep} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {steps[currentStep]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={cn(currentStep === 0 && 'invisible')}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="text-sm text-slate-500">
              Step {currentStep + 1} of {steps.length}
            </div>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleComplete}
                disabled={!canProceed || isSubmitting}
                loading={isSubmitting}
              >
                Complete
                <Check className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed}
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </WizardContext.Provider>
  );
}

// Wizard Step Component
interface WizardStepProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  helpText?: string;
  helpUrl?: string;
}

export function WizardStep({ 
  title, 
  description, 
  icon: Icon,
  children,
  helpText,
  helpUrl
}: WizardStepProps) {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Step Header */}
      <div className="mb-6 text-center">
        {Icon && (
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30">
            <Icon className="h-8 w-8 text-violet-600 dark:text-violet-400" />
          </div>
        )}
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h2>
        {description && (
          <p className="mt-2 text-slate-500 dark:text-slate-400">{description}</p>
        )}
        {helpText && (
          <Tooltip content={helpText}>
            <button className="mt-2 inline-flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400">
              <HelpCircle className="h-4 w-4" />
              Need help?
            </button>
          </Tooltip>
        )}
      </div>

      {/* Step Content */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {children}
      </div>

      {/* Help Link */}
      {helpUrl && (
        <div className="mt-4 text-center">
          <a
            href={helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
          >
            Learn more about this step →
          </a>
        </div>
      )}
    </div>
  );
}

// Progress Indicator
interface WizardProgressProps {
  steps: React.ReactNode[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

function WizardProgress({ steps, currentStep, onStepClick }: WizardProgressProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const stepElement = step as React.ReactElement<WizardStepProps>;
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && index <= currentStep;

        return (
          <React.Fragment key={index}>
            {/* Step Circle */}
            <button
              onClick={() => isClickable && onStepClick?.(index)}
              disabled={!isClickable}
              className={cn(
                'flex items-center gap-3 transition-all',
                isClickable ? 'cursor-pointer' : 'cursor-default'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all',
                  isCompleted && 'border-violet-600 bg-violet-600 text-white',
                  isCurrent && 'border-violet-600 bg-violet-50 text-violet-600 dark:bg-violet-950/50',
                  !isCompleted && !isCurrent && 'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="hidden text-left sm:block">
                <p className={cn(
                  'text-sm font-medium',
                  (isCompleted || isCurrent) ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                )}>
                  {stepElement.props.title}
                </p>
              </div>
            </button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div
                  className={cn(
                    'h-0.5 w-full rounded-full transition-colors',
                    index < currentStep ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Form Field with Help
interface WizardFieldProps {
  label: string;
  helpText?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export function WizardField({ label, helpText, required, error, children }: WizardFieldProps) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {helpText && (
          <Tooltip content={helpText}>
            <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600" />
          </Tooltip>
        )}
      </div>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

// Selection Card for Wizard Options
interface WizardOptionProps {
  value: string;
  title: string;
  description?: string;
  icon?: React.ElementType;
  selected?: boolean;
  onSelect?: (value: string) => void;
  disabled?: boolean;
}

export function WizardOption({
  value,
  title,
  description,
  icon: Icon,
  selected,
  onSelect,
  disabled
}: WizardOptionProps) {
  return (
    <button
      onClick={() => onSelect?.(value)}
      disabled={disabled}
      className={cn(
        'flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-all',
        selected
          ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/30'
          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      {Icon && (
        <div className={cn(
          'rounded-lg p-2',
          selected
            ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400'
            : 'bg-slate-100 text-slate-400 dark:bg-slate-700'
        )}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1">
        <p className={cn(
          'font-medium',
          selected ? 'text-violet-900 dark:text-violet-300' : 'text-slate-900 dark:text-white'
        )}>
          {title}
        </p>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      <div className={cn(
        'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all',
        selected
          ? 'border-violet-600 bg-violet-600'
          : 'border-slate-300 dark:border-slate-600'
      )}>
        {selected && <Check className="h-3 w-3 text-white" />}
      </div>
    </button>
  );
}

// Loading State for Wizard Actions
export function WizardLoading({ message = 'Processing...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
      <p className="mt-4 text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  );
}

// Success State
export function WizardSuccess({ 
  title, 
  description, 
  action,
  actionHref
}: { 
  title: string;
  description?: string;
  action?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-2 text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && actionHref && (
        <a
          href={actionHref}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
        >
          {action}
          <ChevronRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

export default Wizard;
