import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import AdAnalyzer from './components/AdAnalyzer.jsx';
import RewriteSuggestions from './components/RewriteSuggestions.jsx';
import ABTestGenerator from './components/ABTestGenerator.jsx';
import LandingPageAudit from './components/LandingPageAudit.jsx';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'analyzer', label: 'Ad Analyzer', icon: '🔍' },
  { id: 'rewrite', label: 'AI Rewrites', icon: '✍️' },
  { id: 'abtest', label: 'A/B Variants', icon: '🧪' },
  { id: 'audit', label: 'Landing Audit', icon: '🏠' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm fixed h-full z-10">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow">
              C
            </div>
            <div>
              <div className="font-bold text-slate-800 text-lg leading-tight">ConvertAI</div>
              <div className="text-xs text-slate-400">Ad Conversion Suite</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <div className="text-xs text-slate-400 text-center">
            ConvertAI v1.0 · Rule-based Engine
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-8 min-h-screen">
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'analyzer' && <AdAnalyzer />}
        {activeTab === 'rewrite' && <RewriteSuggestions />}
        {activeTab === 'abtest' && <ABTestGenerator />}
        {activeTab === 'audit' && <LandingPageAudit />}
      </main>
    </div>
  );
}
