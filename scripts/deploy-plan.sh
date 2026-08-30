#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_SERVICE_NAME="${API_SERVICE_NAME:-quote-intake-demo-api}"
VERCEL_PROJECT_NAME="${VERCEL_PROJECT_NAME:-quote-intake-demo-web}"
RAILWAY_PROJECT_ID="${RAILWAY_PROJECT_ID:-}"

if ! command -v railway >/dev/null 2>&1; then
  echo "railway CLI is required" >&2
  exit 1
fi
if ! command -v vercel >/dev/null 2>&1; then
  echo "vercel CLI is required" >&2
  exit 1
fi

if [[ -z "${RAILWAY_PROJECT_ID}" ]]; then
  echo "RAILWAY_PROJECT_ID is required; hosted products deploy into the shared Railway project, not a new project." >&2
  exit 1
fi

railway status --json >/dev/null
vercel whoami >/dev/null

if [[ -z "${PRODUCT_DATABASE_URL:-}" ]]; then
  echo "PRODUCT_DATABASE_URL is required" >&2
  exit 1
fi
if [[ -z "${PRODUCT_ALLOWED_ORIGINS:-}" ]]; then
  echo "PRODUCT_ALLOWED_ORIGINS is required" >&2
  exit 1
fi
if [[ "${INKPASS_AUTH_MODE:-}" != "inkpass" ]]; then
  echo "INKPASS_AUTH_MODE=inkpass is required" >&2
  exit 1
fi
if [[ -z "${INKPASS_URL:-}" || "${INKPASS_URL}" != https://* ]]; then
  echo "INKPASS_URL=https://... is required" >&2
  exit 1
fi
if [[ -z "${INKPASS_USERINFO_URL:-}" ]]; then
  echo "INKPASS_USERINFO_URL=https://... is required for server-side token validation" >&2
  exit 1
fi
if [[ -z "${PRODUCT_INKPASS_SERVICE_API_KEY:-${INKPASS_SERVICE_API_KEY:-}}" ]]; then
  echo "PRODUCT_INKPASS_SERVICE_API_KEY or INKPASSS_SERVICE_API_KEY is required" >&2
  exit 1
fi
if [[ -z "${INKPASS_CLIENT_SLUG:-${PRODUCT_INKPASS_CLIENT_SLUG:-}}" ]]; then
  echo "INKPASS_CLIENT_SLUG is required" >&2
  exit 1
fi
if [[ -z "${PRODUCT_FACTORY_POSTHOG_PROJECT_TOKEN:-${POSTHOG_PROJECT_TOKEN:-${NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN:-}}}" ]]; then
  echo "PRODUCT_FACTORY_POSTHOG_PROJECT_TOKEN is required" >&2
  exit 1
fi

echo "Deploy API service root: ${ROOT}/backend"
echo "Deploy static web project root: ${ROOT}/frontend"
echo "This script intentionally does not create projects or persist secrets itself."
echo "Use the shared Railway project and existing product services, then run:"
echo "  cd ${ROOT}/backend && railway up --ci --project ${RAILWAY_PROJECT_ID} --service ${API_SERVICE_NAME}"
echo "  export NEXT_PUBLIC_PRODUCT_API_URL=https://<api-domain>"
echo "  export NEXT_PUBLIC_SITE_URL=https://<product-domain>"
echo "  export NEXT_PUBLIC_INKPASS_CLIENT_SLUG=${INKPASS_CLIENT_SLUG:-${PRODUCT_INKPASS_CLIENT_SLUG:-}}"
echo "  export NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=${PRODUCT_FACTORY_POSTHOG_PROJECT_TOKEN:-${POSTHOG_PROJECT_TOKEN:-${NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN:-}}}"
echo "  export NEXT_PUBLIC_POSTHOG_HOST=${PRODUCT_FACTORY_POSTHOG_HOST:-${POSTHOG_HOST:-${NEXT_PUBLIC_POSTHOG_HOST:-https://us.i.posthog.com}}}"
echo "  cd ${ROOT}/frontend && vercel --prod --yes --project ${VERCEL_PROJECT_NAME} --build-env NEXT_PUBLIC_PRODUCT_API_URL=https://<api-domain> --build-env NEXT_PUBLIC_SITE_URL=https://<product-domain>"
