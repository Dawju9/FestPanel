import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const offersHistoryPath = path.join(process.cwd(), 'crawler', 'data', 'offers_history.json');
    const sourcesPath = path.join(process.cwd(), 'crawler', 'knowledge', 'sources.json');

    let offers = {};
    try {
      const offersData = await fs.readFile(offersHistoryPath, 'utf8');
      offers = JSON.parse(offersData);
    } catch (e) {
      console.warn('No offers history found:', e.message);
    }

    let sources = [];
    try {
      const sourcesData = await fs.readFile(sourcesPath, 'utf8');
      sources = JSON.parse(sourcesData);
    } catch (e) {
      console.warn('No sources found:', e.message);
    }

    // Basic analysis (can be expanded)
    const activeOffers = Object.values(offers).filter(offer => offer.age_group !== 'expired');
    const totalOffers = Object.keys(offers).length;
    const totalActiveOffers = activeOffers.length;
    const totalSources = sources.length;
    const activeSources = sources.filter(s => s.active).length;

    res.status(200).json({
      summary: {
        totalOffers,
        totalActiveOffers,
        totalSources,
        activeSources,
      },
      offers: activeOffers, // Or just a subset/summary for the dashboard
      sources,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching crawler data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
