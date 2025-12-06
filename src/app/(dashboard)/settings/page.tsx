
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Bell, CreditCard, Shield, Link2, Palette, Globe, Download,
  Key, Trash2, Save, Check, AlertCircle, ChevronRight, Mail, Smartphone,
  Moon, Sun, Monitor, Volume2, VolumeX, Eye, EyeOff, Lock, Unlock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
}

const mockUser = {
  name: 'Jane Author',
  email: 'jane@example.com',
  avatar: null,
  plan: 'Professional',
  aiCredits: 847,
  joinedAt: '2024-01-15',
};

const notificationSettings: NotificationSetting[] = [
  { id: 'writing', label: 'Writing Reminders', description: 'Daily writing goal reminders', email: true, push: true },
  { id: 'collaborator', label: 'Collaborator Activity', description: 'When someone comments or edits', email: true, push: true },
  { id: 'sales', label: 'Sales Reports', description: 'Weekly sales summary', email: true, push: false },
  { id: 'marketing', label: 'Marketing Tips', description: 'Promotional opportunities', email: false, push: false },
  { id: 'product', label: 'Product Updates', description: 'New features and improvements', email: true, push: false },
];

const connectedAccounts = [
  { id: 'amazon', name: 'Amazon KDP', connected: true, icon: '📚' },
  { id: 'apple', name: 'Apple Books', connected: false, icon: '🍎' },
  { id: 'google', name: 'Google Drive', connected: true, icon: '📁' },
  { id: 'dropbox', name: 'Dropbox', connected: false, icon: '📦' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState(notificationSettings);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [profile, setProfile] = useState({
    name: mockUser.name,
    email: mockUser.email,
    bio: 'Science fiction author with a passion for space operas.',
    website: 'https://janeauthor.com',
    twitter: '@janeauthor',
  });
  const [preferences, setPreferences] = useState({
    autoSave: true,
    autoSaveInterval: 30,
    spellCheck: true,
    wordCountGoal: 1000,
    focusSounds: false,
    showWordCount: true,
    typewriterMode: false,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'connections', label: 'Connections', icon: Link2 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Privacy', icon: Download },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const toggleNotification = (id: string, type: 'email' | 'push') => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, [type]: !n[type] } : n
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-slate-500">Manage your account and preferences</p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1">
            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Profile Information</h2>
                  
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-bold text-white">
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <button className="rounded-xl bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-200">
                        Change Avatar
                      </button>
                      <p className="mt-1 text-xs text-slate-500">JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Website</label>
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Twitter</label>
                      <input
                        type="text"
                        value={profile.twitter}
                        onChange={(e) => setProfile(prev => ({ ...prev, twitter: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 font-medium text-white shadow-lg"
                >
                  {isSaving ? <Save className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Notification Preferences</h2>
                <div className="space-y-4">
                  {notifications.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">{setting.label}</h3>
                        <p className="text-sm text-slate-500">{setting.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={setting.email}
                            onChange={() => toggleNotification(setting.id, 'email')}
                            className="h-4 w-4 rounded border-slate-300 text-violet-600"
                          />
                          <Mail className="h-4 w-4 text-slate-400" />
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={setting.push}
                            onChange={() => toggleNotification(setting.id, 'push')}
                            className="h-4 w-4 rounded border-slate-300 text-violet-600"
                          />
                          <Smartphone className="h-4 w-4 text-slate-400" />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Billing */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Current Plan</h2>
                  <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 p-6 text-white">
                    <div>
                      <p className="text-sm opacity-80">Your Plan</p>
                      <p className="text-2xl font-bold">{mockUser.plan}</p>
                      <p className="mt-1 text-sm opacity-80">$49/month • Renews Jan 15, 2025</p>
                    </div>
                    <button className="rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm hover:bg-white/30">
                      Manage Plan
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">AI Credits</h2>
                  <div className="flex items-center gap-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50">
                      <span className="text-2xl font-bold text-violet-600">{mockUser.aiCredits}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Credits Remaining</p>
                      <p className="text-sm text-slate-500">Resets monthly with your plan</p>
                      <button className="mt-2 text-sm font-medium text-violet-600 hover:text-violet-700">Buy More Credits</button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Payment Method</h2>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                        <CreditCard className="h-6 w-6 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">•••• •••• •••• 4242</p>
                        <p className="text-sm text-slate-500">Expires 12/25</p>
                      </div>
                    </div>
                    <button className="text-sm font-medium text-violet-600 hover:text-violet-700">Update</button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Appearance</h2>
                  <div className="flex gap-3">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Monitor },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setTheme(option.id as typeof theme)}
                        className={cn(
                          'flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                          theme === option.id ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/30' : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        <option.icon className={cn('h-6 w-6', theme === option.id ? 'text-violet-600' : 'text-slate-400')} />
                        <span className={cn('text-sm font-medium', theme === option.id ? 'text-violet-600' : 'text-slate-600')}>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Writing Preferences</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'autoSave', label: 'Auto-save', description: 'Automatically save your work' },
                      { key: 'spellCheck', label: 'Spell check', description: 'Highlight spelling errors' },
                      { key: 'showWordCount', label: 'Show word count', description: 'Display word count in editor' },
                      { key: 'typewriterMode', label: 'Typewriter mode', description: 'Keep cursor centered while typing' },
                      { key: 'focusSounds', label: 'Focus sounds', description: 'Play ambient sounds while writing' },
                    ].map((pref) => (
                      <div key={pref.key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{pref.label}</p>
                          <p className="text-sm text-slate-500">{pref.description}</p>
                        </div>
                        <button
                          onClick={() => setPreferences(prev => ({ ...prev, [pref.key]: !prev[pref.key as keyof typeof prev] }))}
                          className={cn(
                            'relative h-6 w-11 rounded-full transition-colors',
                            preferences[pref.key as keyof typeof preferences] ? 'bg-violet-600' : 'bg-slate-200'
                          )}
                        >
                          <span className={cn(
                            'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                            preferences[pref.key as keyof typeof preferences] && 'translate-x-5'
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Daily Writing Goal</h2>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="100"
                      value={preferences.wordCountGoal}
                      onChange={(e) => setPreferences(prev => ({ ...prev, wordCountGoal: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="w-24 text-right font-medium text-slate-900 dark:text-white">{preferences.wordCountGoal} words</span>
                  </div>
                </div>
              </div>
            )}

            {/* Connections */}
            {activeTab === 'connections' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Connected Accounts</h2>
                <div className="space-y-3">
                  {connectedAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{account.icon}</span>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{account.name}</p>
                          <p className="text-sm text-slate-500">{account.connected ? 'Connected' : 'Not connected'}</p>
                        </div>
                      </div>
                      <button className={cn(
                        'rounded-xl px-4 py-2 text-sm font-medium',
                        account.connected
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                      )}>
                        {account.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Password</h2>
                  <button className="rounded-xl bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-200">
                    Change Password
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Two-Factor Authentication</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">2FA is disabled</p>
                      <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                    </div>
                    <button className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
                      Enable 2FA
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Active Sessions</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Chrome on macOS</p>
                        <p className="text-sm text-slate-500">Current session • San Francisco, CA</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data & Privacy */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Export Your Data</h2>
                  <p className="mb-4 text-slate-600 dark:text-slate-400">Download a copy of all your books, chapters, and account data.</p>
                  <button className="inline-flex items-center gap-2 rounded-xl bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-200">
                    <Download className="h-4 w-4" /> Request Data Export
                  </button>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
                  <h2 className="mb-4 text-lg font-semibold text-red-700 dark:text-red-400">Danger Zone</h2>
                  <p className="mb-4 text-red-600 dark:text-red-400">Once you delete your account, there is no going back. Please be certain.</p>
                  <button className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                    <Trash2 className="h-4 w-4" /> Delete Account
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
