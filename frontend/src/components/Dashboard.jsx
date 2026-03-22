import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '';

function ScoreCircle({ score, size = 'md' }) {
  const color = score >= 70 ? 'text-green-500' : score >= 40 ? 'text-yellow-500' : 'text-red-500';
  const ring = score >= 70 ? 'border-green-400' : score >= 40 ? 'border-yellow-400' : 'border-red-400';
  const sz = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-lg';
  return (
    <div className={`${sz} rounded-full border-4 ${ring} flex items-center justify-center font-bold ${color}`}>
      {score}
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError('Could not connect to backend. Make sure the server is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const typeLabel = {
    analyze: 'Ad Analysis',
    rewrite: 'Rewrite',
    'ab-test': 'A/B Test',
    'landing-audit': 'Landing Audit',
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your ad analyses and conversion insights</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-red-400 text-xl">⚠️</span>
          <div>
            <div className="font-semibold">Backend not reachable</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-sm">Loading stats...</span>
          </div>
        </div>
      ) : stats ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="text-4xl font-bold text-blue-600">{stats.totalAnalyses}</div>
              <div className="text-slate-500 text-sm mt-1">Total Analyses</div>
              <div className="text-xs text-slate-400 mt-2">All types combined</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <ScoreCircle score={stats.avgScore} size="lg" />
                <div>
                  <div className="text-slate-700 font-semibold">Avg Score</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {stats.avgScore >= 70 ? 'Good overall quality' : stats.avgScore >= 40 ? 'Needs improvement' : 'Critical issues found'}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="text-4xl font-bold text-indigo-600">{stats.topIssues.length}</div>
              <div className="text-slate-500 text-sm mt-1">Unique Issues Found</div>
              <div className="text-xs text-slate-400 mt-2">Across all analyses</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Analysis by type */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-700 mb-4">Analyses by Type</h2>
              {stats.byType.length === 0 ? (
                <div className="text-slate-400 text-sm py-4 text-center">No analyses yet. Start analyzing!</div>
              ) : (
                <div className="space-y-3">
                  {stats.byType.map(item => (
                    <div key={item.type} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{typeLabel[item.type] || item.type}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 rounded-full bg-blue-200 w-24 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${Math.min(100, (item.count / Math.max(...stats.byType.map(t => t.count))) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 w-6 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top issues */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-700 mb-4">Top Issues Found</h2>
              {stats.topIssues.length === 0 ? (
                <div className="text-slate-400 text-sm py-4 text-center">No issues yet.</div>
              ) : (
                <div className="space-y-2">
                  {stats.topIssues.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-red-100 text-red-500 text-xs flex items-center justify-center font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm text-slate-600">{item.issue}</span>
                      <span className="ml-auto text-xs font-semibold text-red-400 flex-shrink-0">{item.count}×</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent analyses */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
            <h2 className="font-semibold text-slate-700 mb-4">Recent Analyses</h2>
            {stats.recent.length === 0 ? (
              <div className="text-slate-400 text-sm py-6 text-center">
                No analyses yet. Try the{' '}
                <button className="text-blue-500 underline" onClick={() => onNavigate('analyzer')}>Ad Analyzer</button>!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-100">
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Input (preview)</th>
                      <th className="pb-3 font-medium">Score</th>
                      <th className="pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent.map(row => (
                      <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-3 pr-4">
                          <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-medium">
                            {typeLabel[row.type] || row.type}
                          </span>
                        </td>
                        <td className="py-3 pr-4 max-w-xs truncate text-slate-600">{row.input_text}</td>
                        <td className="py-3 pr-4">
                          {row.score != null ? (
                            <span className={`font-semibold ${row.score >= 70 ? 'text-green-600' : row.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {row.score}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-3 text-slate-400">{new Date(row.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { id: 'analyzer', label: 'Analyze Ad', icon: '🔍', color: 'from-blue-500 to-blue-600' },
              { id: 'rewrite', label: 'Rewrite Ad', icon: '✍️', color: 'from-violet-500 to-violet-600' },
              { id: 'abtest', label: 'A/B Test', icon: '🧪', color: 'from-teal-500 to-teal-600' },
              { id: 'audit', label: 'Audit Page', icon: '🏠', color: 'from-orange-500 to-orange-600' },
            ].map(action => (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className={`bg-gradient-to-br ${action.color} text-white rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="font-semibold text-sm">{action.label}</div>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
