
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Eye, ShoppingCart, Star,
  Calendar, Filter, Download, BookOpen, BarChart3, PieChart, Activity,
  Globe, Users, Target, ArrowUpRight, ArrowDownRight, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/feedback';

interface SalesData {
  date: string;
  sales: number;
  revenue: number;
  pageReads: number;
}

interface BookStats {
  id: string;
  title: string;
  sales: number;
  revenue: number;
  rating: number;
  reviews: number;
  trend: number;
}

const mockSalesData: SalesData[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
  sales: Math.floor(Math.random() * 50) + 10,
  revenue: Math.floor(Math.random() * 200) + 50,
  pageReads: Math.floor(Math.random() * 5000) + 1000,
}));

const mockBookStats: BookStats[] = [
  { id: '1', title: 'The Last Horizon', sales: 1247, revenue: 4988, rating: 4.6, reviews: 89, trend: 12 },
  { id: '2', title: 'Whispers in the Dark', sales: 856, revenue: 3424, rating: 4.4, reviews: 67, trend: -3 },
  { id: '3', title: 'The Garden of Dreams', sales: 634, revenue: 2536, rating: 4.8, reviews: 124, trend: 8 },
];

const platformData = [
  { name: 'Amazon KDP', sales: 1842, revenue: 7368, percentage: 67 },
  { name: 'Apple Books', sales: 456, revenue: 1824, percentage: 17 },
  { name: 'Kobo', sales: 289, revenue: 1156, percentage: 10 },
  { name: 'Others', sales: 150, revenue: 600, percentage: 6 },
];

const geoData = [
  { country: 'United States', sales: 1456, flag: '🇺🇸', percentage: 53 },
  { country: 'United Kingdom', sales: 423, flag: '🇬🇧', percentage: 15 },
  { country: 'Canada', sales: 312, flag: '🇨🇦', percentage: 11 },
  { country: 'Australia', sales: 234, flag: '🇦🇺', percentage: 9 },
  { country: 'Germany', sales: 189, flag: '🇩🇪', percentage: 7 },
  { country: 'Other', sales: 123, flag: '🌍', percentage: 5 },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [selectedBook, setSelectedBook] = useState<string>('all');

  const totalSales = mockSalesData.reduce((sum, d) => sum + d.sales, 0);
  const totalRevenue = mockSalesData.reduce((sum, d) => sum + d.revenue, 0);
  const totalPageReads = mockSalesData.reduce((sum, d) => sum + d.pageReads, 0);
  const avgRating = mockBookStats.reduce((sum, b) => sum + b.rating, 0) / mockBookStats.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
            <p className="mt-1 text-slate-500">Track your sales and reader engagement</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
              <option value="all">All Books</option>
              {mockBookStats.map(book => <option key={book.id} value={book.id}>{book.title}</option>)}
            </select>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={ShoppingCart} label="Total Sales" value={totalSales.toLocaleString()} trend={15} color="violet" subValue="units sold" />
          <MetricCard icon={DollarSign} label="Revenue" value={`$${totalRevenue.toLocaleString()}`} trend={12} color="emerald" subValue="total earnings" />
          <MetricCard icon={Eye} label="Page Reads" value={totalPageReads.toLocaleString()} trend={8} color="blue" subValue="Kindle Unlimited" />
          <MetricCard icon={Star} label="Avg Rating" value={avgRating.toFixed(1)} trend={2} color="amber" subValue={`${mockBookStats.reduce((s, b) => s + b.reviews, 0)} reviews`} />
        </div>

        {/* Charts Row */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* Sales Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Sales Over Time</h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-violet-500"></span>Sales</span>
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500"></span>Revenue</span>
              </div>
            </div>
            <div className="h-64">
              <SalesChart data={mockSalesData} />
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Sales by Platform</h2>
            <div className="space-y-4">
              {platformData.map((platform, index) => (
                <div key={platform.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{platform.name}</span>
                    <span className="font-medium text-slate-900 dark:text-white">{platform.percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${platform.percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={cn('h-full rounded-full', index === 0 ? 'bg-violet-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-emerald-500' : 'bg-amber-500')}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Books Performance & Geography */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Books Performance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Book Performance</h2>
            <div className="space-y-4">
              {mockBookStats.map((book) => (
                <div key={book.id} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="h-12 w-9 flex-shrink-0 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/50 dark:to-indigo-900/50" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-slate-900 dark:text-white">{book.title}</h3>
                    <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                      <span>{book.sales} sales</span>
                      <span>${book.revenue}</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{book.rating}</span>
                    </div>
                  </div>
                  <div className={cn('flex items-center gap-1 text-sm font-medium', book.trend > 0 ? 'text-emerald-600' : 'text-red-600')}>
                    {book.trend > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {Math.abs(book.trend)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Sales by Country</h2>
            <div className="space-y-3">
              {geoData.map((country, index) => (
                <div key={country.country} className="flex items-center gap-3">
                  <span className="text-xl">{country.flag}</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{country.country}</span>
                      <span className="font-medium text-slate-900 dark:text-white">{country.sales}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${country.percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full rounded-full bg-violet-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Conversion Funnel</h2>
          <div className="flex items-center justify-between gap-4">
            {[
              { label: 'Page Views', value: 45678, percentage: 100 },
              { label: 'Sample Downloads', value: 8234, percentage: 18 },
              { label: 'Add to Cart', value: 3456, percentage: 7.6 },
              { label: 'Purchases', value: 2737, percentage: 6 },
            ].map((step, index) => (
              <React.Fragment key={step.label}>
                <div className="flex-1 text-center">
                  <div className={cn('mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full', index === 0 ? 'bg-violet-100 text-violet-600' : index === 1 ? 'bg-blue-100 text-blue-600' : index === 2 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600')}>
                    <span className="text-lg font-bold">{step.percentage}%</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{step.value.toLocaleString()}</p>
                  <p className="text-sm text-slate-500">{step.label}</p>
                </div>
                {index < 3 && <div className="h-0.5 w-12 bg-slate-200 dark:bg-slate-700" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, trend, color, subValue }: { icon: React.ElementType; label: string; value: string; trend: number; color: 'violet' | 'emerald' | 'blue' | 'amber'; subValue: string }) {
  const colorClasses = { violet: 'bg-violet-100 text-violet-600', emerald: 'bg-emerald-100 text-emerald-600', blue: 'bg-blue-100 text-blue-600', amber: 'bg-amber-100 text-amber-600' };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className={cn('rounded-xl p-2.5', colorClasses[color])}><Icon className="h-5 w-5" /></div>
        <div className={cn('flex items-center gap-1 text-sm', trend > 0 ? 'text-emerald-600' : 'text-red-600')}>
          {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}{Math.abs(trend)}%
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xs text-slate-400">{subValue}</p>
    </div>
  );
}

function SalesChart({ data }: { data: SalesData[] }) {
  const maxSales = Math.max(...data.map(d => d.sales));
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div className="flex h-full items-end gap-1">
      {data.map((d, i) => (
        <div key={i} className="group relative flex-1">
          <div className="absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
            {d.sales} sales<br/>${d.revenue}
          </div>
          <div className="relative h-full">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.sales / maxSales) * 100}%` }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className="absolute bottom-0 w-full rounded-t bg-violet-500/80"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
