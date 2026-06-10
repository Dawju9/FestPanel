import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'pagespeed.json');

export default async function handler(req, res) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return res.status(200).json(JSON.parse(data));
  } catch {
    return res.status(200).json({});
  }
}
