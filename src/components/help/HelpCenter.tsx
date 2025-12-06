'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  X, 
  Search, 
  BookOpen, 
  Video, 
  MessageCircle,
  ExternalLink,
  ChevronRight,
  FileText,
  Sparkles,
  Send,
  Image,
  BarChart3,
  Users,
  DollarSign,
  PenTool
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  icon?: React.ElementType;
}

interface HelpVideo {
  id: string;
  title: string;
  duration: string;
  thumbnail?: string;
  url: string;
}

const helpArticles: HelpArticle[] = [
  {
    id: '1',
    title: 'Getting Started with BookFactory AI',
    description: 'Learn the basics of creating your first book project',
    category: 'Getting Started',
    url: '/help/getting-started',
    icon: BookOpen,
  },
  {
    id: '2',
    title: 'Using the AI Writing Assistant',
    description: 'Discover how to use AI to improve your writing',
    category: 'AI Features',
    url: '/help/ai-assistant',
    icon: Sparkles,
  },
  {
    id: '3',
    title: 'Exporting Your Book',
    description: 'Export to EPUB, PDF, DOCX and other formats',
    category: 'Publishing',
    url: '/help/exporting',
    icon: Send,
  },
  {
    id: '4',
    title: 'Creating AI-Generated Covers',
    description: 'Design professional book covers with AI',
    category: 'Design',
    url: '/help/covers',
    icon: Image,
  },
  {
    id: '5',
    title: 'Understanding Analytics',
    description: 'Track your book sales and performance',
    category: 'Analytics',
    url: '/help/analytics',
    icon: BarChart3,
  },
  {
    id: '6',
    title: 'Collaborating with Others',
    description: 'Add beta readers, editors, and co-authors',
    category: 'Collaboration',
    url: '/help/collaboration',
    icon: Users,
  },
  {
    id: '7',
    title: 'Managing Royalties & Finances',
    description: 'Track income and expenses across platforms',
    category: 'Finances',
    url: '/help/finances',
    icon: DollarSign,
  },
  {
    id: '8',
    title: 'Writing Tools & Features',
    description: 'Master the distraction-free writing editor',
    category: 'Writing',
    url: '/help/writing-tools',
    icon: PenTool,
  },
];

const helpVideos: HelpVideo[] = [
  {
    id: '1',
    title: 'BookFactory AI Quick Start Guide',
    duration: '5:32',
    url: '#',
  },
  {
    id: '2',
    title: 'Creating Your First Book',
    duration: '8:15',
    url: '#',
  },
  {
    id: '3',
    title: 'AI Writing Assistant Deep Dive',
    duration: '12:45',
    url: '#',
  },
  {
    id: '4',
    title: 'Publishing to Amazon KDP',
    duration: '10:20',
    url: '#',
  },
];

const faqs = [
  {
    question: 'How do I create a new book?',
    answer: 'Click the "New Book" button in the sidebar or use the keyboard shortcut ⌘N. Follow the wizard to set up your book\'s title, genre, and other details.',
  },
  {
    question: 'Can I import my existing manuscript?',
    answer: 'Yes! When creating a new book, select "Import Existing" and upload your DOCX, TXT, or RTF file. BookFactory AI will automatically organize it into chapters.',
  },
  {
    question: 'How does the AI writing assistant work?',
    answer: 'The AI assistant can help with plot development, character creation, dialogue, and more. Press ⌘J while writing to open the assistant, or use the AI panel on the right side of the editor.',
  },
  {
    question: 'What export formats are available?',
    answer: 'BookFactory AI supports EPUB, PDF (both screen and print), DOCX, MOBI, HTML, and Markdown formats. You can also publish directly to Amazon KDP and other platforms.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! The free tier includes basic writing and editing tools. You can upgrade to Mid ($19/mo) or Pro ($49/mo) tiers for full features including AI generation, publishing, and marketing tools.',
  },
];

// Floating Help Button & Panel
interface HelpWidgetProps {
  context?: string; // Current page/context for relevant help
}

export function HelpWidget({ context }: HelpWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'articles' | 'videos' | 'faq' | 'chat'>('articles');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = helpArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 transition-all hover:scale-110 hover:shadow-violet-500/50"
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      {/* Help Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-50 w-96 overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
            >
              {/* Header */}
              <div className="border-b border-slate-200 bg-gradient-to-r from-violet-600 to-indigo-600 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">Help Center</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search help articles..."
                    className="w-full rounded-lg bg-white/20 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/60 outline-none focus:bg-white/30"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800">
                {[
                  { id: 'articles', label: 'Articles', icon: FileText },
                  { id: 'videos', label: 'Videos', icon: Video },
                  { id: 'faq', label: 'FAQ', icon: HelpCircle },
                  { id: 'chat', label: 'Chat', icon: MessageCircle },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'border-b-2 border-violet-600 text-violet-600'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="max-h-80 overflow-y-auto p-4">
                {activeTab === 'articles' && (
                  <div className="space-y-2">
                    {filteredArticles.map((article) => (
                      <a
                        key={article.id}
                        href={article.url}
                        className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        {article.icon && (
                          <div className="rounded-lg bg-violet-100 p-2 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
                            <article.icon className="h-4 w-4" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                            {article.title}
                          </h4>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {article.description}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </a>
                    ))}
                  </div>
                )}

                {activeTab === 'videos' && (
                  <div className="space-y-3">
                    {helpVideos.map((video) => (
                      <a
                        key={video.id}
                        href={video.url}
                        className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <div className="relative h-16 w-24 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Video className="h-6 w-6 text-slate-400" />
                          </div>
                          <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                            {video.duration}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                            {video.title}
                          </h4>
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {activeTab === 'faq' && (
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <details key={index} className="group">
                        <summary className="flex cursor-pointer items-center justify-between rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800">
                          <span className="text-sm font-medium text-slate-900 dark:text-white pr-4">
                            {faq.question}
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-90" />
                        </summary>
                        <div className="px-3 pb-3 pt-1">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {faq.answer}
                          </p>
                        </div>
                      </details>
                    ))}
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div className="text-center py-8">
                    <MessageCircle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                    <h4 className="mt-4 font-medium text-slate-900 dark:text-white">
                      Chat with Support
                    </h4>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Our team is available Mon-Fri, 9am-5pm EST
                    </p>
                    <button className="mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40">
                      Start Chat
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                <a
                  href="/help"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
                >
                  View full Help Center
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Inline Help Tip Component
interface HelpTipProps {
  title: string;
  content: string;
  learnMoreUrl?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function HelpTip({ title, content, learnMoreUrl, dismissible, onDismiss }: HelpTipProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">{title}</h4>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">{content}</p>
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Learn more <ChevronRight className="h-3 w-3" />
            </a>
          )}
        </div>
        {dismissible && (
          <button
            onClick={() => {
              setDismissed(true);
              onDismiss?.();
            }}
            className="flex-shrink-0 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Feature Spotlight for New Features
interface FeatureSpotlightProps {
  title: string;
  description: string;
  isNew?: boolean;
  children: React.ReactNode;
}

export function FeatureSpotlight({ title, description, isNew, children }: FeatureSpotlightProps) {
  const [showTip, setShowTip] = useState(true);

  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-full top-0 z-50 ml-2 w-64"
          >
            <div className="rounded-xl border border-violet-200 bg-white p-4 shadow-lg dark:border-violet-800 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {isNew && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
                      New
                    </span>
                  )}
                  <h4 className="font-medium text-slate-900 dark:text-white">{title}</h4>
                </div>
                <button
                  onClick={() => setShowTip(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
              <button
                onClick={() => setShowTip(false)}
                className="mt-3 text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
              >
                Got it
              </button>
            </div>
            {/* Arrow */}
            <div className="absolute left-0 top-4 -ml-2 border-8 border-transparent border-r-white dark:border-r-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HelpWidget;
