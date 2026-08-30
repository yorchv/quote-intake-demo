from __future__ import annotations

import argparse
import json
import urllib.error
import urllib.request


def probe(url: str) -> dict[str, object]:
    try:
        with urllib.request.urlopen(url, timeout=20) as response:
            return {"url": url, "status_code": response.status, "passed": 200 <= response.status < 400}
    except (urllib.error.URLError, TimeoutError, ValueError) as exc:
        return {"url": url, "status_code": None, "passed": False, "error": str(exc)}


parser = argparse.ArgumentParser()
parser.add_argument("--web-url", required=True)
parser.add_argument("--api-url", required=True)
parser.add_argument("--json", action="store_true")
args = parser.parse_args()
checks = [
    probe(args.web_url.rstrip("/") + "/"),
    probe(args.api_url.rstrip("/") + "/health"),
]
report = {"passed": all(check["passed"] for check in checks), "checks": checks}
print(json.dumps(report, indent=2, sort_keys=True))
raise SystemExit(0 if report["passed"] else 1)
