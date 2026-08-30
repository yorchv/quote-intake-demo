import MarketingPage from "../components/MarketingPage";

const site = {
  "name": "QuoteRivet",
  "market": "Independent residential service contractors with 2 to 20 employees that receive estimate requests through calls, texts, email, and web forms",
  "baseUrl": ""
};
const page = {
  "access_policy": "anonymous",
  "audience": "An office coordinator preparing a complete request for an estimator's review.",
  "canonical_path": "/quote-ready-checklist",
  "claim_refs": [
    "claim_quote_ready_package"
  ],
  "cta_href": "/request",
  "cta_label": "Start an estimate request",
  "description": "Check contact details, job information, photos, measurements, site notes, and open questions before an estimator prepares a quote.",
  "include_in_sitemap": true,
  "index_policy": "index",
  "internal_links": [
    "/",
    "/estimate-request-intake",
    "/site-visit-handoff"
  ],
  "last_material_change": "2026-08-29",
  "page_type": "resource",
  "primary_heading": "Check the details before preparing a quote",
  "proof_refs": [
    "source_architecture_brief",
    "source_jobber_request_basics"
  ],
  "route": "/quote-ready-checklist",
  "search_intent": "Learn which details to collect before deciding whether a request needs an on-site assessment or can move toward a quote.",
  "sections": [
    {
      "body": "Confirm the contact method and consent, service location, requested work, timing, availability, access instructions, and any missing or contradictory answers.",
      "heading": "Start with the requester's facts"
    },
    {
      "body": "Attach the assigned estimator, confirmed visit details, latest photos and measurements, observations, work notes, exclusions, assumptions, access limits, and unanswered questions.",
      "heading": "Add the latest site details when the work needs them"
    },
    {
      "body": "The estimator checks each required detail and records whether there is enough information to prepare a quote. Missing or disputed details stay listed with the reason. Passing this check does not mean a quote was issued or accepted.",
      "heading": "Record the decision and its limits"
    }
  ],
  "structured_data_types": [
    "WebPage",
    "Article",
    "BreadcrumbList"
  ],
  "summary": "Use this checklist to see which request and site details are present, which are missing, and what an estimator still needs before preparing a quote.",
  "surface": "public_marketing",
  "title": "Estimate details checklist for service requests | QuoteRivet"
};

export default function PublicMarketingRoute() {
  const providerHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || '';
  const requestOrigin = process.env.NEXT_PUBLIC_SITE_URL || (providerHost ? `https://${providerHost}` : 'http://localhost:3000');
  return <MarketingPage site={site} page={page} requestOrigin={requestOrigin} />;
}
