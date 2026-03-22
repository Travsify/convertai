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

  // Original analyses table
  db.run(`
    CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      input_text TEXT NOT NULL,
      score INTEGER,
      issues TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Usage tracking table
  db.run(`
    CREATE TABLE IF NOT EXISTS usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      month TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      UNIQUE(user_id, month)
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

// ---- User functions ----

function createUser(name, email, passwordHash) {
  if (!db) return null;
  db.run(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );
  const res = db.exec('SELECT last_insert_rowid() as id');
  const id = res[0].values[0][0];
  persist();
  return getUserById(id);
}

function getUserByEmail(email) {
  if (!db) return null;
  const res = db.exec('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  if (!res.length || !res[0].values.length) return null;
  const cols = res[0].columns;
  const vals = res[0].values[0];
  return Object.fromEntries(cols.map((c, i) => [c, vals[i]]));
}

function getUserById(id) {
  if (!db) return null;
  const res = db.exec('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  if (!res.length || !res[0].values.length) return null;
  const cols = res[0].columns;
  const vals = res[0].values[0];
  return Object.fromEntries(cols.map((c, i) => [c, vals[i]]));
}

function updateUser(id, fields) {
  if (!db) return;
  const allowed = ['name', 'email', 'plan', 'stripe_customer_id', 'stripe_subscription_id'];
  const updates = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (!updates.length) return;
  const setClause = updates.map(([k]) => `${k} = ?`).join(', ');
  const values = updates.map(([, v]) => v);
  db.run(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
  persist();
}

function updateUserByStripeCustomer(stripeCustomerId, fields) {
  if (!db) return;
  const allowed = ['plan', 'stripe_subscription_id'];
  const updates = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (!updates.length) return;
  const setClause = updates.map(([k]) => `${k} = ?`).join(', ');
  const values = updates.map(([, v]) => v);
  db.run(`UPDATE users SET ${setClause} WHERE stripe_customer_id = ?`, [...values, stripeCustomerId]);
  persist();
}

// ---- Usage functions ----

function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getUsage(userId) {
  if (!db) return 0;
  const month = getCurrentMonth();
  const res = db.exec('SELECT count FROM usage WHERE user_id = ? AND month = ?', [userId, month]);
  if (!res.length || !res[0].values.length) return 0;
  return res[0].values[0][0];
}

function incrementUsage(userId) {
  if (!db) return;
  const month = getCurrentMonth();
  db.run(`
    INSERT INTO usage (user_id, month, count) VALUES (?, ?, 1)
    ON CONFLICT(user_id, month) DO UPDATE SET count = count + 1
  `, [userId, month]);
  persist();
}

function checkUsageLimit(userId, plan) {
  const LIMITS = { free: 5, pro: Infinity, agency: Infinity };
  const limit = LIMITS[plan] || 5;
  if (limit === Infinity) return { allowed: true, usage: 0, limit };
  const usage = getUsage(userId);
  return { allowed: usage < limit, usage, limit };
}

// ---- Analysis functions ----

function insertAnalysis(type, inputText, score, issues, userId) {
  if (!db) return;
  db.run(
    'INSERT INTO analyses (type, input_text, score, issues, user_id) VALUES (?, ?, ?, ?, ?)',
    [type, inputText, score !== null && score !== undefined ? score : null, JSON.stringify(issues), userId || null]
  );
  persist();
}

function getStats(userId) {
  if (!db) return { totalAnalyses: 0, avgScore: 0, byType: [], topIssues: [], recent: [] };

  const userFilter = userId ? `WHERE user_id = ${userId}` : '';

  const totalRes = db.exec(`SELECT COUNT(*) as count FROM analyses ${userFilter}`);
  const totalAnalyses = totalRes.length > 0 ? totalRes[0].values[0][0] : 0;

  const avgRes = db.exec(`SELECT AVG(score) as avg FROM analyses ${userFilter ? userFilter + ' AND score IS NOT NULL' : 'WHERE score IS NOT NULL'}`);
  const avgRaw = avgRes.length > 0 ? avgRes[0].values[0][0] : null;
  const avgScore = avgRaw ? Math.round(avgRaw) : 0;

  const byTypeRes = db.exec(`SELECT type, COUNT(*) as count FROM analyses ${userFilter} GROUP BY type`);
  const byType = byTypeRes.length > 0
    ? byTypeRes[0].values.map(([type, count]) => ({ type, count }))
    : [];

  const recentRes = db.exec(`SELECT id, type, input_text, score, issues, created_at FROM analyses ${userFilter} ORDER BY created_at DESC LIMIT 5`);
  const recent = recentRes.length > 0
    ? recentRes[0].values.map(([id, type, input_text, score, issues, created_at]) => ({
        id, type, input_text, score, created_at,
        issues: (() => { try { return JSON.parse(issues); } catch { return []; } })()
      }))
    : [];

  const allIssuesRes = db.exec(`SELECT issues FROM analyses ${userFilter ? userFilter + ' AND issues IS NOT NULL' : 'WHERE issues IS NOT NULL'}`);
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

module.exports = {
  initDB,
  insertAnalysis,
  getStats,
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  updateUserByStripeCustomer,
  getUsage,
  incrementUsage,
  checkUsageLimit,
};
