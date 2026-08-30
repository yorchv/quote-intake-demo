#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path
from uuid import uuid4

PRODUCT_ID = 'quote-intake-demo'
CONTRACT = json.loads((Path(__file__).parents[1] / "executable-product.json").read_text(encoding="utf-8"))


def call(method: str, path: str, payload: dict | None = None, token: str | None = None, key: str | None = None) -> dict:
    base = os.environ.get("PRODUCT_API_URL", "http://127.0.0.1:8000").rstrip("/")
    headers = {"content-type": "application/json"}
    if token:
        headers["authorization"] = f"Bearer {token}"
    if key:
        headers["idempotency-key"] = key
    request = urllib.request.Request(base + path, data=json.dumps(payload).encode() if payload is not None else None, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read().decode()
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as exc:
        sys.stderr.write(exc.read().decode() + "\n")
        raise SystemExit(1) from exc


def main() -> int:
    parser = argparse.ArgumentParser(description=f"Typed command CLI for {PRODUCT_ID}")
    sub = parser.add_subparsers(dest="action", required=True)
    sub.add_parser("commands")
    login = sub.add_parser("local-session")
    login.add_argument("--persona", required=True)
    listing = sub.add_parser("list")
    listing.add_argument("entity")
    listing.add_argument("--token", default=os.environ.get("PRODUCT_TOKEN"), required=os.environ.get("PRODUCT_TOKEN") is None)
    read = sub.add_parser("read")
    read.add_argument("entity")
    read.add_argument("record_id")
    read.add_argument("--token", default=os.environ.get("PRODUCT_TOKEN"), required=os.environ.get("PRODUCT_TOKEN") is None)
    execute = sub.add_parser("execute")
    execute.add_argument("command_id", choices=[item["command_id"] for item in CONTRACT["commands"]])
    execute.add_argument("--record-id")
    execute.add_argument("--fields", default="{}", help="JSON object containing typed command fields")
    execute.add_argument("--evidence-ref", action="append", default=[])
    execute.add_argument("--idempotency-key", default=None)
    execute.add_argument("--token", default=os.environ.get("PRODUCT_TOKEN"), required=os.environ.get("PRODUCT_TOKEN") is None)
    args = parser.parse_args()
    if args.action == "commands":
        result = {"schema_version": CONTRACT["schema_version"], "commands": CONTRACT["commands"]}
    elif args.action == "local-session":
        result = call("POST", "/auth/local-session", {"product_id": PRODUCT_ID, "persona_id": args.persona})
    elif args.action == "list":
        result = call("GET", f"/entities/{args.entity}", token=args.token)
    elif args.action == "read":
        result = call("GET", f"/entities/{args.entity}/{args.record_id}", token=args.token)
    else:
        try:
            fields = json.loads(args.fields)
        except json.JSONDecodeError as exc:
            parser.error(f"--fields must be valid JSON: {exc}")
        if not isinstance(fields, dict):
            parser.error("--fields must be a JSON object")
        result = call(
            "POST",
            f"/commands/{args.command_id}",
            {"record_id": args.record_id, "fields": fields, "evidence_refs": args.evidence_ref},
            args.token,
            args.idempotency_key or f"cli-{args.command_id}-{uuid4().hex}",
        )
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
