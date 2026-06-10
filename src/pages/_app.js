import '@/styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import dynamic from 'next/dynamic';
import { useAnalytics } from '../lib/analytics';

const ThemeSwitcher = dynamic(() => import('../components/ThemeSwitcher'), { ssr: false });

function AnalyticsWrapper({ children }) {
  useAnalytics();
  return <>{children}</>;
}

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <ToastProvider>
          <AnalyticsWrapper>
            <Component {...pageProps} />
          </AnalyticsWrapper>
          <ThemeSwitcher />
          <Analytics />
          <SpeedInsights />
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
