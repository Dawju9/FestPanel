import { sendSeoReport } from '../../lib/mail';

const SITE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

async function checkPageSpeed(url) {
  const startTime = Date.now();
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const html = await res.text();
    const loadTime = Date.now() - startTime;

    const checks = {
      hasTitle: /<title[^>]*>(.+)<\/title>/i.test(html),
      hasMetaDescription: /<meta\s+name=["']description["']/i.test(html),
      hasViewport: /<meta\s+name=["']viewport["']/i.test(html),
      hasCharset: /<meta\s+charset/i.test(html),
      hasCanonical: /<link\s+rel=["']canonical["']/i.test(html),
      hasRobots: /<meta\s+name=["']robots["']/i.test(html),
      hasOpenGraph: /<meta\s+property=["']og:/i.test(html),
      hasStructuredData: /<script\s+type=["']application\/ld\+json["']/i.test(html),
      hasH1: /<h1[\s>]/i.test(html),
      imageSize: html.length,
      hasHttps: url.startsWith('https'),
    };

    const titleMatch = html.match(/<title[^>]*>(.+)<\/title>/i);
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);

    return {
      url,
      loadTime,
      status: res.status,
      title: titleMatch?.[1] || null,
      metaDescription: descMatch?.[1] || null,
      checks,
      score: calculateSeoScore(checks),
    };
  } catch (error) {
    return {
      url,
      loadTime: null,
      status: null,
      error: error.message,
      checks: {},
      score: 0,
    };
  }
}

function calculateSeoScore(checks) {
  const weights = {
    hasTitle: 15,
    hasMetaDescription: 15,
    hasViewport: 10,
    hasCharset: 5,
    hasCanonical: 10,
    hasRobots: 5,
    hasOpenGraph: 15,
    hasStructuredData: 15,
    hasH1: 5,
    hasHttps: 5,
  };

  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    if (checks[key]) {
      score += weight;
    }
  }
  return score;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pages = [
      SITE_URL,
      `${SITE_URL}/js/auth/dashboard`,
      `${SITE_URL}/qr`,
      `${SITE_URL}/ulotka`,
    ];

    const results = await Promise.all(pages.map(checkPageSpeed));
    const avgScore = Math.round(results.reduce((a, b) => a + b.score, 0) / results.length);

    const recommendations = [];
    results.forEach(r => {
      if (!r.checks?.hasMetaDescription) {
        recommendations.push(`${r.url} - Missing meta description`);
      }
      if (!r.checks?.hasOpenGraph) {
        recommendations.push(`${r.url} - Missing Open Graph tags`);
      }
      if (!r.checks?.hasStructuredData) {
        recommendations.push(`${r.url} - Missing structured data (JSON-LD)`);
      }
      if (!r.checks?.hasCanonical) {
        recommendations.push(`${r.url} - Missing canonical URL`);
      }
      if (r.loadTime && r.loadTime > 3000) {
        recommendations.push(`${r.url} - Slow load time: ${r.loadTime}ms`);
      }
    });

    const report = {
      timestamp: new Date().toISOString(),
      averageScore: avgScore,
      pages: results,
      recommendations,
    };

    if (req.query.sendEmail === 'true') {
      try {
        await sendSeoReport({
          scores: { performance: avgScore, seo: avgScore, accessibility: avgScore, bestPractices: avgScore },
          recommendations,
          url: SITE_URL,
        });
      } catch (emailError) {
        console.error('Failed to send SEO email:', emailError);
      }
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('SEO check error:', error);
    res.status(500).json({ error: 'Failed to run SEO check' });
  }
}
