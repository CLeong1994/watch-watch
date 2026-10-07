// Same-origin proxy for NEA readings on data.gov.sg, so the browser never depends on
// data.gov.sg's CORS settings. Responses are cached at Vercel's edge for a few minutes,
// which also keeps us well inside data.gov.sg's rate limits.
// Optional: set DATA_GOV_SG_API_KEY in Vercel project settings for a higher rate limit.
const ENDPOINTS = new Set(['psi', 'pm25']);

module.exports = async (req, res) => {
  const { ep = 'psi', date } = req.query || {};
  if (!ENDPOINTS.has(ep) || (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
    res.status(400).json({ error: 'Use ep=psi or ep=pm25, and date=YYYY-MM-DD if needed.' });
    return;
  }
  const url = `https://api-open.data.gov.sg/v2/real-time/api/${ep}${date ? `?date=${date}` : ''}`;
  const headers = { accept: 'application/json' };
  if (process.env.DATA_GOV_SG_API_KEY) headers['x-api-key'] = process.env.DATA_GOV_SG_API_KEY;
  try {
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
    const body = await r.text();
    // Past days don't change; the current day refreshes every few minutes.
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore' }).format(new Date());
    const maxAge = date && date < today ? 3600 : 300;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (r.ok) res.setHeader('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=600`);
    res.status(r.status).send(body);
  } catch (e) {
    res.status(502).json({ error: 'Could not reach data.gov.sg' });
  }
};
