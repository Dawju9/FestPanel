import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const ERROR_MESSAGES = {
  Configuration: 'Server configuration error. Please contact the administrator.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'Verification link has expired or has already been used.',
  Default: 'An authentication error occurred.',
  CredentialsSignin: 'Invalid username or password.',
  SessionRequired: 'Please sign in to access this page.',
};

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;
  const [countdown, setCountdown] = useState(15);

  const message = ERROR_MESSAGES[error] || ERROR_MESSAGES.Default;

  useEffect(() => {
    if (countdown <= 0) {
      router.replace('/auth');
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="error-title">Authentication Error</h1>
        <p className="error-code">{error || 'UNKNOWN'}</p>
        <p className="error-message">{message}</p>
        <div className="error-actions">
          <Link href="/auth" className="error-btn error-btn-primary">
            Back to Login
          </Link>
          <Link href="/" className="error-btn error-btn-secondary">
            Go to Homepage
          </Link>
        </div>
        <p className="error-redirect">
          Redirecting to login in <strong>{countdown}</strong>s...
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
          max-width: 440px;
          width: 100%;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          border: 1px solid var(--border-color, #eee);
        }
        .error-icon {
          color: var(--color-primary, #D32F2F);
          margin-bottom: 20px;
        }
        .error-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-text, #1a1a1a);
          margin: 0 0 8px;
        }
        .error-code {
          font-size: 13px;
          color: var(--color-primary, #D32F2F);
          background: color-mix(in srgb, var(--color-primary, #D32F2F) 10%, transparent);
          padding: 4px 12px;
          border-radius: 20px;
          display: inline-block;
          margin: 0 0 16px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .error-message {
          font-size: 15px;
          color: var(--color-text-light, #666);
          margin: 0 0 32px;
          line-height: 1.5;
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
          .error-title { font-size: 20px; }
          .error-actions { flex-direction: column; }
          .error-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}
