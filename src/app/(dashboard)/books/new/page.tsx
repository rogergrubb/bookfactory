'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, PenTool, Upload, Sparkles, ChevronLeft, ChevronRight,
  Check, HelpCircle, FileText, Image, Target, Users, Globe, Tag,
  Calendar, DollarSign, Wand2, BookMarked, Lightbulb, X, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/tooltip';

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
  const [error, setError] = useState<string | null>(null);
  
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
    if (!genre || !formData.title.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          subtitle: formData.subtitle.trim() || undefined,
          description: formData.description.trim() || undefined,
          genre: genre,
          targetWordCount: formData.targetWordCount,
          targetChapters: formData.targetChapters,
          template: creationMethod === 'template' ? template : undefined,
          // seriesId would be handled separately if isPartOfSeries
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create book');
      }

      const { book } = await response.json();
      
      // Redirect to the new book's page
      router.push(`/books/${book.id}`);
    } catch (err) {
      console.error('Failed to create book:', err);
      setError(err instanceof Error ? err.message : 'Failed to create book. Please try again.');
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
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-white">Create a New Book</h1>
          <p className="mt-2 text-stone-500 dark:text-stone-400">Let's set up your book project step by step</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all',
                    index < currentStep && 'border-teal-600 bg-teal-600 text-white',
                    index === currentStep && 'border-teal-600 bg-teal-50 text-teal-600 dark:bg-teal-950/50',
                    index > currentStep && 'border-stone-200 bg-white text-stone-400 dark:border-stone-700 dark:bg-stone-800'
                  )}>
                    {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                  </div>
                  <div className="hidden sm:block">
                    <p className={cn('text-sm font-medium', index <= currentStep ? 'text-stone-900 dark:text-white' : 'text-stone-400')}>{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && <div className={cn('mx-4 h-0.5 flex-1 rounded-full', index < currentStep ? 'bg-teal-600' : 'bg-stone-200 dark:bg-stone-700')} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step Content */}
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              
              {/* Step 0: Book Type */}
              {currentStep === 0 && (
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-stone-900 dark:text-white">What type of book are you writing?</h2>
                  <p className="mb-6 text-stone-500 dark:text-stone-400">This helps us customize your writing experience</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {bookTypes.map((type) => (
                      <button key={type.id} onClick={() => setBookType(type.id as BookType)} className={cn(
                        'flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all',
                        bookType === type.id ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/30' : 'border-stone-200 hover:border-stone-300 dark:border-stone-700'
                      )}>
                        <div className={cn('rounded-lg p-2', bookType === type.id ? 'bg-teal-100 text-teal-600' : 'bg-stone-100 text-stone-400')}>
                          <type.icon className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 font-medium text-stone-900 dark:text-white">{type.name}</h3>
                        <p className="mt-1 text-sm text-stone-500">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Genre */}
              {currentStep === 1 && (
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-stone-900 dark:text-white">Select your genre</h2>
                  <p className="mb-6 text-stone-500 dark:text-stone-400">This helps set appropriate word count targets and structure</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {getGenresForType().map((g) => (
                      <button key={g.id} onClick={() => { setGenre(g.id); setFormData(prev => ({ ...prev, targetWordCount: Math.round((g.wordCountRange[0] + g.wordCountRange[1]) / 2) })); }} className={cn(
                        'flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all',
                        genre === g.id ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/30' : 'border-stone-200 hover:border-stone-300 dark:border-stone-700'
                      )}>
                        <div className={cn('rounded-lg p-2', genre === g.id ? 'bg-teal-100 text-teal-600' : 'bg-stone-100 text-stone-400')}>
                          <g.icon className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 font-medium text-stone-900 dark:text-white">{g.name}</h3>
                        <p className="mt-1 text-sm text-stone-500">{g.wordCountRange[0].toLocaleString()} - {g.wordCountRange[1].toLocaleString()} words</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Creation Method */}
              {currentStep === 2 && (
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-stone-900 dark:text-white">How would you like to start?</h2>
                  <p className="mb-6 text-stone-500 dark:text-stone-400">Choose your preferred approach to begin writing</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {creationMethods.map((method) => (
                      <button key={method.id} onClick={() => setCreationMethod(method.id as CreationMethod)} className={cn(
                        'flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all',
                        creationMethod === method.id ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/30' : 'border-stone-200 hover:border-stone-300 dark:border-stone-700'
                      )}>
                        <div className={cn('rounded-lg p-2', creationMethod === method.id ? 'bg-teal-100 text-teal-600' : 'bg-stone-100 text-stone-400')}>
                          <method.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-stone-900 dark:text-white">{method.name}</h3>
                          <p className="mt-1 text-sm text-stone-500">{method.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {creationMethod === 'template' && (
                    <div className="mt-6">
                      <h3 className="mb-4 font-medium text-stone-900 dark:text-white">Choose a template</h3>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {templates.map((t) => (
                          <button key={t.id} onClick={() => setTemplate(t.id)} className={cn(
                            'rounded-xl border-2 p-3 text-left transition-all',
                            template === t.id ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/30' : 'border-stone-200 hover:border-stone-300 dark:border-stone-700'
                          )}>
                            <h4 className="font-medium text-stone-900 dark:text-white">{t.name}</h4>
                            <p className="mt-1 text-xs text-stone-500">{t.description}</p>
                            <p className="mt-2 text-xs text-teal-600">{t.chapters} chapters</p>
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
                  <h2 className="mb-2 text-xl font-semibold text-stone-900 dark:text-white">Book Details</h2>
                  <p className="mb-6 text-stone-500 dark:text-stone-400">Give your book a name and description</p>
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                        Title <span className="text-red-500">*</span>
                        <InfoTooltip title="Book Title" description="Choose a compelling title that captures your book's essence" />
                      </label>
                      <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Enter your book title" className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                        Subtitle <span className="text-stone-400">(optional)</span>
                      </label>
                      <input type="text" value={formData.subtitle} onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="Enter a subtitle" className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                        Description <span className="text-stone-400">(optional)</span>
                        <InfoTooltip title="Book Description" description="A brief summary of what your book is about. You can refine this later." />
                      </label>
                      <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="What is your book about?" rows={4} className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white" />
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="series" checked={formData.isPartOfSeries} onChange={(e) => setFormData(prev => ({ ...prev, isPartOfSeries: e.target.checked }))} className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500" />
                      <label htmlFor="series" className="text-sm text-stone-700 dark:text-stone-300">This book is part of a series</label>
                    </div>
                    {formData.isPartOfSeries && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Series Name</label>
                        <input type="text" value={formData.seriesName} onChange={(e) => setFormData(prev => ({ ...prev, seriesName: e.target.value }))} placeholder="Enter series name" className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Writing Goals */}
              {currentStep === 4 && (
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-stone-900 dark:text-white">Set Your Writing Goals</h2>
                  <p className="mb-6 text-stone-500 dark:text-stone-400">These help track your progress (you can adjust them anytime)</p>
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                        Target Word Count
                        <InfoTooltip title="Word Count Goal" description="A typical novel is 70,000-100,000 words. This is just a target - write as much as your story needs!" />
                      </label>
                      <div className="flex items-center gap-4">
                        <input type="range" min="5000" max="200000" step="5000" value={formData.targetWordCount} onChange={(e) => setFormData(prev => ({ ...prev, targetWordCount: parseInt(e.target.value) }))} className="flex-1 accent-teal-600" />
                        <span className="w-24 text-right font-medium text-stone-900 dark:text-white">{formData.targetWordCount.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                        Target Chapters
                        <InfoTooltip title="Chapter Goal" description="Most novels have 15-30 chapters. This is flexible - add or remove chapters as needed." />
                      </label>
                      <div className="flex items-center gap-4">
                        <input type="range" min="5" max="50" value={formData.targetChapters} onChange={(e) => setFormData(prev => ({ ...prev, targetChapters: parseInt(e.target.value) }))} className="flex-1 accent-teal-600" />
                        <span className="w-24 text-right font-medium text-stone-900 dark:text-white">{formData.targetChapters} chapters</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-teal-50 p-4 dark:bg-teal-950/30">
                      <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                        <Target className="h-5 w-5" />
                        <span className="font-medium">Estimated chapter length</span>
                      </div>
                      <p className="mt-1 text-sm text-teal-600 dark:text-teal-300">
                        ~{Math.round(formData.targetWordCount / formData.targetChapters).toLocaleString()} words per chapter
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-stone-200 pt-6 dark:border-stone-800">
            <button onClick={handleBack} disabled={currentStep === 0} className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors', currentStep === 0 ? 'invisible' : 'text-stone-600 hover:bg-stone-100 dark:text-stone-400')}>
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <div className="text-sm text-stone-500">Step {currentStep + 1} of {steps.length}</div>
            {currentStep === steps.length - 1 ? (
              <button onClick={handleSubmit} disabled={!canProceed() || isSubmitting} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Book <Check className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : (
              <button onClick={handleNext} disabled={!canProceed()} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
