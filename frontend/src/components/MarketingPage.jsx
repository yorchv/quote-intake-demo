import Head from 'next/head';
import Link from 'next/link';

const proofSources = {
  source_architecture_brief: {
    label: 'QuoteRivet product scope (internal product scope)',
  },
  source_google_local_services_leads: {
    href: 'https://support.google.com/localservices/answer/6224859?hl=en',
    label: 'Google Local Services lead documentation',
  },
  source_jobber_request_basics: {
    href: 'https://help.getjobber.com/en/articles/request-basics/',
    label: 'Jobber Request Basics',
  },
};

function proofSource(proofRef) {
  return proofSources[proofRef] || { label: 'Supporting product documentation' };
}

function structuredNode(type, site, page, canonicalUrl) {
  const organizationId = `${site.baseUrl || canonicalUrl}/#organization`;
  const websiteId = `${site.baseUrl || canonicalUrl}/#website`;
  if (type === 'Organization') {
    return {
      '@type': 'Organization',
      '@id': organizationId,
      name: site.name,
      url: site.baseUrl || canonicalUrl,
      logo: `${site.baseUrl || canonicalUrl}/favicon.svg`,
    };
  }
  if (type === 'WebSite') {
    return {
      '@type': 'WebSite',
      '@id': websiteId,
      name: site.name,
      url: site.baseUrl || canonicalUrl,
      publisher: { '@id': organizationId },
    };
  }
  if (type === 'SoftwareApplication') {
    return {
      '@type': 'SoftwareApplication',
      name: site.name,
      description: page.description,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: canonicalUrl,
    };
  }
  if (type === 'Product') {
    return {
      '@type': 'Product',
      name: site.name,
      description: page.description,
      url: canonicalUrl,
      brand: { '@id': organizationId },
    };
  }
  if (type === 'Article') {
    return {
      '@type': 'Article',
      headline: page.primary_heading,
      description: page.description,
      dateModified: page.last_material_change,
      mainEntityOfPage: canonicalUrl,
      author: { '@id': organizationId },
      publisher: { '@id': organizationId },
    };
  }
  if (type === 'BreadcrumbList') {
    const segments = page.route.split('/').filter(Boolean);
    return {
      '@type': 'BreadcrumbList',
      itemListElement: segments.map((segment, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: segment.replace(/-/g, ' '),
        item: `${site.baseUrl || ''}/${segments.slice(0, index + 1).join('/')}`,
      })),
    };
  }
  return {
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    name: page.title,
    description: page.description,
    url: canonicalUrl,
    isPartOf: { '@id': websiteId },
    about: { '@id': organizationId },
    dateModified: page.last_material_change,
  };
}

export default function MarketingPage({ site, page, requestOrigin }) {
  const baseUrl = String(site.baseUrl || requestOrigin || '').replace(/[/]$/, '');
  const path = page.route === '/' ? '' : page.route;
  const canonicalUrl = `${baseUrl}${path}`;
  const robots = page.index_policy === 'index'
    ? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    : 'noindex,follow';
  const graph = Array.from(new Set(page.structured_data_types || []))
    .map((type) => structuredNode(type, { ...site, baseUrl }, page, canonicalUrl));
  const structuredData = { '@context': 'https://schema.org', '@graph': graph };
  const socialImage = `${baseUrl}/social-preview.png`;
  const socialImageAlt = `${site.name}: ${page.primary_heading}`;
  const sections = Array.isArray(page.sections) ? page.sections : [];
  const links = Array.isArray(page.internal_links) ? page.internal_links : [];
  return (
    <>
      <Head>
        <title>{page.title}</title>
        <meta name="description" content={page.description} />
        <meta name="robots" content={robots} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={site.name} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={socialImage} />
        <meta property="og:image:secure_url" content={socialImage} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={socialImageAlt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page.title} />
        <meta name="twitter:description" content={page.description} />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:image" content={socialImage} />
        <meta name="twitter:image:alt" content={socialImageAlt} />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <main className="marketing-page">
        <header className="marketing-header">
          <Link href="/" className="marketing-brand">{site.name}</Link>
          <nav aria-label="Public pages">
            {links.map((href) => (
              <Link href={href} key={href}>
                {href === '/' ? 'Home' : href.split('/').filter(Boolean).pop().replace(/-/g, ' ')}
              </Link>
            ))}
          </nav>
        </header>
        <article>
          <p className="marketing-eyebrow">{page.page_type.replace(/_/g, ' ')}</p>
          <h1>{page.primary_heading}</h1>
          <p className="marketing-summary">{page.summary}</p>
          <a className="marketing-cta" href={page.cta_href}>{page.cta_label}</a>
          <div className="marketing-sections">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </section>
            ))}
          </div>
          {page.proof_refs?.length ? (
            <p className="marketing-proof">
              Sources:{' '}
              {page.proof_refs.map((proofRef, index) => {
                const source = proofSource(proofRef);
                return (
                  <span key={proofRef}>
                    {index > 0 ? '; ' : ''}
                    {source.href ? (
                      <a href={source.href} target="_blank" rel="noopener noreferrer">
                        {source.label}
                      </a>
                    ) : (
                      <span>{source.label}</span>
                    )}
                  </span>
                );
              })}
              .
            </p>
          ) : null}
          <p className="marketing-updated">
            Materially updated {page.last_material_change}
          </p>
        </article>
      </main>
      <style jsx>{`
        .marketing-page { min-height: 100vh; color: var(--foreground); background: var(--background); }
        .marketing-header { display: flex; justify-content: space-between; gap: 2rem; align-items: center; padding: 1.25rem clamp(1rem, 4vw, 4rem); border-bottom: 1px solid var(--border); }
        .marketing-brand { color: inherit; font-family: var(--font-display); font-weight: 800; text-decoration: none; }
        nav { display: flex; flex-wrap: wrap; gap: 1rem; }
        nav a { color: inherit; text-transform: capitalize; }
        article { width: min(72rem, calc(100% - 2rem)); margin: 0 auto; padding: clamp(3rem, 9vw, 8rem) 0; }
        h1 { max-width: 16ch; margin: 0; font: 800 clamp(2.5rem, 7vw, 6rem)/0.98 var(--font-display); letter-spacing: -0.045em; }
        .marketing-eyebrow { color: var(--muted-foreground); font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        .marketing-summary { max-width: 48rem; font-size: clamp(1.15rem, 2vw, 1.5rem); line-height: 1.55; }
        .marketing-cta { display: inline-flex; margin: 1rem 0 3rem; padding: .85rem 1.15rem; border-radius: var(--radius); color: var(--primary-foreground); background: var(--primary); font-weight: 800; text-decoration: none; }
        .marketing-sections { display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: 1rem; }
        section { padding: 1.5rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); }
        section h2 { font-family: var(--font-display); }
        section p { color: var(--muted-foreground); line-height: 1.65; }
        .marketing-proof, .marketing-updated { color: var(--muted-foreground); font-size: .875rem; }
      `}</style>
    </>
  );
}
