import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang="pl">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#D32F2F" />
      </Head>
      <body>
        <Main />
        <NextScript />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TQGYFLKP0F"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TQGYFLKP0F');
          `}
        </Script>
        <Script id="theme-loader" strategy="beforeInteractive">
          {`
            (function() {
              const theme = localStorage.getItem('theme') || 'default';
              document.documentElement.setAttribute('data-theme', theme);
            })();
          `}
        </Script>
      </body>
    </Html>
  );
}