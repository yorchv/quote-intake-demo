import MarketingPage from "../components/MarketingPage";

const site = {
  "name": "QuoteRivet",
  "market": "Independent residential service contractors with 2 to 20 employees that receive estimate requests through calls, texts, email, and web forms",
  "baseUrl": ""
};
const page = {
  "access_policy": "anonymous",
  "audience": "An owner deciding whether to add estimate-request software alongside the company's current dispatch and accounting tools.",
  "canonical_path": "/works-with-your-tools",
  "claim_refs": [
    "claim_focused_companion"
  ],
  "cta_href": "/request",
  "cta_label": "Start an estimate request",
  "description": "See how QuoteRivet keeps estimate requests, site details, and the next staff action together while accounting and dispatch stay in place.",
  "include_in_sitemap": true,
  "index_policy": "index",
  "internal_links": [
    "/",
    "/estimate-request-intake",
    "/quote-ready-checklist",
    "/site-visit-handoff"
  ],
  "last_material_change": "2026-08-29",
  "page_type": "comparison",
  "primary_heading": "Keep estimate requests organized alongside your current tools",
  "proof_refs": [
    "source_architecture_brief",
    "source_housecallpro_feature_scope"
  ],
  "route": "/works-with-your-tools",
  "search_intent": "Decide whether to add estimate-request software alongside the company's current field-service tools.",
  "sections": [
    {
      "body": "The product keeps the original request, staff review, assigned estimator, visit notes, latest supporting information, pre-quote check, and delivery record connected.",
      "heading": "What QuoteRivet keeps together"
    },
    {
      "body": "Dispatch schedules, issued quotes, accounting entries, invoices, payments, and completed-job records remain outside this product. The company adds an integration only after approving how the systems identify and exchange records and correct errors.",
      "heading": "What remains in your existing systems"
    },
    {
      "body": "A company seeking one system for scheduling, dispatch, estimating, invoicing, payments, customer management, and accounting integration should evaluate a full field-service suite against those needs.",
      "heading": "When a broader suite may fit better"
    }
  ],
  "structured_data_types": [
    "WebPage",
    "SoftwareApplication",
    "BreadcrumbList"
  ],
  "summary": "QuoteRivet keeps request review, estimator assignment, site details, the pre-quote check, and delivery to the next staff member together. Accounting, dispatch, invoicing, payments, and completed-job records stay in the systems your team already uses.",
  "surface": "public_marketing",
  "title": "Focused quote intake beside your current tools | QuoteRivet"
};

export default function PublicMarketingRoute() {
  const providerHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || '';
  const requestOrigin = process.env.NEXT_PUBLIC_SITE_URL || (providerHost ? `https://${providerHost}` : 'http://localhost:3000');
  return <MarketingPage site={site} page={page} requestOrigin={requestOrigin} />;
}
