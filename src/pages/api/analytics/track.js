import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'analytics.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') { return res.status(405).end(); }

  const { type, label } = req.body;
  const dir = path.join(process.cwd(), 'data');
  await fs.mkdir(dir, { recursive: true });

  let analytics = { pageViews: 0, buttonClicks: {}, ulotkaTouches: 0 };
  try {
    const data = await fs.readFile(filePath, 'utf8');
    analytics = JSON.parse(data);
  } catch { /* init default */ }

  if (type === 'pageView') {
    analytics.pageViews++;
  } else if (type === 'buttonClick') {
    analytics.buttonClicks[label] = (analytics.buttonClicks[label] || 0) + 1;
  } else if (type === 'ulotkaTouch') {
    analytics.ulotkaTouches++;
  }

  await fs.writeFile(filePath, JSON.stringify(analytics, null, 2));
  return res.status(200).json({ success: true });
}
