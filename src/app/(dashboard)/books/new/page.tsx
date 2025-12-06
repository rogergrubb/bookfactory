
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, PenTool, Upload, Sparkles, ChevronLeft, ChevronRight,
  Check, HelpCircle, FileText, Image, Target, Users, Globe, Tag,
  Calendar, DollarSign, Wand2, BookMarked, Lightbulb, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, InfoTooltip } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

type BookType = 'fiction' | 'nonfiction' | 'memoir' | 'children' | 'technical';
type CreationMethod = 'scratch' | 'import' | 'ai-assist' | 'template';

interface Genre {
  id: string;
  name: string;
  icon: React.ElementType;
  wordCountRange: [number, number];
}

const bookTypes = [
  { id: 'fiction', name: 'Fiction', description: 'Novels, short stories, and creative writing', icon: BookOpen },
  { id: 'nonfiction', name: 'Non-Fiction', description: 'Self-help, business, history, science', icon: Lightbulb },
  { id: 'memoir', name: 'Memoir', description: 'Personal stories and autobiographies', icon: PenTool },
  { id: 'children', name: "Children's", description: 'Picture books, middle grade, young adult', icon: Sparkles },
  { id: 'technical', name: 'Technical', description: 'How-to guides, manuals, documentation', icon: FileText },
];

const fictionGenres: Genre[] = [
  { id: 'romance', name: 'Romance', icon: BookOpen, wordCountRange: [50000, 100000] },
  { id: 'fantasy', name: 'Fantasy', icon: Wand2, wordCountRange: [80000, 150000] },
  { id: 'scifi', name: 'Science Fiction', icon: Globe, wordCountRange: [70000, 120000] },
  { id: 'mystery', name: 'Mystery/Thriller', icon: BookMarked, wordCountRange: [70000, 100000] },
  { id: 'literary', name: 'Literary Fiction', icon: PenTool, wordCountRange: [70000, 100000] },
  { id: 'horror', name: 'Horror', icon: BookOpen, wordCountRange: [60000, 90000] },
];

const nonfictionGenres: Genre[] = [
  { id: 'selfhelp', name: 'Self-Help', icon: Lightbulb, wordCountRange: [40000, 60000] },
  { id: 'business', name: 'Business', icon: DollarSign, wordCountRange: [50000, 70000] },
  { id: 'history', name: 'History', icon: Calendar, wordCountRange: [80000, 120000] },
  { id: 'science', name: 'Science', icon: Globe, wordCountRange: [60000, 90000] },
  { id: 'biography', name: 'Biography', icon: Users, wordCountRange: [70000, 100000] },
];

const creationMethods = [
  { id: 'scratch', name: 'Start from Scratch', description: 'Begin with a blank canvas', icon: PenTool },
  { id: 'import', name: 'Import Manuscript', description: 'Upload an existing document', icon: Upload },
  { id: 'ai-assist', name: 'AI-Assisted Creation', description: 'Let AI help you outline and plan', icon: Sparkles },
  { id: 'template', name: 'Use a Template', description: 'Start with a pre-built structure', icon: FileText },
];

const templates = [
  { id: 'three-act', name: 'Three-Act Structure', description: 'Classic storytelling framework', chapters: 25 },
  { id: 'hero-journey', name: "Hero's Journey", description: '12-stage mythic structure', chapters: 12 },
  { id: 'save-cat', name: 'Save the Cat', description: '15-beat story structure', chapters: 15 },
  { id: 'seven-point', name: 'Seven Point Story', description: 'Plot-focused framework', chapters: 7 },
  { id: 'memoir-arc', name: 'Memoir Arc', description: 'Personal narrative structure', chapters: 10 },
  { id: 'nonfiction', name: 'Non-Fiction Framework', description: 'Problem-solution structure', chapters: 12 },
];

export default function NewBookPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [bookType, setBookType] = useState<BookType | null>(null);
  const [genre, setGenre] = useState<string | null>(null);
  const [creationMethod, setCreationMethod] = useState<CreationMethod | null>(null);
  const [template, setTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    targetWordCount: 80000,
    targetChapters: 25,
    seriesName: '',
    isPartOfSeries: false,
  });

  const steps = [
    { id: 'type', title: 'Book Type', description: 'What are you writing?' },
    { id: 'genre', title: 'Genre', description: 'Choose your genre' },
    { id: 'method', title: 'How to Start', description: 'Choose your approach' },
    { id: 'details', title: 'Book Details', description: 'Name your masterpiece' },
    { id: 'goals', title: 'Writing Goals', description: 'Set your targets' },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0: return bookType !== null;
      case 1: return genre !== null;
      case 2: return creationMethod !== null && (creationMethod !== 'template' || template !== null);
      case 3: return formData.title.trim().length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In production, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/books');
    } catch (error) {
      console.error('Failed to create book:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGenresForType = () => {
    switch (bookType) {
      case 'fiction': return fictionGenres;
      case 'nonfiction': return nonfictionGenres;
      case 'memoir': return [{ id: 'memoir', name: 'Memoir', icon: PenTool, wordCountRange: [60000, 100000] as [number, number] }];
      case 'children': return [
        { id: 'picture', name: 'Picture Book', icon: Image, wordCountRange: [500, 1000] as [number, number] },
        { id: 'middle', name: 'Middle Grade', icon: BookOpen, wordCountRange: [25000, 50000] as [number, number] },
        { id: 'ya', name: 'Young Adult', icon: BookMarked, wordCountRange: [50000, 80000] as [number, number] },
      ];
      case 'technical': return [
        { id: 'howto', name: 'How-To Guide', icon: FileText, wordCountRange: [30000, 60000] as [number, number] },
        { id: 'manual', name: 'Manual', icon: FileText, wordCountRange: [20000, 50000] as [number, number] },
        { id: 'textbook', name: 'Textbook', icon: BookOpen, wordCountRange: [80000, 150000] as [number, number] },
      ];
      default: return [];
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create a New Book</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Let's set up your book project step by step</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all',
                    index < currentStep && 'border-violet-600 bg-violet-600 text-white',
                    index === currentStep && 'border-violet-600 bg-violet-50 text-violet-600 dark:bg-violet-950/50',
                    index > currentStep && 'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800'
                  )}>
                    {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                  </div>
                  <div className="hidden sm:block">
                    <p className={cn('text-sm font-medium', index <= currentStep ? 'text-slate-900 dark:text-white' : 'text-slate-400')}>{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && <div className={cn('mx-4 h-0.5 flex-1 rounded-full', index < currentStep ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700')} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              
              {/* Step 0: Book Type */}
              {currentStep === 0 && (
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">What type of book are you writing?</h2>
                  <p className="mb-6 text-slate-500 dark:text-slate-400">This helps us customize your writing experience</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {bookTypes.map((type) => (
                      <button key={type.id} onClick={() => setBookType(type.id as BookType)} className={cn(
                        'flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all',
                        bookType === type.id ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/30' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                      )}>
                        <div className={cn('rounded-lg p-2', bookType === type.id ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400')}>
                          <type.icon className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 font-medium text-slate-900 dark:text-white">{type.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Genre */}
              {currentStep === 1 && (
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Select your genre</h2>
                  <p className="mb-6 text-slate-500 dark:text-slate-400">This helps set appropriate word count targets and structure</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {getGenresForType().map((g) => (
                      <button key={g.id} onClick={() => { setGenre(g.id); setFormData(prev => ({ ...prev, targetWordCount: Math.round((g.wordCountRange[0] + g.wordCountRange[1]) / 2) })); }} className={cn(
                        'flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all',
                        genre === g.id ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/30' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                      )}>
                        <div className={cn('rounded-lg p-2', genre === g.id ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400')}>
                          <g.icon className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 font-medium text-slate-900 dark:text-white">{g.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{g.wordCountRange[0].toLocaleString()} - {g.wordCountRange[1].toLocaleString()} words</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Creation Method */}
              {currentStep === 2 && (
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">How would you like to start?</h2>
                  <p className="mb-6 text-slate-500 dark:text-slate-400">Choose your preferred approach to begin writing</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {creationMethods.map((method) => (
                      <button key={method.id} onClick={() => setCreationMethod(method.id as CreationMethod)} className={cn(
                        'flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all',
                        creationMethod === method.id ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/30' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                      )}>
                        <div className={cn('rounded-lg p-2', creationMethod === method.id ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400')}>
                          <method.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white">{method.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">{method.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {creationMethod === 'template' && (
                    <div className="mt-6">
                      <h3 className="mb-4 font-medium text-slate-900 dark:text-white">Choose a template</h3>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {templates.map((t) => (
                          <button key={t.id} onClick={() => setTemplate(t.id)} className={cn(
                            'rounded-xl border-2 p-3 text-left transition-all',
                            template === t.id ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/30' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                          )}>
                            <h4 className="font-medium text-slate-900 dark:text-white">{t.name}</h4>
                            <p className="mt-1 text-xs text-slate-500">{t.description}</p>
                            <p className="mt-2 text-xs text-violet-600">{t.chapters} chapters</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Book Details */}
              {currentStep === 3 && (
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Book Details</h2>
                  <p className="mb-6 text-slate-500 dark:text-slate-400">Give your book a name and description</p>
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        Title <span className="text-red-500">*</span>
                        <InfoTooltip title="Book Title" description="Choose a compelling title that captures your book's essence" />
                      </label>
                      <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Enter your book title" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800" />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        Subtitle <span className="text-slate-400">(optional)</span>
                      </label>
                      <input type="text" value={formData.subtitle} onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="Enter a subtitle" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800" />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        Description <span className="text-slate-400">(optional)</span>
                        <InfoTooltip title="Book Description" description="A brief summary of what your book is about. You can refine this later." />
                      </label>
                      <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="What is your book about?" rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800" />
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="series" checked={formData.isPartOfSeries} onChange={(e) => setFormData(prev => ({ ...prev, isPartOfSeries: e.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                      <label htmlFor="series" className="text-sm text-slate-700 dark:text-slate-300">This book is part of a series</label>
                    </div>
                    {formData.isPartOfSeries && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Series Name</label>
                        <input type="text" value={formData.seriesName} onChange={(e) => setFormData(prev => ({ ...prev, seriesName: e.target.value }))} placeholder="Enter series name" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Writing Goals */}
              {currentStep === 4 && (
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Set Your Writing Goals</h2>
                  <p className="mb-6 text-slate-500 dark:text-slate-400">These help track your progress (you can adjust them anytime)</p>
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        Target Word Count
                        <InfoTooltip title="Word Count Goal" description="A typical novel is 70,000-100,000 words. This is just a target - write as much as your story needs!" />
                      </label>
                      <div className="flex items-center gap-4">
                        <input type="range" min="5000" max="200000" step="5000" value={formData.targetWordCount} onChange={(e) => setFormData(prev => ({ ...prev, targetWordCount: parseInt(e.target.value) }))} className="flex-1" />
                        <span className="w-24 text-right font-medium text-slate-900 dark:text-white">{formData.targetWordCount.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        Target Chapters
                        <InfoTooltip title="Chapter Goal" description="Most novels have 15-30 chapters. This is flexible - add or remove chapters as needed." />
                      </label>
                      <div className="flex items-center gap-4">
                        <input type="range" min="5" max="50" value={formData.targetChapters} onChange={(e) => setFormData(prev => ({ ...prev, targetChapters: parseInt(e.target.value) }))} className="flex-1" />
                        <span className="w-24 text-right font-medium text-slate-900 dark:text-white">{formData.targetChapters} chapters</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-violet-50 p-4 dark:bg-violet-950/30">
                      <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400">
                        <Target className="h-5 w-5" />
                        <span className="font-medium">Estimated chapter length</span>
                      </div>
                      <p className="mt-1 text-sm text-violet-600 dark:text-violet-300">
                        ~{Math.round(formData.targetWordCount / formData.targetChapters).toLocaleString()} words per chapter
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
            <button onClick={handleBack} disabled={currentStep === 0} className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors', currentStep === 0 ? 'invisible' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400')}>
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <div className="text-sm text-slate-500">Step {currentStep + 1} of {steps.length}</div>
            {currentStep === steps.length - 1 ? (
              <button onClick={handleSubmit} disabled={!canProceed() || isSubmitting} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 disabled:opacity-50">
                {isSubmitting ? 'Creating...' : 'Create Book'} <Check className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={handleNext} disabled={!canProceed()} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 disabled:opacity-50">
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
