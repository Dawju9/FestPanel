import fs from 'fs/promises';
import path from 'path';
import { fetchOferteoEmails } from '../../lib/mail_reader';

const filePath = path.join(process.cwd(), 'data', 'zlecenia.json');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return res.status(200).json(JSON.parse(data));
    } catch {
      return res.status(200).json([]);
    }
  }

  if (req.method === 'POST') {
    try {
      const newEmails = await fetchOferteoEmails();
      let existing = [];
      try {
        const data = await fs.readFile(filePath, 'utf8');
        existing = JSON.parse(data);
      } catch (e) {
        console.error(e);
      }

      const updated = [...newEmails, ...existing];
      await fs.writeFile(filePath, JSON.stringify(updated, null, 2));
      return res.status(200).json({ success: true, count: newEmails.length });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to fetch emails' });
    }
  }

  return res.status(405).end();
}
