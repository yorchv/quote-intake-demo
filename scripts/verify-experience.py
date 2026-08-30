from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load(path: Path) -> dict:
    payload = json.loads(path.read_text())
    if not isinstance(payload, dict):
        raise ValueError(f"expected object: {path}")
    return payload


def canonical_sha(payload: dict) -> str:
    raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def resolve_source_path(relative: str) -> Path:
    """Resolve blueprint source refs inside the hosted frontend package."""
    direct = ROOT / relative
    if direct.is_file():
        return direct
    frontend = ROOT / "frontend" / relative
    if frontend.is_file():
        return frontend
    frontend_source = ROOT / "frontend" / "src" / relative
    if frontend_source.is_file():
        return frontend_source
    return direct


blueprint = load(ROOT / "experience-blueprint.json")
implementation = load(ROOT / "experience-implementation.json")
checks: list[dict[str, object]] = []


def check(name: str, passed: bool, detail: str) -> None:
    checks.append({"name": name, "passed": bool(passed), "detail": detail})


check("implementation is complete", implementation.get("status") == "complete", str(implementation.get("status")))
check(
    "implementation is pinned to the blueprint",
    implementation.get("blueprint_sha256") == canonical_sha(blueprint),
    str(implementation.get("blueprint_sha256") or "missing digest"),
)

required_files = list((blueprint.get("implementation") or {}).get("required_component_files") or [])
declared_files = set(implementation.get("component_files") or [])
for relative in required_files:
    check(f"component exists: {relative}", resolve_source_path(relative).is_file(), relative)
    check(f"component declared: {relative}", relative in declared_files, relative)

panels = list((blueprint.get("workspace") or {}).get("panels") or [])
panel_bindings = implementation.get("panel_bindings") or {}
for panel in panels:
    panel_id = str(panel.get("panel_id") or "")
    component_file = str(panel_bindings.get(panel_id) or "")
    component_path = resolve_source_path(component_file) if component_file else None
    source = component_path.read_text() if component_path and component_path.is_file() else ""
    check(f"panel bound: {panel_id}", bool(component_file), component_file or "missing binding")
    check(
        f"panel marker implemented: {panel_id}",
        f'data-experience-panel="{panel_id}"' in source or f"data-experience-panel='{panel_id}'" in source,
        component_file or "missing component",
    )

required_commands = {
    str(command)
    for panel in panels
    for command in panel.get("command_refs", [])
    if isinstance(panel, dict) and command
}
command_bindings = implementation.get("command_bindings") or {}
for command_ref in sorted(required_commands):
    check(f"command bound: {command_ref}", bool(command_bindings.get(command_ref)), str(command_bindings.get(command_ref) or "missing"))

browser_test = str(implementation.get("browser_test") or "")
check("browser journey test exists", bool(browser_test) and (ROOT / browser_test).is_file(), browser_test or "missing browser test")
browser_evidence_ref = str(implementation.get("browser_evidence") or "")
browser_evidence_path = ROOT / browser_evidence_ref if browser_evidence_ref else None
browser_evidence = load(browser_evidence_path) if browser_evidence_path and browser_evidence_path.is_file() else {}
check("browser journey evidence exists", bool(browser_evidence_path) and browser_evidence_path.is_file(), browser_evidence_ref or "missing browser evidence")
check("browser journey evidence passed", browser_evidence.get("passed") is True, str(browser_evidence.get("passed")))
required_journeys = {str(item.get("journey_id")) for item in blueprint.get("journeys", []) if isinstance(item, dict)}
verified_journeys = {str(item) for item in implementation.get("verified_journeys", [])}
check("all journeys are verified", required_journeys.issubset(verified_journeys), ", ".join(sorted(required_journeys - verified_journeys)) or "all verified")
evidence_journeys = {str(item) for item in browser_evidence.get("verified_journeys", [])}
check("browser evidence covers all journeys", required_journeys.issubset(evidence_journeys), ", ".join(sorted(required_journeys - evidence_journeys)) or "all verified")

usability_contract = blueprint.get("usability_contract") if isinstance(blueprint.get("usability_contract"), dict) else {}
if usability_contract:
    usability_evidence = browser_evidence.get("usability") if isinstance(browser_evidence.get("usability"), dict) else {}
    declared_modes = {
        str(item.get("mode_id"))
        for item in usability_contract.get("primary_modes", [])
        if isinstance(item, dict) and item.get("mode_id")
    }
    verified_modes = {str(item) for item in usability_evidence.get("verified_modes", [])}
    check(
        "usability contract is declared complete",
        implementation.get("usability_contract_verified") is True,
        str(implementation.get("usability_contract_verified")),
    )
    check(
        "all focused modes are browser verified",
        declared_modes == verified_modes,
        ", ".join(sorted(declared_modes - verified_modes)) or "all verified",
    )
    check(
        "primary action limit is browser verified",
        usability_evidence.get("maximum_primary_actions_per_mode") == usability_contract.get("primary_action_limit"),
        str(usability_evidence.get("maximum_primary_actions_per_mode")),
    )
    check(
        "advanced controls start hidden",
        usability_evidence.get("advanced_controls_hidden_by_default") is True,
        str(usability_evidence.get("advanced_controls_hidden_by_default")),
    )
    check(
        "desktop context is preserved",
        usability_evidence.get("desktop_context_preserved") is True,
        str(usability_evidence.get("desktop_context_preserved")),
    )
    check(
        "mobile context is preserved",
        usability_evidence.get("mobile_context_preserved") is True,
        str(usability_evidence.get("mobile_context_preserved")),
    )
    check(
        "responsive layout has no horizontal overflow",
        usability_evidence.get("no_horizontal_overflow") is True,
        str(usability_evidence.get("no_horizontal_overflow")),
    )

report = {
    "schema_version": "product_factory.experience_verification.v1",
    "passed": all(item["passed"] for item in checks),
    "checks": checks,
    "failed_checks": [item["name"] for item in checks if not item["passed"]],
}
print(json.dumps(report, indent=2))
raise SystemExit(0 if report["passed"] else 1)
