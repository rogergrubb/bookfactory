'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

interface SeriesDashboardProps {
  seriesId?: string;
}

export function SeriesDashboard({ seriesId }: SeriesDashboardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-violet-600" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Series Dashboard
        </h2>
      </div>
      <p className="mt-2 text-slate-500">
        {seriesId ? `Managing series: ${seriesId}` : 'Select a series to manage'}
      </p>
    </div>
  );
}

export default SeriesDashboard;
