// Rule-based ad copy analyzer

const CTA_KEYWORDS = ['buy', 'get', 'try', 'start', 'sign up', 'download', 'click', 'learn more', 'shop now', 'order', 'subscribe', 'join', 'book', 'claim'];
const VALUE_KEYWORDS = ['save', 'free', 'guaranteed', '%', 'results', 'proven', 'boost', 'increase', 'reduce', 'improve', 'exclusive', 'deal', 'discount', 'off'];
const URGENCY_KEYWORDS = ['today', 'now', 'limited', 'last chance', 'expires', 'hurry', "don't miss", 'urgent', 'ending soon', 'only', 'while supplies last', 'act fast'];
const SOCIAL_PROOF_KEYWORDS = ['customers', 'reviews', 'rated', 'trusted', 'users', 'people', '#1', 'best', 'award', 'million', 'thousand', 'clients', '5 star', 'top rated'];
const SPAM_PHRASES = ['click here', 'free money', 'guaranteed income', 'work from home', 'make money fast', 'earn cash', 'risk free', '!!!', 'act now!!!', '$$$'];

function containsAny(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some(kw => lower.includes(kw.toLowerCase()));
}

function findMatches(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.filter(kw => lower.includes(kw.toLowerCase()));
}

function analyzeAdCopy(text) {
  let score = 0;
  const issues = [];
  const positives = [];

  // Check CTA
  if (containsAny(text, CTA_KEYWORDS)) {
    score += 20;
    const matches = findMatches(text, CTA_KEYWORDS);
    positives.push(`Clear CTA found: "${matches[0]}"`);
  } else {
    issues.push('Missing clear call-to-action (CTA)');
  }

  // Check value proposition
  if (containsAny(text, VALUE_KEYWORDS)) {
    score += 20;
    const matches = findMatches(text, VALUE_KEYWORDS);
    positives.push(`Value proposition present: "${matches[0]}"`);
  } else {
    issues.push('No value proposition — why should the customer care?');
  }

  // Check length
  const len = text.trim().length;
  if (len >= 50 && len <= 300) {
    score += 15;
    positives.push(`Good length (${len} characters)`);
  } else if (len < 50) {
    issues.push(`Too short (${len} chars) — add more context`);
  } else {
    issues.push(`Too long (${len} chars) — trim to under 300 characters`);
  }

  // Check urgency
  if (containsAny(text, URGENCY_KEYWORDS)) {
    score += 15;
    const matches = findMatches(text, URGENCY_KEYWORDS);
    positives.push(`Urgency language detected: "${matches[0]}"`);
  } else {
    issues.push('No urgency — add time-sensitive language to drive action');
  }

  // Check social proof
  if (containsAny(text, SOCIAL_PROOF_KEYWORDS)) {
    score += 15;
    const matches = findMatches(text, SOCIAL_PROOF_KEYWORDS);
    positives.push(`Social proof detected: "${matches[0]}"`);
  } else {
    issues.push('No social proof — add customer counts, ratings, or trust signals');
  }

  // Check spam words
  if (!containsAny(text, SPAM_PHRASES)) {
    score += 15;
    positives.push('No spammy language detected');
  } else {
    const matches = findMatches(text, SPAM_PHRASES);
    issues.push(`Spam/low-quality phrases detected: "${matches[0]}" — remove these`);
  }

  return { score, issues, positives };
}

function generateRewrites(text) {
  const { score } = analyzeAdCopy(text);
  const trimmed = text.trim();

  // Variant 1: Stronger CTA
  const variant1 = `${trimmed} Start today and see the difference — [Your CTA Button]`;

  // Variant 2: Urgency + Value Prop
  const variant2 = `Don't miss out — Save big now! ${trimmed} Limited time offer. Act fast before it's gone.`;

  // Variant 3: Pain-point focused
  const variant3 = `Tired of [pain point]? Here's the solution: ${trimmed} Join thousands of satisfied customers. Get started free.`;

  return [
    {
      variant: 1,
      label: 'Stronger CTA',
      text: variant1,
      analysis: analyzeAdCopy(variant1)
    },
    {
      variant: 2,
      label: 'Urgency + Value Prop',
      text: variant2,
      analysis: analyzeAdCopy(variant2)
    },
    {
      variant: 3,
      label: 'Pain-Point Focus',
      text: variant3,
      analysis: analyzeAdCopy(variant3)
    }
  ];
}

function generateABVariants(text) {
  const trimmed = text.trim();
  const words = trimmed.split(' ').slice(0, 6).join(' ');

  const headlines = [
    `${words} — Try It Free Today`,
    `The #1 Way to ${words}`,
    `How Thousands Are Using "${words}" to Succeed`,
    `Stop Struggling — ${words} Works`,
    `Limited Offer: ${words} at 50% Off`
  ];

  const bodies = [
    `${trimmed} Join over 10,000 satisfied customers. Get started with a free trial — no credit card required.`,
    `${trimmed} Proven results backed by real customers. Limited spots available — claim yours now before midnight.`,
    `${trimmed} Don't waste another dollar on ads that don't convert. Our solution is guaranteed to boost your ROI or your money back.`
  ];

  return { headlines, bodies };
}

function auditLandingPage(content) {
  const issues = [];
  const positives = [];
  let score = 100;
  const lower = content.toLowerCase();

  // Check for headline
  const hasH1 = lower.includes('<h1') || lower.includes('# ') || lower.includes('headline');
  if (hasH1) {
    positives.push('Has a primary headline');
  } else {
    issues.push('No clear headline detected — every landing page needs a strong H1');
    score -= 15;
  }

  // Check CTA
  if (containsAny(content, CTA_KEYWORDS)) {
    positives.push('Call-to-action present');
  } else {
    issues.push('No call-to-action found — add a button or link telling visitors what to do');
    score -= 20;
  }

  // Check value prop
  if (containsAny(content, VALUE_KEYWORDS)) {
    positives.push('Value proposition language found');
  } else {
    issues.push('Missing value proposition — clearly state what the visitor gains');
    score -= 20;
  }

  // Check social proof
  if (containsAny(content, SOCIAL_PROOF_KEYWORDS)) {
    positives.push('Social proof / testimonials detected');
  } else {
    issues.push('No social proof — add testimonials, reviews, or customer counts');
    score -= 15;
  }

  // Check for contact info or trust signals
  const hasTrust = lower.includes('privacy') || lower.includes('secure') || lower.includes('ssl') || lower.includes('guarantee') || lower.includes('refund') || lower.includes('trusted') || lower.includes('verified');
  if (hasTrust) {
    positives.push('Trust signals detected (privacy/security/guarantee)');
  } else {
    issues.push('No trust signals — add privacy policy, security badges, or money-back guarantee');
    score -= 10;
  }

  // Check for urgency
  if (containsAny(content, URGENCY_KEYWORDS)) {
    positives.push('Urgency elements present');
  } else {
    issues.push('No urgency elements — add limited-time offers or scarcity to increase conversions');
    score -= 10;
  }

  // Check content length
  const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 50) {
    issues.push(`Very thin content (${wordCount} words) — add more copy to build trust`);
    score -= 10;
  } else if (wordCount > 800) {
    issues.push(`Very long page (${wordCount} words) — consider breaking into sections with clear headers`);
    score -= 5;
  } else {
    positives.push(`Content length is good (${wordCount} words)`);
  }

  // Check for forms
  const hasForm = lower.includes('<form') || lower.includes('input') || lower.includes('email') || lower.includes('subscribe');
  if (hasForm) {
    positives.push('Lead capture form or email input detected');
  } else {
    issues.push('No form or lead capture element — add a way to collect visitor information');
    score -= 10;
  }

  return {
    score: Math.max(0, score),
    issues,
    positives,
    wordCount
  };
}

module.exports = { analyzeAdCopy, generateRewrites, generateABVariants, auditLandingPage };
