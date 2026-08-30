from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
checks = []

def check(name: str, passed: bool, detail: dict | None = None) -> None:
    item = {"name": name, "passed": bool(passed)}
    if detail:
        item.update(detail)
    checks.append(item)

railway = shutil.which("railway")
vercel = shutil.which("vercel")
check("Railway CLI available", bool(railway))
if railway:
    try:
        proc = subprocess.run([railway, "whoami"], text=True, capture_output=True, timeout=20)
        check("Railway CLI authenticated", proc.returncode == 0, {"stdout": proc.stdout.strip()[:200], "stderr": proc.stderr.strip()[:200]})
    except Exception as exc:
        check("Railway CLI authenticated", False, {"error": str(exc)})
else:
    check("Railway CLI authenticated", False)
check("Vercel CLI available", bool(vercel))
if vercel:
    try:
        proc = subprocess.run([vercel, "whoami"], text=True, capture_output=True, timeout=20)
        check("Vercel CLI authenticated", proc.returncode == 0, {"stdout": proc.stdout.strip()[:200], "stderr": proc.stderr.strip()[:200]})
    except Exception as exc:
        check("Vercel CLI authenticated", False, {"error": str(exc)})
else:
    check("Vercel CLI authenticated", False)
check("backend Dockerfile exists", (ROOT / "backend" / "Dockerfile").exists())
check("backend railway config exists", (ROOT / "backend" / "railway.json").exists())
check("frontend Vercel config exists", (ROOT / "frontend" / "vercel.json").exists())
check("Next.js static frontend export exists", (ROOT / "frontend" / "out" / "index.html").exists())
check("provider deploy plan exists", (ROOT / "scripts" / "deploy-plan.sh").exists())
check("live evidence template exists", (ROOT / "live-evidence-template.json").exists())
check("live evidence validator exists", (ROOT / "scripts" / "validate-live-evidence.py").exists())
check("PRODUCT_DATABASE_URL configured", bool(os.environ.get("PRODUCT_DATABASE_URL")))
check("PRODUCT_ALLOWED_ORIGINS configured", bool(os.environ.get("PRODUCT_ALLOWED_ORIGINS")))
check("INKPASS_AUTH_MODE configured for production", os.environ.get("INKPASS_AUTH_MODE") == "inkpass")
check("INKPASS_URL configured with https", os.environ.get("INKPASS_URL", "").startswith("https://"))
check("INKPASS_USERINFO_URL configured for server-side token validation", (os.environ.get("INKPASS_USERINFO_URL") or "").startswith(("https://", "http://127.0.0.1", "http://localhost")))
check("InkPass service key configured", bool(os.environ.get("PRODUCT_INKPASS_SERVICE_API_KEY") or os.environ.get("INKPASS_SERVICE_API_KEY")))
check("INKPASS_CLIENT_SLUG configured", bool(os.environ.get("INKPASS_CLIENT_SLUG") or os.environ.get("PRODUCT_INKPASS_CLIENT_SLUG")))
check("NEXT_PUBLIC_PRODUCT_API_URL configured for web build", bool(os.environ.get("NEXT_PUBLIC_PRODUCT_API_URL")))
check("PostHog project token configured", bool(os.environ.get("PRODUCT_FACTORY_POSTHOG_PROJECT_TOKEN") or os.environ.get("POSTHOG_PROJECT_TOKEN") or os.environ.get("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN")))
check("PostHog ingestion host configured", (os.environ.get("PRODUCT_FACTORY_POSTHOG_HOST") or os.environ.get("POSTHOG_HOST") or os.environ.get("NEXT_PUBLIC_POSTHOG_HOST") or "").startswith(("https://", "http://127.0.0.1", "http://localhost")))

missing = [item["name"] for item in checks if not item["passed"]]
print(json.dumps({"passed": not missing, "checks": checks, "missing": missing}, indent=2, sort_keys=True))
raise SystemExit(0 if not missing else 1)
