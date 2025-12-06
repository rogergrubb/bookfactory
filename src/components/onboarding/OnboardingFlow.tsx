'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, PenTool, Target, Sparkles, ChevronRight, ChevronLeft,
  Check, User, Briefcase, Clock, Zap, Award, Users, Heart,
  Rocket, Star, Coffee, Sun, Moon, Feather
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingData {
  name: string;
  writingGoal: string;
  experience: string;
  genres: string[];
  weeklyTime: string;
  aiAssistance: string;
  firstProject: string;
}

const genres = [
  { id: 'fantasy', label: 'Fantasy', icon: '🐉' },
  { id: 'scifi', label: 'Science Fiction', icon: '🚀' },
  { id: 'romance', label: 'Romance', icon: '💕' },
  { id: 'mystery', label: 'Mystery', icon: '🔍' },
  { id: 'thriller', label: 'Thriller', icon: '😱' },
  { id: 'literary', label: 'Literary Fiction', icon: '📖' },
  { id: 'memoir', label: 'Memoir', icon: '📝' },
  { id: 'nonfiction', label: 'Non-Fiction', icon: '📚' },
  { id: 'children', label: "Children's", icon: '🧸' },
  { id: 'ya', label: 'Young Adult', icon: '🎒' },
  { id: 'horror', label: 'Horror', icon: '👻' },
  { id: 'historical', label: 'Historical', icon: '🏰' },
];

const writingGoals = [
  { id: 'hobby', label: 'Write for fun', description: 'Personal enjoyment and creativity', icon: Heart },
  { id: 'publish', label: 'Publish my first book', description: 'Get my story out into the world', icon: Rocket },
  { id: 'career', label: 'Build a writing career', description: 'Make writing my profession', icon: Briefcase },
  { id: 'series', label: 'Write a series', description: 'Create an epic multi-book saga', icon: BookOpen },
];

const experienceLevels = [
  { id: 'beginner', label: 'Just starting out', description: "I've never written a book before", icon: Feather },
  { id: 'intermediate', label: 'Some experience', description: "I've written but not published", icon: PenTool },
  { id: 'experienced', label: 'Published author', description: 'I have published books', icon: Award },
];

const weeklyTimeOptions = [
  { id: '1-5', label: '1-5 hours', icon: Coffee },
  { id: '5-10', label: '5-10 hours', icon: Sun },
  { id: '10-20', label: '10-20 hours', icon: Clock },
  { id: '20+', label: '20+ hours', icon: Zap },
];

const aiAssistanceOptions = [
  { id: 'minimal', label: 'Minimal', description: 'Just for brainstorming and stuck moments' },
  { id: 'moderate', label: 'Moderate', description: 'Help with writing and editing' },
  { id: 'extensive', label: 'Extensive', description: 'Full AI partnership throughout' },
];

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    writingGoal: '',
    experience: '',
    genres: [],
    weeklyTime: '',
    aiAssistance: '',
    firstProject: '',
  });

  const steps = [
    { id: 'welcome', title: 'Welcome' },
    { id: 'goal', title: 'Your Goal' },
    { id: 'experience', title: 'Experience' },
    { id: 'genres', title: 'Genres' },
    { id: 'time', title: 'Time' },
    { id: 'ai', title: 'AI Help' },
    { id: 'ready', title: 'Ready!' },
  ];

  const canProceed = () => {
    switch (step) {
      case 0: return data.name.length > 0;
      case 1: return data.writingGoal.length > 0;
      case 2: return data.experience.length > 0;
      case 3: return data.genres.length > 0;
      case 4: return data.weeklyTime.length > 0;
      case 5: return data.aiAssistance.length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const toggleGenre = (genreId: string) => {
    setData(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(g => g !== genreId)
        : [...prev.genres, genreId],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl px-4">
        {/* Progress */}
        <div className="mb-8 flex justify-center gap-2">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'h-2 w-12 rounded-full transition-all',
                i <= step ? 'bg-violet-500' : 'bg-white/20'
              )}
            />
          ))}
        </div>

        {/* Skip button */}
        <button
          onClick={onSkip}
          className="absolute right-4 top-0 text-sm text-white/60 hover:text-white"
        >
          Skip for now
        </button>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl bg-white/10 p-8 backdrop-blur-xl"
          >
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h1 className="mb-2 text-3xl font-bold text-white">Welcome to BookFactory AI</h1>
                <p className="mb-8 text-white/70">Let's personalize your experience. What should we call you?</p>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full max-w-xs rounded-xl border-0 bg-white/10 px-6 py-4 text-center text-lg text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-violet-500"
                  autoFocus
                />
              </div>
            )}

            {/* Step 1: Writing Goal */}
            {step === 1 && (
              <div>
                <h2 className="mb-2 text-center text-2xl font-bold text-white">What's your writing goal?</h2>
                <p className="mb-8 text-center text-white/70">We'll tailor features to help you succeed</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {writingGoals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => setData(prev => ({ ...prev, writingGoal: goal.id }))}
                      className={cn(
                        'flex items-center gap-4 rounded-xl p-4 text-left transition-all',
                        data.writingGoal === goal.id
                          ? 'bg-violet-600 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                    >
                      <goal.icon className="h-8 w-8" />
                      <div>
                        <p className="font-semibold">{goal.label}</p>
                        <p className="text-sm opacity-70">{goal.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Experience */}
            {step === 2 && (
              <div>
                <h2 className="mb-2 text-center text-2xl font-bold text-white">What's your experience level?</h2>
                <p className="mb-8 text-center text-white/70">No judgment - everyone starts somewhere!</p>
                <div className="space-y-3">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setData(prev => ({ ...prev, experience: level.id }))}
                      className={cn(
                        'flex w-full items-center gap-4 rounded-xl p-4 text-left transition-all',
                        data.experience === level.id
                          ? 'bg-violet-600 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                    >
                      <level.icon className="h-8 w-8" />
                      <div>
                        <p className="font-semibold">{level.label}</p>
                        <p className="text-sm opacity-70">{level.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Genres */}
            {step === 3 && (
              <div>
                <h2 className="mb-2 text-center text-2xl font-bold text-white">What genres interest you?</h2>
                <p className="mb-8 text-center text-white/70">Select all that apply</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {genres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => toggleGenre(genre.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl p-3 transition-all',
                        data.genres.includes(genre.id)
                          ? 'bg-violet-600 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                    >
                      <span className="text-2xl">{genre.icon}</span>
                      <span className="text-xs font-medium">{genre.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Time */}
            {step === 4 && (
              <div>
                <h2 className="mb-2 text-center text-2xl font-bold text-white">How much time can you dedicate weekly?</h2>
                <p className="mb-8 text-center text-white/70">We'll set realistic goals together</p>
                <div className="grid grid-cols-2 gap-3">
                  {weeklyTimeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setData(prev => ({ ...prev, weeklyTime: option.id }))}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl p-6 transition-all',
                        data.weeklyTime === option.id
                          ? 'bg-violet-600 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                    >
                      <option.icon className="h-8 w-8" />
                      <span className="font-semibold">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: AI Assistance */}
            {step === 5 && (
              <div>
                <h2 className="mb-2 text-center text-2xl font-bold text-white">How much AI help do you want?</h2>
                <p className="mb-8 text-center text-white/70">You can change this anytime</p>
                <div className="space-y-3">
                  {aiAssistanceOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setData(prev => ({ ...prev, aiAssistance: option.id }))}
                      className={cn(
                        'flex w-full items-center gap-4 rounded-xl p-4 text-left transition-all',
                        data.aiAssistance === option.id
                          ? 'bg-violet-600 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                    >
                      <div className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full',
                        data.aiAssistance === option.id ? 'bg-white/20' : 'bg-white/10'
                      )}>
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold">{option.label}</p>
                        <p className="text-sm opacity-70">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Ready */}
            {step === 6 && (
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                  <Check className="h-10 w-10 text-white" />
                </div>
                <h1 className="mb-2 text-3xl font-bold text-white">You're all set, {data.name}!</h1>
                <p className="mb-8 text-white/70">Your personalized workspace is ready. Let's start writing!</p>
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setData(prev => ({ ...prev, firstProject: 'new' }));
                      onComplete(data);
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 font-semibold text-white hover:shadow-lg"
                  >
                    <Rocket className="mr-2 inline h-5 w-5" /> Start a New Book
                  </button>
                  <button
                    onClick={() => {
                      setData(prev => ({ ...prev, firstProject: 'import' }));
                      onComplete(data);
                    }}
                    className="w-full rounded-xl bg-white/10 py-4 font-semibold text-white hover:bg-white/20"
                  >
                    <BookOpen className="mr-2 inline h-5 w-5" /> Import Existing Manuscript
                  </button>
                  <button
                    onClick={() => {
                      setData(prev => ({ ...prev, firstProject: 'explore' }));
                      onComplete(data);
                    }}
                    className="w-full rounded-xl bg-white/10 py-4 font-semibold text-white hover:bg-white/20"
                  >
                    <Star className="mr-2 inline h-5 w-5" /> Explore the Platform First
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step < 6 && (
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-white/60 hover:text-white disabled:opacity-0"
            >
              <ChevronLeft className="h-5 w-5" /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              Continue <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnboardingFlow;
