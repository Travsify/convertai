import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TopNav from '../components/TopNav';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PLAN_INFO = {
  free: { label: 'Free', color: 'bg-slate-100 text-slate-700', limit: 5 },
  pro: { label: 'Pro', color: 'bg-blue-100 text-blue-700', limit: null },
  agency: { label: 'Agency', color: 'bg-violet-100 text-violet-700', limit: null },
};

export default function Account() {
  const { user, token, login, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [billingLoading, setBillingLoading] = useState(false);

  const plan = user?.plan || 'free';
  const usage = user?.usage || 0;
  const planInfo = PLAN_INFO[plan];
  const limit = planInfo.limit;
  const usagePct = limit ? Math.min(100, (usage / limit) * 100) : 0;

  const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveMsg('');
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      if (data.token) login(data.token);
      setSaveMsg('Profile updated successfully.');
    } catch (e) {
      setSaveMsg('Failed to save. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleBillingPortal = async () => {
    setBillingLoading(true);
    try {
      const res = await fetch(`${API}/api/stripe/billing-portal`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      alert('Could not open billing portal. Please try again.');
    } finally {
      setBillingLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Account & Billing</h1>
          <p className="text-slate-500 mt-1">Manage your profile, plan, and billing settings</p>
        </div>

        <div className="space-y-6">
          {/* Current Plan */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 text-lg mb-4">Current Plan</h2>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <span className={`text-sm font-bold px-3 py-1.5 rounded-full capitalize ${planInfo.color}`}>
                  {planInfo.label} Plan
                </span>
                <div>
                  <div className="font-semibold text-slate-800">
                    {plan === 'free' ? '$0/month' : plan === 'pro' ? '$29/month' : '$99/month'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {plan === 'free' ? '5 analyses per month' : 'Unlimited analyses'}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                {plan !== 'agency' && (
                  <Link
                    to="/pricing"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                  >
                    Upgrade Plan
                  </Link>
                )}
                {plan !== 'free' && (
                  <button
                    onClick={handleBillingPortal}
                    disabled={billingLoading}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2 rounded-xl transition disabled:opacity-60"
                  >
                    {billingLoading ? 'Loading...' : 'Manage Billing'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 text-lg mb-4">Usage — {month}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              {[
                { label: 'Analyses Run', value: usage, color: 'text-blue-600' },
                { label: 'Limit', value: limit === null ? '∞' : limit, color: 'text-slate-700' },
                { label: 'Remaining', value: limit === null ? '∞' : Math.max(0, limit - usage), color: limit !== null && limit - usage <= 1 ? 'text-red-500' : 'text-green-600' },
                { label: 'Plan', value: planInfo.label, color: 'text-slate-700' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4 text-center">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            {limit !== null && (
              <>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>{usage} of {limit} analyses used</span>
                  <span>{Math.round(usagePct)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${usagePct >= 100 ? 'bg-red-400' : usagePct >= 80 ? 'bg-amber-400' : 'bg-blue-500'}`}
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
                {usagePct >= 80 && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex items-center justify-between">
                    <span>
                      {usagePct >= 100 ? "You've hit your monthly limit." : "You're approaching your monthly limit."}
                    </span>
                    <Link to="/pricing" className="text-amber-700 font-semibold underline ml-3 whitespace-nowrap">
                      Upgrade now
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Profile */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 text-lg mb-4">Profile Settings</h2>
            <form onSubmit={handleSave} className="space-y-4">
              {saveMsg && (
                <div className={`rounded-xl p-3 text-sm ${saveMsg.includes('success') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  {saveMsg}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 text-lg mb-2">Sign Out</h2>
            <p className="text-slate-500 text-sm mb-4">You'll be signed out of your account on this device.</p>
            <button
              onClick={handleLogout}
              className="border border-red-200 hover:bg-red-50 text-red-600 text-sm font-semibold px-4 py-2.5 rounded-xl transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
