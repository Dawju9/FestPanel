import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

const API_KEY = process.env.PAGESPEED_API_KEY;
const URL = 'https://festpanel.pl';

async function analyze() {
  const modes = ['mobile', 'desktop'];
  const results = {};

  for (const mode of modes) {
    const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${URL}&strategy=${mode}&key=${API_KEY}`);
    const data = await res.json();
    results[mode] = {
      score: data.lighthouseResult.categories.performance.score * 100,
      fcp: data.lighthouseResult.audits['first-contentful-paint'].displayValue,
    };
  }

  await fs.writeFile(path.join(process.cwd(), 'data', 'pagespeed.json'), JSON.stringify(results, null, 2));
  console.log('PageSpeed Analysis Complete');
}

analyze();
