const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'convertai.db');

let db;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      input_text TEXT NOT NULL,
      score INTEGER,
      issues TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  persist();
  return db;
}

function persist() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function insertAnalysis(type, inputText, score, issues) {
  if (!db) return;
  db.run(
    'INSERT INTO analyses (type, input_text, score, issues) VALUES (?, ?, ?, ?)',
    [type, inputText, score !== null && score !== undefined ? score : null, JSON.stringify(issues)]
  );
  persist();
}

function getStats() {
  if (!db) return { totalAnalyses: 0, avgScore: 0, byType: [], topIssues: [], recent: [] };

  const totalRes = db.exec('SELECT COUNT(*) as count FROM analyses');
  const totalAnalyses = totalRes.length > 0 ? totalRes[0].values[0][0] : 0;

  const avgRes = db.exec('SELECT AVG(score) as avg FROM analyses WHERE score IS NOT NULL');
  const avgRaw = avgRes.length > 0 ? avgRes[0].values[0][0] : null;
  const avgScore = avgRaw ? Math.round(avgRaw) : 0;

  const byTypeRes = db.exec('SELECT type, COUNT(*) as count FROM analyses GROUP BY type');
  const byType = byTypeRes.length > 0
    ? byTypeRes[0].values.map(([type, count]) => ({ type, count }))
    : [];

  const recentRes = db.exec('SELECT id, type, input_text, score, issues, created_at FROM analyses ORDER BY created_at DESC LIMIT 5');
  const recent = recentRes.length > 0
    ? recentRes[0].values.map(([id, type, input_text, score, issues, created_at]) => ({
        id, type, input_text, score, created_at,
        issues: (() => { try { return JSON.parse(issues); } catch { return []; } })()
      }))
    : [];

  const allIssuesRes = db.exec('SELECT issues FROM analyses WHERE issues IS NOT NULL');
  const issueCounts = {};
  if (allIssuesRes.length > 0) {
    for (const row of allIssuesRes[0].values) {
      try {
        const issues = JSON.parse(row[0]);
        if (Array.isArray(issues)) {
          for (const issue of issues) {
            if (typeof issue === 'string' && issue.length > 3) {
              issueCounts[issue] = (issueCounts[issue] || 0) + 1;
            }
          }
        }
      } catch (e) { /* skip */ }
    }
  }

  const topIssues = Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([issue, count]) => ({ issue, count }));

  return { totalAnalyses, avgScore, byType, topIssues, recent };
}

module.exports = { initDB, insertAnalysis, getStats };
