import Link from 'next/link';
import { 
  BookOpen, PenTool, Sparkles, Download, Users, BarChart3,
  ArrowRight, Check, Star, Zap, Globe, Shield
} from 'lucide-react';

const features = [
  { icon: PenTool, title: 'Distraction-Free Writing', description: 'Focus mode, auto-save, and a beautiful editor designed for long-form content.' },
  { icon: Sparkles, title: 'AI Writing Assistant', description: 'Get help with continuations, dialogue, descriptions, and overcoming writer\'s block.' },
  { icon: Download, title: 'Multi-Format Export', description: 'Export to EPUB, PDF, DOCX, and more. Ready for any publishing platform.' },
  { icon: Users, title: 'Collaboration Tools', description: 'Invite beta readers and editors. Track feedback and suggestions easily.' },
  { icon: BarChart3, title: 'Sales Analytics', description: 'Track your sales across platforms. Understand your readers and revenue.' },
  { icon: Globe, title: 'Direct Publishing', description: 'Publish directly to Amazon KDP, Apple Books, and more from one place.' },
];

const testimonials = [
  { name: 'Sarah Mitchell', role: 'Romance Author', quote: 'BookFactory AI helped me finish my trilogy in half the time. The AI suggestions are remarkably good.', avatar: '👩‍🦰' },
  { name: 'James Chen', role: 'Sci-Fi Writer', quote: 'The export tools alone are worth it. Perfect EPUB every time, no more formatting headaches.', avatar: '👨‍💻' },
  { name: 'Elena Rodriguez', role: 'Mystery Novelist', quote: 'Finally, a writing tool that understands authors. The collaboration features are fantastic.', avatar: '👩‍✈️' },
];

const plans = [
  { name: 'Free', price: 0, features: ['1 book project', '50 AI requests/month', 'Markdown export', 'Community support'], cta: 'Get Started' },
  { name: 'Creator', price: 19, features: ['10 book projects', '500 AI requests/month', 'All export formats', 'Cover design tools', '3 collaborators', 'Email support'], cta: 'Start Free Trial', popular: true },
  { name: 'Professional', price: 49, features: ['Unlimited books', 'Unlimited AI', 'All export formats', 'Advanced cover AI', 'Unlimited collaborators', 'Direct publishing', 'Priority support'], cta: 'Start Free Trial' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <BookOpen className="h-8 w-8 text-violet-600" />
            BookFactory AI
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-slate-600 hover:text-violet-600 dark:text-slate-400">Features</Link>
            <Link href="#pricing" className="text-slate-600 hover:text-violet-600 dark:text-slate-400">Pricing</Link>
            <Link href="/help" className="text-slate-600 hover:text-violet-600 dark:text-slate-400">Help</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-slate-600 hover:text-violet-600 dark:text-slate-400">Sign In</Link>
            <Link href="/sign-up" className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 font-medium text-white shadow-lg transition hover:shadow-xl">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 to-white px-4 py-20 dark:from-slate-900 dark:to-slate-950 lg:py-32">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
            <Sparkles className="h-4 w-4" /> Powered by Claude AI
          </div>
          <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-7xl">
            Write Books Faster with <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">AI Assistance</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-600 dark:text-slate-400">
            The complete platform for indie authors. Write, edit, collaborate, and publish—all in one place. Let AI help you overcome writer's block and finish your book.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/sign-up" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:shadow-xl">
              Start Writing Free <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <Link href="#features" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-8 py-4 text-lg font-semibold text-slate-700 transition hover:border-violet-300 dark:border-slate-700 dark:text-slate-300">
              See Features
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">No credit card required • Free tier available forever</p>
        </div>
        {/* Decorative elements */}
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-violet-200 opacity-50 blur-3xl dark:bg-violet-900/30" />
        <div className="absolute -right-40 top-20 h-80 w-80 rounded-full bg-indigo-200 opacity-50 blur-3xl dark:bg-indigo-900/30" />
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">Everything You Need to Write & Publish</h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              From your first draft to your published book, BookFactory AI has you covered.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-8 transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 inline-flex rounded-xl bg-violet-100 p-3 dark:bg-violet-900/50">
                  <feature.icon className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 px-4 py-20 dark:bg-slate-900 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">Loved by Authors Worldwide</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Join thousands of writers who've found their flow.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-4 flex text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                </div>
                <p className="mb-6 text-slate-600 dark:text-slate-400">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{testimonial.avatar}</span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">Simple, Transparent Pricing</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Start free, upgrade when you're ready.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl border p-8 ${plan.popular ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-4 py-1 text-sm font-medium text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">${plan.price}</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Check className="h-5 w-5 text-emerald-500" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className={`block w-full rounded-xl py-3 text-center font-semibold transition ${plan.popular ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg' : 'border border-slate-300 text-slate-700 hover:border-violet-400 dark:border-slate-700 dark:text-slate-300'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">Ready to Write Your Book?</h2>
          <p className="mb-8 text-xl text-white/80">Join thousands of authors already using BookFactory AI.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-violet-600 shadow-lg transition hover:shadow-xl">
            Get Started Free <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-12 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                <BookOpen className="h-6 w-6 text-violet-600" /> BookFactory AI
              </Link>
              <p className="mt-4 text-sm text-slate-500">The complete platform for indie authors to write, publish, and sell their books.</p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="#features" className="hover:text-violet-600">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-violet-600">Pricing</Link></li>
                <li><Link href="/help" className="hover:text-violet-600">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-violet-600">About</Link></li>
                <li><Link href="#" className="hover:text-violet-600">Blog</Link></li>
                <li><Link href="#" className="hover:text-violet-600">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-violet-600">Privacy</Link></li>
                <li><Link href="#" className="hover:text-violet-600">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-800">
            © {new Date().getFullYear()} BookFactory AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
