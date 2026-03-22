const express = require('express');
const cors = require('cors');
const { initDB, insertAnalysis, getStats } = require('./database');
const { analyzeAdCopy, generateRewrites, generateABVariants, auditLandingPage } = require('./analyzer');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));

// POST /api/analyze — analyze ad copy
app.post('/api/analyze', (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'text field is required' });
  }

  const result = analyzeAdCopy(text.trim());
  insertAnalysis('analyze', text.trim(), result.score, result.issues);

  res.json({
    score: result.score,
    issues: result.issues,
    positives: result.positives,
  });
});

// POST /api/rewrite — get 3 rewritten versions
app.post('/api/rewrite', (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'text field is required' });
  }

  const variants = generateRewrites(text.trim());
  insertAnalysis('rewrite', text.trim(), null, ['rewrite requested']);

  res.json({ variants });
});

// POST /api/ab-variants — generate A/B test variants
app.post('/api/ab-variants', (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'text field is required' });
  }

  const result = generateABVariants(text.trim());
  insertAnalysis('ab-test', text.trim(), null, ['ab variants generated']);

  res.json(result);
});

// POST /api/audit-landing — audit landing page HTML or text
app.post('/api/audit-landing', (req, res) => {
  const { content, url } = req.body;
  if (!content && !url) {
    return res.status(400).json({ error: 'content or url field is required' });
  }

  const inputContent = content || url;
  const result = auditLandingPage(inputContent);
  insertAnalysis('landing-audit', inputContent.slice(0, 500), result.score, result.issues);

  res.json({
    score: result.score,
    issues: result.issues,
    positives: result.positives,
    wordCount: result.wordCount,
  });
});

// GET /api/stats — usage stats
app.get('/api/stats', (req, res) => {
  const stats = getStats();
  res.json(stats);
});

// Initialize DB then start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`ConvertAI backend running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
