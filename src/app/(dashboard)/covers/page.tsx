
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image, Sparkles, Palette, Type, Download, ChevronLeft, ChevronRight,
  Check, Wand2, Upload, RotateCcw, ZoomIn, ZoomOut, Layers, Settings,
  Eye, Save, Share2, Grid, Sliders, BookOpen, Plus, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { ProgressBar } from '@/components/ui/feedback';

interface CoverStyle {
  id: string;
  name: string;
  preview: string;
  category: string;
}

interface GeneratedCover {
  id: string;
  url: string;
  prompt: string;
}

const coverStyles: CoverStyle[] = [
  { id: 'minimal', name: 'Minimalist', preview: '🎨', category: 'Modern' },
  { id: 'dramatic', name: 'Dramatic', preview: '🌅', category: 'Fiction' },
  { id: 'elegant', name: 'Elegant', preview: '✨', category: 'Romance' },
  { id: 'dark', name: 'Dark & Moody', preview: '🌙', category: 'Thriller' },
  { id: 'fantasy', name: 'Fantasy', preview: '🏰', category: 'Fantasy' },
  { id: 'scifi', name: 'Sci-Fi', preview: '🚀', category: 'Science Fiction' },
  { id: 'vintage', name: 'Vintage', preview: '📜', category: 'Historical' },
  { id: 'playful', name: 'Playful', preview: '🎪', category: 'Children' },
];

const colorPalettes = [
  { id: '1', colors: ['#667EEA', '#764BA2', '#F093FB'], name: 'Purple Dream' },
  { id: '2', colors: ['#FF6B6B', '#FFA06D', '#FFD93D'], name: 'Sunset' },
  { id: '3', colors: ['#2D3436', '#636E72', '#B2BEC3'], name: 'Monochrome' },
  { id: '4', colors: ['#00B894', '#00CEC9', '#0984E3'], name: 'Ocean' },
  { id: '5', colors: ['#E17055', '#D63031', '#6C5CE7'], name: 'Bold' },
  { id: '6', colors: ['#FDCB6E', '#E84393', '#6C5CE7'], name: 'Vibrant' },
];

const fonts = [
  { id: 'serif', name: 'Classic Serif', preview: 'Georgia' },
  { id: 'sans', name: 'Modern Sans', preview: 'Helvetica' },
  { id: 'script', name: 'Script', preview: 'Dancing Script' },
  { id: 'display', name: 'Display', preview: 'Playfair Display' },
  { id: 'bold', name: 'Bold Impact', preview: 'Anton' },
];

export default function CoversPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState<string>('serif');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCovers, setGeneratedCovers] = useState<GeneratedCover[]>([]);
  const [selectedCover, setSelectedCover] = useState<string | null>(null);
  const [coverText, setCoverText] = useState({ title: 'The Last Horizon', subtitle: 'A Space Opera', author: 'Jane Author' });
  const [aiPrompt, setAiPrompt] = useState('');

  const steps = [
    { id: 'style', title: 'Choose Style', icon: Palette },
    { id: 'generate', title: 'AI Generate', icon: Sparkles },
    { id: 'customize', title: 'Customize', icon: Sliders },
    { id: 'export', title: 'Export', icon: Download },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    const newCovers: GeneratedCover[] = [
      { id: '1', url: '/covers/generated-1.jpg', prompt: aiPrompt },
      { id: '2', url: '/covers/generated-2.jpg', prompt: aiPrompt },
      { id: '3', url: '/covers/generated-3.jpg', prompt: aiPrompt },
      { id: '4', url: '/covers/generated-4.jpg', prompt: aiPrompt },
    ];
    setGeneratedCovers(newCovers);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cover Designer</h1>
          <p className="mt-1 text-slate-500">Create stunning book covers with AI assistance</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button onClick={() => setCurrentStep(index)} className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                    index < currentStep && 'border-emerald-600 bg-emerald-600 text-white',
                    index === currentStep && 'border-violet-600 bg-violet-50 text-violet-600',
                    index > currentStep && 'border-slate-200 bg-white text-slate-400'
                  )}>
                    {index < currentStep ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  <span className={cn('hidden font-medium sm:block', index <= currentStep ? 'text-slate-900 dark:text-white' : 'text-slate-400')}>{step.title}</span>
                </button>
                {index < steps.length - 1 && <div className={cn('mx-4 h-0.5 flex-1 rounded-full', index < currentStep ? 'bg-emerald-600' : 'bg-slate-200')} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <AnimatePresence mode="wait">
                <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  
                  {/* Step 0: Style Selection */}
                  {currentStep === 0 && (
                    <div>
                      <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Choose a Cover Style</h2>
                      <p className="mb-6 text-slate-500">Select a style that matches your book's genre and tone</p>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {coverStyles.map((style) => (
                          <button key={style.id} onClick={() => setSelectedStyle(style.id)} className={cn(
                            'flex flex-col items-center rounded-xl border-2 p-4 transition-all',
                            selectedStyle === style.id ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/30' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                          )}>
                            <span className="text-4xl">{style.preview}</span>
                            <h3 className="mt-3 font-medium text-slate-900 dark:text-white">{style.name}</h3>
                            <p className="text-xs text-slate-500">{style.category}</p>
                          </button>
                        ))}
                      </div>
                      <div className="mt-6">
                        <h3 className="mb-4 font-medium text-slate-900 dark:text-white">Color Palette</h3>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {colorPalettes.map((palette) => (
                            <button key={palette.id} onClick={() => setSelectedPalette(palette.id)} className={cn(
                              'flex items-center gap-3 rounded-xl border-2 p-3',
                              selectedPalette === palette.id ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/30' : 'border-slate-200 dark:border-slate-700'
                            )}>
                              <div className="flex gap-1">
                                {palette.colors.map((color, i) => (
                                  <div key={i} className="h-6 w-6 rounded-full" style={{ backgroundColor: color }} />
                                ))}
                              </div>
                              <span className="text-sm text-slate-700 dark:text-slate-300">{palette.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 1: AI Generation */}
                  {currentStep === 1 && (
                    <div>
                      <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">AI Cover Generation</h2>
                      <p className="mb-6 text-slate-500">Describe your ideal cover and let AI create options for you</p>
                      <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Describe your cover</label>
                        <textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="E.g., A lone astronaut standing on a cliff overlooking a massive alien city under twin suns. Dramatic lighting with purple and orange hues. Epic science fiction feel."
                          rows={4}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>
                      <button onClick={handleGenerate} disabled={isGenerating || !aiPrompt} className="mb-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-lg disabled:opacity-50">
                        {isGenerating ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Generating...</> : <><Wand2 className="h-4 w-4" /> Generate Covers</>}
                      </button>
                      
                      {isGenerating && (
                        <div className="rounded-xl bg-violet-50 p-4 dark:bg-violet-950/30">
                          <p className="mb-2 text-sm text-violet-700 dark:text-violet-400">Creating your covers...</p>
                          <ProgressBar value={65} color="violet" />
                        </div>
                      )}
                      
                      {generatedCovers.length > 0 && (
                        <div>
                          <h3 className="mb-4 font-medium text-slate-900 dark:text-white">Generated Options</h3>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {generatedCovers.map((cover) => (
                              <button key={cover.id} onClick={() => setSelectedCover(cover.id)} className={cn(
                                'relative aspect-[2/3] overflow-hidden rounded-xl border-2',
                                selectedCover === cover.id ? 'border-violet-600' : 'border-slate-200 dark:border-slate-700'
                              )}>
                                <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30">
                                  <Image className="h-12 w-12 text-slate-300" />
                                </div>
                                {selectedCover === cover.id && (
                                  <div className="absolute right-2 top-2 rounded-full bg-violet-600 p-1">
                                    <Check className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Customize */}
                  {currentStep === 2 && (
                    <div>
                      <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Customize Your Cover</h2>
                      <p className="mb-6 text-slate-500">Fine-tune the text, colors, and layout</p>
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Book Title</label>
                            <input type="text" value={coverText.title} onChange={(e) => setCoverText({ ...coverText, title: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800" />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Subtitle</label>
                            <input type="text" value={coverText.subtitle} onChange={(e) => setCoverText({ ...coverText, subtitle: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800" />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Author Name</label>
                            <input type="text" value={coverText.author} onChange={(e) => setCoverText({ ...coverText, author: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800" />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Title Font</label>
                            <div className="grid grid-cols-3 gap-2">
                              {fonts.slice(0, 3).map((font) => (
                                <button key={font.id} onClick={() => setSelectedFont(font.id)} className={cn(
                                  'rounded-lg border-2 p-2 text-center text-sm',
                                  selectedFont === font.id ? 'border-violet-600 bg-violet-50' : 'border-slate-200'
                                )}>
                                  {font.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="relative aspect-[2/3] w-full max-w-xs overflow-hidden rounded-xl border-2 border-slate-200 bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl">
                            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-white">
                              <h3 className="text-2xl font-bold">{coverText.title}</h3>
                              {coverText.subtitle && <p className="mt-2 text-sm opacity-80">{coverText.subtitle}</p>}
                              <p className="absolute bottom-6 text-sm">{coverText.author}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Export */}
                  {currentStep === 3 && (
                    <div>
                      <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">Export Your Cover</h2>
                      <p className="mb-6 text-slate-500">Download in various formats for different platforms</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {[
                          { format: 'Amazon KDP', size: '2560 x 1600', type: 'JPG' },
                          { format: 'IngramSpark', size: '3000 x 3000', type: 'PDF' },
                          { format: 'Apple Books', size: '1400 x 2100', type: 'PNG' },
                          { format: 'Web Preview', size: '800 x 1200', type: 'JPG' },
                        ].map((option) => (
                          <button key={option.format} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                            <div>
                              <h3 className="font-medium text-slate-900 dark:text-white">{option.format}</h3>
                              <p className="text-sm text-slate-500">{option.size} • {option.type}</p>
                            </div>
                            <Download className="h-5 w-5 text-violet-600" />
                          </button>
                        ))}
                      </div>
                      <div className="mt-6 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
                        <div className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-emerald-600" />
                          <div>
                            <h4 className="font-medium text-emerald-800 dark:text-emerald-400">Cover Ready!</h4>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300">Your cover meets all platform requirements</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
                <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium', currentStep === 0 ? 'invisible' : 'text-slate-600 hover:bg-slate-100')}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                {currentStep < steps.length - 1 ? (
                  <button onClick={() => setCurrentStep(currentStep + 1)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg">
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg">
                    <Download className="h-4 w-4" /> Download All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Preview</h3>
              <div className="relative mx-auto aspect-[2/3] w-full max-w-xs overflow-hidden rounded-xl border-2 border-slate-200 bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl">
                <div className="flex h-full flex-col items-center justify-center p-6 text-center text-white">
                  <h3 className="text-2xl font-bold">{coverText.title}</h3>
                  {coverText.subtitle && <p className="mt-2 text-sm opacity-80">{coverText.subtitle}</p>}
                  <p className="absolute bottom-6 text-sm">{coverText.author}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <Tooltip content="Zoom Out"><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><ZoomOut className="h-4 w-4" /></button></Tooltip>
                <Tooltip content="Zoom In"><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><ZoomIn className="h-4 w-4" /></button></Tooltip>
                <Tooltip content="Reset"><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><RotateCcw className="h-4 w-4" /></button></Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
