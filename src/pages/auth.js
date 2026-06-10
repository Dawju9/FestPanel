import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';

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
  const recaptchaRef = useRef(null);

  useEffect(() => {
    if (session) {
      router.replace(callbackUrl || '/js/auth/dashboard');
    }
  }, [session, callbackUrl, router]);

  useEffect(() => {
    const renderWidget = () => {
      if (recaptchaRef.current && window.grecaptcha?.render) {
        try {
          window.grecaptcha.render(recaptchaRef.current, {
            sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
          });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    };

    if (!renderWidget()) {
      window.recaptchaOnload = renderWidget;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const grecaptcha = window.grecaptcha;
    if (!grecaptcha) {
      setError('reCAPTCHA nie jest jeszcze gotowe. Odśwież stronę.');
      setLoading(false);
      return;
    }

    const token = grecaptcha.getResponse();
    if (!token) {
      setError('Proszę wypełnić reCAPTCHA.');
      setLoading(false);
      return;
    }

    const result = await signIn('credentials', {
      username,
      password,
      recaptchaToken: token,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid username, password, or reCAPTCHA.');
      setLoading(false);
      grecaptcha.reset();
    } else {
      router.push(callbackUrl || '/js/auth/dashboard');
    }
  };

  return (
    <>
      <Head>
        <script
          src="https://www.google.com/recaptcha/api.js?onload=recaptchaOnload&render=explicit"
          async
          defer
        ></script>
      </Head>
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

            <div ref={recaptchaRef}></div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <Link href="/" className="back-link">&larr; Back to FestPanel</Link>
          </div>
        </div>

        <style jsx>{`
          .login-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--hero-bg);
            padding: 20px;
            transition: background 0.5s ease;
          }

          .login-container {
            width: 100%;
            max-width: 420px;
            background: var(--surface, var(--bg-color));
            border-radius: 16px;
            padding: 48px 40px;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border-color);
            transition: background 0.5s ease, color 0.5s ease;
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
            color: var(--color-text);
          }

          .login-logo .logo-accent {
            color: var(--color-primary);
          }

          .login-subtitle {
            color: var(--color-text-light);
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
            color: var(--color-text);
          }

          .form-group input {
            padding: 14px 16px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            font-size: 16px;
            background: var(--bg-color);
            color: var(--color-text);
            transition: all 0.3s ease;
          }

          .form-group input:focus {
            outline: none;
            border-color: var(--color-primary);
          }

          .login-error {
            background: color-mix(in srgb, var(--color-primary) 10%, transparent);
            color: var(--color-primary);
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
            border: 1px solid var(--color-primary);
          }

          .login-btn {
            background: var(--color-primary);
            color: var(--color-white);
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
            background: var(--color-primary-dark);
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
            color: var(--color-text-light);
            text-decoration: none;
            font-size: 14px;
            transition: color 0.3s ease;
          }

          .back-link:hover {
            color: var(--color-primary);
          }
        `}</style>
      </div>
    </>
  );
}
