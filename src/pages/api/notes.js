import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'notes.json');

export default async function handler(req, res) {
  const dir = path.join(process.cwd(), 'data');
  await fs.mkdir(dir, { recursive: true });

  let notes = [];
  try {
    const data = await fs.readFile(filePath, 'utf8');
    notes = JSON.parse(data);
  } catch (e) { /* init empty */ }

  if (req.method === 'GET') {
    return res.status(200).json(notes);
  }

  if (req.method === 'POST') {
    const { title, content, category } = req.body;
    notes.push({ id: Date.now(), title, content, category: category || 'General' });
  } else if (req.method === 'PUT') {
    const { id, title, content, category } = req.body;
    notes = notes.map(n => n.id === id ? { ...n, title, content, category } : n);
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    notes = notes.filter(n => n.id !== id);
  } else {
    return res.status(405).end();
  }

  await fs.writeFile(filePath, JSON.stringify(notes, null, 2));
  return res.status(200).json(notes);
}
