from __future__ import annotations

import json
import struct
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_json(path: Path) -> dict:
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    return data if isinstance(data, dict) else {}


def png_dimensions(path: Path) -> tuple[int, int] | None:
    if not path.exists():
        return None
    data = path.read_bytes()[:24]
    if len(data) < 24 or data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
        return None
    return struct.unpack(">II", data[16:24])


def main() -> int:
    contract = load_json(ROOT / "launch-distribution.json")
    social_copy = load_json(ROOT / "launch-assets/social-copy.json")
    page_path = ROOT / "frontend/src/pages/index.jsx"
    page = page_path.read_text(encoding="utf-8") if page_path.exists() else ""
    checks: list[dict[str, object]] = []

    def check(name: str, passed: object, detail: object = None) -> None:
        item: dict[str, object] = {"name": name, "passed": bool(passed)}
        if detail is not None:
            item["detail"] = detail
        checks.append(item)

    check("launch distribution contract exists", contract.get("schema_version") == "product_factory.launch_distribution.v1")
    check("launch distribution agent task exists", (ROOT / "agent-tasks/launch-distribution.json").exists())
    search = contract.get("search") if isinstance(contract.get("search"), dict) else {}
    check("SEO title is concise", 1 <= len(str(search.get("title") or "")) <= 60, {"length": len(str(search.get("title") or ""))})
    check("SEO description is concise", 20 <= len(str(search.get("description") or "")) <= 160, {"length": len(str(search.get("description") or ""))})
    check("researched or derived intent phrases are present", len(search.get("intent_phrases") or []) >= 3)

    required_page_tokens = [
        'rel="canonical"',
        'name="description"',
        'name="robots"',
        'property="og:title"',
        'property="og:image"',
        'name="twitter:card"',
        'type="application/ld+json"',
        "'@type': 'Organization'",
        "'@type': 'WebSite'",
        "'@type': 'WebPage'",
    ]
    for token in required_page_tokens:
        check(f"page contains {token}", token in page)
    check("obsolete meta keywords tag is absent", 'name="keywords"' not in page)

    check(
        "sitemap artifact exists",
        (ROOT / "frontend/src/pages/sitemap.xml.jsx").exists()
        or (ROOT / "frontend/public/sitemap.xml").exists(),
    )
    check(
        "robots artifact exists",
        (ROOT / "frontend/src/pages/robots.txt.jsx").exists()
        or (ROOT / "frontend/public/robots.txt").exists(),
    )

    social = contract.get("social") if isinstance(contract.get("social"), dict) else {}
    images = social.get("images") if isinstance(social.get("images"), list) else []
    expected_images = {
        "landscape": (1200, 630),
        "square": (1200, 1200),
        "story": (1080, 1920),
    }
    by_id = {str(item.get("id")): item for item in images if isinstance(item, dict)}
    for image_id, dimensions in expected_images.items():
        item = by_id.get(image_id, {})
        source = ROOT / str(item.get("source") or "")
        output = ROOT / str(item.get("output") or "")
        check(f"{image_id} social source exists", source.exists(), str(source.relative_to(ROOT)) if source.exists() else str(source))
        actual = png_dimensions(output)
        check(f"{image_id} social PNG has required dimensions", actual == dimensions, {"expected": dimensions, "actual": actual})

    platforms = social_copy.get("platforms") if isinstance(social_copy.get("platforms"), dict) else {}
    check("social copy covers X, LinkedIn, and Instagram", {"x", "linkedin", "instagram"}.issubset(platforms))
    check("social hashtags are present", bool(social_copy.get("hashtags")))
    x_copy = platforms.get("x") if isinstance(platforms.get("x"), dict) else {}
    check("X caption fits its character limit", 1 <= len(str(x_copy.get("caption") or "")) <= 280)

    missing = [str(item["name"]) for item in checks if not item["passed"]]
    report = {
        "schema_version": "product_factory.launch_distribution_verification.v1",
        "status": "passed" if not missing else "failed",
        "passed": not missing,
        "checks": checks,
        "missing": missing,
        "live_evidence_pending": [
            "canonical HTTPS route",
            "rendered Open Graph and X tags",
            "public social image content types and dimensions",
            "sitemap.xml and robots.txt HTTP 200",
        ],
    }
    (ROOT / "launch-distribution-verification.json").write_text(
        json.dumps(report, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(report, sort_keys=True))
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
