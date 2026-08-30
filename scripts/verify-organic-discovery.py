from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_json(path: Path) -> dict[str, object]:
    if not path.is_file():
        return {}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return payload if isinstance(payload, dict) else {}


def main() -> int:
    contract = load_json(ROOT / "organic-discovery.json")
    clarity_review = load_json(ROOT / "customer-clarity-review.json")
    buyer_review = load_json(ROOT / "skeptical-buyer-review.json")
    review = load_json(ROOT / "organic-discovery-review.json")
    growth = load_json(ROOT / "organic-growth-plan.json")
    package = load_json(ROOT / "package-manifest.json")
    strategy = contract.get("strategy") if isinstance(contract.get("strategy"), dict) else {}
    pages = strategy.get("public_pages") if isinstance(strategy.get("public_pages"), list) else []
    pages = [page for page in pages if isinstance(page, dict)]
    required = contract.get("required") is True
    if not required:
        pages = [
            {
                "route": "/",
                "title": str((package.get("social_metadata") or {}).get("title") or ""),
                "description": str((package.get("social_metadata") or {}).get("description") or ""),
                "primary_heading": str((package.get("product") or {}).get("name") or ""),
                "access_policy": "anonymous",
                "surface": "public_marketing",
                "index_policy": "index",
                "include_in_sitemap": True,
                "internal_links": ["/"],
                "structured_data_types": ["Organization", "WebSite", "WebPage"],
            }
        ]

    sitemap_path = next(
        (
            path
            for path in (
                ROOT / "frontend/src/pages/sitemap.xml.jsx",
                ROOT / "frontend/public/sitemap.xml",
                ROOT / "frontend/out/sitemap.xml",
            )
            if path.is_file()
        ),
        None,
    )
    robots_path = next(
        (
            path
            for path in (
                ROOT / "frontend/src/pages/robots.txt.jsx",
                ROOT / "frontend/public/robots.txt",
                ROOT / "frontend/out/robots.txt",
            )
            if path.is_file()
        ),
        None,
    )
    sitemap_source = sitemap_path.read_text(encoding="utf-8") if sitemap_path else ""
    robots_source = robots_path.read_text(encoding="utf-8") if robots_path else ""
    index_source = (ROOT / "frontend/src/pages/index.jsx").read_text(encoding="utf-8")
    next_config_path = ROOT / "frontend/next.config.js"
    vercel_config_path = ROOT / "frontend/vercel.json"
    next_config = next_config_path.read_text(encoding="utf-8") if next_config_path.is_file() else ""
    vercel_config = vercel_config_path.read_text(encoding="utf-8") if vercel_config_path.is_file() else ""
    route_header_config = next_config + "\n" + vercel_config
    checks: list[dict[str, object]] = []

    def check(name: str, passed: object, detail: object = None) -> None:
        item: dict[str, object] = {"name": name, "passed": bool(passed)}
        if detail is not None:
            item["detail"] = detail
        checks.append(item)

    check(
        "organic discovery package contract exists",
        contract.get("schema_version") == "product_factory.organic_discovery_package.v1",
    )
    check(
        "organic discovery agent task exists",
        (ROOT / "agent-tasks/organic-discovery-review.json").is_file(),
    )
    check(
        "customer clarity review task exists",
        (ROOT / "agent-tasks/customer-clarity-review.json").is_file(),
    )
    check(
        "skeptical buyer review task exists",
        (ROOT / "agent-tasks/skeptical-buyer-review.json").is_file(),
    )
    check(
        "organic growth learning task exists",
        (ROOT / "agent-tasks/organic-growth-learning.json").is_file(),
    )
    check(
        "organic growth plan exists",
        growth.get("schema_version") == "product_factory.organic_growth_plan.v1"
        and growth.get("experiment_policy", {}).get("automatic_publish") is False,
    )
    if required:
        check(
            "researched strategy schema is retained",
            strategy.get("schema_version") == "product_factory.organic_discovery.v1"
            and strategy.get("research_status") == "researched",
        )
        check(
            "architecture strategy verification is retained",
            strategy.get("verification", {}).get("status") == "verified"
            and strategy.get("verification", {}).get("verified_by")
            == "organic_discovery_verifier_agent",
        )
        check(
            "independent rendered review approved",
            review.get("schema_version")
            == "product_factory.organic_discovery_rendered_review.v1"
            and review.get("decision") == "approved"
            and review.get("status") == "verified"
            and bool(review.get("checks_passed"))
            and not list(review.get("checks_failed") or [])
            and not list(review.get("issues") or []),
        )

    routes = [str(page.get("route") or "") for page in pages]
    titles = [str(page.get("title") or "") for page in pages]
    descriptions = [str(page.get("description") or "") for page in pages]
    headings = [str(page.get("primary_heading") or "") for page in pages]
    check(
        "public page routes are unique and include root",
        bool(routes) and routes.count("/") == 1 and len(set(routes)) == len(routes),
        routes,
    )
    check(
        "public page titles are unique and concise",
        all(1 <= len(value) <= 60 for value in titles)
        and len(set(titles)) == len(titles),
        titles,
    )
    check(
        "public page descriptions are unique and concise",
        all(20 <= len(value) <= 160 for value in descriptions)
        and len(set(descriptions)) == len(descriptions),
        descriptions,
    )
    check(
        "public page headings are unique",
        all(headings) and len(set(headings)) == len(headings),
        headings,
    )

    def public_copy_review_passes(
        payload: dict[str, object],
        *,
        review_type: str,
        reviewer_agent_id: str,
    ) -> bool:
        route_reviews = payload.get("route_reviews")
        route_reviews = (
            [item for item in route_reviews if isinstance(item, dict)]
            if isinstance(route_reviews, list)
            else []
        )
        reviewed_route_set = {
            str(item.get("route") or "") for item in route_reviews
        }
        complete_route_reviews = all(
            str(item.get("route") or "")
            and str(item.get("plain_language_summary") or "").strip()
            and str(item.get("customer_outcome") or "").strip()
            and isinstance(item.get("unexplained_terms"), list)
            and not list(item.get("unexplained_terms") or [])
            and item.get("passed") is True
            for item in route_reviews
        )
        return (
            payload.get("schema_version")
            == "product_factory.public_copy_review.v1"
            and payload.get("review_type") == review_type
            and payload.get("reviewer_agent_id") == reviewer_agent_id
            and payload.get("decision") == "approved"
            and payload.get("status") == "verified"
            and bool(payload.get("checks_passed"))
            and not list(payload.get("checks_failed") or [])
            and not list(payload.get("issues") or [])
            and set(payload.get("reviewed_routes") or []) == set(routes)
            and reviewed_route_set == set(routes)
            and len(route_reviews) == len(routes)
            and complete_route_reviews
        )

    if required:
        check(
            "independent customer clarity review approved",
            public_copy_review_passes(
                clarity_review,
                review_type="customer_clarity",
                reviewer_agent_id="customer_clarity_review_agent",
            ),
            "every public route must pass first-read comprehension with no unexplained terms",
        )
        check(
            "independent skeptical buyer review approved",
            public_copy_review_passes(
                buyer_review,
                review_type="skeptical_buyer",
                reviewer_agent_id="skeptical_buyer_review_agent",
            ),
            "every public route must state a concrete customer outcome and retain support for material claims",
        )

    public_route_set = set(routes)
    for page in pages:
        route = str(page.get("route") or "")
        is_sitemap_page = page.get("include_in_sitemap") is True
        safe_for_sitemap = (
            page.get("surface") in {"public_marketing", "public_product"}
            and page.get("access_policy") == "anonymous"
            and page.get("index_policy") == "index"
        )
        check(
            f"{route} sitemap policy is safe",
            not is_sitemap_page or safe_for_sitemap,
        )
        links = {
            str(link)
            for link in page.get("internal_links", [])
            if str(link)
        }
        check(
            f"{route} internal links resolve",
            bool(links) and links.issubset(public_route_set),
            sorted(links),
        )
        check(
            f"{route} structured data is declared",
            bool(page.get("structured_data_types")),
        )
        if route != "/":
            route_path = route.strip("/")
            check(
                f"{route} server-rendered source exists",
                (ROOT / f"frontend/src/pages/{route_path}.jsx").is_file(),
            )
        if is_sitemap_page:
            check(
                f"{route} appears in sitemap source",
                (
                    json.dumps(route) in sitemap_source
                    if sitemap_path and sitemap_path.suffix == ".jsx"
                    else f"{route}</loc>" in sitemap_source
                ),
            )

    private_routes = {
        str(route)
        for route in package.get("routes", [])
        if str(route)
    } | {"/login", "/owner", "/settings", "/activity", "/api"}
    check(
        "private routes are excluded from public page contract",
        not (private_routes & public_route_set),
        sorted(private_routes & public_route_set),
    )
    check(
        "private route responses carry noindex headers",
        "X-Robots-Tag" in route_header_config
        and "noindex, nofollow, noarchive" in route_header_config
        and all(json.dumps(route) in route_header_config for route in private_routes - {"/api"}),
    )
    check(
        "robots separates ChatGPT search from model training policy",
        "User-agent: OAI-SearchBot" in robots_source
        and "User-agent: GPTBot" in robots_source,
    )
    check(
        "root metadata avoids obsolete meta keywords",
        'name="keywords"' not in index_source,
    )
    for token in ("'@type': 'Organization'", "'@type': 'WebSite'", "'@type': 'WebPage'"):
        check(f"root structured data contains {token}", token in index_source)
    check(
        "sitemap does not manufacture lastmod at request time",
        "new Date()" not in sitemap_source,
    )
    check(
        "llms.txt is not a required launch artifact",
        not bool(re.search(r"llms[.]txt.*required", json.dumps(contract), re.I)),
    )
    if required:
        reviewed_routes = {
            str(route) for route in review.get("reviewed_routes", []) if str(route)
        }
        check(
            "independent review covers every public route",
            reviewed_routes == public_route_set,
            {
                "expected": sorted(public_route_set),
                "actual": sorted(reviewed_routes),
            },
        )

    missing = [str(item["name"]) for item in checks if not item["passed"]]
    report = {
        "schema_version": "product_factory.organic_discovery_verification.v1",
        "product_id": contract.get("product_id"),
        "status": "passed" if not missing else "failed",
        "passed": not missing,
        "required": required,
        "checks": checks,
        "missing": missing,
        "public_routes": routes,
        "sitemap_routes": [
            str(page.get("route"))
            for page in pages
            if page.get("include_in_sitemap") is True
        ],
        "live_evidence_pending": [
            "crawler reachability through CDN and bot protection",
            "rendered canonical, robots, and structured data",
            "sitemap and robots HTTP 200",
            "search engine property verification and sitemap submission",
            "post-launch indexing, query, AI referral, conversion, and commercial evidence",
        ],
    }
    (ROOT / "organic-discovery-verification.json").write_text(
        json.dumps(report, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(report, sort_keys=True))
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
