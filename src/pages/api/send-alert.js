import { requireAuth } from '../../lib/auth';
import { sendAlertEmail, sendSecurityAlert, sendSeoReport } from '../../lib/mail';

export async function getServerSideProps(context) {
  return requireAuth(context);
}

export default function SendAlertPage() {
  return null;
}

export async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await requireAuth({ req, res });
  if (session.redirect) {
    return session;
  }

  const { type, subject, message, details, url } = req.body;

  try {
    let result;

    if (type === 'security') {
      result = await sendSecurityAlert({
        type: details || 'warning',
        details: message,
        url,
      });
    } else if (type === 'seo') {
      result = await sendSeoReport({
        scores: details?.scores || {},
        recommendations: details?.recommendations || [],
        url,
      });
    } else {
      result = await sendAlertEmail({
        subject: subject || 'FestPanel Alert',
        html: `<p>${message}</p>`,
      });
    }

    res.status(200).json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}
