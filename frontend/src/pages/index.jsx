import Head from 'next/head';
import Script from 'next/script';
import App from '../App.jsx';

export default function HomePage() {
  const providerHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (providerHost ? `https://${providerHost}` : 'http://localhost:3000');
  const canonicalUrl = ("" || siteUrl || '').replace(/[/]$/, '');
  const socialImage = `${canonicalUrl}${"/social-preview.png"}`;
  const squareSocialImage = `${canonicalUrl}${"/social-square.png"}`;
  const title = "QuoteRivet | Estimate Request Intake for Contractors";
  const description = "Capture estimate requests, assign an estimator, collect site photos and notes, and check whether the details are sufficient to prepare a quote.";
  const socialImageAlt = "QuoteRivet estimate request showing contact details, an assigned estimator, site photos, and details still needed before preparing a quote";
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${canonicalUrl}/#organization`,
        name: "QuoteRivet",
        url: canonicalUrl,
        logo: `${canonicalUrl}/favicon.svg`
      },
      {
        '@type': 'WebSite',
        '@id': `${canonicalUrl}/#website`,
        name: "QuoteRivet",
        url: canonicalUrl,
        publisher: { '@id': `${canonicalUrl}/#organization` }
      },
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}/#webpage`,
        name: title,
        description,
        url: canonicalUrl,
        isPartOf: { '@id': `${canonicalUrl}/#website` },
        about: { '@id': `${canonicalUrl}/#organization` },
        primaryImageOfPage: { '@type': 'ImageObject', url: socialImage }
      },
      {
        '@type': 'SoftwareApplication',
        name: "QuoteRivet",
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: canonicalUrl
      }
    ]
  };
  return <>
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      <meta name="theme-color" content={"#151515"} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={"QuoteRivet"} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={socialImage} />
      <meta property="og:image:secure_url" content={socialImage} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={socialImageAlt} />
      <meta property="og:image" content={squareSocialImage} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="1200" />
      <meta property="og:image:alt" content="Square QuoteRivet estimate request with details still needed before preparing a quote" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:image" content={socialImage} />
      <meta name="twitter:image:alt" content={socialImageAlt} />
      <meta name="twitter:image:width" content="1200" />
      <meta name="twitter:image:height" content="630" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </Head>
    <Script src="/product-api-config.js" strategy="beforeInteractive" />
    <App />
  </>;
}
