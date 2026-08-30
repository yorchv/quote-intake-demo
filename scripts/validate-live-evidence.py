from __future__ import annotations

import json
import sys
from pathlib import Path

path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("live-evidence.json")
data = json.loads(path.read_text(encoding="utf-8"))
missing = []

if data.get("schema_version") != "product_factory.railway_live_evidence.v1":
    missing.append("schema_version")
if not str(data.get("api", {}).get("url", "")).startswith("https://"):
    missing.append("api.url")
if not str(data.get("web", {}).get("url", "")).startswith("https://"):
    missing.append("web.url")
for path_key in [
    ("api", "health"),
    ("api", "unauthenticated_state"),
    ("api", "authenticated_state"),
    ("api", "postgres_persistence"),
    ("web", "loads"),
    ("web", "launch_distribution"),
    ("web", "organic_discovery"),
    ("web", "browser_workflow"),
]:
    section = data.get(path_key[0], {}).get(path_key[1], {})
    if not isinstance(section, dict) or section.get("passed") is not True:
        missing.append(".".join(path_key))
env = data.get("env", {})
for key in ["product_database_url_configured", "product_allowed_origins_configured", "inkpass_url_configured", "inkpass_client_slug_configured", "inkpass_service_key_configured", "posthog_project_token_configured", "posthog_host_configured", "secrets_redacted"]:
    if env.get(key) is not True:
        missing.append(f"env.{key}")
if env.get("inkpass_auth_mode") != "inkpass":
    missing.append("env.inkpass_auth_mode")
analytics = data.get("analytics", {})
if not isinstance(analytics, dict) or analytics.get("provider") != "posthog" or analytics.get("capture", {}).get("passed") is not True:
    missing.append("analytics.capture")
events = data.get("events", {})
for key in ["usage_event_stored", "sandbox_billing_event_stored"]:
    if events.get(key) is not True:
        missing.append(f"events.{key}")
print(json.dumps({"passed": not missing, "missing": missing}, indent=2, sort_keys=True))
raise SystemExit(0 if not missing else 1)
