import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { name, phone, email, message, recaptchaToken, metrage, prepServices, baseboards } = req.body;

  // Verify reCAPTCHA
  const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
  });
  const recaptchaData = await recaptchaRes.json();

  if (!recaptchaData.success) {
    return res.status(400).json({ message: 'reCAPTCHA verification failed.' });
  }

  try {
    // Save to JSON file
    const submission = { name, phone, email, message, metrage, prepServices, baseboards, createdAt: new Date() };
    const dir = path.join(process.cwd(), 'data');
    const filePath = path.join(dir, 'submissions.json');

    await fs.mkdir(dir, { recursive: true });
    let submissions = [];
    try {
      const data = await fs.readFile(filePath, 'utf8');
      submissions = JSON.parse(data);
    } catch {
      // file might not exist
    }
    submissions.push(submission);
    await fs.writeFile(filePath, JSON.stringify(submissions, null, 2));

    // Send Discord notification
    if (process.env.DISCORD_WEBHOOK) {
      await fetch(process.env.DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '🔔 Nowe zapytanie ofertowe',
            color: 13893632, // Red color
            fields: [
              { name: '👤 Imię', value: name, inline: true },
              { name: '📞 Telefon', value: phone, inline: true },
              { name: '📧 Email', value: email, inline: false },
              { name: '📐 Metraż', value: `${metrage || 'Brak'} m2`, inline: true },
              { name: '🛠️ Usługi', value: `${prepServices ? '✅ Przygotowanie\n' : ''}${baseboards ? '✅ Listwy' : ''}` || 'Brak', inline: true },
              { name: '📝 Wiadomość', value: message || 'Brak treści', inline: false }
            ],
            footer: { text: `Data: ${new Date().toLocaleString()}` }
          }]
        }),
      });
    }

    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
