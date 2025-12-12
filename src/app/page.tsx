'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  BookOpen, Sparkles, ArrowRight, Check, Star, Play,
  Wand2, Zap, BarChart3, Brain, Palette, Search,
  FileText, Users, Download, Shield, Clock, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tool categories that live inside the Theater
const toolCategories = [
  { 
    name: 'Generate', 
    count: 6, 
    icon: Wand2, 
    color: 'emerald',
    tools: ['Continue Writing', 'First Draft', 'Write Dialogue', 'Add Description', 'Action Scene', 'Inner Thoughts']
  },
  { 
    name: 'Enhance', 
    count: 8, 
    icon: Zap, 
    color: 'blue',
    tools: ['Expand', 'Condense', 'Rewrite', 'Polish', 'Strengthen Verbs', 'Vary Sentences', 'Fix Dialogue Tags', 'Show Don\'t Tell']
  },
  { 
    name: 'Analyze', 
    count: 10, 
    icon: Search, 
    color: 'amber',
    tools: ['Pacing Analysis', 'Voice Check', 'Tension Map', 'Character Voice', 'Repetition Finder', 'Adverb Hunter', 'Passive Voice', 'Readability', 'Emotional Arc', 'Chapter Summary']
  },
  { 
    name: 'Brainstorm', 
    count: 8, 
    icon: Brain, 
    color: 'purple',
    tools: ['Plot Ideas', 'Character Moments', 'Dialogue Options', 'Scene Transitions', 'Conflict Escalation', 'Twist Generator', 'What If...', 'I\'m Stuck']
  },
  { 
    name: 'World', 
    count: 6, 
    icon: Palette, 
    color: 'rose',
    tools: ['Characters', 'Locations', 'Plot Threads', 'Timeline', 'Scene Contexts', 'Story Bible']
  },
];

const workflowSteps = [
  { icon: BookOpen, label: 'Create', description: 'Start your book with our guided wizard' },
  { icon: Wand2, label: 'Write', description: '44 AI tools at your fingertips' },
  { icon: Download, label: 'Export', description: 'EPUB, PDF, DOCX in one click' },
  { icon: Users, label: 'Share', description: 'Invite beta readers for feedback' },
];

const testimonials = [
  { 
    name: 'Sarah Mitchell', 
    role: 'Romance Author', 
    quote: 'I finished my last three books in half the time. Having all tools in one workspace changed everything.',
    stat: '47,000+ copies sold'
  },
  { 
    name: 'James Chen', 
    role: 'Sci-Fi Writer', 
    quote: 'No more switching between apps. The Theater keeps me in flow for hours.',
    stat: 'Bestseller in Space Opera'
  },
  { 
    name: 'Elena Rodriguez', 
    role: 'Mystery Novelist', 
    quote: 'Finally, software that understands how authors actually work. This is my permanent writing home.',
    stat: '8-book series completed'
  },
];

const plans = [
  { 
    name: 'Starter', 
    price: 0, 
    period: 'forever',
    description: 'Perfect for your first book',
    features: ['1 book project', '50 AI assists/month', 'Markdown & PDF export', 'Community support'], 
    cta: 'Start Free',
    popular: false
  },
  { 
    name: 'Author', 
    price: 19, 
    period: '/month',
    description: 'For serious indie authors',
    features: ['10 book projects', '500 AI assists/month', 'All export formats', 'Cover design tools', '3 beta readers', 'Email support'], 
    cta: 'Start 14-Day Trial',
    popular: true
  },
  { 
    name: 'Professional', 
    price: 49, 
    period: '/month',
    description: 'For full-time authors',
    features: ['Unlimited books', 'Unlimited AI assists', 'Priority export queue', 'Advanced cover AI', 'Unlimited collaborators', 'Dedicated support'], 
    cta: 'Start 14-Day Trial',
    popular: false
  },
];

// Animated Theater Preview Component
function TheaterPreview() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeChapter, setActiveChapter] = useState(3);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCategory(prev => (prev + 1) % toolCategories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const categoryColors: Record<string, string> = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border border-stone-200 bg-stone-900 shadow-2xl">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-stone-700 bg-stone-800 px-4 py-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <div className="ml-4 flex-1 rounded-md bg-stone-700 px-3 py-1 text-xs text-stone-400">
          bookfactory.cafe/book/my-novel
        </div>
      </div>
      
      {/* Theater UI */}
      <div className="flex h-[400px]">
        {/* Tool Tray */}
        <div className="w-36 border-r border-stone-700 bg-stone-850 p-3">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">Tools</div>
          <div className="space-y-1">
            {toolCategories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.name}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-all duration-300',
                    i === activeCategory 
                      ? 'bg-stone-700 text-white' 
                      : 'text-stone-400'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.name}</span>
                  <span className="ml-auto text-[10px] text-stone-500">{cat.count}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Chapter Timeline */}
          <div className="flex items-center gap-2 border-b border-stone-700 bg-stone-800 px-4 py-2">
            {[1, 2, 3, 4, 5, 6].map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveChapter(ch)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-all',
                  ch === activeChapter
                    ? 'bg-teal-600 text-white'
                    : 'bg-stone-700 text-stone-400 hover:bg-stone-600'
                )}
              >
                Ch {ch}
              </button>
            ))}
            <div className="ml-2 flex h-6 w-6 items-center justify-center rounded-md bg-stone-700 text-stone-400 hover:bg-stone-600">
              <span className="text-sm">+</span>
            </div>
          </div>
          
          {/* Writing Canvas */}
          <div className="flex-1 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-white">Chapter {activeChapter}: The Discovery</h3>
              <p className="text-xs text-stone-500">2,847 words</p>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-stone-300">
              <p>The ancient door creaked open, revealing a chamber that hadn&apos;t seen light in centuries. Maya&apos;s flashlight beam cut through the dust-laden air, illuminating walls covered in symbols she couldn&apos;t begin to understand.</p>
              <p>&quot;Are you seeing this?&quot; she whispered into her radio, but only static answered.</p>
              <p className="text-stone-500">|</p>
            </div>
          </div>
        </div>
        
        {/* Active Tool Panel */}
        <div className="w-64 border-l border-stone-700 bg-stone-800 p-4">
          <div className="mb-4">
            <div className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-white',
              categoryColors[toolCategories[activeCategory].color]
            )}>
              {(() => {
                const Icon = toolCategories[activeCategory].icon;
                return <Icon className="h-3.5 w-3.5" />;
              })()}
              {toolCategories[activeCategory].name}
            </div>
          </div>
          
          <div className="space-y-1">
            {toolCategories[activeCategory].tools.slice(0, 5).map((tool) => (
              <div
                key={tool}
                className="rounded-md bg-stone-700/50 px-3 py-2 text-xs text-stone-300 hover:bg-stone-700"
              >
                {tool}
              </div>
            ))}
            {toolCategories[activeCategory].tools.length > 5 && (
              <div className="px-3 py-1 text-xs text-stone-500">
                +{toolCategories[activeCategory].tools.length - 5} more...
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Undo Stack */}
      <div className="flex items-center gap-4 border-t border-stone-700 bg-stone-800 px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <Clock className="h-3.5 w-3.5" />
          <span>Auto-saved</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div className="rounded bg-stone-700 px-2 py-1 text-[10px] text-stone-400">
            Expand: +127 words
          </div>
          <div className="rounded bg-stone-700 px-2 py-1 text-[10px] text-stone-400">
            Continue: +89 words
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-stone-50/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-stone-900">BookFactory</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#theater" className="text-sm text-stone-600 transition hover:text-stone-900">The Theater</Link>
            <Link href="#tools" className="text-sm text-stone-600 transition hover:text-stone-900">44 Tools</Link>
            <Link href="#pricing" className="text-sm text-stone-600 transition hover:text-stone-900">Pricing</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="hidden text-sm font-medium text-stone-600 transition hover:text-stone-900 sm:block">
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              Start Writing Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero - Theater Focused */}
      <section className="relative overflow-hidden px-4 pb-8 pt-12 md:pb-16 md:pt-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1">
              <Layers className="h-3.5 w-3.5 text-teal-600" />
              <span className="text-xs font-medium text-teal-700">One Workspace. 44 AI Tools. Zero Distractions.</span>
            </div>
            
            {/* Headline */}
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-stone-900 md:text-5xl lg:text-6xl">
              Your Book&apos;s
              <br />
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Command Center</span>
            </h1>
            
            {/* Subheadline */}
            <p className="mb-8 text-lg text-stone-600 md:text-xl">
              Stop switching between apps. The Book Operating Theater puts 
              <span className="font-semibold text-stone-900"> 44 AI writing tools </span> 
              right inside your writing canvas.
            </p>
            
            {/* CTAs */}
            <div className="mb-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link 
                href="/sign-up" 
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-3 text-base font-medium text-white shadow-lg shadow-teal-500/25 transition hover:shadow-teal-500/40 sm:w-auto"
              >
                Start Your Book Free
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link 
                href="/demo" 
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-6 py-3 text-base font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 sm:w-auto"
              >
                <Play className="h-4 w-4" />
                Try Demo Free
              </Link>
            </div>
          </div>
          
          {/* Theater Preview */}
          <div id="theater">
            <TheaterPreview />
            <div className="mt-6 flex justify-center">
              <Link 
                href="/demo"
                className="group inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                <Play className="h-4 w-4" />
                Try the Full Theater Demo
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
          
          {/* Trust indicator */}
          <p className="mt-8 text-center text-sm text-stone-500">
            Free forever plan · No credit card required · Your words stay yours
          </p>
        </div>
      </section>

      {/* Value Props - Quick hits */}
      <section className="border-y border-stone-200 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 md:gap-12">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Sparkles className="h-4 w-4 text-teal-600" />
            <span><strong>44</strong> AI writing tools</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Download className="h-4 w-4 text-teal-600" />
            <span>EPUB, PDF, DOCX export</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Users className="h-4 w-4 text-teal-600" />
            <span>Beta reader management</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Shield className="h-4 w-4 text-teal-600" />
            <span>100% ownership of your content</span>
          </div>
        </div>
      </section>

      {/* Tool Categories */}
      <section id="tools" className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Everything you need, exactly where you need it
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-stone-600">
              These aren&apos;t separate apps. They&apos;re all inside your writing canvas, 
              ready to use without breaking your flow.
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-5">
            {toolCategories.map((category) => {
              const Icon = category.icon;
              const colorClasses: Record<string, string> = {
                emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                blue: 'bg-blue-100 text-blue-700 border-blue-200',
                amber: 'bg-amber-100 text-amber-700 border-amber-200',
                purple: 'bg-purple-100 text-purple-700 border-purple-200',
                rose: 'bg-rose-100 text-rose-700 border-rose-200',
              };
              const iconColorClasses: Record<string, string> = {
                emerald: 'bg-emerald-500',
                blue: 'bg-blue-500',
                amber: 'bg-amber-500',
                purple: 'bg-purple-500',
                rose: 'bg-rose-500',
              };
              
              return (
                <div 
                  key={category.name}
                  className={cn(
                    'rounded-xl border-2 p-5 transition-all hover:shadow-lg',
                    colorClasses[category.color]
                  )}
                >
                  <div className={cn(
                    'mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg text-white',
                    iconColorClasses[category.color]
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1 text-lg font-semibold">{category.name}</h3>
                  <p className="mb-3 text-sm opacity-80">{category.count} tools</p>
                  <ul className="space-y-1 text-xs opacity-70">
                    {category.tools.slice(0, 3).map((tool) => (
                      <li key={tool}>• {tool}</li>
                    ))}
                    <li>• and more...</li>
                  </ul>
                </div>
              );
            })}
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              href="/sign-up" 
              className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              Try All 44 Tools Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="bg-stone-100 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              From first draft to published book
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-stone-600">
              One seamless journey. No exporting to other apps. No reformatting.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-4">
            {workflowSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="relative text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Icon className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-stone-900">{step.label}</h3>
                  <p className="text-sm text-stone-600">{step.description}</p>
                  
                  {i < 3 && (
                    <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 bg-stone-300 md:block" 
                         style={{ width: 'calc(100% - 4rem)', left: 'calc(50% + 2rem)' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Authors love the Theater
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-stone-600">
              Join thousands of writers who&apos;ve made BookFactory their creative home.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.name} 
                className="flex flex-col rounded-xl border border-stone-200 bg-white p-6"
              >
                <div className="mb-4 flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mb-6 flex-1 text-stone-600">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="border-t border-stone-100 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-200 text-sm font-medium text-stone-600">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">{testimonial.name}</p>
                      <p className="text-xs text-stone-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-medium text-teal-600">{testimonial.stat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-stone-100 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              One workspace. Simple pricing.
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-stone-600">
              Start free, upgrade when you need more. All plans include the full Theater experience.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div 
                key={plan.name} 
                className={cn(
                  'relative flex flex-col rounded-xl border-2 p-6',
                  plan.popular 
                    ? 'border-teal-600 bg-white shadow-xl' 
                    : 'border-stone-200 bg-white'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 px-3 py-1 text-xs font-medium text-white">
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-stone-900">{plan.name}</h3>
                  <p className="text-sm text-stone-500">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-stone-900">${plan.price}</span>
                  <span className="text-stone-500">{plan.period}</span>
                </div>
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-stone-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={cn(
                    'block w-full rounded-lg py-3 text-center text-sm font-medium transition',
                    plan.popular
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40'
                      : 'border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          
          <p className="mt-8 text-center text-sm text-stone-500">
            All plans include the Book Operating Theater, SSL encryption, automatic backups, and 24/7 system monitoring.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Ready to enter the Theater?
          </h2>
          <p className="mb-8 text-lg text-stone-600">
            Join 12,000+ authors who&apos;ve found their creative home. 
            Your book is waiting.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link 
              href="/sign-up" 
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-4 text-base font-medium text-white shadow-lg shadow-teal-500/25 transition hover:shadow-teal-500/40 sm:w-auto"
            >
              Start Your Book Free
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-stone-500">
            No credit card required · Free forever plan available
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-5">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-stone-900">BookFactory</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm text-stone-500">
                The Book Operating Theater. One unified workspace for indie authors to write, publish, and grow.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-stone-900">Product</h4>
              <ul className="space-y-2 text-sm text-stone-500">
                <li><Link href="#theater" className="transition hover:text-stone-900">The Theater</Link></li>
                <li><Link href="#tools" className="transition hover:text-stone-900">44 AI Tools</Link></li>
                <li><Link href="#pricing" className="transition hover:text-stone-900">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-stone-900">Resources</h4>
              <ul className="space-y-2 text-sm text-stone-500">
                <li><Link href="/help" className="transition hover:text-stone-900">Help Center</Link></li>
                <li><Link href="#" className="transition hover:text-stone-900">Blog</Link></li>
                <li><Link href="#" className="transition hover:text-stone-900">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-stone-900">Legal</h4>
              <ul className="space-y-2 text-sm text-stone-500">
                <li><Link href="#" className="transition hover:text-stone-900">Privacy</Link></li>
                <li><Link href="#" className="transition hover:text-stone-900">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-stone-100 pt-8 text-center text-sm text-stone-500">
            © {new Date().getFullYear()} BookFactory. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
