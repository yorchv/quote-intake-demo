import Head from 'next/head';
import Script from 'next/script';
import App from '../App.jsx';

export default function RequestPage() {
  const title = 'Start an estimate request | QuoteRivet';
  const description = 'Share your contact details, service location, and requested work so a staff member can review the estimate request and explain the next step.';

  return <>
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="noindex,nofollow,noarchive" />
    </Head>
    <Script src="/product-api-config.js" strategy="beforeInteractive" />
    <App />
  </>;
}
