import { useEffect } from 'react';
import { useRouter } from 'next/router';

export const trackEvent = async (type, label = '') => {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, label }),
    });
  } catch (e) {
    console.error('Analytics tracking failed', e);
  }
};

export const useAnalytics = () => {
  const router = useRouter();

  useEffect(() => {
    // Page View Tracking
    trackEvent('pageView', router.pathname);

    // Heartbeat for online viewers
    const sessionId = localStorage.getItem('sessionId') || Math.random().toString(36).substring(7);
    localStorage.setItem('sessionId', sessionId);

    const sendHeartbeat = async () => {
      try {
        await fetch('/api/analytics/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
      } catch (e) {
        console.error('Heartbeat failed', e);
      }
    };

    sendHeartbeat(); // initial
    const interval = setInterval(sendHeartbeat, 60 * 1000); // Every minute
    return () => clearInterval(interval);
  }, [router.pathname]);
};
