import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'active_sessions.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') { return res.status(405).end(); }

  const { sessionId } = req.body;
  const dir = path.join(process.cwd(), 'data');
  await fs.mkdir(dir, { recursive: true });

  let sessions = {};
  try {
    const data = await fs.readFile(filePath, 'utf8');
    sessions = JSON.parse(data);
  } catch { /* init default */ }

  sessions[sessionId] = Date.now();

  // Cleanup sessions older than 5 minutes
  const now = Date.now();
  for (const [id, lastSeen] of Object.entries(sessions)) {
    if (now - lastSeen > 5 * 60 * 1000) {
      delete sessions[id];
    }
  }

  await fs.writeFile(filePath, JSON.stringify(sessions, null, 2));
  return res.status(200).json({ activeCount: Object.keys(sessions).length });
}
