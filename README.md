# QuoteRivet Hosted App Package

Generated from `quote-intake-demo` using `hosted_app` mode.

## Contains

- `frontend/`: React Next.js vertical SaaS workspace generated from the product spec. It contains no API routes; product APIs live in the separate FastAPI backend service.
- `backend/`: FastAPI API with local development auth, production demo-session support for prototype verification, and production InkPass fail-closed checks.
- `backend/migrations/000_isolation.sql`: product role/schema isolation for shared Postgres; run it with an admin connection and a `product_password` psql variable.
- `backend/migrations/001_init.sql`: product tables applied through the isolated runtime role.
- `backend/Dockerfile` and `backend/railway.json`: Railway API service image and config.
- `frontend/vercel.json`: Vercel static-export deployment config.
- `frontend/Dockerfile`: local full-stack smoke image for the static export; it is not the production web host.
- `deployment-plan.json`: selected incubation, traction, or production topology.
- `scripts/local-integration.py`: action-level API integration matrix covering mutations, validation, requirement gates, persistence, feedback, intake, and signed billing events.

- `executable-product.json`: machine-readable lifecycle, command, guard, permission, and system-requirement contract.
- `cli/product_cli.py`: JSON CLI for Claude Code, Codex, CI, and human operators.
- `docs/AGENT-INTEGRATION.md`: documented command discovery, authentication, error, and execution workflow.

- `agent-tasks/launch-distribution.json`: required social-image, social-copy, and search-optimization agent task.
- `launch-distribution.json`: required image inventory, metadata contract, and live-evidence requirements.
- `launch-assets/social-copy.json`: platform-ready captions and hashtags.
- `scripts/verify-launch-distribution.py`: local social/search gate run by hosted local CI.
- `agent-tasks/design-review.json`: independent public/authenticated desktop/mobile visual review task.
- `design-readiness-contract.json`: blocking quality scores, screenshot, copy, and anti-template requirements.
- `scripts/verify-design-readiness.py`: fail-closed design gate required before source publication.
- `scripts/provider-preflight.py`: package/env/provider readiness check before mutating Railway or Vercel.
- `scripts/deploy-plan.sh`: authenticated Railway API and Vercel web deployment command plan.
- `live-evidence-template.json`: required live evidence shape.
- `scripts/validate-live-evidence.py`: live evidence gate before production claims.

## Surface Separation

This package follows the Product Factory surface separation contract: customer-facing routes must stay focused on the primary user's product job, while owner/backoffice reporting, ROI, spend, revenue, ad RPM, internal ad inventory, and factory evidence concerns belong behind protected owner/reporting surfaces.

- Customer surface: generated from `package-manifest.json` -> `surfaces.customer`.
- Owner/backoffice surface: generated from `package-manifest.json` -> `surfaces.owner`.
- Owner/reporting APIs must be enforced server-side through InkPass RBAC.
- Reference: `docs/surface-separation-contract.md` in the factory repository.

## Still Missing

- Deployment evidence (not required for local package completion).
- Customer-grade InkPass browser login evidence before a production claim.
