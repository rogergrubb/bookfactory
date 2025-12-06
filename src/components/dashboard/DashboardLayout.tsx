'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, PenTool, Image, Send, BarChart3, Megaphone, Settings,
  ChevronLeft, ChevronRight, Menu, Search, Bell, User, Plus, Sparkles,
  HelpCircle, X, Home, Users, DollarSign, Library, Keyboard, Moon, Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/books', icon: Home, tooltip: 'View all your books', shortcut: '⌘1' },
  { name: 'My Books', href: '/books/library', icon: Library, tooltip: 'Manage your library', shortcut: '⌘2' },
  { name: 'Write', href: '/write', icon: PenTool, tooltip: 'Open the editor', shortcut: '⌘3' },
  { name: 'Covers', href: '/covers', icon: Image, tooltip: 'Design covers', shortcut: '⌘4' },
  { name: 'Publish', href: '/publish', icon: Send, tooltip: 'Export and publish', shortcut: '⌘5' },
  { name: 'Marketing', href: '/marketing', icon: Megaphone, tooltip: 'Marketing tools', shortcut: '⌘6' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, tooltip: 'Track performance', shortcut: '⌘7' },
  { name: 'Collaborators', href: '/collaborators', icon: Users, tooltip: 'Manage team', shortcut: '⌘8' },
  { name: 'Finances', href: '/finances', icon: DollarSign, tooltip: 'Track royalties', shortcut: '⌘9' },
];

const bottomNav = [
  { name: 'Settings', href: '/settings', icon: Settings, tooltip: 'Account settings' },
  { name: 'Help', href: '/help', icon: HelpCircle, tooltip: 'Get help' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const breadcrumbs = React.useMemo(() => {
    const paths = pathname.split('/').filter(Boolean);
    return paths.map((path, index) => ({
      name: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
      href: '/' + paths.slice(0, index + 1).join('/'),
      current: index === paths.length - 1,
    }));
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
      if (e.key === 'Escape') {
        setShowKeyboardShortcuts(false);
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={cn('flex h-screen', darkMode ? 'dark' : '')}>
      {/* Desktop Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900',
        sidebarCollapsed ? 'w-20' : 'w-72',
        'hidden lg:flex'
      )}>
        <div className={cn('flex h-16 items-center border-b border-slate-200 dark:border-slate-800', sidebarCollapsed ? 'justify-center px-4' : 'px-6')}>
          <Link href="/books" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-white">BookFactory</span>
                <span className="text-xs text-violet-600">AI-Powered Writing</span>
              </div>
            )}
          </Link>
        </div>

        <div className={cn('p-4', sidebarCollapsed && 'px-3')}>
          <Tooltip content="Create a new book (⌘N)" side="right" disabled={!sidebarCollapsed}>
            <Link href="/books/new" className={cn(
              'flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-[1.02]',
              sidebarCollapsed ? 'px-3' : 'px-4'
            )}>
              <Plus className="h-5 w-5" />
              {!sidebarCollapsed && <span>New Book</span>}
            </Link>
          </Tooltip>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Tooltip content={<div><p className="font-medium">{item.name}</p><p className="text-xs text-slate-400">{item.tooltip}</p>{item.shortcut && <p className="mt-1 text-xs text-violet-400">{item.shortcut}</p>}</div>} side="right" disabled={!sidebarCollapsed}>
                    <Link href={item.href} className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive ? 'bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 dark:from-violet-950/50 dark:to-indigo-950/50 dark:text-violet-300' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
                      sidebarCollapsed && 'justify-center px-2'
                    )}>
                      <item.icon className={cn('h-5 w-5 transition-colors', isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 group-hover:text-slate-600')} />
                      {!sidebarCollapsed && <><span className="flex-1">{item.name}</span>{item.shortcut && <span className="text-xs text-slate-400">{item.shortcut}</span>}</>}
                    </Link>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <ul className="space-y-1">
            {bottomNav.map((item) => (
              <li key={item.name}>
                <Tooltip content={item.tooltip} side="right" disabled={!sidebarCollapsed}>
                  <Link href={item.href} className={cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800',
                    sidebarCollapsed && 'justify-center px-2'
                  )}>
                    <item.icon className="h-5 w-5" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                </Tooltip>
              </li>
            ))}
          </ul>
          <div className={cn('mt-3 flex gap-2', sidebarCollapsed ? 'flex-col' : 'flex-row')}>
            <button onClick={() => setShowKeyboardShortcuts(true)} className="flex-1 rounded-lg border border-slate-200 p-2 text-slate-400 hover:border-slate-300 hover:text-slate-600 dark:border-slate-700"><Keyboard className="mx-auto h-4 w-4" /></button>
            <button onClick={() => setDarkMode(!darkMode)} className="flex-1 rounded-lg border border-slate-200 p-2 text-slate-400 hover:border-slate-300 hover:text-slate-600 dark:border-slate-700">{darkMode ? <Sun className="mx-auto h-4 w-4" /> : <Moon className="mx-auto h-4 w-4" />}</button>
          </div>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-sm text-slate-500 hover:border-slate-300 dark:border-slate-700">
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:hidden">
              <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
                <Link href="/books" className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600"><BookOpen className="h-5 w-5 text-white" /></div><span className="font-bold text-slate-900 dark:text-white">BookFactory</span></Link>
                <button onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
              </div>
              <nav className="p-4">
                <Link href="/books/new" onClick={() => setMobileMenuOpen(false)} className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-medium text-white"><Plus className="h-5 w-5" /><span>New Book</span></Link>
                <ul className="space-y-1">{[...navigation, ...bottomNav].map((item) => (<li key={item.name}><Link href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium', pathname === item.href ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50')}><item.icon className="h-5 w-5" /><span>{item.name}</span></Link></li>))}</ul>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={cn('flex flex-1 flex-col overflow-hidden bg-slate-50 transition-all duration-300 dark:bg-slate-950', sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72')}>
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 lg:px-8">
          <button onClick={() => setMobileMenuOpen(true)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5" /></button>
          <nav className="hidden items-center gap-2 text-sm lg:flex">
            <Link href="/books" className="text-slate-400 hover:text-slate-600"><Home className="h-4 w-4" /></Link>
            {breadcrumbs.map((crumb, index) => (<React.Fragment key={crumb.href}><ChevronRight className="h-4 w-4 text-slate-300" />{crumb.current ? <span className="font-medium text-slate-900 dark:text-white">{crumb.name}</span> : <Link href={crumb.href} className="text-slate-500 hover:text-slate-700">{crumb.name}</Link>}</React.Fragment>))}
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowCommandPalette(true)} className="hidden md:flex items-center gap-3 w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-400 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800"><Search className="h-4 w-4" /><span className="flex-1 text-left">Search...</span><kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs dark:border-slate-600 dark:bg-slate-700">⌘K</kbd></button>
            <div className="hidden lg:flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-700"><Sparkles className="h-4 w-4 text-violet-500" /><span className="font-medium text-slate-700 dark:text-slate-300">847</span><span className="text-slate-400">credits</span></div>
            <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100"><Bell className="h-5 w-5" /><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" /></button>
            <Link href="/help" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><HelpCircle className="h-5 w-5" /></Link>
            <button className="flex items-center gap-3 rounded-xl border border-slate-200 p-1.5 pr-3 hover:border-slate-300 dark:border-slate-700"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600"><User className="h-4 w-4 text-white" /></div><span className="hidden text-sm font-medium text-slate-700 dark:text-slate-300 md:block">Author</span></button>
          </div>
        </header>
        {showOnboarding && <OnboardingProgress onDismiss={() => setShowOnboarding(false)} />}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showKeyboardShortcuts && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowKeyboardShortcuts(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Keyboard Shortcuts</h2><button onClick={() => setShowKeyboardShortcuts(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {[{category:'Navigation',shortcuts:[{keys:'⌘ K',action:'Command palette'},{keys:'⌘ 1-9',action:'Go to section'},{keys:'⌘ N',action:'New book'}]},{category:'Editor',shortcuts:[{keys:'⌘ S',action:'Save'},{keys:'⌘ F',action:'Focus mode'},{keys:'⌘ B',action:'Bold'}]},{category:'AI',shortcuts:[{keys:'⌘ J',action:'AI assistant'},{keys:'⌘ G',action:'Generate'}]}].map((group) => (
                  <div key={group.category}><h3 className="mb-2 text-sm font-medium text-slate-500">{group.category}</h3><div className="space-y-1">{group.shortcuts.map((s) => (<div key={s.action} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800"><span className="text-sm text-slate-700 dark:text-slate-300">{s.action}</span><kbd className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">{s.keys}</kbd></div>))}</div></div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Palette */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-24" onClick={() => setShowCommandPalette(false)}>
            <motion.div initial={{ scale: 0.95, y: -10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -10 }} className="w-full max-w-xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800"><Search className="h-5 w-5 text-slate-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search commands, books..." className="flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" autoFocus /><kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-800">ESC</kbd></div>
              <div className="max-h-80 overflow-y-auto p-2">
                <div className="mb-2 px-2 text-xs font-medium text-slate-500">Quick Actions</div>
                {[{icon:Plus,label:'Create new book',href:'/books/new'},{icon:PenTool,label:'Open editor',href:'/write'},{icon:Sparkles,label:'AI assistant',href:'/write?ai=true'},{icon:Image,label:'Create cover',href:'/covers/new'}].filter(i => !searchQuery || i.label.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (<Link key={item.label} href={item.href} onClick={() => setShowCommandPalette(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><item.icon className="h-4 w-4 text-slate-400" /><span className="text-sm">{item.label}</span></Link>))}
                <div className="mb-2 mt-4 px-2 text-xs font-medium text-slate-500">Navigation</div>
                {navigation.filter(i => !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (<Link key={item.name} href={item.href} onClick={() => setShowCommandPalette(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><item.icon className="h-4 w-4 text-slate-400" /><span className="text-sm">Go to {item.name}</span>{item.shortcut && <kbd className="ml-auto rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs text-slate-400 dark:border-slate-700">{item.shortcut}</kbd>}</Link>))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DashboardLayout;
