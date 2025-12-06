
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, PenTool, Target, Sparkles, Users, ChevronRight,
  ChevronLeft, Check, Wand2, Upload, FileText, Coffee, Zap,
  Moon, Sun, Clock, Calendar, Star, Heart, Award, Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

const genres = [
  { id: 'fantasy', label: 'Fantasy', emoji: '🐉', color: 'from-purple-500 to-indigo-600' },
  { id: 'scifi', label: 'Science Fiction', emoji: '🚀', color: 'from-blue-500 to-cyan-600' },
  { id: 'romance', label: 'Romance', emoji: '💕', color: 'from-pink-500 to-rose-600' },
  { id: 'mystery', label: 'Mystery/Thriller', emoji: '🔍', color: 'from-slate-600 to-slate-800' },
  { id: 'literary', label: 'Literary Fiction', emoji: '📚', color: 'from-amber-500 to-orange-600' },
  { id: 'horror', label: 'Horror', emoji: '👻', color: 'from-red-600 to-red-900' },
  { id: 'nonfiction', label: 'Non-Fiction', emoji: '📖', color: 'from-emerald-500 to-teal-600' },
  { id: 'memoir', label: 'Memoir', emoji: '✍️', color: 'from-violet-500 to-purple-600' },
  { id: 'children', label: "Children's", emoji: '🌈', color: 'from-yellow-400 to-orange-500' },
  { id: 'ya', label: 'Young Adult', emoji: '⭐', color: 'from-indigo-500 to-blue-600' },
];

const experienceLevels = [
  { id: 'beginner', label: 'Just Starting', description: "I've never written a book before", icon: '🌱' },
  { id: 'dabbler', label: 'Dabbled Before', description: "I've started books but haven't finished", icon: '🌿' },
  { id: 'finisher', label: 'Finished One', description: "I've completed at least one book", icon: '🌳' },
  { id: 'published', label: 'Published Author', description: "I've published books before", icon: '🏆' },
];

const writingGoals = [
  { id: 'hobby', label: 'For Fun', description: 'Writing as a hobby', icon: Heart },
  { id: 'publish', label: 'To Publish', description: 'Get traditionally published', icon: Award },
  { id: 'selfpublish', label: 'Self-Publish', description: 'Indie publish on Amazon/etc', icon: Rocket },
  { id: 'income', label: 'Build Income', description: 'Create a writing business', icon: Star },
];

const dailyGoals = [
  { id: '250', label: '250 words', description: '~15 minutes', icon: Coffee },
  { id: '500', label: '500 words', description: '~30 minutes', icon: Clock },
  { id: '1000', label: '1,000 words', description: '~1 hour', icon: Target },
  { id: '2000', label: '2,000 words', description: '~2 hours', icon: Zap },
];

const writingTimes = [
  { id: 'morning', label: 'Morning', description: 'Early bird', icon: Sun },
  { id: 'afternoon', label: 'Afternoon', description: 'Midday writer', icon: Coffee },
  { id: 'evening', label: 'Evening', description: 'Night owl', icon: Moon },
  { id: 'whenever', label: 'Whenever', description: 'Flexible schedule', icon: Calendar },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({
    name: '',
    genres: [] as string[],
    experience: '',
    goal: '',
    dailyGoal: '500',
    writingTime: 'whenever',
    aiFeatures: true,
    currentProject: '',
  });

  const steps = [
    { id: 'welcome', title: 'Welcome' },
    { id: 'genres', title: 'Your Genres' },
    { id: 'experience', title: 'Experience' },
    { id: 'goals', title: 'Goals' },
    { id: 'schedule', title: 'Schedule' },
    { id: 'project', title: 'First Project' },
    { id: 'complete', title: 'All Set!' },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else router.push('/books');
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const toggleGenre = (genreId: string) => {
    setSelections(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(g => g !== genreId)
        : [...prev.genres, genreId],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return selections.name.length > 0;
      case 1: return selections.genres.length > 0;
      case 2: return selections.experience.length > 0;
      case 3: return selections.goal.length > 0;
      case 4: return true;
      case 5: return true;
      default: return true;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-slate-500">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{steps[step].title}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">Welcome to BookFactory AI</h1>
              <p className="mb-8 text-slate-500">Let's set up your writing workspace. First, what should we call you?</p>
              <input
                type="text"
                placeholder="Your name or pen name"
                value={selections.name}
                onChange={(e) => setSelections(prev => ({ ...prev, name: e.target.value }))}
                className="mx-auto block w-full max-w-sm rounded-xl border border-slate-200 px-4 py-3 text-center text-lg outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800"
                autoFocus
              />
            </div>
          )}

          {/* Step 1: Genres */}
          {step === 1 && (
            <div>
              <h2 className="mb-2 text-center text-2xl font-bold text-slate-900 dark:text-white">What do you write, {selections.name}?</h2>
              <p className="mb-6 text-center text-slate-500">Select all genres that interest you</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={cn(
                      'rounded-xl border-2 p-4 text-left transition-all',
                      selections.genres.includes(genre.id)
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                    )}
                  >
                    <span className="text-2xl">{genre.emoji}</span>
                    <p className="mt-1 font-medium text-slate-900 dark:text-white">{genre.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {step === 2 && (
            <div>
              <h2 className="mb-2 text-center text-2xl font-bold text-slate-900 dark:text-white">Your Writing Experience</h2>
              <p className="mb-6 text-center text-slate-500">This helps us personalize your experience</p>
              <div className="space-y-3">
                {experienceLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelections(prev => ({ ...prev, experience: level.id }))}
                    className={cn(
                      'flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all',
                      selections.experience === level.id
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                    )}
                  >
                    <span className="text-3xl">{level.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{level.label}</p>
                      <p className="text-sm text-slate-500">{level.description}</p>
                    </div>
                    {selections.experience === level.id && <Check className="ml-auto h-5 w-5 text-violet-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div>
              <h2 className="mb-2 text-center text-2xl font-bold text-slate-900 dark:text-white">What's Your Goal?</h2>
              <p className="mb-6 text-center text-slate-500">We'll tailor features to help you succeed</p>
              <div className="grid grid-cols-2 gap-3">
                {writingGoals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelections(prev => ({ ...prev, goal: goal.id }))}
                    className={cn(
                      'rounded-xl border-2 p-4 text-center transition-all',
                      selections.goal === goal.id
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                    )}
                  >
                    <goal.icon className={cn('mx-auto mb-2 h-8 w-8', selections.goal === goal.id ? 'text-violet-600' : 'text-slate-400')} />
                    <p className="font-semibold text-slate-900 dark:text-white">{goal.label}</p>
                    <p className="text-xs text-slate-500">{goal.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Schedule */}
          {step === 4 && (
            <div>
              <h2 className="mb-2 text-center text-2xl font-bold text-slate-900 dark:text-white">Set Your Writing Rhythm</h2>
              <p className="mb-6 text-center text-slate-500">Build a sustainable writing habit</p>
              
              <div className="mb-6">
                <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Daily word count goal:</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {dailyGoals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => setSelections(prev => ({ ...prev, dailyGoal: goal.id }))}
                      className={cn(
                        'rounded-xl border-2 p-3 text-center transition-all',
                        selections.dailyGoal === goal.id
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                      )}
                    >
                      <goal.icon className={cn('mx-auto mb-1 h-5 w-5', selections.dailyGoal === goal.id ? 'text-violet-600' : 'text-slate-400')} />
                      <p className="font-medium text-slate-900 dark:text-white">{goal.label}</p>
                      <p className="text-xs text-slate-500">{goal.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Best time to write:</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {writingTimes.map((time) => (
                    <button
                      key={time.id}
                      onClick={() => setSelections(prev => ({ ...prev, writingTime: time.id }))}
                      className={cn(
                        'rounded-xl border-2 p-3 text-center transition-all',
                        selections.writingTime === time.id
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                      )}
                    >
                      <time.icon className={cn('mx-auto mb-1 h-5 w-5', selections.writingTime === time.id ? 'text-violet-600' : 'text-slate-400')} />
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{time.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: First Project */}
          {step === 5 && (
            <div>
              <h2 className="mb-2 text-center text-2xl font-bold text-slate-900 dark:text-white">Ready to Start?</h2>
              <p className="mb-6 text-center text-slate-500">Choose how you'd like to begin</p>
              <div className="space-y-3">
                {[
                  { id: 'new', label: 'Start a New Book', description: 'Begin with a blank canvas or template', icon: PenTool },
                  { id: 'import', label: 'Import Existing Work', description: 'Upload a manuscript in progress', icon: Upload },
                  { id: 'ai', label: 'AI-Assisted Creation', description: 'Let AI help you develop your idea', icon: Sparkles },
                  { id: 'explore', label: 'Explore First', description: 'Look around before starting', icon: BookOpen },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelections(prev => ({ ...prev, currentProject: option.id }))}
                    className={cn(
                      'flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all',
                      selections.currentProject === option.id
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                    )}
                  >
                    <div className={cn('rounded-lg p-2', selections.currentProject === option.id ? 'bg-violet-100' : 'bg-slate-100')}>
                      <option.icon className={cn('h-6 w-6', selections.currentProject === option.id ? 'text-violet-600' : 'text-slate-500')} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{option.label}</p>
                      <p className="text-sm text-slate-500">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Complete */}
          {step === 6 && (
            <div className="py-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600"
              >
                <Check className="h-12 w-12 text-white" />
              </motion.div>
              <h2 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">You're All Set, {selections.name}!</h2>
              <p className="mb-8 text-slate-500">Your writing workspace is ready. Let's create something amazing.</p>
              <div className="rounded-xl bg-violet-50 p-4 dark:bg-violet-950/30">
                <p className="text-sm text-violet-700 dark:text-violet-400">
                  <strong>Your goal:</strong> {selections.dailyGoal} words per day • <strong>Genres:</strong> {selections.genres.map(g => genres.find(x => x.id === g)?.label).join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-slate-500 hover:bg-slate-100 disabled:invisible"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 font-medium text-white shadow-lg disabled:opacity-50"
            >
              {step === steps.length - 1 ? 'Get Started' : 'Continue'} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
