
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone, Mail, Share2, Calendar, Target, TrendingUp, Plus,
  Send, Twitter, Facebook, Instagram, Linkedin, Users, FileText,
  Sparkles, Clock, CheckCircle, AlertCircle, BarChart3, Eye, Edit,
  Trash2, Copy, ExternalLink, Gift, Star, BookOpen
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { ProgressBar, Badge } from '@/components/ui/feedback';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'ads';
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  startDate: string;
  endDate?: string;
  reach: number;
  clicks: number;
  conversions: number;
}

interface SocialPost {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin';
  content: string;
  scheduledFor: string;
  status: 'draft' | 'scheduled' | 'published';
  engagement?: number;
}

const mockCampaigns: Campaign[] = [
  { id: '1', name: 'Launch Week Promo', type: 'email', status: 'active', startDate: '2024-03-01', reach: 2500, clicks: 450, conversions: 45 },
  { id: '2', name: 'Facebook Book Ads', type: 'ads', status: 'active', startDate: '2024-03-05', endDate: '2024-03-20', reach: 15000, clicks: 890, conversions: 32 },
  { id: '3', name: 'Newsletter Blast', type: 'email', status: 'scheduled', startDate: '2024-03-15', reach: 0, clicks: 0, conversions: 0 },
];

const mockPosts: SocialPost[] = [
  { id: '1', platform: 'twitter', content: '🚀 Excited to announce my new book "The Last Horizon" is now available!', scheduledFor: '2024-03-10T10:00:00', status: 'scheduled' },
  { id: '2', platform: 'instagram', content: 'Behind the scenes of my writing process...', scheduledFor: '2024-03-11T14:00:00', status: 'scheduled' },
  { id: '3', platform: 'facebook', content: 'Thank you to everyone who supported the launch!', scheduledFor: '2024-03-08T09:00:00', status: 'published', engagement: 234 },
];

const launchChecklist = [
  { id: '1', task: 'Finalize book description and keywords', completed: true },
  { id: '2', task: 'Set up pre-order pages', completed: true },
  { id: '3', task: 'Prepare email announcement', completed: true },
  { id: '4', task: 'Schedule social media posts', completed: false },
  { id: '5', task: 'Contact book bloggers for reviews', completed: false },
  { id: '6', task: 'Set up Amazon A+ content', completed: false },
  { id: '7', task: 'Create promotional graphics', completed: false },
  { id: '8', task: 'Plan launch day activities', completed: false },
];

const platformIcons = { twitter: Twitter, facebook: Facebook, instagram: Instagram, linkedin: Linkedin };
const statusColors = {
  draft: 'bg-slate-100 text-slate-700',
  scheduled: 'bg-blue-100 text-blue-700',
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-violet-100 text-violet-700',
  published: 'bg-emerald-100 text-emerald-700',
};

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'social' | 'email' | 'checklist'>('overview');
  const [checklist, setChecklist] = useState(launchChecklist);

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const completedTasks = checklist.filter(t => t.completed).length;
  const totalTasks = checklist.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Marketing</h1>
            <p className="mt-1 text-slate-500">Promote your books and grow your audience</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Sparkles className="h-4 w-4" /> AI Generate
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 font-medium text-white shadow-lg">
              <Plus className="h-4 w-4" /> New Campaign
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
            { id: 'social', label: 'Social Media', icon: Share2 },
            { id: 'email', label: 'Email Lists', icon: Mail },
            { id: 'checklist', label: 'Launch Checklist', icon: CheckCircle },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all',
              activeTab === tab.id ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400' : 'text-slate-500 hover:text-slate-700'
            )}>
              <tab.icon className="h-4 w-4" /> <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600"><Users className="h-5 w-5" /></div>
                  <span className="flex items-center gap-1 text-sm text-emerald-600"><TrendingUp className="h-4 w-4" />12%</span>
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">2,847</p>
                <p className="text-sm text-slate-500">Email Subscribers</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600"><Share2 className="h-5 w-5" /></div>
                  <span className="flex items-center gap-1 text-sm text-emerald-600"><TrendingUp className="h-4 w-4" />8%</span>
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">5,234</p>
                <p className="text-sm text-slate-500">Social Followers</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600"><Target className="h-5 w-5" /></div>
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">18.5%</p>
                <p className="text-sm text-slate-500">Email Open Rate</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600"><Star className="h-5 w-5" /></div>
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">4.6</p>
                <p className="text-sm text-slate-500">Average Rating</p>
              </div>
            </div>

            {/* Active Campaigns */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Active Campaigns</h2>
                <button className="text-sm text-violet-600 hover:text-violet-700">View All</button>
              </div>
              <div className="space-y-3">
                {mockCampaigns.filter(c => c.status === 'active').map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className={cn('rounded-lg p-2', campaign.type === 'email' ? 'bg-violet-100 text-violet-600' : campaign.type === 'ads' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600')}>
                        {campaign.type === 'email' ? <Mail className="h-5 w-5" /> : campaign.type === 'ads' ? <Target className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">{campaign.name}</h3>
                        <p className="text-sm text-slate-500">Started {new Date(campaign.startDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center"><p className="font-medium text-slate-900 dark:text-white">{campaign.reach.toLocaleString()}</p><p className="text-slate-500">Reach</p></div>
                      <div className="text-center"><p className="font-medium text-slate-900 dark:text-white">{campaign.clicks}</p><p className="text-slate-500">Clicks</p></div>
                      <div className="text-center"><p className="font-medium text-emerald-600">{campaign.conversions}</p><p className="text-slate-500">Sales</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Checklist Preview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Launch Checklist</h2>
                  <p className="text-sm text-slate-500">{completedTasks} of {totalTasks} tasks completed</p>
                </div>
                <button onClick={() => setActiveTab('checklist')} className="text-sm text-violet-600 hover:text-violet-700">View All</button>
              </div>
              <ProgressBar value={(completedTasks / totalTasks) * 100} color="emerald" />
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">All Campaigns</h2>
                <button className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> New Campaign</button>
              </div>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {mockCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn('rounded-lg p-2', campaign.type === 'email' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600')}>
                      {campaign.type === 'email' ? <Mail className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">{campaign.name}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusColors[campaign.status])}>{campaign.status}</span>
                        <span className="text-sm text-slate-500">{new Date(campaign.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Eye className="h-4 w-4" /></button>
                    <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Edit className="h-4 w-4" /></button>
                    <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="flex gap-3">
              {[
                { platform: 'twitter', icon: Twitter, color: 'bg-sky-500' },
                { platform: 'facebook', icon: Facebook, color: 'bg-blue-600' },
                { platform: 'instagram', icon: Instagram, color: 'bg-pink-500' },
                { platform: 'linkedin', icon: Linkedin, color: 'bg-blue-700' },
              ].map(({ platform, icon: Icon, color }) => (
                <button key={platform} className={cn('flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white', color)}>
                  <Icon className="h-4 w-4" /> Connect {platform}
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Scheduled Posts</h2>
                  <button className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> Schedule Post</button>
                </div>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {mockPosts.map((post) => {
                  const Icon = platformIcons[post.platform];
                  return (
                    <div key={post.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn('rounded-lg p-2', post.platform === 'twitter' ? 'bg-sky-100 text-sky-600' : post.platform === 'facebook' ? 'bg-blue-100 text-blue-600' : post.platform === 'instagram' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-700')}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-900 dark:text-white">{post.content}</p>
                          <div className="mt-2 flex items-center gap-3 text-sm">
                            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusColors[post.status])}>{post.status}</span>
                            <span className="flex items-center gap-1 text-slate-500"><Clock className="h-3 w-3" /> {new Date(post.scheduledFor).toLocaleString()}</span>
                            {post.engagement && <span className="text-emerald-600">{post.engagement} engagements</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><Edit className="h-4 w-4" /></button>
                          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Email Lists Tab */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-medium text-slate-900 dark:text-white">Main Newsletter</h3>
                <p className="mt-2 text-3xl font-bold text-violet-600">2,847</p>
                <p className="text-sm text-slate-500">subscribers</p>
                <button className="mt-4 w-full rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700">Send Email</button>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-medium text-slate-900 dark:text-white">ARC Readers</h3>
                <p className="mt-2 text-3xl font-bold text-violet-600">156</p>
                <p className="text-sm text-slate-500">subscribers</p>
                <button className="mt-4 w-full rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700">Send Email</button>
              </div>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Plus className="h-8 w-8 text-slate-400" />
                  <p className="mt-2 font-medium text-slate-600 dark:text-slate-400">Create New List</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Launch Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Book Launch Checklist</h2>
              <p className="mt-1 text-slate-500">{completedTasks} of {totalTasks} tasks completed</p>
              <div className="mt-3">
                <ProgressBar value={(completedTasks / totalTasks) * 100} color="emerald" showLabel />
              </div>
            </div>
            <div className="space-y-2">
              {checklist.map((item) => (
                <button key={item.id} onClick={() => toggleChecklistItem(item.id)} className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all',
                  item.completed ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                )}>
                  <div className={cn('flex h-6 w-6 items-center justify-center rounded-full border-2', item.completed ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300')}>
                    {item.completed && <Check className="h-4 w-4 text-white" />}
                  </div>
                  <span className={cn('flex-1', item.completed ? 'text-emerald-700 line-through dark:text-emerald-400' : 'text-slate-900 dark:text-white')}>{item.task}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>;
}
