'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { 
  BookOpen, FolderOpen, PenTool, BarChart3, Settings, 
  ChevronLeft, ChevronRight, Sparkles, Users, Map, 
  Clock, Target, Flame, HelpCircle, GitBranch, Shield,
  Scroll, Menu, X, Bell, Search, Command
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface NavItem {
  id: string;
  label: string;
  icon: typeof BookOpen;
  href: string;
  badge?: string | number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// ============================================================================
// BOOKFACTORY LOGO
// ============================================================================

function BookFactoryLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <Link href="/dashboard" className={`
      flex items-center gap-3 px-3 py-2 rounded-xl
      transition-all duration-300 hover:bg-stone-100 dark:hover:bg-stone-800
      ${collapsed ? 'justify-center' : ''}
    `}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
        <BookOpen className="w-5 h-5 text-white" />
      </div>
      {!collapsed && (
        <div className="overflow-hidden">
          <span className="font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            BookFactory
          </span>
        </div>
      )}
    </Link>
  );
}

// ============================================================================
// MAIN LAYOUT
// ============================================================================

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mock data - replace with real data from API
  const writingStreak = 7;
  const dailyProgress = 65; // percentage
  const dailyGoal = 2000;
  const wordsToday = 1300;
  
  // Main navigation items
  const mainNav: NavItem[] = [
    { id: 'studio', label: 'AI Studio', icon: Sparkles, href: '/dashboard/ai-studio' },
    { id: 'books', label: 'My Books', icon: FolderOpen, href: '/dashboard/books' },
    { id: 'write', label: 'Write', icon: PenTool, href: '/dashboard/write' },
  ];
  
  // Story Bible section
  const storyBibleNav: NavItem[] = [
    { id: 'characters', label: 'Characters', icon: Users, href: '/dashboard/story-bible/characters' },
    { id: 'locations', label: 'Locations', icon: Map, href: '/dashboard/story-bible/locations' },
    { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/story-bible/timeline' },
    { id: 'world', label: 'World Rules', icon: Scroll, href: '/dashboard/story-bible/world' },
  ];
  
  // Craft tools section
  const craftNav: NavItem[] = [
    { id: 'threads', label: 'Story Threads', icon: GitBranch, href: '/dashboard/craft/threads' },
    { id: 'continuity', label: 'Continuity', icon: Shield, href: '/dashboard/craft/continuity' },
  ];
  
  // Bottom navigation
  const bottomNav: NavItem[] = [
    { id: 'analytics', label: 'Progress', icon: BarChart3, href: '/dashboard/analytics' },
    { id: 'help', label: 'Help', icon: HelpCircle, href: '/dashboard/help' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];
  
  // Check if route is active
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  
  // Render nav item
  const renderNavItem = (item: NavItem, showTooltip: boolean = true) => (
    <Link
      key={item.id}
      href={item.href}
      onClick={() => setMobileMenuOpen(false)}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-200 group
        ${collapsed && !mobileMenuOpen ? 'justify-center' : ''}
        ${isActive(item.href)
          ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
        }
      `}
    >
      <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.href) ? 'text-teal-600 dark:text-teal-400' : ''}`} />
      
      {(!collapsed || mobileMenuOpen) && (
        <>
          <span className="text-sm font-medium flex-1">{item.label}</span>
          {item.badge && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-teal-600 text-white">
              {item.badge}
            </span>
          )}
        </>
      )}
      
      {/* Tooltip for collapsed state */}
      {collapsed && showTooltip && !mobileMenuOpen && (
        <div className="
          absolute left-full ml-2 px-2 py-1 rounded-lg
          bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900
          text-xs font-medium whitespace-nowrap
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-200 z-50
        ">
          {item.label}
        </div>
      )}
    </Link>
  );
  
  // Render section
  const renderSection = (title: string, items: NavItem[]) => (
    <div className="mb-6">
      {(!collapsed || mobileMenuOpen) && (
        <h3 className="px-3 mb-2 text-xs font-medium text-stone-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {items.map(item => renderNavItem(item))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-stone-50 dark:bg-stone-950">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-50 lg:z-auto
        flex flex-col h-screen
        bg-white dark:bg-stone-900
        border-r border-stone-200 dark:border-stone-800
        transition-all duration-300 ease-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${collapsed && !mobileMenuOpen ? 'w-[72px]' : 'w-64'}
      `}>
        {/* Header */}
        <div className="flex-shrink-0 p-4 flex items-center justify-between">
          <BookFactoryLogo collapsed={collapsed && !mobileMenuOpen} />
          
          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>
        
        {/* Streak indicator */}
        {writingStreak > 0 && (!collapsed || mobileMenuOpen) && (
          <div className="mx-4 mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  {writingStreak} day streak!
                </p>
                <div className="mt-1.5 h-1.5 rounded-full bg-amber-200 dark:bg-amber-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${dailyProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  {wordsToday.toLocaleString()} / {dailyGoal.toLocaleString()} words
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Collapsed streak indicator */}
        {writingStreak > 0 && collapsed && !mobileMenuOpen && (
          <div className="mx-3 mb-4 p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <div className="relative">
              <Flame className="w-5 h-5 text-amber-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] rounded-full bg-amber-500 text-white flex items-center justify-center font-medium">
                {writingStreak}
              </span>
            </div>
          </div>
        )}
        
        {/* Main Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto">
          {/* Primary nav */}
          <div className="space-y-1 mb-6">
            {mainNav.map(item => renderNavItem(item))}
          </div>
          
          {/* Divider */}
          <div className="h-px bg-stone-200 dark:bg-stone-800 my-4" />
          
          {/* Story Bible */}
          {renderSection('Story Bible', storyBibleNav)}
          
          {/* Craft Tools */}
          {renderSection('Craft', craftNav)}
        </nav>
        
        {/* Bottom Navigation */}
        <div className="flex-shrink-0 p-3 border-t border-stone-200 dark:border-stone-800">
          <div className="space-y-1">
            {bottomNav.map(item => renderNavItem(item))}
          </div>
        </div>
        
        {/* Collapse Toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            hidden lg:flex
            absolute -right-3 top-20
            w-6 h-6 rounded-full
            bg-white dark:bg-stone-800
            border border-stone-200 dark:border-stone-700
            shadow-sm
            items-center justify-center
            text-stone-500 hover:text-stone-700 dark:hover:text-stone-300
            transition-colors duration-200
            z-10
          "
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="flex-shrink-0 h-14 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 flex items-center justify-between">
          {/* Left: Mobile menu + Search */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <Menu className="w-5 h-5 text-stone-600" />
            </button>
            
            {/* Search */}
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
              <Search className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs rounded bg-stone-200 dark:bg-stone-700">
                ⌘K
              </kbd>
            </button>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 relative">
              <Bell className="w-5 h-5 text-stone-600 dark:text-stone-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500" />
            </button>
            
            {/* User */}
            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-stone-200 dark:border-stone-800">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300 hidden sm:inline">
                  {user.firstName || 'Writer'}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                  {user.firstName?.[0] || 'W'}
                </div>
              </div>
            )}
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
