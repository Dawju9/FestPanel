import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const logPath = path.join(process.cwd(), 'schedule.log');
  
  try {
    const logContent = await fs.readFile(logPath, 'utf8');
    // Get last 20 lines
    const lines = logContent.split('\n').filter(line => line.trim() !== '');
    const lastLines = lines.slice(-20);
    
    res.status(200).json({ 
      lastRun: lastLines[lastLines.length - 1]?.match(/\[(.*?)\]/)?.[1] || 'Never',
      log: lastLines,
      cronInfo: '0 */6 * * * /bin/bash /Development/repos/Projekt/FestPanel/schedule.sh'
    });
  } catch {
    res.status(200).json({ 
      lastRun: 'Never',
      log: ['No logs found. Schedule might not have run yet.'],
      cronInfo: '0 */6 * * * /bin/bash /Development/repos/Projekt/FestPanel/schedule.sh'
    });
  }
}
