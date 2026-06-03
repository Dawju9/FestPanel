import '@/styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function App({ Component, pageProps: { session, ...pageProps }, router }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <AnimatePresence mode="wait">
          <motion.div
            key={router.route}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
        <Analytics />
      </ThemeProvider>
    </SessionProvider>
  );
}