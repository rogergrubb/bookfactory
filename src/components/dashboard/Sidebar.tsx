'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, FolderOpen, PenTool, BarChart3, Settings, 
  ChevronLeft, ChevronRight, Sparkles, Users, Map, 
  Clock, Lightbulb, Target, Flame, HelpCircle,
  Library, Scroll, GitBranch
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

interface SidebarProps {
  userName?: string;
  writingStreak?: number;
  dailyProgress?: number; // 0-100
}

// ============================================================================
// BOOKFACTORY LOGO
// ============================================================================

function BookFactoryLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={`
      flex items-center gap-3 px-3 py-2 rounded-xl
      transition-all duration-300
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
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Sidebar({ 
  userName = 'Writer',
  writingStreak = 0,
  dailyProgress = 0
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  // Main navigation items
  const mainNav: NavItem[] = [
    { id: 'studio', label: 'AI Studio', icon: Sparkles, href: '/dashboard/ai-studio' },
    { id: 'projects', label: 'Projects', icon: FolderOpen, href: '/dashboard/books' },
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
    { id: 'continuity', label: 'Continuity', icon: Target, href: '/dashboard/craft/continuity' },
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
  const renderNavItem = (item: NavItem) => (
    <Link
      key={item.id}
      href={item.href}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-200 group
        ${collapsed ? 'justify-center' : ''}
        ${isActive(item.href)
          ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
        }
      `}
    >
      <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.href) ? 'text-teal-600 dark:text-teal-400' : ''}`} />
      
      {!collapsed && (
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
      {collapsed && (
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
      {!collapsed && (
        <h3 className="px-3 mb-2 text-xs font-medium text-stone-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {items.map(renderNavItem)}
      </div>
    </div>
  );

  return (
    <aside className={`
      relative flex flex-col h-screen
      bg-white dark:bg-stone-900
      border-r border-stone-200 dark:border-stone-800
      transition-all duration-300 ease-out
      ${collapsed ? 'w-[72px]' : 'w-64'}
    `}>
      {/* Header */}
      <div className="flex-shrink-0 p-4">
        <BookFactoryLogo collapsed={collapsed} />
      </div>
      
      {/* Streak indicator (when visible) */}
      {writingStreak > 0 && !collapsed && (
        <div className="mx-4 mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {writingStreak} day streak!
              </p>
              {dailyProgress > 0 && (
                <div className="mt-1.5 h-1.5 rounded-full bg-amber-200 dark:bg-amber-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${dailyProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Collapsed streak indicator */}
      {writingStreak > 0 && collapsed && (
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
          {mainNav.map(renderNavItem)}
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
          {bottomNav.map(renderNavItem)}
        </div>
      </div>
      
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="
          absolute -right-3 top-20
          w-6 h-6 rounded-full
          bg-white dark:bg-stone-800
          border border-stone-200 dark:border-stone-700
          shadow-sm
          flex items-center justify-center
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
  );
}
