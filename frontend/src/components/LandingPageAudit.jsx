import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function ScoreCircle({ score }) {
  const isGood = score >= 70;
  const isMedium = score >= 40 && score < 70;
  const color = isGood ? '#22c55e' : isMedium ? '#eab308' : '#ef4444';
  const circumference = 2 * Math.PI * 36;
  const strokeDash = (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#e2e8f0" strokeWidth="7" />
        <circle
          cx="40" cy="40" r="36"
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-slate-400">/100</span>
      </div>
    </div>
  );
}

export default function LandingPageAudit() {
  const [inputMode, setInputMode] = useState('html'); // 'html' or 'url'
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const audit = async () => {
    const payload = inputMode === 'html'
      ? { content: content.trim() }
      : { content: url.trim(), url: url.trim() };
    if (!payload.content) return;

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/api/audit-landing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Audit failed');
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError('Could not reach the backend. Make sure the server is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  const hasInput = inputMode === 'html' ? content.trim().length > 0 : url.trim().length > 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Landing Page Audit</h1>
        <p className="text-slate-500 mt-1">Paste your landing page HTML or URL text to find conversion-killing issues</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        {/* Mode toggle */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setInputMode('html')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition border ${
              inputMode === 'html'
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:border-orange-300'
            }`}
          >
            Paste HTML / Text
          </button>
          <button
            onClick={() => setInputMode('url')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition border ${
              inputMode === 'url'
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:border-orange-300'
            }`}
          >
            Enter Page Copy
          </button>
        </div>

        {inputMode === 'html' ? (
          <>
            <label className="block text-sm font-medium text-slate-700 mb-2">Landing Page HTML or Content</label>
            <textarea
              className="w-full h-48 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              placeholder={`Paste your landing page HTML or plain text here...\n\nExample:\n<h1>Boost Your Sales by 200%</h1>\n<p>Join 10,000+ businesses that trust us...</p>\n<button>Start Free Trial</button>`}
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </>
        ) : (
          <>
            <label className="block text-sm font-medium text-slate-700 mb-2">Page Copy or Description</label>
            <textarea
              className="w-full h-48 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              placeholder="Describe your landing page or paste the visible text content (headline, body, CTA buttons, testimonials, etc.)..."
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-400">
            {inputMode === 'html'
              ? `${content.length} characters`
              : `${url.length} characters`}
          </span>
          <button
            onClick={audit}
            disabled={!hasInput || loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm shadow-sm"
          >
            {loading ? 'Auditing...' : 'Audit Landing Page'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div className="space-y-5">
          {/* Score overview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-8">
            <ScoreCircle score={result.score} />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-800 mb-1">Conversion Score</h2>
              <p className="text-sm text-slate-500 mb-3">
                {result.score >= 70
                  ? 'Your landing page is well optimized for conversions.'
                  : result.score >= 40
                  ? 'Some important conversion elements are missing.'
                  : 'This page has serious conversion issues that need immediate attention.'}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500">
                  Word count: <strong className="text-slate-700">{result.wordCount}</strong>
                </span>
                <span className="text-red-500">
                  {result.issues.length} issue{result.issues.length !== 1 ? 's' : ''}
                </span>
                <span className="text-green-500">
                  {result.positives.length} positive{result.positives.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-500 text-xs flex items-center justify-center font-bold">!</span>
                Conversion Issues ({result.issues.length})
              </h2>
              <div className="space-y-2">
                {result.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="w-5 h-5 flex-shrink-0 rounded-full bg-red-200 text-red-600 text-xs flex items-center justify-center font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-red-700">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Positives */}
          {result.positives.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-500 text-xs flex items-center justify-center font-bold">✓</span>
                What's Working ({result.positives.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.positives.map((pos, i) => (
                  <span key={i} className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-xl flex items-center gap-1.5">
                    <span className="text-green-400">✓</span> {pos}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-semibold text-slate-700 mb-4">Priority Fixes</h2>
            <div className="space-y-3">
              {result.issues.slice(0, 3).map((issue, i) => {
                const priorities = ['🔴 Critical', '🟠 High', '🟡 Medium'];
                const fixes = {
                  'No call-to-action found': 'Add a prominent button with action text like "Start Free Trial", "Get Quote", or "Download Now".',
                  'Missing value proposition': 'Add a clear statement of what you offer and why it\'s better, ideally above the fold.',
                  'No social proof': 'Add 2-3 customer testimonials with names and photos, or display review counts.',
                  'No trust signals': 'Add SSL badge, money-back guarantee, or privacy policy link near your CTA.',
                  'No urgency elements': 'Add a countdown timer, limited offer, or "only X spots left" near your CTA.',
                  'No clear headline detected': 'Add a bold, benefit-focused H1 headline at the top of the page.',
                };
                const fixText = Object.entries(fixes).find(([key]) => issue.includes(key.split(' ').slice(0, 3).join(' ')));
                return (
                  <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-sm font-medium text-slate-500 flex-shrink-0 mt-0.5">{priorities[i] || '🟢 Low'}</span>
                    <div>
                      <div className="text-sm font-semibold text-slate-700 mb-1">{issue}</div>
                      {fixText && (
                        <div className="text-xs text-slate-500">{fixText[1]}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
