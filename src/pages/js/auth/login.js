import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { useEffect } from 'react';

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session) {
    const callbackUrl = context.query.callbackUrl || '/js/auth/dashboard';
    return {
      redirect: { destination: callbackUrl, permanent: false },
    };
  }
  return { props: {} };
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const { callbackUrl } = router.query;

  useEffect(() => {
    if (session) {
      router.replace(callbackUrl || '/js/auth/dashboard');
    }
  }, [session, callbackUrl, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid username or password');
      setLoading(false);
    } else {
      router.push(callbackUrl || '/js/auth/dashboard');
    }
  };

  return (
    <>
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <h1 className="login-logo">
              <span className="logo-text">Fest</span>
              <span className="logo-accent">Panel</span>
            </h1>
            <p className="login-subtitle">Staff Admin Area</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <a href="/" className="back-link">&larr; Back to FestPanel</a>
          </div>
        </div>

        <style jsx>{`
          .login-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            padding: 20px;
          }

          .login-container {
            width: 100%;
            max-width: 420px;
            background: #ffffff;
            border-radius: 16px;
            padding: 48px 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }

          .login-header {
            text-align: center;
            margin-bottom: 40px;
          }

          .login-logo {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -1px;
            margin-bottom: 8px;
          }

          .login-logo .logo-text {
            color: #1a1a1a;
          }

          .login-logo .logo-accent {
            color: #D32F2F;
          }

          .login-subtitle {
            color: #666666;
            font-size: 14px;
          }

          .login-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-group label {
            font-size: 14px;
            font-weight: 600;
            color: #333333;
          }

          .form-group input {
            padding: 14px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: all 0.3s ease;
          }

          .form-group input:focus {
            outline: none;
            border-color: #D32F2F;
          }

          .login-error {
            background: #ffebee;
            color: #D32F2F;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
          }

          .login-btn {
            background: #D32F2F;
            color: #ffffff;
            padding: 16px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 8px;
          }

          .login-btn:hover:not(:disabled) {
            background: #B71C1C;
            transform: translateY(-2px);
          }

          .login-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .login-footer {
            margin-top: 32px;
            text-align: center;
          }

          .back-link {
            color: #666666;
            text-decoration: none;
            font-size: 14px;
            transition: color 0.3s ease;
          }

          .back-link:hover {
            color: #D32F2F;
          }
        `}</style>
      </div>
    </>
  );
}