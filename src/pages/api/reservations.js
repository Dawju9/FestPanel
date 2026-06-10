import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'reservations.json');

export default async function handler(req, res) {
  const dir = path.join(process.cwd(), 'data');
  await fs.mkdir(dir, { recursive: true });

  let reservations = [];
  try {
    const data = await fs.readFile(filePath, 'utf8');
    reservations = JSON.parse(data);
  } catch { /* init empty */ }

  if (req.method === 'GET') {
    return res.status(200).json(reservations);
  }

  if (req.method === 'POST') {
    const { name, date, meters, floorType, recaptchaToken } = req.body;
    
    // Verify reCAPTCHA
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${secret}&response=${recaptchaToken}`,
    });
    const verifyData = await verifyRes.json();
    
    if (!verifyData.success) {
        return res.status(400).json({ error: 'Nieprawidłowa weryfikacja reCAPTCHA.' });
    }

    reservations.push({ id: Date.now(), name, date, meters, floorType, status: 'pending' });
  } else if (req.method === 'PUT') {
    const { id, status } = req.body;
    reservations = reservations.map(r => r.id === id ? { ...r, status } : r);
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    reservations = reservations.filter(r => r.id !== id);
  }

  await fs.writeFile(filePath, JSON.stringify(reservations, null, 2));
  return res.status(200).json(reservations);
}
