import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'tasks_config.json');

export default async function handler(req, res) {
  const dir = path.join(process.cwd(), 'data');
  await fs.mkdir(dir, { recursive: true });

  if (req.method === 'GET') {
    let config = { tasks: {} };
    try {
      const data = await fs.readFile(filePath, 'utf8');
      config = JSON.parse(data);
    } catch { /* init default */ }
    return res.status(200).json(config);
  }

  if (req.method === 'POST') {
    const { taskId, frequency, enabled } = req.body;
    let config = { tasks: {} };
    try {
      const data = await fs.readFile(filePath, 'utf8');
      config = JSON.parse(data);
    } catch { /* init default */ }

    config.tasks[taskId] = { frequency, enabled };
    await fs.writeFile(filePath, JSON.stringify(config, null, 2));
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}
