import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ErrorPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);
  const statusCode = router.query.statusCode || 500;

  const title = statusCode === 404 ? 'Page Not Found' : `Server Error (${statusCode})`;
  const message = statusCode === 404
    ? 'The page you are looking for does not exist or has been moved.'
    : 'Something went wrong on our end. Please try again later.';

  useEffect(() => {
    if (countdown <= 0) {
      router.replace('/');
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-code-display">{statusCode}</div>
        <h1 className="error-title">{title}</h1>
        <p className="error-message">{message}</p>
        <div className="error-actions">
          <Link href="/" className="error-btn error-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 6, verticalAlign: 'middle'}}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to Homepage
          </Link>
          <button onClick={() => router.reload()} className="error-btn error-btn-secondary">
            Try Again
          </button>
        </div>
        <p className="error-redirect">
          Auto-redirect to homepage in <strong>{countdown}</strong>s
        </p>
      </div>

      <style jsx>{`
        .error-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--hero-bg, #f5f5f5);
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .error-card {
          background: var(--surface, #fff);
          border-radius: 16px;
          padding: 48px 40px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          border: 1px solid var(--border-color, #eee);
        }
        .error-code-display {
          font-size: 96px;
          font-weight: 900;
          line-height: 1;
          margin-bottom: 16px;
          letter-spacing: -4px;
          background: linear-gradient(135deg, var(--color-primary, #D32F2F), #ff6b6b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .error-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--color-text, #1a1a1a);
          margin: 0 0 12px;
        }
        .error-message {
          font-size: 15px;
          color: var(--color-text-light, #666);
          margin: 0 0 32px;
          line-height: 1.6;
        }
        .error-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .error-btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
        }
        .error-btn-primary {
          background: var(--color-primary, #D32F2F);
          color: var(--color-white, #fff);
        }
        .error-btn-primary:hover {
          background: var(--color-primary-dark, #b71c1c);
          transform: translateY(-1px);
        }
        .error-btn-secondary {
          background: var(--bg-color, #f0f0f0);
          color: var(--color-text, #1a1a1a);
          border: 1px solid var(--border-color, #ddd);
        }
        .error-btn-secondary:hover {
          background: var(--border-color, #e0e0e0);
        }
        .error-redirect {
          font-size: 13px;
          color: var(--color-text-light, #999);
          margin: 0;
        }
        @media (max-width: 480px) {
          .error-card { padding: 32px 24px; }
          .error-code-display { font-size: 72px; }
          .error-title { font-size: 18px; }
          .error-actions { flex-direction: column; }
          .error-btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
