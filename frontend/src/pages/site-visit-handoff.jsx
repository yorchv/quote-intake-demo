import MarketingPage from "../components/MarketingPage";

const site = {
  "name": "QuoteRivet",
  "market": "Independent residential service contractors with 2 to 20 employees that receive estimate requests through calls, texts, email, and web forms",
  "baseUrl": ""
};
const page = {
  "access_policy": "anonymous",
  "audience": "An office coordinator arranging an estimate site visit and handing the request to the assigned estimator.",
  "canonical_path": "/site-visit-handoff",
  "claim_refs": [
    "claim_quote_ready_package"
  ],
  "cta_href": "/request",
  "cta_label": "Start an estimate request",
  "description": "Coordinate a visit time, assigned estimator, site checklist, and latest job details before the estimator prepares a quote.",
  "include_in_sitemap": true,
  "index_policy": "index",
  "internal_links": [
    "/",
    "/estimate-request-intake",
    "/quote-ready-checklist"
  ],
  "last_material_change": "2026-08-29",
  "page_type": "use_case",
  "primary_heading": "Keep every site-visit detail with the estimate request",
  "proof_refs": [
    "source_architecture_brief",
    "source_jobber_request_basics",
    "source_housecallpro_feature_scope"
  ],
  "route": "/site-visit-handoff",
  "search_intent": "Coordinate the site visit and assigned estimator needed to gather the details for a quote.",
  "sections": [
    {
      "body": "Offer available visit times, record how the requester received them, keep their acceptance or correction, and confirm which estimator is assigned and which details to collect.",
      "heading": "Confirm a visit time and the assigned estimator"
    },
    {
      "body": "The estimator records arrival and completion details, photos, measurements, observations, work notes, exclusions, assumptions, access limits, and unanswered questions. Each item says who supplied or observed it and when.",
      "heading": "Capture what happened at the site"
    },
    {
      "body": "No access, changed work, missing details, or a requester dispute prevents the estimator from preparing a quote until the assigned staff member fixes the record or the business owner decides what to do.",
      "heading": "Send incomplete work to the person who can fix it"
    }
  ],
  "structured_data_types": [
    "WebPage",
    "Article",
    "BreadcrumbList"
  ],
  "summary": "Keep the work description the requester can see, confirmed visit time, assigned estimator, access notes, and site checklist in one place. A scheduled visit does not mean the company has enough information to prepare a quote.",
  "surface": "public_marketing",
  "title": "Site-visit handoff for estimates | QuoteRivet"
};

export default function PublicMarketingRoute() {
  const providerHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || '';
  const requestOrigin = process.env.NEXT_PUBLIC_SITE_URL || (providerHost ? `https://${providerHost}` : 'http://localhost:3000');
  return <MarketingPage site={site} page={page} requestOrigin={requestOrigin} />;
}
