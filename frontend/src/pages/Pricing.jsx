import { useState } from 'react';
import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { useAuth } from '../contexts/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const { token } = useAuth();

  const handleCheckout = async (plan) => {
    setLoadingPlan(plan);
    try {
      const res = await fetch(`${API}/api/stripe/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan, annual }),
      });
      if (!res.ok) throw new Error('Checkout failed');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      alert('Could not start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      key: 'free',
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      desc: 'Perfect for getting started',
      features: [
        '5 analyses per month',
        'Ad copy analyzer',
        'Basic score breakdown',
        'Performance dashboard',
        'Spam phrase detector',
      ],
      notIncluded: ['AI rewrite suggestions', 'A/B variant generator', 'Landing page audit', 'Team seats'],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      key: 'pro',
      name: 'Pro',
      monthlyPrice: 29,
      yearlyPrice: 24,
      desc: 'For serious marketers',
      features: [
        'Unlimited analyses',
        'Ad copy analyzer (all features)',
        'AI rewrite suggestions (3 variants)',
        'A/B test generator (5+ variants)',
        'Landing page audit',
        'Performance dashboard',
        'Email support',
      ],
      notIncluded: ['Team seats', 'White-label reports', 'API access'],
      cta: 'Start Pro Trial',
      popular: true,
    },
    {
      key: 'agency',
      name: 'Agency',
      monthlyPrice: 99,
      yearlyPrice: 82,
      desc: 'For agencies and teams',
      features: [
        'Everything in Pro',
        '10 team seats',
        'White-label reports',
        'Priority support',
        'API access',
        'Client management',
        'Bulk analysis',
      ],
      notIncluded: [],
      cta: 'Start Agency Trial',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-slate-50 to-white text-center">
        <div className="max-w-3xl mx-auto">
          <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Pricing</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-3 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-slate-500 mb-8">
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>

          {/* Monthly / Annual toggle */}
          <div className="inline-flex items-center gap-3 bg-slate-100 rounded-xl p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${!annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Annual
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Save 2 months</span>
            </button>
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const price = annual ? plan.yearlyPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.key}
                  className={`rounded-2xl border p-7 relative flex flex-col ${
                    plan.popular
                      ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-500/25 scale-105'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className={`font-bold text-xl mb-1 ${plan.popular ? 'text-white' : 'text-slate-800'}`}>{plan.name}</h3>
                    <div className="flex items-baseline gap-1 my-3">
                      <span className={`text-5xl font-black ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                        ${price}
                      </span>
                      <span className={`text-sm ${plan.popular ? 'text-blue-200' : 'text-slate-400'}`}>/month</span>
                    </div>
                    {annual && price > 0 && (
                      <div className={`text-xs ${plan.popular ? 'text-blue-200' : 'text-green-600'} font-medium`}>
                        Billed ${price * 12}/year — save ${(plan.monthlyPrice - price) * 12}/year
                      </div>
                    )}
                    <p className={`text-sm mt-2 ${plan.popular ? 'text-blue-200' : 'text-slate-500'}`}>{plan.desc}</p>
                  </div>

                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-blue-200' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={plan.popular ? 'text-blue-100' : 'text-slate-600'}>{f}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm opacity-40">
                        <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-blue-300' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className={plan.popular ? 'text-blue-200' : 'text-slate-500'}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.key === 'free' ? (
                    <Link
                      to="/signup"
                      className="block w-full text-center font-semibold py-3 rounded-xl transition text-sm bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      {plan.cta}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleCheckout(plan.key)}
                      disabled={loadingPlan === plan.key}
                      className={`w-full font-semibold py-3 rounded-xl transition text-sm disabled:opacity-60 ${
                        plan.popular
                          ? 'bg-white text-blue-600 hover:bg-blue-50'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {loadingPlan === plan.key ? 'Loading...' : plan.cta}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Money-back guarantee */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-6 py-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <div className="font-bold text-slate-800 text-sm">30-Day Money-Back Guarantee</div>
                <div className="text-slate-500 text-xs">Not satisfied? Get a full refund within 30 days, no questions asked.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Full feature comparison</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-slate-600 font-semibold">Feature</th>
                  <th className="px-6 py-4 text-slate-600 font-semibold text-center">Free</th>
                  <th className="px-6 py-4 text-blue-600 font-semibold text-center bg-blue-50">Pro</th>
                  <th className="px-6 py-4 text-slate-600 font-semibold text-center">Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ['Monthly analyses', '5', 'Unlimited', 'Unlimited'],
                  ['Ad copy analyzer', true, true, true],
                  ['Score breakdown', 'Basic', 'Full', 'Full'],
                  ['AI rewrite suggestions', false, '3 variants', '3 variants'],
                  ['A/B variant generator', false, '5+ variants', '5+ variants'],
                  ['Landing page audit', false, true, true],
                  ['Performance dashboard', true, true, true],
                  ['Team seats', '1', '1', '10'],
                  ['White-label reports', false, false, true],
                  ['API access', false, false, true],
                  ['Support', 'Community', 'Email', 'Priority'],
                ].map(([feature, free, pro, agency], i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 text-slate-700 font-medium">{feature}</td>
                    {[free, pro, agency].map((val, j) => (
                      <td key={j} className={`px-6 py-3.5 text-center ${j === 1 ? 'bg-blue-50/50' : ''}`}>
                        {val === true ? (
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : val === false ? (
                          <svg className="w-4 h-4 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <span className="text-slate-600 font-medium">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Pricing FAQ</h2>
          <div className="space-y-3">
            {[
              { q: 'Can I change plans later?', a: 'Yes. You can upgrade or downgrade at any time. When you upgrade, you get immediate access. When you downgrade, the change takes effect at the next billing cycle.' },
              { q: 'What happens when I hit my free plan limit?', a: 'You\'ll see an upgrade prompt within the dashboard. Your existing analyses and history remain accessible — you just can\'t run new analyses until you upgrade or wait for the next month.' },
              { q: 'Do you offer refunds?', a: 'Yes. We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied for any reason, contact us within 30 days for a full refund.' },
              { q: 'Is there a free trial for Pro?', a: 'The Free plan lets you try the core analyzer with 5 analyses per month. For a full Pro trial, you can start with our 30-day money-back guarantee — get full access risk-free.' },
            ].map((faq, i) => (
              <PricingFaq key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">C</div>
            <span className="text-white font-bold">ConvertAI</span>
          </div>
          <div className="flex gap-5 text-sm">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link to="/login" className="hover:text-white transition">Login</Link>
            <Link to="/signup" className="hover:text-white transition">Sign Up</Link>
          </div>
          <div className="text-xs text-slate-600">© 2025 ConvertAI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

function PricingFaq({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-100 transition"
      >
        <span className="font-semibold text-slate-800 text-sm pr-4">{q}</span>
        <svg className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-200 pt-3">{a}</div>
      )}
    </div>
  );
}
