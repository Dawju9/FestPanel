import imapSimple from 'imap-simple';
import { simpleParser } from 'mailparser';

const config = {
  imap: {
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASS,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  }
};

export async function fetchOferteoEmails() {
  const connection = await imapSimple.connect(config);
  await connection.openBox('INBOX');

  const searchCriteria = [
    ['FROM', 'powiadomienie@oferteo.pl'],
    ['UNSEEN']
  ];
  const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: false };

  const messages = await connection.search(searchCriteria, fetchOptions);
  const parsedMessages = [];

  for (const message of messages) {
    const part = message.parts.find(p => p.which === 'TEXT');
    const parsed = await simpleParser(part.body);
    parsedMessages.push({
      id: message.attributes.uid,
      subject: parsed.subject,
      text: parsed.text,
      date: parsed.date,
    });
  }

  connection.end();
  return parsedMessages;
}
