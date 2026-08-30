import MarketingPage from "../components/MarketingPage";

const site = {
  "name": "QuoteRivet",
  "market": "Independent residential service contractors with 2 to 20 employees that receive estimate requests through calls, texts, email, and web forms",
  "baseUrl": ""
};
const page = {
  "access_policy": "anonymous",
  "audience": "An office coordinator who reviews estimate requests arriving through several channels.",
  "canonical_path": "/estimate-request-intake",
  "claim_refs": [
    "claim_intake_queue"
  ],
  "cta_href": "/request",
  "cta_label": "Start an estimate request",
  "description": "Keep estimate requests from calls, messages, email, and forms in one review queue, with the original source and the person responsible for follow-up.",
  "include_in_sitemap": true,
  "index_policy": "index",
  "internal_links": [
    "/",
    "/quote-ready-checklist",
    "/site-visit-handoff"
  ],
  "last_material_change": "2026-08-29",
  "page_type": "how_it_works",
  "primary_heading": "Organize every estimate request before assignment",
  "proof_refs": [
    "source_architecture_brief",
    "source_jobber_request_basics",
    "source_google_local_services_leads"
  ],
  "route": "/estimate-request-intake",
  "search_intent": "Find a practical way to capture and qualify estimate requests that arrive through calls, messages, email, and forms.",
  "sections": [
    {
      "body": "Record whether the request arrived by call, message, email, web form, or in person. Keep that source after corrections, and ask for the contact method, service location, requested work, timing, and follow-up consent still missing.",
      "heading": "Preserve the source, then fill the gaps"
    },
    {
      "body": "A coordinator checks whether the company handles the requested work, whether details are missing or duplicated, and whether the business owner needs to decide. The coordinator asks for clarification, sends suitable work to an estimator, or records why the company cannot move forward.",
      "heading": "Record who will follow up"
    },
    {
      "body": "Receiving a request does not promise a visit, quote, schedule, price, or acceptance. The office keeps the next step and the staff member responsible for it visible.",
      "heading": "Do not promise an outcome at intake"
    }
  ],
  "structured_data_types": [
    "WebPage",
    "Article",
    "BreadcrumbList"
  ],
  "summary": "Office staff can keep requests from every channel in one place, fill in missing details, and tell each requester who will follow up.",
  "surface": "public_marketing",
  "title": "Estimate request intake for contractors | QuoteRivet"
};

export default function PublicMarketingRoute() {
  const providerHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || '';
  const requestOrigin = process.env.NEXT_PUBLIC_SITE_URL || (providerHost ? `https://${providerHost}` : 'http://localhost:3000');
  return <MarketingPage site={site} page={page} requestOrigin={requestOrigin} />;
}
