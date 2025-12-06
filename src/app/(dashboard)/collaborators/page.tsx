
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Mail, MessageSquare, Eye, Edit, Shield, Clock,
  Check, X, Send, Star, FileText, AlertCircle, ChevronRight, Search,
  MoreHorizontal, Trash2, Copy, ExternalLink, Lock, Unlock, BookOpen
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { Badge, EmptyState } from '@/components/ui/feedback';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'coauthor' | 'editor' | 'beta_reader';
  status: 'active' | 'pending' | 'revoked';
  joinedAt: string;
  lastActive?: string;
  booksAccess: string[];
}

interface BetaFeedback {
  id: string;
  readerId: string;
  readerName: string;
  bookId: string;
  bookTitle: string;
  chapter?: number;
  type: 'general' | 'chapter' | 'inline';
  content: string;
  rating?: number;
  createdAt: string;
  status: 'new' | 'reviewed' | 'addressed';
}

interface InviteForm {
  email: string;
  role: 'coauthor' | 'editor' | 'beta_reader';
  books: string[];
  message: string;
}

const mockCollaborators: Collaborator[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'coauthor', status: 'active', joinedAt: '2024-01-15', lastActive: new Date(Date.now() - 3600000).toISOString(), booksAccess: ['1', '2'] },
  { id: '2', name: 'Mike Chen', email: 'mike@example.com', role: 'editor', status: 'active', joinedAt: '2024-02-01', lastActive: new Date(Date.now() - 86400000).toISOString(), booksAccess: ['1'] },
  { id: '3', name: 'Emily Davis', email: 'emily@example.com', role: 'beta_reader', status: 'pending', joinedAt: '2024-03-05', booksAccess: ['1'] },
  { id: '4', name: 'Alex Turner', email: 'alex@example.com', role: 'beta_reader', status: 'active', joinedAt: '2024-02-20', lastActive: new Date(Date.now() - 172800000).toISOString(), booksAccess: ['1', '3'] },
];

const mockFeedback: BetaFeedback[] = [
  { id: '1', readerId: '4', readerName: 'Alex Turner', bookId: '1', bookTitle: 'The Last Horizon', chapter: 5, type: 'chapter', content: 'The pacing in this chapter feels a bit rushed. Consider expanding the dialogue between the two main characters to build more tension.', rating: 4, createdAt: new Date(Date.now() - 86400000).toISOString(), status: 'new' },
  { id: '2', readerId: '4', readerName: 'Alex Turner', bookId: '1', bookTitle: 'The Last Horizon', type: 'general', content: 'Overall, I love the world-building! The setting is vivid and immersive. The ending of Part 1 was a great cliffhanger.', rating: 5, createdAt: new Date(Date.now() - 172800000).toISOString(), status: 'reviewed' },
  { id: '3', readerId: '3', readerName: 'Emily Davis', bookId: '1', bookTitle: 'The Last Horizon', chapter: 3, type: 'inline', content: 'This sentence is a bit confusing. Maybe rephrase for clarity?', createdAt: new Date(Date.now() - 259200000).toISOString(), status: 'addressed' },
];

const roleColors = {
  owner: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400',
  coauthor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400',
  editor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
  beta_reader: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
};

const roleLabels = { owner: 'Owner', coauthor: 'Co-Author', editor: 'Editor', beta_reader: 'Beta Reader' };
const statusColors = { active: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-100 text-amber-700', revoked: 'bg-red-100 text-red-700' };
const feedbackStatusColors = { new: 'bg-blue-100 text-blue-700', reviewed: 'bg-amber-100 text-amber-700', addressed: 'bg-emerald-100 text-emerald-700' };

export default function CollaboratorsPage() {
  const [activeTab, setActiveTab] = useState<'team' | 'feedback' | 'permissions'>('team');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<BetaFeedback | null>(null);

  const filteredCollaborators = mockCollaborators.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Collaboration</h1>
            <p className="mt-1 text-slate-500">Manage your team, beta readers, and feedback</p>
          </div>
          <button onClick={() => setShowInviteModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 font-medium text-white shadow-lg">
            <UserPlus className="h-4 w-4" /> Invite Collaborator
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600"><Users className="h-5 w-5" /></div>
              <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{mockCollaborators.filter(c => c.status === 'active').length}</p><p className="text-sm text-slate-500">Active Members</p></div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600"><Clock className="h-5 w-5" /></div>
              <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{mockCollaborators.filter(c => c.status === 'pending').length}</p><p className="text-sm text-slate-500">Pending Invites</p></div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600"><MessageSquare className="h-5 w-5" /></div>
              <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{mockFeedback.filter(f => f.status === 'new').length}</p><p className="text-sm text-slate-500">New Feedback</p></div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600"><Star className="h-5 w-5" /></div>
              <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{mockCollaborators.filter(c => c.role === 'beta_reader').length}</p><p className="text-sm text-slate-500">Beta Readers</p></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {[
            { id: 'team', label: 'Team Members', icon: Users },
            { id: 'feedback', label: 'Beta Feedback', icon: MessageSquare },
            { id: 'permissions', label: 'Permissions', icon: Shield },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all',
              activeTab === tab.id ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400' : 'text-slate-500 hover:text-slate-700'
            )}>
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search collaborators..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800" />
              </div>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredCollaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-medium text-white">
                      {collaborator.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900 dark:text-white">{collaborator.name}</h3>
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', roleColors[collaborator.role])}>{roleLabels[collaborator.role]}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusColors[collaborator.status])}>{collaborator.status}</span>
                      </div>
                      <p className="text-sm text-slate-500">{collaborator.email}</p>
                      {collaborator.lastActive && <p className="text-xs text-slate-400">Active {formatRelativeTime(new Date(collaborator.lastActive))}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip content="Send message"><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Mail className="h-4 w-4" /></button></Tooltip>
                    <Tooltip content="Edit permissions"><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Edit className="h-4 w-4" /></button></Tooltip>
                    <Tooltip content="Remove"><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-white">Recent Feedback</h2>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {mockFeedback.map((feedback) => (
                  <button key={feedback.id} onClick={() => setSelectedFeedback(feedback)} className={cn(
                    'w-full p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800',
                    selectedFeedback?.id === feedback.id && 'bg-violet-50 dark:bg-violet-950/30'
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{feedback.readerName}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', feedbackStatusColors[feedback.status])}>{feedback.status}</span>
                      </div>
                      {feedback.rating && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-3 w-3 fill-current" />{feedback.rating}
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{feedback.bookTitle}{feedback.chapter && ` • Chapter ${feedback.chapter}`}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{feedback.content}</p>
                    <p className="mt-2 text-xs text-slate-400">{formatRelativeTime(new Date(feedback.createdAt))}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Detail */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              {selectedFeedback ? (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-slate-900 dark:text-white">Feedback Details</h2>
                      <p className="text-sm text-slate-500">From {selectedFeedback.readerName}</p>
                    </div>
                    <span className={cn('rounded-full px-3 py-1 text-xs font-medium', feedbackStatusColors[selectedFeedback.status])}>{selectedFeedback.status}</span>
                  </div>
                  <div className="mb-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                    <p className="text-sm text-slate-500">Book: <span className="font-medium text-slate-900 dark:text-white">{selectedFeedback.bookTitle}</span></p>
                    {selectedFeedback.chapter && <p className="text-sm text-slate-500">Chapter: <span className="font-medium text-slate-900 dark:text-white">{selectedFeedback.chapter}</span></p>}
                    <p className="text-sm text-slate-500">Type: <span className="font-medium text-slate-900 dark:text-white capitalize">{selectedFeedback.type}</span></p>
                  </div>
                  <div className="mb-6">
                    <h3 className="mb-2 text-sm font-medium text-slate-900 dark:text-white">Feedback</h3>
                    <p className="text-slate-600 dark:text-slate-400">{selectedFeedback.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-medium text-white hover:bg-violet-700">Mark as Addressed</button>
                    <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">Reply</button>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <MessageSquare className="h-12 w-12 text-slate-300" />
                  <p className="mt-4 text-slate-500">Select feedback to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Role Permissions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 text-left text-sm font-medium text-slate-500">Permission</th>
                    <th className="py-3 text-center text-sm font-medium text-slate-500">Co-Author</th>
                    <th className="py-3 text-center text-sm font-medium text-slate-500">Editor</th>
                    <th className="py-3 text-center text-sm font-medium text-slate-500">Beta Reader</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {[
                    { name: 'View manuscript', coauthor: true, editor: true, beta: true },
                    { name: 'Edit content', coauthor: true, editor: true, beta: false },
                    { name: 'Add comments', coauthor: true, editor: true, beta: true },
                    { name: 'Delete content', coauthor: true, editor: false, beta: false },
                    { name: 'Manage chapters', coauthor: true, editor: false, beta: false },
                    { name: 'Export files', coauthor: true, editor: true, beta: false },
                    { name: 'Invite others', coauthor: true, editor: false, beta: false },
                    { name: 'View analytics', coauthor: true, editor: false, beta: false },
                  ].map((perm) => (
                    <tr key={perm.name}>
                      <td className="py-3 text-sm text-slate-900 dark:text-white">{perm.name}</td>
                      <td className="py-3 text-center">{perm.coauthor ? <Check className="mx-auto h-5 w-5 text-emerald-500" /> : <X className="mx-auto h-5 w-5 text-slate-300" />}</td>
                      <td className="py-3 text-center">{perm.editor ? <Check className="mx-auto h-5 w-5 text-emerald-500" /> : <X className="mx-auto h-5 w-5 text-slate-300" />}</td>
                      <td className="py-3 text-center">{perm.beta ? <Check className="mx-auto h-5 w-5 text-emerald-500" /> : <X className="mx-auto h-5 w-5 text-slate-300" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<InviteForm>({ email: '', role: 'beta_reader', books: [], message: '' });
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Invite Collaborator</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="collaborator@example.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as InviteForm['role'] })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800">
              <option value="coauthor">Co-Author</option>
              <option value="editor">Editor</option>
              <option value="beta_reader">Beta Reader</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Personal Message (optional)</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Add a personal message..." rows={3} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700">Cancel</button>
          <button className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700">Send Invitation</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
