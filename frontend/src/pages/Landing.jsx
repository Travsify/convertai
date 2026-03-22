import { useState } from 'react';
import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav';

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition"
      >
        <span className="font-semibold text-slate-800 text-sm pr-4">{q}</span>
        <svg
          className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="relative">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header bar */}
        <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span className="ml-3 text-slate-400 text-xs font-mono">ConvertAI — Ad Analyzer</span>
        </div>

        <div className="p-6">
          {/* Before state */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your Current Ad</span>
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">Score: 34/100</span>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
              "Check out our new product. It's really good and you should try it. Click here for more info."
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-lg">No clear CTA</span>
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-lg">No value prop</span>
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-lg">Spam phrase detected</span>
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-lg">No urgency</span>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center my-4">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-blue-700 text-xs font-semibold">AI Rewrite</span>
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* After state */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">AI Optimized Version</span>
              <span className="bg-green-100 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full">Score: 91/100</span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
              "Struggling with low conversions? Our proven solution boosts ROI by 3x — trusted by 10,000+ marketers. Start your free trial today, no credit card required."
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-lg">Strong CTA</span>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-lg">Value prop clear</span>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-lg">Social proof</span>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-lg">Urgency added</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
        +57 point boost
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      {/* HERO */}
      <section className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white pt-20 pb-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                Trusted by 500+ marketers worldwide
              </div>

              <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6">
                Your Ads Aren't Failing.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Your Copy Is.
                </span>
              </h1>

              <p className="text-xl text-slate-300 leading-relaxed mb-8 max-w-xl">
                ConvertAI analyzes your ad copy, finds exactly why it's not converting, and rewrites it to drive results — in seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  to="/signup"
                  className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-7 py-4 rounded-xl transition shadow-lg shadow-blue-500/25 text-center text-base"
                >
                  Analyze My Ad Free
                </Link>
                <Link
                  to="/pricing"
                  className="border border-white/20 hover:border-white/40 text-white font-semibold px-7 py-4 rounded-xl transition text-center text-base bg-white/5 hover:bg-white/10"
                >
                  See How It Works
                </Link>
              </div>

              {/* Trust bar */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <div className="flex -space-x-2">
                  {['SM', 'JT', 'PK', 'AR', 'ML'].map((init, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444'][i] }}
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    <StarRating />
                    <span className="text-yellow-400 text-sm font-semibold ml-1">4.9/5</span>
                  </div>
                  <div className="text-xs text-slate-400">from 500+ marketers</div>
                </div>
              </div>
            </div>

            <div className="lg:pl-8">
              <HeroMockup />
            </div>
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Sound familiar?</h2>
            <p className="text-slate-500 text-lg">You're not alone. These are the three ad problems we hear every day.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '💸',
                title: 'Burning budget, getting nothing back',
                desc: "You're spending $5k/month on ads but getting a 0.8% CTR. The algorithm isn't the problem — your copy is.",
                color: 'from-red-50 to-orange-50 border-red-200',
              },
              {
                icon: '😤',
                title: "Your competitor's ads outperform yours",
                desc: "They're in the same market, same audience, same budget. But their ads crush yours and you can't figure out why.",
                color: 'from-amber-50 to-yellow-50 border-amber-200',
              },
              {
                icon: '🎲',
                title: 'Writing copy feels like gambling',
                desc: "You rewrite copy by gut feel and hope something sticks. There's no system, no feedback, no way to know what will work.",
                color: 'from-blue-50 to-indigo-50 border-blue-200',
              },
            ].map((item, i) => (
              <div key={i} className={`bg-gradient-to-br ${item.color} border rounded-2xl p-7`}>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-slate-800 text-lg mb-3">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-3">Everything you need to fix your ads</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">One suite of tools covering the entire lifecycle of ad optimization — from diagnosis to deployment.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🔍',
                title: 'Ad Score Analyzer',
                desc: 'Know exactly why your ad fails. Get a 0–100 conversion score with detailed breakdown across 6 key dimensions.',
                badge: 'Free',
                badgeColor: 'bg-green-100 text-green-700',
              },
              {
                icon: '✍️',
                title: 'AI Rewrite Engine',
                desc: 'Get 3 conversion-optimized rewrites instantly. Each variant uses a different strategy: CTA-driven, urgency-first, or pain-point focused.',
                badge: 'Pro',
                badgeColor: 'bg-violet-100 text-violet-700',
              },
              {
                icon: '🧪',
                title: 'A/B Variant Generator',
                desc: 'Create 5+ test variants with one click. Get distinct headlines and body copy options ready to drop into your ad platform.',
                badge: 'Pro',
                badgeColor: 'bg-violet-100 text-violet-700',
              },
              {
                icon: '🏠',
                title: 'Landing Page Auditor',
                desc: 'Find conversion killers on your page. Paste your HTML or copy and get an instant audit with prioritized fixes.',
                badge: 'Pro',
                badgeColor: 'bg-violet-100 text-violet-700',
              },
              {
                icon: '📊',
                title: 'Performance Dashboard',
                desc: 'Track all your analyses in one place. See trends, top issues, and average scores across your entire account.',
                badge: 'Free',
                badgeColor: 'bg-green-100 text-green-700',
              },
              {
                icon: '🚫',
                title: 'Spam Detector',
                desc: 'Avoid words that get your ads rejected or buried. Our spam checker flags low-quality phrases before they cost you.',
                badge: 'Free',
                badgeColor: 'bg-green-100 text-green-700',
              },
            ].map((f, i) => (
              <div key={i} className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-200 hover:shadow-md rounded-2xl p-6 transition-all duration-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-2xl group-hover:shadow-md transition-all">
                    {f.icon}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${f.badgeColor}`}>
                    {f.badge}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-600 to-indigo-700">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Marketers love ConvertAI</h2>
            <p className="text-blue-200 text-lg">Real results from real customers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah M.',
                role: 'E-commerce Founder',
                initials: 'SM',
                color: '#f59e0b',
                quote: "Our CTR went from 1.2% to 4.7% after using ConvertAI to rewrite our Facebook ads. Best $29 I spend every month.",
                stat: '+292% CTR',
              },
              {
                name: 'James T.',
                role: 'Growth Marketer',
                initials: 'JT',
                color: '#3b82f6',
                quote: "I used to spend hours A/B testing copy. Now I generate 5 variants in 30 seconds and know which one will win.",
                stat: '5 variants in 30s',
              },
              {
                name: 'Priya K.',
                role: 'Agency Owner',
                initials: 'PK',
                color: '#10b981',
                quote: "I run ads for 12 clients. ConvertAI saves me 6 hours a week and my clients are seeing better results than ever.",
                stat: '6 hrs saved/week',
              },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-1 mb-4">
                  <StarRating />
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{t.name}</div>
                      <div className="text-slate-500 text-xs">{t.role}</div>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {t.stat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Pricing</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-3">Simple, transparent pricing</h2>
            <p className="text-slate-500 text-lg">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              {
                name: 'Free',
                price: '$0',
                period: '/month',
                desc: 'Perfect for trying ConvertAI',
                features: ['5 analyses per month', 'Ad copy analyzer', 'Basic score breakdown', 'Performance dashboard'],
                cta: 'Get Started Free',
                ctaLink: '/signup',
                popular: false,
              },
              {
                name: 'Pro',
                price: '$29',
                period: '/month',
                desc: 'For serious marketers',
                features: ['Unlimited analyses', 'All analyzer features', 'AI rewrite suggestions', 'A/B test generator', 'Landing page audit', 'Email support'],
                cta: 'Start Pro Trial',
                ctaLink: '/pricing',
                popular: true,
              },
              {
                name: 'Agency',
                price: '$99',
                period: '/month',
                desc: 'For agencies and teams',
                features: ['Everything in Pro', '10 team seats', 'White-label reports', 'Priority support', 'API access'],
                cta: 'Start Agency Trial',
                ctaLink: '/pricing',
                popular: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-6 relative ${
                  plan.popular
                    ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-500/25 scale-105'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow">
                    Most Popular
                  </div>
                )}
                <div className="mb-5">
                  <h3 className={`font-bold text-lg mb-1 ${plan.popular ? 'text-white' : 'text-slate-800'}`}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.popular ? 'text-blue-200' : 'text-slate-400'}`}>{plan.period}</span>
                  </div>
                  <p className={`text-sm mt-1 ${plan.popular ? 'text-blue-200' : 'text-slate-500'}`}>{plan.desc}</p>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm">
                      <svg className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-blue-200' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={plan.popular ? 'text-blue-100' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.ctaLink}
                  className={`block w-full text-center font-semibold py-3 rounded-xl transition text-sm ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/pricing" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View full pricing details →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Frequently asked questions</h2>
            <p className="text-slate-500">Everything you need to know before you start.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does the ad analyzer work?',
                a: 'ConvertAI uses a rule-based scoring engine that evaluates your ad copy across 6 key dimensions: clear CTA, value proposition, copy length, urgency language, social proof signals, and spam phrase detection. Each dimension is scored and you get a 0–100 overall conversion score plus specific feedback on what to fix.',
              },
              {
                q: 'Do I need a credit card to start?',
                a: 'No. The Free plan requires no credit card and gives you 5 analyses per month forever. You only need a card when you upgrade to Pro or Agency.',
              },
              {
                q: 'What types of ads does ConvertAI support?',
                a: "ConvertAI analyzes any text-based ad copy: Facebook and Instagram ads, Google Search ads, LinkedIn ads, TikTok ad copy, email subject lines, and landing page headlines. If it's copy, we can score it.",
              },
              {
                q: 'Can I cancel anytime?',
                a: "Yes, absolutely. There are no contracts or lock-in periods. You can cancel your subscription at any time from your account settings and you'll retain access until the end of your billing period.",
              },
              {
                q: 'Is my ad copy stored or shared?',
                a: 'Your ad copy is stored only to power your personal dashboard and history. We never share, sell, or use your ad copy to train models or serve other customers. You own your data.',
              },
              {
                q: "What's the difference between Pro and Agency?",
                a: 'Pro is for individual marketers with unlimited analyses and all tools. Agency adds 10 team seats so you can collaborate with colleagues or clients, white-label reports with your own branding, priority support, and API access for custom integrations.',
              },
            ].map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 to-blue-950 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-5 leading-tight">
            Ready to stop burning<br />ad spend?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-xl mx-auto">
            Join 500+ marketers who've already improved their CTR with ConvertAI. Your first 5 analyses are free.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-blue-500 hover:bg-blue-400 text-white font-bold px-10 py-4 rounded-xl text-lg transition shadow-xl shadow-blue-500/30"
          >
            Start Free — No Credit Card Needed
          </Link>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Free forever plan
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              30-day money-back guarantee
            </span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                C
              </div>
              <div>
                <div className="text-white font-bold">ConvertAI</div>
                <div className="text-xs text-slate-500">Fix Your Ads. Convert More.</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/" className="hover:text-white transition">Home</Link>
              <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
              <Link to="/login" className="hover:text-white transition">Login</Link>
              <Link to="/signup" className="hover:text-white transition">Sign Up</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-600">
            © 2025 ConvertAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
