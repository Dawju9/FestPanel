import { exec } from 'child_process';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') { return res.status(405).end(); }

  const { taskId } = req.body;
  
  // Map taskId to scripts
  const taskScripts = {
    crawler: './manage.sh crawler run basic',
    insights: 'node scripts/pagespeed-analyze.js'
  };

  const command = taskScripts[taskId];
  if (!command) { return res.status(400).json({ error: 'Unknown task' }); }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing ${taskId}:`, error);
      return res.status(500).json({ error: 'Task execution failed' });
    }
    return res.status(200).json({ success: true, stdout });
  });
}
