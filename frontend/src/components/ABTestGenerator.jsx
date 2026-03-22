import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ABTestGenerator() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedItem, setCopiedItem] = useState(null);
  const [selectedHeadline, setSelectedHeadline] = useState(null);
  const [selectedBody, setSelectedBody] = useState(null);

  const generate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedHeadline(null);
    setSelectedBody(null);
    try {
      const res = await fetch(`${API}/api/ab-variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError('Could not reach the backend. Make sure the server is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  const copy = (txt, key) => {
    navigator.clipboard.writeText(txt).then(() => {
      setCopiedItem(key);
      setTimeout(() => setCopiedItem(null), 2000);
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">A/B Test Variant Generator</h1>
        <p className="text-slate-500 mt-1">Generate multiple headline and body copy variants to test what converts best</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Source Ad Copy</label>
        <textarea
          className="w-full h-32 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
          placeholder="Enter your original ad copy to generate A/B test variants..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={generate}
            disabled={!text.trim() || loading}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm shadow-sm"
          >
            {loading ? 'Generating...' : 'Generate Variants'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Headlines */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-semibold text-slate-700 text-lg">Headline Variants</h2>
              <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {result.headlines.length} variants
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Click a headline to select it for your A/B test plan</p>
            <div className="space-y-2">
              {result.headlines.map((headline, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedHeadline(selectedHeadline === i ? null : i)}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition group ${
                    selectedHeadline === i
                      ? 'border-teal-400 bg-teal-50'
                      : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/50'
                  }`}
                >
                  <span className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5 transition ${
                    selectedHeadline === i ? 'border-teal-500 bg-teal-500 text-white' : 'border-slate-300 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm text-slate-700 flex-1 font-medium leading-relaxed">{headline}</span>
                  <button
                    onClick={e => { e.stopPropagation(); copy(headline, `h-${i}`); }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 text-xs border border-slate-200 px-2 py-1 rounded-lg flex-shrink-0 transition bg-white"
                  >
                    {copiedItem === `h-${i}` ? '✓' : '⎘'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bodies */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-semibold text-slate-700 text-lg">Body Copy Variants</h2>
              <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {result.bodies.length} variants
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Select a body variant to pair with your chosen headline</p>
            <div className="space-y-3">
              {result.bodies.map((body, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedBody(selectedBody === i ? null : i)}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition group ${
                    selectedBody === i
                      ? 'border-violet-400 bg-violet-50'
                      : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/50'
                  }`}
                >
                  <span className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5 transition ${
                    selectedBody === i ? 'border-violet-500 bg-violet-500 text-white' : 'border-slate-300 text-slate-400'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-600 flex-1 leading-relaxed">{body}</span>
                  <button
                    onClick={e => { e.stopPropagation(); copy(body, `b-${i}`); }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 text-xs border border-slate-200 px-2 py-1 rounded-lg flex-shrink-0 transition bg-white self-start"
                  >
                    {copiedItem === `b-${i}` ? '✓' : '⎘'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Test plan summary */}
          {(selectedHeadline !== null || selectedBody !== null) && (
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl border border-teal-200 p-6">
              <h2 className="font-semibold text-slate-700 mb-4">Your A/B Test Plan</h2>
              {selectedHeadline !== null && (
                <div className="mb-3">
                  <div className="text-xs text-teal-600 font-semibold mb-1">SELECTED HEADLINE</div>
                  <div className="bg-white rounded-xl p-3 border border-teal-200 text-sm text-slate-700 font-medium">
                    {result.headlines[selectedHeadline]}
                  </div>
                </div>
              )}
              {selectedBody !== null && (
                <div className="mb-4">
                  <div className="text-xs text-violet-600 font-semibold mb-1">SELECTED BODY</div>
                  <div className="bg-white rounded-xl p-3 border border-violet-200 text-sm text-slate-600 leading-relaxed">
                    {result.bodies[selectedBody]}
                  </div>
                </div>
              )}
              <button
                onClick={() => copy(
                  `HEADLINE: ${selectedHeadline !== null ? result.headlines[selectedHeadline] : ''}\n\nBODY: ${selectedBody !== null ? result.bodies[selectedBody] : ''}`,
                  'plan'
                )}
                className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition shadow-sm"
              >
                {copiedItem === 'plan' ? '✓ Copied!' : '⎘ Copy full variant'}
              </button>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            <strong>Testing Tip:</strong> Run each variant for at least 1,000 impressions before drawing conclusions.
            Test one element at a time — don't change the headline and body simultaneously in the same test.
          </div>
        </div>
      )}
    </div>
  );
}
