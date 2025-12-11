import Link from 'next/link';
import { 
  BookOpen, PenTool, Sparkles, Download, Users, BarChart3,
  ArrowRight, Check, Star, Play, ChevronRight, Shield
} from 'lucide-react';

const features = [
  { 
    icon: PenTool, 
    title: 'Distraction-Free Editor', 
    description: 'A beautiful writing environment with auto-save, focus mode, and chapter organization.',
    highlight: 'Write faster',
    href: '/books'
  },
  { 
    icon: Sparkles, 
    title: 'AI Writing Assistant', 
    description: 'The most advanced AI tools for fiction writers. Generate, enhance, analyze, and brainstorm.',
    highlight: 'Never stuck',
    href: '/ai-studio'
  },
  { 
    icon: Download, 
    title: 'One-Click Export', 
    description: 'Export to EPUB, PDF, DOCX instantly. Perfect formatting for Amazon KDP, Apple Books, and more.',
    highlight: 'Publish ready',
    href: '/books'
  },
  { 
    icon: Users, 
    title: 'Beta Reader Management', 
    description: 'Invite readers, collect feedback, and track revisions all in one place.',
    highlight: 'Better feedback',
    href: '/books'
  },
  { 
    icon: BarChart3, 
    title: 'Sales Dashboard', 
    description: 'Connect your publishing accounts and track royalties across all platforms.',
    highlight: 'Know your numbers',
    href: '/analytics'
  },
  { 
    icon: Shield, 
    title: 'Your Words, Protected', 
    description: 'Bank-level encryption, automatic backups, and you own 100% of your content.',
    highlight: 'Always safe',
    href: '/settings'
  },
];

const testimonials = [
  { 
    name: 'Sarah Mitchell', 
    role: 'Romance Author, 12 books published', 
    quote: 'I finished my last three books in half the time. The AI suggestions feel like having a writing partner who actually understands my voice.',
    books: '47,000+ copies sold'
  },
  { 
    name: 'James Chen', 
    role: 'Sci-Fi Writer', 
    quote: 'The export feature alone saved me weeks of formatting headaches. Perfect EPUB every single time.',
    books: 'Bestseller in Space Opera'
  },
  { 
    name: 'Elena Rodriguez', 
    role: 'Mystery Novelist', 
    quote: 'Finally, software built by people who understand what authors actually need. This is my permanent writing home.',
    books: '8-book series completed'
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
    features: ['10 book projects', '500 AI assists/month', 'All export formats (EPUB, DOCX, PDF)', 'Cover design tools', '3 beta readers', 'Email support'], 
    cta: 'Start 14-Day Trial',
    popular: true
  },
  { 
    name: 'Professional', 
    price: 49, 
    period: '/month',
    description: 'For full-time authors & teams',
    features: ['Unlimited books', 'Unlimited AI assists', 'Priority export queue', 'Advanced cover AI', 'Unlimited collaborators', 'Direct KDP publishing', 'Dedicated support'], 
    cta: 'Start 14-Day Trial',
    popular: false
  },
];

const stats = [
  { value: '12,000+', label: 'Authors writing' },
  { value: '2.4M', label: 'Words written daily' },
  { value: '850+', label: 'Books published' },
  { value: '4.9/5', label: 'Average rating' },
];

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
            <Link href="#features" className="text-sm text-stone-600 transition hover:text-stone-900">Features</Link>
            <Link href="#pricing" className="text-sm text-stone-600 transition hover:text-stone-900">Pricing</Link>
            <Link href="#testimonials" className="text-sm text-stone-600 transition hover:text-stone-900">Reviews</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="hidden text-sm font-medium text-stone-600 transition hover:text-stone-900 sm:block">
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-12 md:pb-24 md:pt-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">AI-Powered Writing Assistant</span>
            </div>
            
            {/* Headline */}
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-stone-900 md:text-5xl lg:text-6xl">
              Write your book.
              <br />
              <span className="text-stone-400">We handle the rest.</span>
            </h1>
            
            {/* Subheadline */}
            <p className="mb-8 text-lg text-stone-600 md:text-xl">
              The complete platform for indie authors. Write with AI assistance, 
              export to any format, and track your sales—all in one place.
            </p>
            
            {/* CTAs */}
            <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link 
                href="/sign-up" 
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-6 py-3 text-base font-medium text-white transition hover:bg-stone-800 sm:w-auto"
              >
                Start Writing Free
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link 
                href="#demo" 
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-6 py-3 text-base font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 sm:w-auto"
              >
                <Play className="h-4 w-4" />
                Watch Demo
              </Link>
            </div>
            
            {/* Trust indicator */}
            <p className="text-sm text-stone-500">
              Free forever plan available · No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="border-y border-stone-200 bg-white px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-stone-900 md:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-stone-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Everything you need to write & publish
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-stone-600">
              Stop juggling multiple tools. BookFactory brings writing, editing, collaboration, and publishing into one seamless workflow.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link 
                key={feature.title}
                href={feature.href}
                className="group rounded-xl border border-stone-200 bg-white p-6 transition hover:border-stone-300 hover:shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 transition group-hover:bg-stone-900">
                    <feature.icon className="h-5 w-5 text-stone-600 transition group-hover:text-white" />
                  </div>
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                    {feature.highlight}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-stone-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-stone-600">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-stone-900 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              From idea to published in 3 steps
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-stone-400">
              Our streamlined workflow gets you from blank page to bookshelf faster than ever.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Write', description: 'Use our distraction-free editor with AI assistance to write your manuscript. Organize chapters, track progress, and never lose a word.' },
              { step: '02', title: 'Polish', description: 'Invite beta readers, gather feedback, and refine your work. Use AI to improve dialogue, descriptions, and pacing.' },
              { step: '03', title: 'Publish', description: 'Export to any format with one click. Upload directly to Amazon KDP, Apple Books, and more. Track your sales in real-time.' },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                <div className="mb-4 text-5xl font-bold text-stone-700">{item.step}</div>
                <h3 className="mb-2 text-xl font-semibold text-white">{item.title}</h3>
                <p className="text-stone-400">{item.description}</p>
                {i < 2 && (
                  <ChevronRight className="absolute right-0 top-8 hidden h-8 w-8 text-stone-700 md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Loved by authors worldwide
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-stone-600">
              Join thousands of writers who&apos;ve found their creative home.
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
                  <p className="mt-3 text-xs font-medium text-amber-600">{testimonial.books}</p>
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
              Simple, transparent pricing
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-stone-600">
              Start free, upgrade when you&apos;re ready. No hidden fees, cancel anytime.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div 
                key={plan.name} 
                className={`relative flex flex-col rounded-xl border-2 p-6 ${
                  plan.popular 
                    ? 'border-stone-900 bg-white shadow-xl' 
                    : 'border-stone-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white">
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
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`block w-full rounded-lg py-3 text-center text-sm font-medium transition ${
                    plan.popular
                      ? 'bg-stone-900 text-white hover:bg-stone-800'
                      : 'border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          
          <p className="mt-8 text-center text-sm text-stone-500">
            All plans include SSL encryption, automatic backups, and 24/7 system monitoring.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Ready to write your book?
          </h2>
          <p className="mb-8 text-lg text-stone-600">
            Join 12,000+ authors already using BookFactory. Start free today.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link 
              href="/sign-up" 
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-8 py-4 text-base font-medium text-white transition hover:bg-stone-800 sm:w-auto"
            >
              Get Started Free
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
                The complete platform for indie authors to write, publish, and grow their readership.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-stone-900">Product</h4>
              <ul className="space-y-2 text-sm text-stone-500">
                <li><Link href="#features" className="transition hover:text-stone-900">Features</Link></li>
                <li><Link href="#pricing" className="transition hover:text-stone-900">Pricing</Link></li>
                <li><Link href="#" className="transition hover:text-stone-900">Changelog</Link></li>
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
