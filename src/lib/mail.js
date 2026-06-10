import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendAlertEmail({ subject, html, text }) {
  const to = process.env.ALERT_EMAIL_TO || process.env.SMTP_USER;
  const from = process.env.SMTP_USER;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials not configured');
  }

  const transport = getTransporter();
  const info = await transport.sendMail({
    from: `FestPanel Alert <${from}>`,
    to,
    subject: `[FestPanel] ${subject}`,
    text: text || subject,
    html: html || `<p>${subject}</p>`,
  });

  return info;
}

export async function sendSecurityAlert({ type, details, url }) {
  const colors = {
    critical: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    seo: '#6f42c1',
    speed: '#28a745',
    hacked: '#dc35454',
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${colors[type] || '#333'}; color: white; padding: 16px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">🛡️ FestPanel Security Alert</h2>
      </div>
      <div style="background: #f8f9fa; padding: 24px; border: 1px solid #dee2e6;">
        <p><strong>Type:</strong> ${type.toUpperCase()}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString('pl-PL')}</p>
        <p><strong>URL:</strong> ${url || 'N/A'}</p>
        <hr style="border: 1px solid #dee2e6;">
        <p><strong>Details:</strong></p>
        <pre style="background: #fff; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 13px;">${details}</pre>
      </div>
      <div style="padding: 12px; text-align: center; color: #6c757d; font-size: 12px;">
        FestPanel Security Monitor • ${new Date().toISOString()}
      </div>
    </div>
  `;

  return sendAlertEmail({
    subject: `Security Alert: ${type}`,
    html,
  });
}

export async function sendSeoReport({ scores, recommendations, url }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #6f42c1; color: white; padding: 16px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">📊 SEO & Speed Report</h2>
      </div>
      <div style="background: #f8f9fa; padding: 24px; border: 1px solid #dee2e6;">
        <p><strong>URL:</strong> ${url}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString('pl-PL')}</p>
        <hr style="border: 1px solid #dee2e6;">
        <h3>Scores</h3>
        <ul>
          <li>Performance: ${scores.performance || 'N/A'}/100</li>
          <li>SEO: ${scores.seo || 'N/A'}/100</li>
          <li>Accessibility: ${scores.accessibility || 'N/A'}/100</li>
          <li>Best Practices: ${scores.bestPractices || 'N/A'}/100</li>
        </ul>
        ${recommendations?.length ? `
          <h3>Recommendations</h3>
          <ul>
            ${recommendations.map(r => `<li>${r}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
      <div style="padding: 12px; text-align: center; color: #6c757d; font-size: 12px;">
        FestPanel SEO Monitor • ${new Date().toISOString()}
      </div>
    </div>
  `;

  return sendAlertEmail({
    subject: `SEO Report: ${scores.performance || 'N/A'} performance`,
    html,
  });
}
