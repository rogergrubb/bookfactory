'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  BookOpen, BarChart3, Users, Megaphone, DollarSign,
  Settings, HelpCircle, Layers, Upload, Palette, Menu, X,
  ChevronLeft, Sparkles, Bell, Search, Moon, Sun, Plus, Command
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Books', href: '/books', icon: BookOpen },
  { name: 'Series', href: '/series', icon: Layers },
  { name: 'Covers', href: '/covers', icon: Palette },
  { name: 'Publish', href: '/publish', icon: Upload },
  { name: 'Marketing', href: '/marketing', icon: Megaphone },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Collaborators', href: '/collaborators', icon: Users },
  { name: 'Finances', href: '/finances', icon: DollarSign },
];

const bottomNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-stone-100 dark:bg-stone-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white transition-all duration-200 ease-out dark:bg-stone-900 lg:static',
          sidebarCollapsed ? 'w-[72px]' : 'w-60',
          sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0',
          'border-r border-stone-200 dark:border-stone-800'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex h-14 items-center border-b border-stone-100 dark:border-stone-800',
          sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        )}>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 dark:bg-white">
              <BookOpen className="h-4 w-4 text-white dark:text-stone-900" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-stone-900 dark:text-white">BookFactory</span>
            )}
          </Link>
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="hidden rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 lg:block dark:hover:bg-stone-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="rounded-md p-1 text-stone-400 hover:bg-stone-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Expand button when collapsed */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="mx-auto mt-3 hidden rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 lg:block dark:hover:bg-stone-800"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </button>
        )}

        {/* New Book Button */}
        <div className={cn('p-3', sidebarCollapsed && 'px-2')}>
          <Link
            href="/books/new"
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg bg-stone-900 font-medium text-white transition hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100',
              sidebarCollapsed ? 'h-10 w-10 mx-auto' : 'px-4 py-2.5'
            )}
          >
            <Plus className="h-4 w-4" />
            {!sidebarCollapsed && <span className="text-sm">New Book</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/books' && pathname.startsWith(item.href));
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-white'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/50 dark:hover:text-white',
                      sidebarCollapsed && 'justify-center px-2'
                    )}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-stone-900 dark:text-white')} />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-stone-100 p-3 dark:border-stone-800">
          <ul className="space-y-1">
            {bottomNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-white'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/50',
                      sidebarCollapsed && 'justify-center px-2'
                    )}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* AI Credits */}
        {!sidebarCollapsed && (
          <div className="border-t border-stone-100 p-3 dark:border-stone-800">
            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">450 AI credits</span>
              </div>
              <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-500/80">Resets in 12 days</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-stone-200 bg-white/80 px-4 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/80">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 lg:hidden dark:hover:bg-stone-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Search */}
            <div className={cn(
              'relative hidden transition-all sm:block',
              searchFocused ? 'w-80' : 'w-64'
            )}>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search books, chapters..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pl-9 pr-12 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-300 focus:bg-white focus:ring-2 focus:ring-stone-900/5 dark:border-stone-700 dark:bg-stone-800 dark:focus:border-stone-600"
              />
              <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-stone-400 sm:flex dark:border-stone-700 dark:bg-stone-800">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-300">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500" />
            </button>
            
            {/* Dark mode toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-300"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {/* User */}
            <div className="ml-1 border-l border-stone-200 pl-3 dark:border-stone-700">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
