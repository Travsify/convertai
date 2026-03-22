import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || '';

function ScoreCircle({ score }) {
  const isGood = score >= 70;
  const isMedium = score >= 40 && score < 70;
  const color = isGood ? '#22c55e' : isMedium ? '#eab308' : '#ef4444';
  const label = isGood ? 'Good' : isMedium ? 'Needs Work' : 'Poor';
  const circumference = 2 * Math.PI * 36;
  const strokeDash = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#e2e8f0" strokeWidth="7" />
          <circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

export default function AdAnalyzer() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError('Could not reach the backend. Make sure the server is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Ad Copy Analyzer</h1>
        <p className="text-slate-500 mt-1">Paste your ad copy below to get an instant score and detailed feedback</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Your Ad Copy</label>
        <textarea
          className="w-full h-36 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="Paste your ad copy here... e.g. 'Upgrade your workflow with our all-in-one project management tool. Start free today!'"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-400">{text.length} characters</span>
          <button
            onClick={analyze}
            disabled={!text.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm shadow-sm"
          >
            {loading ? 'Analyzing...' : 'Analyze Ad'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div className="space-y-5 animate-in">
          {/* Score card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-8">
            <ScoreCircle score={result.score} />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-800 mb-1">Your Ad Score</h2>
              <p className="text-sm text-slate-500 mb-3">
                {result.score >= 70
                  ? 'Great ad copy! A few refinements could still push conversions higher.'
                  : result.score >= 40
                  ? 'Your ad has potential but is missing key conversion elements.'
                  : 'This ad is unlikely to convert well. It needs significant improvements.'}
              </p>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${
                    result.score >= 70 ? 'bg-green-400' : result.score >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-500 text-xs flex items-center justify-center font-bold">!</span>
                Issues Found ({result.issues.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.issues.map((issue, i) => (
                  <span key={i} className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                    ✕ {issue}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Positives */}
          {result.positives.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-500 text-xs flex items-center justify-center font-bold">✓</span>
                What's Working ({result.positives.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.positives.map((pos, i) => (
                  <span key={i} className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                    ✓ {pos}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Scoring breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-semibold text-slate-700 mb-4">Scoring Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Clear CTA', max: 20 },
                { label: 'Value Proposition', max: 20 },
                { label: 'Length', max: 15 },
                { label: 'Urgency', max: 15 },
                { label: 'Social Proof', max: 15 },
                { label: 'No Spam', max: 15 },
              ].map(item => {
                const earned = result.positives.some(p =>
                  (item.label === 'Clear CTA' && p.toLowerCase().includes('cta')) ||
                  (item.label === 'Value Proposition' && p.toLowerCase().includes('value')) ||
                  (item.label === 'Length' && p.toLowerCase().includes('length')) ||
                  (item.label === 'Urgency' && p.toLowerCase().includes('urgency')) ||
                  (item.label === 'Social Proof' && p.toLowerCase().includes('social')) ||
                  (item.label === 'No Spam' && p.toLowerCase().includes('spam'))
                ) ? item.max : 0;
                return (
                  <div key={item.label} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{item.label}</span>
                      <span className={earned > 0 ? 'text-green-600 font-semibold' : 'text-red-400'}>
                        {earned}/{item.max}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${earned > 0 ? 'bg-green-400' : 'bg-red-200'}`}
                        style={{ width: earned > 0 ? '100%' : '0%' }}
                      />
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
