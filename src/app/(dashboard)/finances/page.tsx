
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, Receipt, FileText,
  Download, Plus, Filter, Calendar, PieChart, BarChart3, ArrowUpRight,
  ArrowDownRight, Building, ShoppingCart, Minus, Edit, Trash2, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/feedback';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  platform?: string;
  bookId?: string;
  bookTitle?: string;
}

interface RoyaltyPayment {
  id: string;
  platform: string;
  amount: number;
  period: string;
  status: 'pending' | 'paid' | 'processing';
  paidAt?: string;
}

const mockTransactions: Transaction[] = [
  { id: '1', type: 'income', category: 'Royalties', description: 'Amazon KDP - March 2024', amount: 1245.67, date: '2024-03-15', platform: 'Amazon KDP' },
  { id: '2', type: 'income', category: 'Royalties', description: 'Apple Books - March 2024', amount: 342.50, date: '2024-03-10', platform: 'Apple Books' },
  { id: '3', type: 'expense', category: 'Editing', description: 'Professional editing - The Last Horizon', amount: -850.00, date: '2024-03-05', bookId: '1', bookTitle: 'The Last Horizon' },
  { id: '4', type: 'expense', category: 'Cover Design', description: 'Book cover design', amount: -350.00, date: '2024-03-01', bookId: '1', bookTitle: 'The Last Horizon' },
  { id: '5', type: 'income', category: 'Royalties', description: 'Kobo - February 2024', amount: 156.89, date: '2024-02-28', platform: 'Kobo' },
  { id: '6', type: 'expense', category: 'Marketing', description: 'Facebook Ads Campaign', amount: -200.00, date: '2024-02-25' },
  { id: '7', type: 'expense', category: 'Tools', description: 'BookFactory AI Pro - Monthly', amount: -49.00, date: '2024-02-20' },
];

const mockRoyalties: RoyaltyPayment[] = [
  { id: '1', platform: 'Amazon KDP', amount: 1567.89, period: 'March 2024', status: 'pending' },
  { id: '2', platform: 'Apple Books', amount: 423.45, period: 'March 2024', status: 'processing' },
  { id: '3', platform: 'Kobo', amount: 187.32, period: 'February 2024', status: 'paid', paidAt: '2024-03-01' },
  { id: '4', platform: 'IngramSpark', amount: 312.67, period: 'February 2024', status: 'paid', paidAt: '2024-03-05' },
];

const expenseCategories = [
  { name: 'Editing', amount: 2450, percentage: 35, color: 'bg-violet-500' },
  { name: 'Cover Design', amount: 1200, percentage: 17, color: 'bg-blue-500' },
  { name: 'Marketing', amount: 1850, percentage: 26, color: 'bg-emerald-500' },
  { name: 'Tools & Software', amount: 588, percentage: 8, color: 'bg-amber-500' },
  { name: 'Other', amount: 912, percentage: 13, color: 'bg-slate-500' },
];

const statusColors = { pending: 'bg-amber-100 text-amber-700', processing: 'bg-blue-100 text-blue-700', paid: 'bg-emerald-100 text-emerald-700' };

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'royalties' | 'taxes'>('overview');
  const [dateRange, setDateRange] = useState('year');
  const [showAddExpense, setShowAddExpense] = useState(false);

  const totalIncome = mockTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = Math.abs(mockTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
  const netProfit = totalIncome - totalExpenses;
  const pendingRoyalties = mockRoyalties.filter(r => r.status !== 'paid').reduce((s, r) => s + r.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Finances</h1>
            <p className="mt-1 text-slate-500">Track royalties, expenses, and profit</p>
          </div>
          <div className="flex gap-3">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
            <button onClick={() => setShowAddExpense(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 font-medium text-white shadow-lg">
              <Plus className="h-4 w-4" /> Add Expense
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600"><TrendingUp className="h-5 w-5" /></div>
              <span className="flex items-center gap-1 text-sm text-emerald-600"><ArrowUpRight className="h-4 w-4" />18%</span>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">${totalIncome.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Total Income</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-red-100 p-2.5 text-red-600"><TrendingDown className="h-5 w-5" /></div>
              <span className="flex items-center gap-1 text-sm text-red-600"><ArrowDownRight className="h-4 w-4" />5%</span>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">${totalExpenses.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Total Expenses</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600"><DollarSign className="h-5 w-5" /></div>
            </div>
            <p className={cn('mt-4 text-2xl font-bold', netProfit >= 0 ? 'text-emerald-600' : 'text-red-600')}>${netProfit.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Net Profit</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600"><CreditCard className="h-5 w-5" /></div>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">${pendingRoyalties.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Pending Royalties</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {[
            { id: 'overview', label: 'Overview', icon: PieChart },
            { id: 'transactions', label: 'Transactions', icon: Receipt },
            { id: 'royalties', label: 'Royalties', icon: DollarSign },
            { id: 'taxes', label: 'Tax Prep', icon: FileText },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all',
              activeTab === tab.id ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50' : 'text-slate-500 hover:text-slate-700'
            )}>
              <tab.icon className="h-4 w-4" /> <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Income vs Expenses Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Income vs Expenses</h2>
              <div className="flex h-48 items-end gap-4">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
                  const income = 800 + Math.random() * 800;
                  const expense = 200 + Math.random() * 400;
                  return (
                    <div key={month} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex w-full gap-1" style={{ height: '160px' }}>
                        <motion.div initial={{ height: 0 }} animate={{ height: `${(income / 1600) * 100}%` }} className="flex-1 rounded-t bg-emerald-500" />
                        <motion.div initial={{ height: 0 }} animate={{ height: `${(expense / 1600) * 100}%` }} className="flex-1 rounded-t bg-red-400" />
                      </div>
                      <span className="text-xs text-slate-500">{month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-center gap-6 text-sm">
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500"></span>Income</span>
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-400"></span>Expenses</span>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Expense Breakdown</h2>
              <div className="space-y-4">
                {expenseCategories.map((cat, index) => (
                  <div key={cat.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{cat.name}</span>
                      <span className="font-medium text-slate-900 dark:text-white">${cat.amount}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${cat.percentage}%` }} transition={{ duration: 0.5, delay: index * 0.1 }} className={cn('h-full rounded-full', cat.color)} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-sm text-slate-500">Total Expenses</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">${expenseCategories.reduce((s, c) => s + c.amount, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 dark:text-white">All Transactions</h2>
                <button className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"><Download className="h-4 w-4" /> Export CSV</button>
              </div>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {mockTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn('rounded-xl p-2.5', tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600')}>
                      {tx.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">{tx.description}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">{tx.category}</span>
                        <span>{new Date(tx.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-lg font-semibold', tx.type === 'income' ? 'text-emerald-600' : 'text-red-600')}>
                      {tx.type === 'income' ? '+' : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    {tx.platform && <p className="text-sm text-slate-500">{tx.platform}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Royalties Tab */}
        {activeTab === 'royalties' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {['Amazon KDP', 'Apple Books', 'Kobo', 'IngramSpark'].map((platform) => {
                const royalty = mockRoyalties.find(r => r.platform === platform);
                return (
                  <div key={platform} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600"><Building className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm text-slate-500">{platform}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">${royalty?.amount.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                    {royalty && <span className={cn('mt-3 inline-block rounded-full px-2 py-0.5 text-xs font-medium', statusColors[royalty.status])}>{royalty.status}</span>}
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-white">Payment History</h2>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {mockRoyalties.map((royalty) => (
                  <div key={royalty.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600"><Building className="h-5 w-5" /></div>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">{royalty.platform}</h3>
                        <p className="text-sm text-slate-500">{royalty.period}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn('rounded-full px-3 py-1 text-xs font-medium', statusColors[royalty.status])}>{royalty.status}</span>
                      <p className="text-lg font-semibold text-emerald-600">${royalty.amount.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Taxes Tab */}
        {activeTab === 'taxes' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600"><FileText className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-semibold text-amber-800 dark:text-amber-400">Tax Season Reminder</h3>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">Remember to set aside approximately 25-30% of your royalty income for taxes. Consult with a tax professional for personalized advice.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Tax Summary (2024)</h2>
                <div className="space-y-4">
                  <div className="flex justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Gross Income</span>
                    <span className="font-semibold text-slate-900 dark:text-white">${totalIncome.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Deductible Expenses</span>
                    <span className="font-semibold text-red-600">-${totalExpenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-violet-50 p-4 dark:bg-violet-950/30">
                    <span className="font-medium text-violet-700 dark:text-violet-400">Taxable Income</span>
                    <span className="font-bold text-violet-700 dark:text-violet-400">${netProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
                    <span className="text-amber-700 dark:text-amber-400">Estimated Tax (25%)</span>
                    <span className="font-semibold text-amber-700 dark:text-amber-400">${(netProfit * 0.25).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Export Documents</h2>
                <div className="space-y-3">
                  {[
                    { name: 'Income Statement', desc: 'Complete income breakdown' },
                    { name: 'Expense Report', desc: 'All deductible expenses' },
                    { name: 'Platform 1099s', desc: 'Forms from each platform' },
                    { name: 'Tax Summary', desc: 'Overview for your accountant' },
                  ].map((doc) => (
                    <button key={doc.name} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{doc.name}</p>
                          <p className="text-sm text-slate-500">{doc.desc}</p>
                        </div>
                      </div>
                      <Download className="h-5 w-5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
