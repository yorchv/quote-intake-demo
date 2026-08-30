# Agent integration

This package exposes a deterministic command surface for Claude Code, Codex, CI jobs, and human operators. Agents must read `executable-product.json`; they must not infer actions from UI labels.

## Local session

```bash
python cli/product_cli.py local-session --persona <persona-id>
export PRODUCT_TOKEN='<returned token>'
```

Production uses an InkPass bearer token and server-side permission checks. Local persona sessions are disabled when `PRODUCT_ENV=production`.

## Discover and execute

```bash
python cli/product_cli.py commands
python cli/product_cli.py list service_request
python cli/product_cli.py read service_request <record-id>
python cli/product_cli.py execute <command-id> --record-id <record-id> --fields '{"field":"value"} --evidence-ref <evidence-id>
```

Every mutation requires an idempotency key, validates its machine guards, verifies the actor permission and persona, records an attributable event, and returns canonical state. HTTP `403` means the identity lacks permission; `409` means a state or evidence guard failed; `422` means the payload contract failed.

## Commands

| Command | Kind | Entity | Permission |
| --- | --- | --- | --- |
| `cmd_service_request_intake_and_qualification_requester_submits_request_v1` | `transition` | `service_request` | `View and amend the request information made available to the requester.` |
| `cmd_service_request_intake_and_qualification_coordinator_captures_request_v1` | `transition` | `service_request` | `Create and edit service requests and requester-visible intake details.` |
| `cmd_service_request_intake_and_qualification_coordinator_marks_clarification_required_v1` | `transition` | `service_request` | `Create and edit service requests and requester-visible intake details.` |
| `cmd_service_request_intake_and_qualification_requester_corrects_request_v1` | `transition` | `service_request` | `View and amend the request information made available to the requester.` |
| `cmd_service_request_intake_and_qualification_coordinator_routes_owner_review_v1` | `transition` | `service_request` | `Apply an intake qualification status under documented service and risk rules.` |
| `cmd_service_request_intake_and_qualification_coordinator_records_supported_v1` | `transition` | `service_request` | `Apply an intake qualification status under documented service and risk rules.` |
| `cmd_service_request_intake_and_qualification_owner_records_supported_exception_v1` | `transition` | `service_request` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_service_request_intake_and_qualification_owner_or_coordinator_records_decline_v1` | `transition` | `service_request` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_service_request_intake_and_qualification_archive_declined_request_v1` | `transition` | `service_request` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_service_request_intake_and_qualification_restore_archived_request_v1` | `transition` | `service_request` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_qualified_request_assignment_prioritize_supported_request_v1` | `transition` | `estimator_assignment` | `Apply an intake qualification status under documented service and risk rules.` |
| `cmd_qualified_request_assignment_assign_eligible_estimator_v1` | `transition` | `estimator_assignment` | `Propose or confirm site-visit windows and assign an eligible estimator.` |
| `cmd_qualified_request_assignment_estimator_acknowledges_assignment_v1` | `transition` | `estimator_assignment` | `Accept or return an assignment with a recorded reason.` |
| `cmd_qualified_request_assignment_estimator_returns_assignment_v1` | `transition` | `estimator_assignment` | `Accept or return an assignment with a recorded reason.` |
| `cmd_qualified_request_assignment_coordinator_reassigns_returned_request_v1` | `transition` | `estimator_assignment` | `Propose or confirm site-visit windows and assign an eligible estimator.` |
| `cmd_qualified_request_assignment_coordinator_escalates_unassignable_request_v1` | `transition` | `operational_exception` | `Propose or confirm site-visit windows and assign an eligible estimator.` |
| `cmd_qualified_request_assignment_owner_reassigns_escalated_request_v1` | `transition` | `estimator_assignment` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_qualified_request_assignment_owner_closes_assignment_v1` | `transition` | `estimator_assignment` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_qualified_request_assignment_owner_reopens_closed_assignment_v1` | `transition` | `estimator_assignment` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_request_evidence_control_submit_evidence_version_v1` | `transition` | `request_evidence` | `Upload evidence for the request.` |
| `cmd_request_evidence_control_estimator_starts_evidence_review_v1` | `transition` | `request_evidence` | `Add and version site-visit evidence and scope notes.` |
| `cmd_request_evidence_control_estimator_accepts_evidence_v1` | `transition` | `request_evidence` | `Add and version site-visit evidence and scope notes.` |
| `cmd_request_evidence_control_estimator_requests_evidence_correction_v1` | `transition` | `request_evidence` | `Add and version site-visit evidence and scope notes.` |
| `cmd_request_evidence_control_submit_corrected_evidence_version_v1` | `transition` | `request_evidence` | `Create and edit service requests and requester-visible intake details.` |
| `cmd_request_evidence_control_requester_disputes_accepted_evidence_v1` | `transition` | `request_evidence` | `Upload evidence for the request.` |
| `cmd_request_evidence_control_estimator_reviews_dispute_v1` | `transition` | `request_evidence` | `Add and version site-visit evidence and scope notes.` |
| `cmd_request_evidence_control_owner_restricts_evidence_v1` | `transition` | `request_evidence` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_request_evidence_control_owner_restores_evidence_access_v1` | `transition` | `request_evidence` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_operational_exception_resolution_open_operational_exception_v1` | `transition` | `operational_exception` | `Create and edit service requests and requester-visible intake details.` |
| `cmd_operational_exception_resolution_escalate_operational_exception_v1` | `transition` | `operational_exception` | `Create and edit service requests and requester-visible intake details.` |
| `cmd_operational_exception_resolution_owner_decides_exception_v1` | `transition` | `operational_exception` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_operational_exception_resolution_owner_closes_resolved_exception_v1` | `transition` | `operational_exception` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_operational_exception_resolution_owner_reopens_exception_v1` | `transition` | `operational_exception` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_operational_exception_resolution_escalate_reopened_exception_v1` | `transition` | `operational_exception` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_site_visit_and_scope_capture_offer_visit_windows_v1` | `transition` | `site_visit` | `Propose or confirm site-visit windows and assign an eligible estimator.` |
| `cmd_site_visit_and_scope_capture_requester_accepts_visit_window_v1` | `transition` | `site_visit` | `Accept or decline a proposed site-visit window.` |
| `cmd_site_visit_and_scope_capture_requester_declines_visit_windows_v1` | `transition` | `site_visit` | `Accept or decline a proposed site-visit window.` |
| `cmd_site_visit_and_scope_capture_offer_rescheduled_windows_v1` | `transition` | `site_visit` | `Propose or confirm site-visit windows and assign an eligible estimator.` |
| `cmd_site_visit_and_scope_capture_coordinator_confirms_visit_v1` | `transition` | `site_visit` | `Propose or confirm site-visit windows and assign an eligible estimator.` |
| `cmd_site_visit_and_scope_capture_estimator_starts_visit_v1` | `transition` | `site_visit` | `Add and version site-visit evidence and scope notes.` |
| `cmd_site_visit_and_scope_capture_estimator_completes_field_record_v1` | `transition` | `site_visit` | `Add and version site-visit evidence and scope notes.` |
| `cmd_site_visit_and_scope_capture_estimator_routes_complete_visit_v1` | `transition` | `site_visit` | `Add and version site-visit evidence and scope notes.` |
| `cmd_site_visit_and_scope_capture_estimator_records_field_correction_v1` | `transition` | `site_visit` | `Add and version site-visit evidence and scope notes.` |
| `cmd_site_visit_and_scope_capture_coordinator_reschedules_correction_visit_v1` | `transition` | `site_visit` | `Propose or confirm site-visit windows and assign an eligible estimator.` |
| `cmd_site_visit_and_scope_capture_estimator_records_no_access_v1` | `transition` | `site_visit` | `Add and version site-visit evidence and scope notes.` |
| `cmd_site_visit_and_scope_capture_coordinator_escalates_no_access_v1` | `transition` | `operational_exception` | `Create and edit service requests and requester-visible intake details.` |
| `cmd_site_visit_and_scope_capture_owner_cancels_visit_v1` | `transition` | `site_visit` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_site_visit_and_scope_capture_owner_authorizes_reschedule_v1` | `transition` | `operational_exception` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_quote_readiness_review_estimator_starts_readiness_review_v1` | `transition` | `quote_readiness_decision` | `Record a quote-ready decision with supporting evidence or a not-ready reason.` |
| `cmd_quote_readiness_review_estimator_records_quote_ready_v1` | `transition` | `quote_readiness_decision` | `Record a quote-ready decision with supporting evidence or a not-ready reason.` |
| `cmd_quote_readiness_review_estimator_records_not_ready_v1` | `transition` | `quote_readiness_decision` | `Record a quote-ready decision with supporting evidence or a not-ready reason.` |
| `cmd_quote_readiness_review_estimator_restarts_corrected_review_v1` | `transition` | `quote_readiness_decision` | `Add and version site-visit evidence and scope notes.` |
| `cmd_quote_readiness_review_estimator_invalidates_ready_decision_v1` | `transition` | `quote_readiness_decision` | `Add and version site-visit evidence and scope notes.` |
| `cmd_quote_readiness_review_estimator_reviews_after_invalidation_v1` | `transition` | `quote_readiness_decision` | `Add and version site-visit evidence and scope notes.` |
| `cmd_quote_readiness_review_owner_restricts_readiness_decision_v1` | `transition` | `quote_readiness_decision` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_quote_readiness_review_owner_restores_readiness_access_v1` | `transition` | `quote_readiness_decision` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_quote_ready_handoff_estimator_assembles_handoff_v1` | `transition` | `quote_ready_handoff` | `Add and version site-visit evidence and scope notes.` |
| `cmd_quote_ready_handoff_estimator_transfers_handoff_v1` | `transition` | `quote_ready_handoff` | `Add and version site-visit evidence and scope notes.` |
| `cmd_quote_ready_handoff_recipient_acknowledgement_recorded_v1` | `transition` | `quote_ready_handoff` | `Create and edit service requests and requester-visible intake details.` |
| `cmd_quote_ready_handoff_recipient_rejection_recorded_v1` | `transition` | `quote_ready_handoff` | `Create and edit service requests and requester-visible intake details.` |
| `cmd_quote_ready_handoff_recipient_access_failure_recorded_v1` | `transition` | `quote_ready_handoff` | `Create and edit service requests and requester-visible intake details.` |
| `cmd_quote_ready_handoff_estimator_reassembles_rejected_package_v1` | `transition` | `quote_ready_handoff` | `Add and version site-visit evidence and scope notes.` |
| `cmd_quote_ready_handoff_coordinator_corrects_recipient_access_v1` | `transition` | `quote_ready_handoff` | `Create and edit service requests and requester-visible intake details.` |
| `cmd_quote_ready_handoff_estimator_invalidates_transferred_package_v1` | `transition` | `quote_ready_handoff` | `Add and version site-visit evidence and scope notes.` |
| `cmd_quote_ready_handoff_estimator_invalidates_acknowledged_package_v1` | `transition` | `quote_ready_handoff` | `Add and version site-visit evidence and scope notes.` |
| `cmd_quote_ready_handoff_estimator_reassembles_invalidated_package_v1` | `transition` | `quote_ready_handoff` | `Add and version site-visit evidence and scope notes.` |
| `cmd_service_request_create_v1` | `create` | `service_request` | `Create and edit service requests and requester-visible intake details.` |
| `cmd_service_request_update_v1` | `update` | `service_request` | `Create and edit service requests and requester-visible intake details.` |
| `cmd_service_request_archive_v1` | `archive` | `service_request` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_service_request_restore_v1` | `restore` | `service_request` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_qualification_decision_create_v1` | `create` | `qualification_decision` | `Apply an intake qualification status under documented service and risk rules.` |
| `cmd_qualification_decision_update_v1` | `update` | `qualification_decision` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_qualification_decision_archive_v1` | `archive` | `qualification_decision` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_qualification_decision_restore_v1` | `restore` | `qualification_decision` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_estimator_assignment_create_v1` | `create` | `estimator_assignment` | `Propose or confirm site-visit windows and assign an eligible estimator.` |
| `cmd_estimator_assignment_update_v1` | `update` | `estimator_assignment` | `Propose or confirm site-visit windows and assign an eligible estimator.` |
| `cmd_estimator_assignment_archive_v1` | `archive` | `estimator_assignment` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_estimator_assignment_restore_v1` | `restore` | `estimator_assignment` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_request_evidence_create_v1` | `create` | `request_evidence` | `Add and version site-visit evidence and scope notes.` |
| `cmd_request_evidence_update_v1` | `update` | `request_evidence` | `Add and version site-visit evidence and scope notes.` |
| `cmd_request_evidence_archive_v1` | `archive` | `request_evidence` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_request_evidence_restore_v1` | `restore` | `request_evidence` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_operational_exception_create_v1` | `create` | `operational_exception` | `Create and edit service requests and requester-visible intake details.` |
| `cmd_operational_exception_update_v1` | `update` | `operational_exception` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_operational_exception_archive_v1` | `archive` | `operational_exception` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_operational_exception_restore_v1` | `restore` | `operational_exception` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_quote_readiness_decision_create_v1` | `create` | `quote_readiness_decision` | `Record a quote-ready decision with supporting evidence or a not-ready reason.` |
| `cmd_quote_readiness_decision_update_v1` | `update` | `quote_readiness_decision` | `Record a quote-ready decision with supporting evidence or a not-ready reason.` |
| `cmd_quote_readiness_decision_archive_v1` | `archive` | `quote_readiness_decision` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_quote_readiness_decision_restore_v1` | `restore` | `quote_readiness_decision` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_quote_ready_handoff_create_v1` | `create` | `quote_ready_handoff` | `Record a quote-ready decision with supporting evidence or a not-ready reason.` |
| `cmd_quote_ready_handoff_update_v1` | `update` | `quote_ready_handoff` | `Create and edit service requests and requester-visible intake details.` |
| `cmd_quote_ready_handoff_archive_v1` | `archive` | `quote_ready_handoff` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_quote_ready_handoff_restore_v1` | `restore` | `quote_ready_handoff` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_site_visit_create_v1` | `create` | `site_visit` | `Propose or confirm site-visit windows and assign an eligible estimator.` |
| `cmd_site_visit_update_v1` | `update` | `site_visit` | `Add and version site-visit evidence and scope notes.` |
| `cmd_site_visit_archive_v1` | `archive` | `site_visit` | `Approve or decline escalated exceptions and reassign accountable work.` |
| `cmd_site_visit_restore_v1` | `restore` | `site_visit` | `Approve or decline escalated exceptions and reassign accountable work.` |

## Production requirements

Call `GET /ready` before agent work. It fails closed when a production system requirement in `executable-product.json` is missing. Hard delete is forbidden; use the declared archive and restore commands.
