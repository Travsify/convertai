import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function ScoreBadge({ score }) {
  const color = score >= 70 ? 'bg-green-100 text-green-700 border-green-200'
    : score >= 40 ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
    : 'bg-red-100 text-red-700 border-red-200';
  return (
    <span className={`border text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      Score: {score}
    </span>
  );
}

export default function RewriteSuggestions() {
  const [text, setText] = useState('');
  const [variants, setVariants] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setVariants(null);
    try {
      const res = await fetch(`${API}/api/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Rewrite failed');
      const data = await res.json();
      setVariants(data.variants);
    } catch (e) {
      setError('Could not reach the backend. Make sure the server is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (txt, idx) => {
    navigator.clipboard.writeText(txt).then(() => {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const variantColors = [
    'border-l-blue-400 bg-blue-50',
    'border-l-violet-400 bg-violet-50',
    'border-l-teal-400 bg-teal-50',
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">AI Rewrite Suggestions</h1>
        <p className="text-slate-500 mt-1">Get 3 improved versions of your ad copy with different conversion strategies</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Original Ad Copy</label>
        <textarea
          className="w-full h-32 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
          placeholder="Paste your underperforming ad copy here..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={generate}
            disabled={!text.trim() || loading}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm shadow-sm"
          >
            {loading ? 'Generating...' : 'Generate 3 Rewrites'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      {variants && (
        <div className="space-y-5">
          <h2 className="font-semibold text-slate-700 text-lg">Rewrite Suggestions</h2>
          {variants.map((v, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-l-4 border-slate-200 shadow-sm p-6 ${variantColors[i]}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-bold flex items-center justify-center shadow-sm">
                    {v.variant}
                  </span>
                  <span className="font-semibold text-slate-700">{v.label}</span>
                </div>
                <ScoreBadge score={v.analysis.score} />
              </div>

              <p className="text-slate-600 text-sm leading-relaxed bg-white rounded-xl p-4 border border-slate-100 mb-4">
                {v.text}
              </p>

              {/* Issues & Positives */}
              <div className="flex flex-wrap gap-2 mb-4">
                {v.analysis.issues.slice(0, 2).map((issue, j) => (
                  <span key={j} className="bg-red-50 border border-red-200 text-red-600 text-xs px-2.5 py-1 rounded-lg">
                    ✕ {issue}
                  </span>
                ))}
                {v.analysis.positives.slice(0, 2).map((pos, j) => (
                  <span key={j} className="bg-green-50 border border-green-200 text-green-700 text-xs px-2.5 py-1 rounded-lg">
                    ✓ {pos}
                  </span>
                ))}
              </div>

              <button
                onClick={() => copyToClipboard(v.text, i)}
                className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 px-4 py-1.5 rounded-lg hover:bg-white transition flex items-center gap-2"
              >
                {copiedIndex === i ? '✓ Copied!' : '⎘ Copy text'}
              </button>
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            <strong>Tip:</strong> These rewrites use template structures. Customize the bracketed placeholders (like <code className="bg-blue-100 px-1 rounded">[pain point]</code>) with specifics from your product or audience.
          </div>
        </div>
      )}
    </div>
  );
}
