
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, Video, MessageCircle, FileText, ChevronRight,
  ChevronDown, ExternalLink, Play, Clock, Star, ThumbsUp, ThumbsDown,
  Sparkles, Zap, PenTool, Upload, Download, Users, CreditCard,
  Settings, Shield, HelpCircle, Mail, Phone, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  views: number;
  helpful: number;
  readTime: number;
}

interface Video {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  category: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const categories = [
  { id: 'getting-started', label: 'Getting Started', icon: Zap, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'writing', label: 'Writing & Editing', icon: PenTool, color: 'bg-violet-100 text-violet-600' },
  { id: 'ai', label: 'AI Features', icon: Sparkles, color: 'bg-amber-100 text-amber-600' },
  { id: 'publishing', label: 'Publishing', icon: Upload, color: 'bg-blue-100 text-blue-600' },
  { id: 'export', label: 'Export & Formats', icon: Download, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'collaboration', label: 'Collaboration', icon: Users, color: 'bg-pink-100 text-pink-600' },
  { id: 'billing', label: 'Billing & Plans', icon: CreditCard, color: 'bg-cyan-100 text-cyan-600' },
  { id: 'account', label: 'Account & Security', icon: Shield, color: 'bg-red-100 text-red-600' },
];

const popularArticles: Article[] = [
  { id: '1', title: 'How to Create Your First Book', category: 'getting-started', excerpt: 'Step-by-step guide to creating your first book project', content: '', views: 12453, helpful: 98, readTime: 5 },
  { id: '2', title: 'Using AI to Continue Your Story', category: 'ai', excerpt: 'Learn how to use AI assistance effectively', content: '', views: 8932, helpful: 95, readTime: 7 },
  { id: '3', title: 'Exporting to EPUB Format', category: 'export', excerpt: 'Complete guide to EPUB export options', content: '', views: 7821, helpful: 92, readTime: 4 },
  { id: '4', title: 'Inviting Beta Readers', category: 'collaboration', excerpt: 'How to share your manuscript with collaborators', content: '', views: 6543, helpful: 89, readTime: 6 },
  { id: '5', title: 'Understanding Your Analytics', category: 'publishing', excerpt: 'Make sense of your sales and reader data', content: '', views: 5432, helpful: 87, readTime: 8 },
];

const videos: Video[] = [
  { id: '1', title: 'BookFactory AI Quick Start Guide', duration: '8:24', thumbnail: '', category: 'getting-started' },
  { id: '2', title: 'Mastering the Writing Editor', duration: '12:15', thumbnail: '', category: 'writing' },
  { id: '3', title: 'AI Writing Assistant Deep Dive', duration: '15:42', thumbnail: '', category: 'ai' },
  { id: '4', title: 'Publishing to Amazon KDP', duration: '10:08', thumbnail: '', category: 'publishing' },
  { id: '5', title: 'Creating Professional Book Covers', duration: '14:33', thumbnail: '', category: 'export' },
  { id: '6', title: 'Managing Your Series', duration: '9:47', thumbnail: '', category: 'writing' },
];

const faqs: FAQItem[] = [
  { id: '1', question: 'How many books can I create on the free plan?', answer: 'The free plan allows you to create 1 book project with up to 10 chapters. Upgrade to Creator ($19/mo) for 10 books or Professional ($49/mo) for unlimited books.', category: 'billing' },
  { id: '2', question: 'Can I export my book to multiple formats?', answer: 'Yes! All plans support export to EPUB, PDF, DOCX, and Markdown formats. The Professional plan also includes MOBI format for Kindle.', category: 'export' },
  { id: '3', question: 'How does the AI writing assistant work?', answer: 'Our AI assistant uses Claude to help you continue your story, improve text, write dialogue, and more. It learns your writing style and maintains consistency with your characters and plot.', category: 'ai' },
  { id: '4', question: 'Is my work private and secure?', answer: 'Absolutely. Your manuscripts are encrypted and stored securely. We never share your content or use it to train AI models. You retain full copyright to everything you write.', category: 'account' },
  { id: '5', question: 'Can I collaborate with editors in real-time?', answer: 'Currently, collaboration is asynchronous - collaborators can leave comments and suggestions that you review. Real-time editing is on our roadmap for Q2 2025.', category: 'collaboration' },
  { id: '6', question: 'How do I publish directly to Amazon KDP?', answer: 'Connect your Amazon KDP account in Settings > Connections, then use the Publishing Wizard to submit your book directly. We handle formatting and metadata automatically.', category: 'publishing' },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'articles' | 'videos' | 'faq'>('articles');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFaqs = faqs.filter(faq => 
    (!selectedCategory || faq.category === selectedCategory) &&
    (!searchQuery || faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold">How can we help you?</h1>
          <p className="mb-8 text-lg text-white/80">Search our knowledge base or browse by category</p>
          <div className="relative mx-auto max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search for articles, tutorials, FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-4 text-slate-900 shadow-xl outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        {/* Categories Grid */}
        <div className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">Browse by Category</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                className={cn(
                  'flex items-center gap-4 rounded-xl border p-4 text-left transition-all',
                  selectedCategory === category.id
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                    : 'border-slate-200 bg-white hover:border-violet-300 dark:border-slate-800 dark:bg-slate-900'
                )}
              >
                <div className={cn('rounded-lg p-2', category.color)}>
                  <category.icon className="h-5 w-5" />
                </div>
                <span className="font-medium text-slate-900 dark:text-white">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'articles', label: 'Articles', icon: FileText },
            { id: 'videos', label: 'Video Tutorials', icon: Video },
            { id: 'faq', label: 'FAQ', icon: HelpCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'articles' && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Popular Articles</h3>
              <div className="space-y-3">
                {popularArticles.map((article) => (
                  <a
                    key={article.id}
                    href={`/help/articles/${article.id}`}
                    className="block rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-violet-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="mb-1 font-medium text-slate-900 dark:text-white">{article.title}</h4>
                        <p className="mb-2 text-sm text-slate-500">{article.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.readTime} min read</span>
                          <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {article.helpful}% helpful</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Need More Help?</h3>
                <div className="space-y-3">
                  <a href="#" className="flex items-center gap-3 rounded-lg p-3 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
                    <MessageCircle className="h-5 w-5 text-violet-500" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Live Chat</p>
                      <p className="text-xs text-slate-500">Available 9am-6pm EST</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-3 rounded-lg p-3 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
                    <Mail className="h-5 w-5 text-violet-500" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Email Support</p>
                      <p className="text-xs text-slate-500">support@bookfactory.ai</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-3 rounded-lg p-3 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
                    <Globe className="h-5 w-5 text-violet-500" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Community Forum</p>
                      <p className="text-xs text-slate-500">Join discussions</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <div key={video.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="relative aspect-video bg-gradient-to-br from-violet-500 to-indigo-600">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm transition-transform group-hover:scale-110">
                      <Play className="h-8 w-8 text-white" fill="white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-slate-900 dark:text-white">{video.title}</h4>
                  <p className="mt-1 text-sm text-slate-500 capitalize">{video.category.replace('-', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="mx-auto max-w-3xl">
            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium text-slate-900 dark:text-white">{faq.question}</span>
                    <ChevronDown className={cn('h-5 w-5 text-slate-400 transition-transform', expandedFaq === faq.id && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {expandedFaq === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-slate-100 px-4 pb-4 pt-3 dark:border-slate-800">
                          <p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>
                          <div className="mt-4 flex items-center gap-4">
                            <span className="text-sm text-slate-500">Was this helpful?</span>
                            <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600">
                              <ThumbsUp className="h-4 w-4" /> Yes
                            </button>
                            <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-600">
                              <ThumbsDown className="h-4 w-4" /> No
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
