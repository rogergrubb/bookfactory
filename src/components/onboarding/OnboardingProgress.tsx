'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  ChevronRight, 
  BookOpen, 
  User, 
  PenTool, 
  Send,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  href: string;
}

const defaultSteps: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Set up your author profile',
    description: 'Add your bio, pen name, and social links',
    icon: User,
    completed: false,
    href: '/settings/profile',
  },
  {
    id: 'first-book',
    title: 'Create your first book',
    description: 'Start a new project or import an existing manuscript',
    icon: BookOpen,
    completed: false,
    href: '/books/new',
  },
  {
    id: 'write',
    title: 'Explore the writing editor',
    description: 'Try the distraction-free writing experience',
    icon: PenTool,
    completed: false,
    href: '/write',
  },
  {
    id: 'ai',
    title: 'Try AI writing assistance',
    description: 'Generate plot ideas, improve dialogue, and more',
    icon: Sparkles,
    completed: false,
    href: '/write?ai=true',
  },
  {
    id: 'publish',
    title: 'Learn about publishing',
    description: 'Discover export options and publishing platforms',
    icon: Send,
    completed: false,
    href: '/publish',
  },
];

interface OnboardingProgressProps {
  onDismiss?: () => void;
  steps?: OnboardingStep[];
}

export function OnboardingProgress({ 
  onDismiss,
  steps = defaultSteps 
}: OnboardingProgressProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-slate-200 bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 dark:border-slate-800 dark:from-violet-950/30 dark:via-indigo-950/30 dark:to-purple-950/30"
    >
      <div className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Welcome to BookFactory AI!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Complete these steps to get started • {completedCount}/{steps.length} done
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress Bar */}
            <div className="hidden items-center gap-3 md:flex">
              <div className="h-2 w-32 overflow-hidden rounded-full bg-white/50 dark:bg-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
                />
              </div>
              <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                {Math.round(progress)}%
              </span>
            </div>

            {/* Toggle/Dismiss */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/50 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
              >
                <ChevronRight className="h-5 w-5" />
              </motion.div>
            </button>
            <button
              onClick={onDismiss}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/50 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Steps */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid gap-3 md:grid-cols-5">
                {steps.map((step, index) => (
                  <a
                    key={step.id}
                    href={step.href}
                    className={cn(
                      'group relative rounded-xl border p-4 transition-all',
                      step.completed
                        ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                        : 'border-white/50 bg-white/50 hover:border-violet-200 hover:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-violet-700 dark:hover:bg-slate-800'
                    )}
                  >
                    {/* Step Number */}
                    <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-400">
                      {step.completed ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'rounded-lg p-2',
                        step.completed
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-400 group-hover:bg-violet-100 group-hover:text-violet-600 dark:bg-slate-700 dark:group-hover:bg-violet-900/50 dark:group-hover:text-violet-400'
                      )}>
                        <step.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          'text-sm font-medium truncate',
                          step.completed
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        )}>
                          {step.title}
                        </h4>
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-2 dark:text-slate-400">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Action indicator */}
                    {!step.completed && (
                      <div className="mt-3 flex items-center text-xs font-medium text-violet-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-violet-400">
                        Get started <ArrowRight className="ml-1 h-3 w-3" />
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Full onboarding modal for first-time users
interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const slides = [
    {
      title: 'Welcome to BookFactory AI',
      description: 'Your complete toolkit for writing, publishing, and marketing your books. Let\'s take a quick tour.',
      image: '/onboarding/welcome.svg',
    },
    {
      title: 'Write Without Distractions',
      description: 'Our distraction-free editor helps you focus on your story. AI assistance is always just a click away.',
      image: '/onboarding/write.svg',
    },
    {
      title: 'AI-Powered Assistance',
      description: 'Get help with plot development, character creation, dialogue, and more. Your AI writing partner is here.',
      image: '/onboarding/ai.svg',
    },
    {
      title: 'Publish Everywhere',
      description: 'Export to EPUB, PDF, DOCX and more. Publish directly to Amazon KDP, IngramSpark, and other platforms.',
      image: '/onboarding/publish.svg',
    },
    {
      title: 'Market Your Books',
      description: 'Generate social posts, email campaigns, and book descriptions with AI. Track sales across all platforms.',
      image: '/onboarding/market.svg',
    },
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Progress dots */}
          <div className="mb-6 flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  currentStep === index
                    ? 'w-8 bg-violet-600'
                    : 'w-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600'
                )}
              />
            ))}
          </div>

          {/* Slide content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              {/* Illustration placeholder */}
              <div className="mx-auto mb-6 h-48 w-48 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30" />
              
              <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                {slides[currentStep].title}
              </h2>
              <p className="mx-auto max-w-md text-slate-600 dark:text-slate-400">
                {slides[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-slate-200 px-8 py-4 dark:border-slate-800">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              currentStep === 0
                ? 'text-slate-300 dark:text-slate-600'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            )}
          >
            Back
          </button>

          <button
            onClick={() => {
              if (currentStep === slides.length - 1) {
                onClose();
              } else {
                setCurrentStep(currentStep + 1);
              }
            }}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
          >
            {currentStep === slides.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default OnboardingProgress;
