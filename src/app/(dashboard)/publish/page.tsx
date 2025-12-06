
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Check, ChevronLeft, ChevronRight, FileText, Settings,
  Globe, DollarSign, Eye, Download, BookOpen, Loader2, AlertCircle,
  CheckCircle, ExternalLink, HelpCircle, Image, Tag, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, InfoTooltip } from '@/components/ui/tooltip';
import { ProgressBar } from '@/components/ui/feedback';

interface Platform {
  id: string;
  name: string;
  logo: string;
  description: string;
  royaltyRate: string;
  supported: boolean;
}

const platforms: Platform[] = [
  { id: 'kdp', name: 'Amazon KDP', logo: '📚', description: 'Kindle Direct Publishing', royaltyRate: '35-70%', supported: true },
  { id: 'ingram', name: 'IngramSpark', logo: '📖', description: 'Wide distribution network', royaltyRate: '40-55%', supported: true },
  { id: 'apple', name: 'Apple Books', logo: '🍎', description: 'Apple ecosystem', royaltyRate: '70%', supported: true },
  { id: 'd2d', name: 'Draft2Digital', logo: '✍️', description: 'Multi-platform distributor', royaltyRate: '60%', supported: true },
  { id: 'kobo', name: 'Kobo', logo: '📱', description: 'Kobo Writing Life', royaltyRate: '70%', supported: true },
  { id: 'gplay', name: 'Google Play', logo: '▶️', description: 'Google Play Books', royaltyRate: '52%', supported: false },
];

const exportFormats = [
  { id: 'epub', name: 'EPUB', description: 'Standard ebook format', icon: FileText, recommended: true },
  { id: 'mobi', name: 'MOBI', description: 'Kindle format', icon: FileText, recommended: false },
  { id: 'pdf', name: 'PDF', description: 'Print-ready PDF', icon: FileText, recommended: false },
  { id: 'docx', name: 'DOCX', description: 'Word document', icon: FileText, recommended: false },
];

const mockBook = {
  id: '1',
  title: 'The Last Horizon',
  subtitle: 'A Space Opera',
  author: 'Jane Author',
  description: 'An epic journey across the stars...',
  wordCount: 85000,
  chapters: 28,
  genre: 'Science Fiction',
  keywords: ['space opera', 'adventure', 'sci-fi'],
  price: 4.99,
  coverUrl: null,
};

export default function PublishPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['epub']);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [metadata, setMetadata] = useState({
    title: mockBook.title,
    subtitle: mockBook.subtitle,
    author: mockBook.author,
    description: mockBook.description,
    keywords: mockBook.keywords.join(', '),
    price: mockBook.price,
    category: 'Science Fiction > Space Opera',
    language: 'English',
    isbn: '',
    publishDate: new Date().toISOString().split('T')[0],
  });

  const steps = [
    { id: 'format', title: 'Export Format', description: 'Choose output formats' },
    { id: 'metadata', title: 'Metadata', description: 'Review book details' },
    { id: 'platforms', title: 'Platforms', description: 'Select where to publish' },
    { id: 'preview', title: 'Preview', description: 'Final review' },
    { id: 'publish', title: 'Publish', description: 'Go live!' },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedFormats.length > 0;
      case 1: return metadata.title && metadata.author && metadata.description;
      case 2: return selectedPlatforms.length > 0;
      case 3: return true;
      default: return false;
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPublishProgress(i);
    }
    setCurrentStep(4);
    setIsPublishing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Publish Your Book</h1>
          <p className="mt-1 text-slate-500">Export and publish "{mockBook.title}" to multiple platforms</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all',
                    index < currentStep && 'border-emerald-600 bg-emerald-600 text-white',
                    index === currentStep && 'border-violet-600 bg-violet-50 text-violet-600',
                    index > currentStep && 'border-slate-200 bg-white text-slate-400 dark:border-slate-700'
                  )}>
                    {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                  </div>
                  <div className="hidden lg:block">
                    <p className={cn('text-sm font-medium', index <= currentStep ? 'text-slate-900 dark:text-white' : 'text-slate-400')}>{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && <div className={cn('mx-4 h-0.5 flex-1 rounded-full', index < currentStep ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700')} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              
              {/* Step 0: Format Selection */}
              {currentStep === 0 && (
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Choose Export Formats</h2>
                  <p className="mb-6 text-slate-500">Select the formats you need for your publishing platforms</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {exportFormats.map((format) => (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormats(prev => prev.includes(format.id) ? prev.filter(f => f !== format.id) : [...prev, format.id])}
                        className={cn(
                          'flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all',
                          selectedFormats.includes(format.id) ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/30' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                        )}
                      >
                        <div className={cn('rounded-lg p-2', selectedFormats.includes(format.id) ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400')}>
                          <format.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900 dark:text-white">{format.name}</h3>
                            {format.recommended && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Recommended</span>}
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{format.description}</p>
                        </div>
                        <div className={cn('h-5 w-5 rounded-full border-2', selectedFormats.includes(format.id) ? 'border-violet-600 bg-violet-600' : 'border-slate-300')}>
                          {selectedFormats.includes(format.id) && <Check className="h-full w-full text-white p-0.5" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Metadata */}
              {currentStep === 1 && (
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Review Metadata</h2>
                  <p className="mb-6 text-slate-500">Make sure your book details are correct before publishing</p>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        Title <InfoTooltip title="Book Title" description="This will appear on all platforms" />
                      </label>
                      <input type="text" value={metadata.title} onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Subtitle</label>
                      <input type="text" value={metadata.subtitle} onChange={(e) => setMetadata(prev => ({ ...prev, subtitle: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Author Name</label>
                      <input type="text" value={metadata.author} onChange={(e) => setMetadata(prev => ({ ...prev, author: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Price (USD)</label>
                      <input type="number" step="0.01" value={metadata.price} onChange={(e) => setMetadata(prev => ({ ...prev, price: parseFloat(e.target.value) }))} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800" />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                      <textarea value={metadata.description} onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))} rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800" />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        Keywords <InfoTooltip title="Keywords" description="Help readers discover your book. Separate with commas." />
                      </label>
                      <input type="text" value={metadata.keywords} onChange={(e) => setMetadata(prev => ({ ...prev, keywords: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Platforms */}
              {currentStep === 2 && (
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Select Publishing Platforms</h2>
                  <p className="mb-6 text-slate-500">Choose where you want to publish your book</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {platforms.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => platform.supported && setSelectedPlatforms(prev => prev.includes(platform.id) ? prev.filter(p => p !== platform.id) : [...prev, platform.id])}
                        disabled={!platform.supported}
                        className={cn(
                          'flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all',
                          selectedPlatforms.includes(platform.id) ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/30' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700',
                          !platform.supported && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="text-2xl">{platform.logo}</span>
                          {platform.supported ? (
                            <div className={cn('h-5 w-5 rounded-full border-2', selectedPlatforms.includes(platform.id) ? 'border-violet-600 bg-violet-600' : 'border-slate-300')}>
                              {selectedPlatforms.includes(platform.id) && <Check className="h-full w-full text-white p-0.5" />}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Coming soon</span>
                          )}
                        </div>
                        <h3 className="mt-3 font-medium text-slate-900 dark:text-white">{platform.name}</h3>
                        <p className="text-sm text-slate-500">{platform.description}</p>
                        <p className="mt-2 text-xs text-emerald-600">Royalty: {platform.royaltyRate}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Preview */}
              {currentStep === 3 && (
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Final Review</h2>
                  <p className="mb-6 text-slate-500">Review everything before publishing</p>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <h3 className="mb-4 font-medium text-slate-900 dark:text-white">Book Details</h3>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between"><dt className="text-slate-500">Title:</dt><dd className="font-medium text-slate-900 dark:text-white">{metadata.title}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-500">Author:</dt><dd className="font-medium text-slate-900 dark:text-white">{metadata.author}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-500">Price:</dt><dd className="font-medium text-slate-900 dark:text-white">${metadata.price}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-500">Word Count:</dt><dd className="font-medium text-slate-900 dark:text-white">{mockBook.wordCount.toLocaleString()}</dd></div>
                      </dl>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <h3 className="mb-4 font-medium text-slate-900 dark:text-white">Publishing To</h3>
                      <div className="space-y-2">
                        {selectedPlatforms.map((id) => {
                          const platform = platforms.find(p => p.id === id);
                          return platform && (
                            <div key={id} className="flex items-center gap-2">
                              <span>{platform.logo}</span>
                              <span className="text-sm text-slate-900 dark:text-white">{platform.name}</span>
                            </div>
                          );
                        })}
                      </div>
                      <h3 className="mb-2 mt-4 font-medium text-slate-900 dark:text-white">Formats</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedFormats.map((format) => (
                          <span key={format} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">{format.toUpperCase()}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <div>
                        <h4 className="font-medium text-amber-800 dark:text-amber-400">Before you publish</h4>
                        <ul className="mt-1 list-inside list-disc text-sm text-amber-700 dark:text-amber-300">
                          <li>Make sure your manuscript is fully edited</li>
                          <li>Verify your cover meets platform requirements</li>
                          <li>Double-check your pricing strategy</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Publishing / Complete */}
              {currentStep === 4 && (
                <div className="text-center py-8">
                  {isPublishing ? (
                    <div>
                      <Loader2 className="mx-auto h-12 w-12 animate-spin text-violet-600" />
                      <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Publishing Your Book...</h2>
                      <p className="mt-2 text-slate-500">This may take a few minutes</p>
                      <div className="mx-auto mt-6 max-w-xs">
                        <ProgressBar value={publishProgress} showLabel />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <CheckCircle className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Published Successfully!</h2>
                      <p className="mt-2 text-slate-500">Your book is now live on {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}</p>
                      <div className="mt-6 flex justify-center gap-3">
                        <a href="/analytics" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 font-medium text-white">View Analytics</a>
                        <a href="/marketing" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-2.5 font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">Start Marketing</a>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {currentStep < 4 && (
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
              <button onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 0} className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium', currentStep === 0 ? 'invisible' : 'text-slate-600 hover:bg-slate-100')}>
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <div className="text-sm text-slate-500">Step {currentStep + 1} of {steps.length}</div>
              {currentStep === 3 ? (
                <button onClick={handlePublish} disabled={isPublishing} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg">
                  Publish Now <Send className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canProceed()} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg disabled:opacity-50">
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
