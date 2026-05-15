import { Html, Head, Main, NextScript } from 'next/document';

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
      </body>
    </Html>
  );
}