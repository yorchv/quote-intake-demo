import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronDown, ClipboardList, FileText, LockKeyhole, LogIn, LogOut, Menu, ShieldCheck, UserRound } from 'lucide-react';
import { api, ApiError, loginWithInkPass, SESSION_INVALID_EVENT } from './api.js';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Field, Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { DecisionSeam } from '@/components/quote-rivet/decision-seam';
import { EvidenceRail } from '@/components/quote-rivet/evidence-rail';
import { HandoffReceipt } from '@/components/quote-rivet/handoff-receipt';
import { NextMoveDock } from '@/components/quote-rivet/next-move-dock';
import { RequestQueueRow } from '@/components/quote-rivet/request-queue-row';
import { RequestSpine } from '@/components/quote-rivet/request-spine';
import { RouteStatePanel } from '@/components/quote-rivet/route-state-panel';
import { SiteCaptureSheet } from '@/components/quote-rivet/site-capture-sheet';

const PRODUCT_ID = 'quote-intake-demo';
const SESSION_KEY = 'quote-rivet-session-v1';
const ACTIVE_ROUTE_KEY = 'quote-rivet-active-route-v1';
const DRAFT_KEY = 'quote-rivet-request-draft-v1';

const routeCopy = {
  requests: {
    navigation: 'Request intake',
    title: 'Incoming estimate requests',
    orientation: 'Review new and returned estimate requests. Each row shows what is missing, who owns the next step, and how long it has been waiting without promising a response time.',
    mode: 'request'
  },
  dossier: {
    navigation: 'Request dossier',
    title: 'Request details and next step',
    orientation: 'The source request stays fixed while evidence, field facts, decisions, and handoffs build around it.',
    mode: 'request'
  },
  assignments: {
    navigation: 'Estimator assignments',
    title: 'Estimator assignments',
    orientation: 'Move supported requests to an eligible estimator. Returns keep their reason and remain visible until reassigned or escalated.',
    mode: 'decision'
  },
  siteVisit: {
    navigation: 'Site visit',
    title: 'Site visit field record',
    orientation: 'Keep the request in view while you record what was observed, measured, photographed, excluded, or left unresolved.',
    mode: 'evidence'
  },
  readiness: {
    navigation: 'Quote readiness',
    title: 'Quote-readiness review',
    orientation: 'Check the current request, assignment, site facts, evidence, and open exceptions before recording a decision.',
    mode: 'decision'
  },
  handoff: {
    navigation: 'Quote-ready handoff',
    title: 'Quote-ready handoff',
    orientation: 'Transfer the exact package that passed readiness review. The package keeps its evidence, limits, recipient access, and open obligations together.',
    mode: 'decision'
  },
  exceptions: {
    navigation: 'Exceptions',
    title: 'Operational exceptions',
    orientation: 'Resolve the blockers that need named authority. Each exception keeps its linked request, requested decision, owner, target date, and evidence.',
    mode: 'decision'
  }
};

const emptyDraft = {
  contact_name: '',
  contact_email: '',
  service_location: '',
  requested_work: '',
  source_channel: ''
};

const publicHomePage = {
  internal_links: [
    '/estimate-request-intake',
    '/quote-ready-checklist',
    '/site-visit-handoff',
    '/works-with-your-tools'
  ],
  proof_refs: [
    'source_architecture_brief',
    'source_jobber_request_basics',
    'source_google_local_services_leads',
    'source_housecallpro_feature_scope'
  ]
};
const publicPageHeadings = {
  '/estimate-request-intake': 'Organize every estimate request before assignment',
  '/quote-ready-checklist': 'Check the details before preparing a quote',
  '/site-visit-handoff': 'Keep every site-visit detail with the estimate request',
  '/works-with-your-tools': 'Keep estimate requests organized alongside your current tools'
};
const publicResourceLinks = publicHomePage.internal_links.map((route) => ({
  route,
  label: publicPageHeadings[route]
}));
const evidenceSourceByRef = {
  source_architecture_brief: {
    label: 'QuoteRivet product scope (internal product scope)',
    href: null
  },
  source_jobber_request_basics: {
    label: 'Jobber Request Basics',
    href: 'https://help.getjobber.com/en/articles/request-basics/'
  },
  source_google_local_services_leads: {
    label: 'Google Local Services lead documentation',
    href: 'https://support.google.com/localservices/answer/6224859?hl=en'
  },
  source_housecallpro_feature_scope: {
    label: 'Housecall Pro features',
    href: 'https://www.housecallpro.com/features/'
  }
};
const publicHomeProofSources = publicHomePage.proof_refs.map((proofRef) => {
  return evidenceSourceByRef[proofRef];
});

function readStoredSession() {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null');
    return parsed && typeof parsed.token === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

function readStoredRoute() {
  if (typeof window === 'undefined') return 'requests';
  const stored = window.localStorage.getItem(ACTIVE_ROUTE_KEY) || '';
  return Object.hasOwn(routeCopy, stored) ? stored : 'requests';
}

function readStoredDraft() {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DRAFT_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object' || typeof parsed.requestId !== 'string' || typeof parsed.draft !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function customerMessage(error) {
  if (error instanceof ApiError && error.status === 403) return 'You do not have permission for this decision. The request stays unchanged. Ask the named owner or coordinator to continue.';
  if (error instanceof ApiError && error.status === 409) return 'A newer revision changed this request. Your draft is still here. Review the changed facts before trying again.';
  if (error instanceof ApiError && error.sessionInvalid) return 'Your session ended. Your draft is still here. Sign in again before retrying.';
  return error instanceof Error && error.message ? error.message : 'The change could not be recorded. No completed state was assumed.';
}

function stateLabel(status) {
  const labels = {
    not_created: 'New request',
    captured: 'Captured',
    clarification_required: 'Missing details',
    owner_review_required: 'Needs owner review',
    supported: 'Supported',
    declined: 'Not supported',
    archived: 'Archived'
  };
  return labels[status] || String(status || 'Needs review').replaceAll('_', ' ');
}

function minimumFacts(draft) {
  return [
    ['Requester name', draft.contact_name],
    ['Requester email', draft.contact_email],
    ['Service address', draft.service_location],
    ['Requested work', draft.requested_work],
    ['Request source', draft.source_channel]
  ].filter(([, value]) => !String(value || '').trim()).map(([label]) => label);
}

function requestRecords(state) {
  return (state?.records || []).filter((record) => record.entity === 'service_request' || String(record.type || '').includes('service_request_intake'));
}

function resourceItems(state, entityRef) {
  const resources = state?.resources;
  if (!resources || typeof resources !== 'object') return [];
  const items = resources[entityRef];
  return Array.isArray(items) ? items : [];
}

function makeIdempotencyKey(commandRef) {
  return `${commandRef.slice(-20)}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function PublicEntry({ onContinue }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [showAccess, setShowAccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const continueSecurely = (event) => {
    event.preventDefault();
    setShowAccess(true);
  };

  const signIn = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const session = await loginWithInkPass({ email, password });
      onContinue(session, draft);
    } catch (caught) {
      setError(customerMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const openLocalPreview = async () => {
    setBusy(true);
    setError('');
    try {
      const session = await api('/auth/local-session', { method: 'POST', body: { product_id: PRODUCT_ID, persona_id: 'office_coordinator' } });
      onContinue(session, draft);
    } catch (caught) {
      setError(customerMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="public-entry" data-product-public-entry>
      <header className="public-wordmark"><span className="rivet-mark" aria-hidden="true">Q</span><strong>QuoteRivet</strong><a href="#request-sheet">Request an estimate</a></header>
      <section className="public-hero">
        <div className="public-promise"><span className="eyebrow">One request. One named reviewer.</span><h1>Send the job details once and see who will review them next.</h1><p>Tell the company what needs attention, where the work is, and how to follow up. A staff member will check the details before arranging a visit or preparing a quote.</p><a className="public-start" href="#request-sheet">Start an estimate request<ArrowRight aria-hidden="true" size={18} /></a></div>
        <ol className="public-steps" aria-label="What happens next"><li><span>01</span><div><strong>Share the request</strong><p>Record the source, contact, service location, requested work, and follow-up consent.</p></div></li><li><span>02</span><div><strong>A person reviews it</strong><p>The office checks for missing or conflicting details and tells you who will follow up.</p></div></li><li><span>03</span><div><strong>See the saved result</strong><p>Request captured. The source and details are saved, and an office coordinator is responsible for the next review.</p></div></li></ol>
      </section>
      <section className="request-sheet" id="request-sheet">
        <div className="sheet-folio"><span>Estimate request sheet</span><strong>What does the company need to review?</strong><p>Each detail helps the reviewer understand the work and contact you about a next step. Submitting a request does not issue or promise a quote.</p></div>
        <Form onSubmit={continueSecurely}>
          <div className="request-sheet-grid">
            <Field label="Your name"><Input required value={draft.contact_name} onChange={(event) => setDraft((current) => ({ ...current, contact_name: event.target.value }))} /></Field>
            <Field label="Email for follow-up"><Input required type="email" value={draft.contact_email} onChange={(event) => setDraft((current) => ({ ...current, contact_email: event.target.value }))} /></Field>
            <Field label="Service address"><Input required value={draft.service_location} onChange={(event) => setDraft((current) => ({ ...current, service_location: event.target.value }))} /></Field>
            <Field label="How did this request arrive?"><Input required placeholder="Call, message, email, or in person" value={draft.source_channel} onChange={(event) => setDraft((current) => ({ ...current, source_channel: event.target.value }))} /></Field>
            <Field className="request-sheet-work" label="What needs attention?"><Textarea required value={draft.requested_work} onChange={(event) => setDraft((current) => ({ ...current, requested_work: event.target.value }))} /></Field>
          </div>
          <label className="consent-check"><input required type="checkbox" /><span><Check aria-hidden="true" size={15} />The company may contact me about this request.</span></label>
          <Button variant="primary" type="submit">Continue to send request<ArrowRight aria-hidden="true" size={18} /></Button>
        </Form>
      </section>
      <section className="public-resources">
        <nav aria-label="QuoteRivet resources">
          <ul>
            {publicResourceLinks.map((resource) => <li key={resource.route}><a href={resource.route}>{resource.label}</a></li>)}
          </ul>
        </nav>
        <p><strong>Sources:</strong>{' '}{publicHomeProofSources.map((source, index) => <React.Fragment key={source.label}>{index ? ', ' : null}{source.href ? <a href={source.href} target="_blank" rel="noopener noreferrer">{source.label}</a> : <span>{source.label}</span>}</React.Fragment>)}</p>
      </section>
      {showAccess ? <section className="secure-access" aria-labelledby="secure-access-title"><div><LockKeyhole aria-hidden="true" size={21} /><span className="eyebrow">Secure request access</span><h2 id="secure-access-title">Sign in to send and track this request</h2><p>Your entries stay in this browser until the request is accepted.</p></div><Form onSubmit={signIn}><Field label="Email"><Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></Field><Field label="Password"><Input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></Field>{error ? <RouteStatePanel state="error" title="Sign-in stopped" message={error} /> : null}<Button variant="primary" disabled={busy} type="submit"><LogIn aria-hidden="true" size={17} />{busy ? 'Signing in…' : 'Sign in and continue'}</Button>{process.env.NODE_ENV !== 'production' ? <Button disabled={busy} onClick={openLocalPreview}>Open local staff preview</Button> : null}</Form></section> : null}
      <footer className="public-footer"><strong>QuoteRivet</strong><p>Estimate-request coordination for small residential service teams. It does not replace accounting or dispatch.</p></footer>
    </main>
  );
}

function Workspace({ initialSession, initialDraft, onLogout }) {
  const [session, setSession] = useState(initialSession);
  const [state, setState] = useState(null);
  const [route, setRouteState] = useState(readStoredRoute);
  const [mode, setMode] = useState(routeCopy[readStoredRoute()].mode);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState(initialDraft || emptyDraft);
  const [revision, setRevision] = useState(0);
  const [draftRevision, setDraftRevision] = useState(0);
  const [saveState, setSaveState] = useState('idle');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const requests = useMemo(() => requestRecords(state), [state]);
  const selectedRequest = useMemo(() => requests.find((record) => record.id === selectedId) || requests[0] || null, [requests, selectedId]);
  const missingFacts = useMemo(() => minimumFacts(draft), [draft]);
  const currentRoute = routeCopy[route];

  const loadState = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api('/state', { token: session.token });
      setState(result.state);
    } catch (caught) {
      setError(customerMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [session.token]);

  useEffect(() => { loadState(); }, [loadState]);

  useEffect(() => {
    const handleInvalidSession = () => onLogout();
    window.addEventListener(SESSION_INVALID_EVENT, handleInvalidSession);
    return () => window.removeEventListener(SESSION_INVALID_EVENT, handleInvalidSession);
  }, [onLogout]);

  useEffect(() => {
    if (!selectedRequest) return;
    setSelectedId(selectedRequest.id);
    const serverDraft = {
      contact_name: selectedRequest.contact_name || '',
      contact_email: selectedRequest.contact_email || '',
      service_location: selectedRequest.service_location || '',
      requested_work: selectedRequest.requested_work || '',
      source_channel: selectedRequest.source_channel || ''
    };
    const hasServerFacts = Object.values(serverDraft).some(Boolean);
    const retainedDraft = readStoredDraft();
    const matchingDraft = retainedDraft?.requestId === selectedRequest.id ? retainedDraft : null;
    const serverRevision = Number(selectedRequest.revision || 0);
    setDraft(hasServerFacts ? serverDraft : matchingDraft?.draft || initialDraft || emptyDraft);
    setRevision(serverRevision);
    setDraftRevision(Number(matchingDraft?.revision || serverRevision));
  }, [selectedRequest?.id]);

  const setRoute = (nextRoute) => {
    setRouteState(nextRoute);
    setMode(routeCopy[nextRoute].mode);
    setNavOpen(false);
    window.localStorage.setItem(ACTIVE_ROUTE_KEY, nextRoute);
  };

  const executeCommand = async (commandRef, { recordId = null, fields = {}, evidenceRefs = [] } = {}) => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const result = await api(`/commands/${encodeURIComponent(commandRef)}`, {
        method: 'POST',
        token: session.token,
        idempotencyKey: makeIdempotencyKey(commandRef),
        body: { record_id: recordId, fields, evidence_refs: evidenceRefs }
      });
      setState(result.state);
      return result;
    } catch (caught) {
      setError(customerMessage(caught));
      return null;
    } finally {
      setBusy(false);
    }
  };

  const saveDraft = async () => {
    if (!selectedRequest || saveState === 'saving') return;
    setSaveState('saving');
    const nextDraftRevision = draftRevision + 1;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ requestId: selectedRequest.id, draft, revision: nextDraftRevision }));
      setDraftRevision(nextDraftRevision);
      setSaveState('saved');
    } catch {
      setSaveState('error');
      setError('This browser could not save the draft. The request has not changed.');
    }
  };

  const nextMove = useMemo(() => {
    if (!selectedRequest) return { label: 'Capture request', commandRef: 'cmd_service_request_intake_and_qualification_coordinator_captures_request_v1', blocked: 'Open a request before recording a next step.' };
    if (selectedRequest.status === 'not_created') return { label: 'Capture request', commandRef: 'cmd_service_request_intake_and_qualification_coordinator_captures_request_v1', blocked: missingFacts.length ? `Add ${missingFacts.join(', ')} before capture.` : '' };
    if (selectedRequest.status === 'captured') return { label: 'Mark supported', commandRef: 'cmd_service_request_intake_and_qualification_coordinator_records_supported_v1', blocked: missingFacts.length ? `The request still needs ${missingFacts.join(', ')}.` : '' };
    if (selectedRequest.status === 'supported') return { label: 'Set estimator priority', commandRef: 'cmd_qualified_request_assignment_prioritize_supported_request_v1', blocked: '' };
    if (selectedRequest.status === 'owner_review_required') return { label: 'Await owner review', commandRef: '', blocked: 'The owner-manager must record the decision before this request can move.' };
    if (selectedRequest.status === 'clarification_required') return { label: 'Review changed facts', commandRef: '', blocked: 'The office coordinator must compare the retained request with the requester-visible corrections.' };
    return { label: 'Review current state', commandRef: '', blocked: `No next command is permitted while this request is ${stateLabel(selectedRequest.status).toLowerCase()}.` };
  }, [missingFacts, selectedRequest]);

  const runNextMove = async () => {
    if (!selectedRequest || !nextMove.commandRef) return;
    await saveDraft();
    const result = await executeCommand(nextMove.commandRef, {
      recordId: nextMove.commandRef.includes('prioritize_supported') ? null : selectedRequest.id,
      fields: {
        ...draft,
        service_request_id: selectedRequest.id,
        follow_up_consent: true,
        required_fields_complete: missingFacts.length === 0,
        policy_result: 'supported',
        owner_authority_required: false,
        priority: 'standard',
        expected_revision: revision
      }
    });
    if (result) {
      if (nextMove.commandRef.includes('coordinator_captures_request')) window.localStorage.removeItem(DRAFT_KEY);
      setRevision(Number(result.record?.revision || revision));
      const nextState = stateLabel(result.record?.status || selectedRequest.status);
      const accountable = result.record?.status === 'supported' ? 'Office coordinator' : 'Office coordinator';
      setSuccess(`Step recorded. The request is now ${nextState}. ${accountable} owns the next step.`);
    }
  };

  const saveEvidence = async () => {
    if (!selectedRequest || evidenceNote.trim().length < 8) return;
    const evidenceRef = `request-note:${selectedRequest.id}:revision-${revision + 1}`;
    const result = await executeCommand('cmd_request_evidence_control_submit_evidence_version_v1', {
      fields: { service_request_id: selectedRequest.id, note: evidenceNote.trim(), classification: 'request_scope', object_scan_status: 'accepted', version: 1 },
      evidenceRefs: [evidenceRef]
    });
    if (result) {
      setEvidenceNote('');
      setSuccess('Evidence note saved as a retained version. It has not been accepted for a readiness decision yet.');
    }
  };

  const evidence = useMemo(() => resourceItems(state, 'request_evidence').filter((item) => !selectedRequest || !item.service_request_id || item.service_request_id === selectedRequest.id).map((item) => ({
    id: item.id,
    kind: item.kind === 'photo' || item.kind === 'measurement' ? item.kind : 'note',
    label: item.note || item.label || 'Scope evidence',
    status: stateLabel(item.status),
    version: Number(item.version || 1)
  })), [selectedRequest, state]);

  const decisions = useMemo(() => (state?.activity || []).filter((item) => !selectedRequest || item.record_id === selectedRequest.id).slice(-6).reverse().map((item, index) => ({
    actor: item.persona_id ? stateLabel(item.persona_id) : item.user_id || 'Recorded actor',
    evidence: item.event_name || 'Recorded request event',
    id: `${item.record_id || 'event'}-${item.created_at || index}`,
    label: stateLabel(String(item.event_name || 'Decision recorded').replace('.v1', '')),
    time: item.created_at ? new Date(item.created_at).toLocaleString() : 'Time retained with event',
    valid: index === 0
  })), [selectedRequest, state]);

  const criteria = useMemo(() => [
    { label: 'Minimum request facts', evidenceLabel: missingFacts.length ? `${missingFacts.length} missing` : `Request revision ${revision}`, result: missingFacts.length ? 'blocked' : 'passed', reviewer: missingFacts.length ? 'Office coordinator' : 'Current request' },
    { label: 'Current field evidence', evidenceLabel: evidence.length ? `${evidence.length} retained version${evidence.length === 1 ? '' : 's'}` : 'No evidence version', result: evidence.length ? 'not_reviewed' : 'blocked', reviewer: 'Assigned estimator' },
    { label: 'Open exceptions', evidenceLabel: 'No recorded exception decision', result: 'not_reviewed', reviewer: 'Owner-manager when required' }
  ], [evidence.length, missingFacts.length, revision]);

  const highRiskAction = async () => {
    const readiness = resourceItems(state, 'quote_readiness_decision')[0];
    if (!readiness || !confirmed) return;
    const result = await executeCommand('cmd_quote_readiness_review_estimator_records_quote_ready_v1', {
      recordId: readiness.id,
      fields: { service_request_id: selectedRequest?.id, confirmed_current_evidence: true },
      evidenceRefs: evidence.map((item) => item.id)
    });
    if (result) {
      setConfirmationOpen(false);
      setConfirmed(false);
      setSuccess('Readiness decision recorded with its reviewer and evidence. This does not mean a quote was issued.');
    }
  };

  if (loading) return <main className="workspace-loading"><RouteStatePanel state="loading" title="Opening request dossier" message="Loading the retained request and its current decisions." /></main>;

  return (
    <div className="quote-workspace" data-design-contract>
      <header className="workspace-topbar"><div className="workspace-brand"><span className="rivet-mark" aria-hidden="true">Q</span><div><strong>QuoteRivet</strong><span>Estimate request workbench</span></div></div><button className="mobile-nav-toggle" onClick={() => setNavOpen((value) => !value)} type="button"><Menu aria-hidden="true" size={19} />Work areas</button><div className="workspace-user"><UserRound aria-hidden="true" size={17} /><span>{session.persona_id ? stateLabel(session.persona_id) : 'Signed-in team member'}</span><Button className="sign-out-control" onClick={onLogout}><LogOut aria-hidden="true" size={16} />Sign out</Button></div></header>
      <nav className={`workspace-nav${navOpen ? ' is-open' : ''}`} aria-label="QuoteRivet work areas">{Object.entries(routeCopy).map(([id, item]) => <button aria-current={route === id ? 'page' : undefined} className={route === id ? 'is-active' : ''} key={id} onClick={() => setRoute(id)} type="button">{item.navigation}</button>)}</nav>
      <main className="workspace-main">
        <header className="route-heading"><span className="eyebrow">{currentRoute.navigation}</span><h1>{currentRoute.title}</h1><p>{currentRoute.orientation}</p></header>
        {error ? <RouteStatePanel state={error.includes('permission') || error.includes('newer revision') ? 'blocked' : 'error'} title={error.includes('permission') ? 'Permission required' : 'Request unchanged'} message={error} /> : null}
        {route === 'requests' ? <section className="request-queue" aria-labelledby="queue-title"><div className="queue-heading"><div><h2 id="queue-title">Requests needing review</h2><p>Open one row to keep its source and accountable next step together.</p></div><span>{requests.length} current</span></div>{requests.length ? requests.map((request) => <RequestQueueRow active={request.id === selectedRequest?.id} accountablePerson={request.owner || 'Office coordinator'} key={request.id} onOpen={() => { setSelectedId(request.id); setRoute('dossier'); }} requestId={request.id.replace('seed_', '').slice(0, 24)} source={request.source_channel || 'Not recorded'} stateLabel={stateLabel(request.status)} waitingLabel={request.created_at ? `Since ${new Date(request.created_at).toLocaleDateString()}` : 'Waiting time not recorded'} />) : <RouteStatePanel state="empty" title="No requests need intake review" message="You can capture a call, message, email, or in-person request here." />}</section> : null}
        {selectedRequest ? <div className="dossier-context" aria-label="Active request context"><span><FileText aria-hidden="true" size={16} /><small>Request</small><strong>{selectedRequest.id}</strong></span><span><small>State</small><strong>{stateLabel(selectedRequest.status)}</strong></span><span><small>Accountable</small><strong>{selectedRequest.owner || 'Office coordinator'}</strong></span><span><small>Missing facts</small><strong>{missingFacts.length || 'None'}</strong></span></div> : null}
        {selectedRequest ? <Tabs className="focused-workbench" value={mode} onValueChange={setMode}><TabsList aria-label="Request work mode"><TabsTrigger value="request">Request</TabsTrigger><TabsTrigger value="evidence">Evidence</TabsTrigger><TabsTrigger value="decision">Decision</TabsTrigger></TabsList><p className="mode-purpose">{mode === 'request' ? 'Review or correct the source request while its identity and current state stay visible.' : mode === 'evidence' ? 'Capture or review evidence and site facts without losing the active request.' : 'Review the current decision trail and execute one guarded next command.'}</p>
          <TabsContent value="request"><RequestSpine accountablePerson={selectedRequest.owner || 'Office coordinator'} draft={draft} missingFacts={missingFacts} onChange={(field, value) => { setDraft((current) => ({ ...current, [field]: value })); setSaveState('idle'); }} onSave={saveDraft} requestId={selectedRequest.id} revision={draftRevision} saveState={saveState} stateLabel={stateLabel(selectedRequest.status)} /></TabsContent>
          <TabsContent value="evidence"><div className="evidence-mode"><EvidenceRail evidence={evidence} errorMessage={error && error.includes('evidence') ? error : undefined} /><SiteCaptureSheet disabled={busy} note={evidenceNote} onChange={setEvidenceNote} onSaveEvidence={saveEvidence} /></div></TabsContent>
          <TabsContent value="decision"><div className="decision-mode"><DecisionSeam blockedMessage={nextMove.blocked || undefined} criteria={criteria} decisions={decisions} />{route === 'handoff' ? <HandoffReceipt evidenceRefs={evidence.map((item) => item.id)} packageVersion={1} recipient="Verified quote recipient not selected" status="Not assembled" /> : null}<NextMoveDock accountablePerson={selectedRequest.status === 'supported' ? 'Office coordinator' : 'Office coordinator'} blockedReason={nextMove.blocked || undefined} busy={busy} commandLabel={nextMove.label} onExecute={runNextMove} successMessage={success || undefined} /></div></TabsContent>
        </Tabs> : <RouteStatePanel state="empty" title="No request is open" message="Open a request row before recording evidence or a decision." />}
        <details className="more-actions"><summary>More actions<ChevronDown aria-hidden="true" size={16} /></summary><div><h2>Advanced request controls</h2><p>Archive, restore, restriction, invalidation, full history, and policy attribution stay hidden until a named role needs them.</p>{route === 'readiness' && resourceItems(state, 'quote_readiness_decision').length ? <Button variant="danger" onClick={() => setConfirmationOpen(true)}>Record quote-ready decision</Button> : <p>No advanced command is permitted for the current request state.</p>}</div></details>
      </main>
      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}><DialogContent><DialogHeader><DialogTitle>Confirm quote-ready decision</DialogTitle><DialogDescription>Confirm that every current criterion has usable evidence and no unresolved blocker. This records readiness only. It does not issue, send, or accept a quote.</DialogDescription></DialogHeader><label className="confirm-check"><input checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} type="checkbox" /><span>I checked the current evidence versions and limitations.</span></label><Button variant="danger" disabled={!confirmed || busy} onClick={highRiskAction}><ShieldCheck aria-hidden="true" size={17} />Record quote-ready</Button></DialogContent></Dialog>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [initialDraft, setInitialDraft] = useState(emptyDraft);

  useEffect(() => {
    setInitialDraft(readStoredDraft()?.draft || emptyDraft);
    setSession(readStoredSession());
  }, []);

  const enterWorkspace = (nextSession, draft) => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setInitialDraft(draft);
    setSession(nextSession);
  };

  const logout = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(ACTIVE_ROUTE_KEY);
    window.localStorage.removeItem(DRAFT_KEY);
    setSession(null);
  }, []);

  return session ? <Workspace initialDraft={initialDraft} initialSession={session} onLogout={logout} /> : <PublicEntry onContinue={enterWorkspace} />;
}
