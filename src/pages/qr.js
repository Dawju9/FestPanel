import Head from 'next/head';
import Link from 'next/link';
import { QrCode, Download, ExternalLink } from 'lucide-react';

export default function QRPage() {
  const flyerUrl = 'https://festpanel.pl/ulotka/';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(flyerUrl)}`;

  return (
    <div className="qr-page">
      <Head>
        <title>Generator QR • FestPanel</title>
      </Head>

      <div className="container">
        <div className="qr-card">
          <div className="qr-header">
            <QrCode size={32} color="#D32F2F" />
            <h1>KOD QR ULOTKI</h1>
          </div>
          
          <p className="qr-desc">
            Zeskanuj poniższy kod, aby otworzyć elektroniczną ulotkę FestPanel.
          </p>

          <div className="qr-image-container">
            <img src={qrUrl} alt="QR Code" className="qr-image" width={250} height={250} />
          </div>

          <div className="qr-url">
            <code>{flyerUrl}</code>
          </div>

          <div className="qr-actions">
            <a href={qrUrl} download="festpanel-qr.png" className="btn-download">
              <Download size={20} />
              Pobierz Kod QR
            </a>
            <Link href="/ulotka/" className="btn-preview">
              <ExternalLink size={20} />
              Podgląd Ulotki
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .qr-page {
          min-height: 100vh;
          background: var(--bg-color);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          transition: background-color 0.5s ease;
        }

        .container {
          width: 100%;
          max-width: 500px;
        }

        .qr-card {
          background: var(--surface, var(--bg-color));
          padding: 40px;
          border-radius: 24px;
          box-shadow: var(--shadow-lg);
          text-align: center;
          border: 1px solid var(--border-color);
        }

        .qr-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .qr-header h1 {
          font-size: 24px;
          font-weight: 800;
          color: var(--color-text);
          margin: 0;
        }

        .qr-desc {
          color: var(--color-text-light);
          margin-bottom: 30px;
          line-height: 1.5;
        }

        .qr-image-container {
          background: white;
          padding: 20px;
          border: 2px solid var(--border-color);
          border-radius: 16px;
          display: inline-block;
          margin-bottom: 24px;
        }

        .qr-image {
          width: 250px;
          height: 250px;
          display: block;
        }

        .qr-url {
          background: var(--color-light);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 30px;
          word-break: break-all;
          border: 1px solid var(--border-color);
        }

        .qr-url code {
          color: var(--color-primary);
          font-weight: 600;
        }

        .qr-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-download {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--color-primary);
          color: var(--color-white);
          text-decoration: none;
          padding: 16px;
          border-radius: 12px;
          font-weight: 700;
          transition: background 0.2s;
        }

        .btn-download:hover {
          background: var(--color-primary-dark);
        }

        .btn-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: transparent;
          color: var(--color-text-light);
          text-decoration: none;
          padding: 16px;
          border-radius: 12px;
          font-weight: 600;
          border: 2px solid var(--border-color);
          transition: all 0.2s;
        }

        .btn-preview:hover {
          background: var(--color-light);
          border-color: var(--color-text-light);
        }
      `}</style>
    </div>
  );
}
