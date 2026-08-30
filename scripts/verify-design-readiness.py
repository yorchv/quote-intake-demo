from __future__ import annotations

import hashlib
import json
import struct
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load(path: Path) -> dict:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return payload if isinstance(payload, dict) else {}


def check(checks: list[dict[str, object]], name: str, passed: bool, detail: object) -> None:
    checks.append({"name": name, "passed": bool(passed), "detail": detail})


def safe_path(relative: object) -> Path | None:
    value = str(relative or "").strip()
    if not value or Path(value).is_absolute():
        return None
    path = (ROOT / value).resolve()
    if ROOT != path and ROOT not in path.parents:
        return None
    return path


def safe_int(value: object, default: int = 0) -> int:
    if isinstance(value, bool):
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def png_dimensions(path: Path) -> tuple[int, int] | None:
    try:
        header = path.read_bytes()[:24]
    except OSError:
        return None
    if len(header) != 24 or header[:8] != b"\x89PNG\r\n\x1a\n" or header[12:16] != b"IHDR":
        return None
    return struct.unpack(">II", header[16:24])


contract = load(ROOT / "design-readiness-contract.json")
review = load(ROOT / "design-readiness-review.json")
checks: list[dict[str, object]] = []
product_id = str(contract.get("product_id") or "")
build_id = str(contract.get("build_id") or "")

check(checks, "contract is blocking", contract.get("blocking") is True, contract.get("blocking"))
check(checks, "review matches product", review.get("product_id") == product_id, review.get("product_id"))
check(checks, "review matches build", review.get("build_id") == build_id, review.get("build_id"))
check(checks, "review is complete", review.get("status") == "complete", review.get("status"))
check(checks, "review decision is approved", review.get("decision") == "approved", review.get("decision"))
check(
    checks,
    "review is independent",
    review.get("reviewer_agent_id") == "design_quality_review_agent"
    and "product_experience_implementation_agent" in list(review.get("independent_from") or []),
    review.get("reviewer_agent_id"),
)

criteria = review.get("criteria") if isinstance(review.get("criteria"), dict) else {}
minimum_score = safe_int(contract.get("minimum_score"), 4)
for criterion in list(contract.get("quality_criteria") or []):
    result = criteria.get(criterion) if isinstance(criteria.get(criterion), dict) else {}
    score = safe_int(result.get("score"))
    evidence = str(result.get("evidence") or "").strip()
    check(
        checks,
        f"quality score passes: {criterion}",
        score >= minimum_score and bool(evidence),
        {"score": score, "minimum": minimum_score, "evidence": evidence},
    )

review_checks = review.get("checks") if isinstance(review.get("checks"), dict) else {}
for required in list(contract.get("required_checks") or []):
    check(
        checks,
        f"review check passes: {required}",
        review_checks.get(required) is True,
        review_checks.get(required),
    )

screenshots = review.get("screenshots") if isinstance(review.get("screenshots"), list) else []
verified_screenshots = 0
for required in list(contract.get("required_views") or []):
    if not isinstance(required, dict):
        continue
    matches = [
        item
        for item in screenshots
        if isinstance(item, dict)
        and item.get("surface") == required.get("surface")
        and item.get("viewport") == required.get("viewport")
    ]
    label = f"{required.get('surface')} {required.get('viewport')}"
    check(checks, f"one screenshot declared: {label}", len(matches) == 1, len(matches))
    if len(matches) != 1:
        continue
    screenshot = matches[0]
    path = safe_path(screenshot.get("ref"))
    dimensions = png_dimensions(path) if path and path.is_file() else None
    digest = hashlib.sha256(path.read_bytes()).hexdigest() if path and dimensions else ""
    size_ok = bool(
        dimensions
        and dimensions[0] >= safe_int(required.get("minimum_width"))
        and dimensions[1] >= safe_int(required.get("minimum_height"))
    )
    digest_ok = bool(digest and digest == str(screenshot.get("sha256") or ""))
    check(checks, f"PNG evidence exists: {label}", bool(dimensions), str(screenshot.get("ref") or ""))
    check(
        checks,
        f"viewport dimensions pass: {label}",
        size_ok,
        {"actual": dimensions, "required": [required.get("minimum_width"), required.get("minimum_height")]},
    )
    check(checks, f"screenshot digest passes: {label}", digest_ok, digest)
    if dimensions and size_ok and digest_ok:
        verified_screenshots += 1

frontend_root = ROOT / "frontend" / "src"
source_files = [
    path
    for path in frontend_root.rglob("*")
    if path.is_file() and path.suffix in {".js", ".jsx", ".ts", ".tsx", ".css"}
]
source = "\n".join(path.read_text(encoding="utf-8", errors="ignore") for path in source_files)
requirements = contract.get("source_requirements") if isinstance(contract.get("source_requirements"), dict) else {}
check(
    checks,
    "product-specific public entry marker exists",
    str(requirements.get("public_marker") or "") in source,
    requirements.get("public_marker"),
)
check(
    checks,
    "authenticated design marker exists",
    str(requirements.get("authenticated_marker") or "") in source,
    requirements.get("authenticated_marker"),
)
for phrase in list(contract.get("forbidden_scaffold_phrases") or []):
    check(
        checks,
        f"generic scaffold phrase absent: {phrase}",
        str(phrase).lower() not in source.lower(),
        phrase,
    )
broken_pattern = str(requirements.get("forbid_broken_copy_pattern") or "").lower()
check(
    checks,
    "broken trailing conjunction copy is absent",
    bool(broken_pattern) and broken_pattern not in source.lower(),
    broken_pattern,
)
issues = review.get("issues") if isinstance(review.get("issues"), list) else []
check(checks, "no blocking review issues remain", not issues, issues)

passed = all(item["passed"] for item in checks)
report = {
    "schema_version": "product_factory.design_readiness_verification.v1",
    "product_id": product_id,
    "build_id": build_id,
    "status": "design_ready" if passed else "design_blocked",
    "passed": passed,
    "review_decision": review.get("decision"),
    "verified_screenshot_count": verified_screenshots,
    "checks": checks,
    "failed_checks": [str(item["name"]) for item in checks if not item["passed"]],
}
(ROOT / "design-readiness-verification.json").write_text(
    json.dumps(report, indent=2, sort_keys=True) + "\n",
    encoding="utf-8",
)
print(json.dumps(report, indent=2))
raise SystemExit(0 if passed else 1)
