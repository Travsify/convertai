const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const {
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
} = require('./database');

const { analyzeAdCopy, generateRewrites, generateABVariants, auditLandingPage } = require('./analyzer');
const { authMiddleware, JWT_SECRET } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://convertairepo.vercel.app';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;
const STRIPE_AGENCY_PRICE_ID = process.env.STRIPE_AGENCY_PRICE_ID;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// CORS
app.use(cors({
  origin: [
    'https://convertairepo.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));

// For Stripe webhooks we need raw body — mount before json middleware
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ error: 'Stripe not configured' });
  }
  const stripe = require('stripe')(STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const plan = session.metadata?.plan || 'pro';

        if (customerId) {
          updateUserByStripeCustomer(customerId, {
            plan,
            stripe_subscription_id: subscriptionId,
          });
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const customerId = sub.customer;
        const status = sub.status;
        if (status === 'active' || status === 'trialing') {
          const priceId = sub.items?.data?.[0]?.price?.id;
          let plan = 'pro';
          if (priceId === STRIPE_AGENCY_PRICE_ID) plan = 'agency';
          updateUserByStripeCustomer(customerId, { plan, stripe_subscription_id: sub.id });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        updateUserByStripeCustomer(sub.customer, { plan: 'free', stripe_subscription_id: null });
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  res.json({ received: true });
});

app.use(express.json({ limit: '2mb' }));

// ---- AUTH ROUTES ----

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const existing = getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = createUser(name.trim(), email.toLowerCase().trim(), passwordHash);
    if (!user) {
      return res.status(500).json({ error: 'Failed to create account' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, plan: user.plan, usage: 0 },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = getUserByEmail(email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  try {
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const usage = getUsage(user.id);
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, plan: user.plan, usage },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me — get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const usage = getUsage(user.id);
  res.json({ id: user.id, name: user.name, email: user.email, plan: user.plan, usage });
});

// PATCH /api/auth/me — update profile
app.patch('/api/auth/me', authMiddleware, (req, res) => {
  const { name, email } = req.body;
  if (!name && !email) return res.status(400).json({ error: 'Nothing to update' });

  const updates = {};
  if (name) updates.name = name.trim();
  if (email) updates.email = email.toLowerCase().trim();

  updateUser(req.user.id, updates);
  const user = getUserById(req.user.id);
  const usage = getUsage(user.id);

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, plan: user.plan, usage },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } });
});

// ---- STRIPE ROUTES ----

// GET /api/stripe/plans
app.get('/api/stripe/plans', (req, res) => {
  res.json({
    plans: [
      { id: 'free', name: 'Free', price: 0, period: 'month', features: ['5 analyses/month', 'Ad analyzer', 'Dashboard'] },
      { id: 'pro', name: 'Pro', price: 29, period: 'month', features: ['Unlimited analyses', 'AI rewrites', 'A/B variants', 'Landing audit'] },
      { id: 'agency', name: 'Agency', price: 99, period: 'month', features: ['Everything in Pro', '10 seats', 'White-label', 'API access'] },
    ]
  });
});

// POST /api/stripe/create-checkout
app.post('/api/stripe/create-checkout', authMiddleware, async (req, res) => {
  if (!STRIPE_SECRET_KEY) {
    return res.status(400).json({ error: 'Stripe not configured on this server' });
  }

  const { plan, annual } = req.body;
  const priceId = plan === 'agency' ? STRIPE_AGENCY_PRICE_ID : STRIPE_PRO_PRICE_ID;

  if (!priceId) {
    return res.status(400).json({ error: 'Stripe price ID not configured' });
  }

  const stripe = require('stripe')(STRIPE_SECRET_KEY);
  const user = getUserById(req.user.id);

  try {
    // Create or retrieve Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: String(user.id) },
      });
      customerId = customer.id;
      updateUser(user.id, { stripe_customer_id: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${FRONTEND_URL}/dashboard?upgraded=1`,
      cancel_url: `${FRONTEND_URL}/pricing?cancelled=1`,
      metadata: { plan, userId: String(user.id) },
      ...(annual ? { subscription_data: { trial_period_days: 0 } } : {}),
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/stripe/billing-portal
app.post('/api/stripe/billing-portal', authMiddleware, async (req, res) => {
  if (!STRIPE_SECRET_KEY) {
    return res.status(400).json({ error: 'Stripe not configured' });
  }

  const user = getUserById(req.user.id);
  if (!user.stripe_customer_id) {
    return res.status(400).json({ error: 'No billing account found' });
  }

  const stripe = require('stripe')(STRIPE_SECRET_KEY);
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${FRONTEND_URL}/account`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Billing portal error:', err);
    res.status(500).json({ error: 'Failed to open billing portal' });
  }
});

// ---- USAGE LIMIT MIDDLEWARE ----
function usageLimitMiddleware(req, res, next) {
  if (!req.user) return next(); // no auth = guest usage allowed for now

  const { allowed, usage, limit } = checkUsageLimit(req.user.id, req.user.plan);
  if (!allowed) {
    return res.status(429).json({
      error: 'Monthly analysis limit reached',
      usage,
      limit,
      upgrade: '/pricing',
      message: `You've used all ${limit} analyses this month. Upgrade to Pro for unlimited access.`,
    });
  }
  next();
}

// ---- ANALYSIS ROUTES (with optional auth + usage limits) ----

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      req.user = require('jsonwebtoken').verify(token, JWT_SECRET);
    } catch { /* ignore invalid token */ }
  }
  next();
}

// POST /api/analyze
app.post('/api/analyze', optionalAuth, usageLimitMiddleware, (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'text field is required' });
  }

  const result = analyzeAdCopy(text.trim());
  const userId = req.user?.id;
  insertAnalysis('analyze', text.trim(), result.score, result.issues, userId);
  if (userId) incrementUsage(userId);

  res.json({ score: result.score, issues: result.issues, positives: result.positives });
});

// POST /api/rewrite
app.post('/api/rewrite', optionalAuth, usageLimitMiddleware, (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'text field is required' });
  }

  const variants = generateRewrites(text.trim());
  const userId = req.user?.id;
  insertAnalysis('rewrite', text.trim(), null, ['rewrite requested'], userId);
  if (userId) incrementUsage(userId);

  res.json({ variants });
});

// POST /api/ab-variants
app.post('/api/ab-variants', optionalAuth, usageLimitMiddleware, (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'text field is required' });
  }

  const result = generateABVariants(text.trim());
  const userId = req.user?.id;
  insertAnalysis('ab-test', text.trim(), null, ['ab variants generated'], userId);
  if (userId) incrementUsage(userId);

  res.json(result);
});

// POST /api/audit-landing
app.post('/api/audit-landing', optionalAuth, usageLimitMiddleware, (req, res) => {
  const { content, url } = req.body;
  if (!content && !url) {
    return res.status(400).json({ error: 'content or url field is required' });
  }

  const inputContent = content || url;
  const result = auditLandingPage(inputContent);
  const userId = req.user?.id;
  insertAnalysis('landing-audit', inputContent.slice(0, 500), result.score, result.issues, userId);
  if (userId) incrementUsage(userId);

  res.json({ score: result.score, issues: result.issues, positives: result.positives, wordCount: result.wordCount });
});

// GET /api/stats
app.get('/api/stats', optionalAuth, (req, res) => {
  const userId = req.user?.id;
  const stats = getStats(userId);
  res.json(stats);
});

// Initialize DB then start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`ConvertAI backend running on http://localhost:${PORT}`);
    console.log(`Stripe configured: ${!!STRIPE_SECRET_KEY}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
