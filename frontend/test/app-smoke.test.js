import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = (relative) => fs.readFileSync(new URL(relative, import.meta.url), 'utf8');

const luminance = (hex) => {
  const channels = hex.match(/[\da-f]{2}/gi).map((value) => Number.parseInt(value, 16) / 255);
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2]);
};

const contrastRatio = (foreground, background) => {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
};

test('public entry is a finished QuoteRivet estimate-request sheet', () => {
  const app = source('../src/App.jsx');
  assert.match(app, /data-product-public-entry/);
  assert.match(app, /Send the job details once and see who will review them next/);
  assert.match(app, /Start an estimate request/);
  assert.match(app, /Request captured\. The source and details are saved/);
  assert.match(app, /A staff member will check the details/);
  assert.doesNotMatch(app, /pilot available|send pilot intake|factory shell|factory stage/i);
});

test('request route reuses the product entry with runtime config and noindex metadata', () => {
  const requestPage = source('../src/pages/request.jsx');
  assert.match(requestPage, /import App from ['"]\.\.\/App\.jsx['"]/);
  assert.match(requestPage, /<Script src="\/product-api-config\.js" strategy="beforeInteractive" \/>/);
  assert.match(requestPage, /<meta name="robots" content="noindex,nofollow,noarchive" \/>/);
  assert.match(requestPage, /<title>\{title\}<\/title>/);
  assert.match(requestPage, /<meta name="description" content=\{description\} \/>/);
  assert.match(requestPage, /<App \/>/);
});

test('discovery contract titles and headings match every approved rendered route', () => {
  const discovery = JSON.parse(source('../../organic-discovery.json'));
  const browserEvidence = JSON.parse(source('../../copy-review-evidence/browser-rendered-routes.json'));
  const renderedByRoute = new Map(browserEvidence.routes.map((route) => [route.route, route]));

  assert.equal(discovery.strategy.public_pages.length, browserEvidence.routes.length);
  for (const page of discovery.strategy.public_pages) {
    const rendered = renderedByRoute.get(page.route);
    assert.ok(rendered, `missing rendered evidence for ${page.route}`);
    assert.equal(page.title, rendered.title, `title mismatch on ${page.route}`);
    assert.equal(page.primary_heading, rendered.h1, `primary heading mismatch on ${page.route}`);
  }
});

test('root entry renders every declared resource and each retained proof source', () => {
  const app = source('../src/App.jsx');
  const discovery = JSON.parse(source('../../organic-discovery.json'));
  const homePage = discovery.strategy.public_pages.find((page) => page.route === '/');
  const evidenceByRef = new Map(
    discovery.strategy.evidence_sources.map((evidenceSource) => [evidenceSource.source_id, evidenceSource])
  );
  const externalUrls = homePage.proof_refs
    .map((proofRef) => evidenceByRef.get(proofRef).source_ref)
    .filter((sourceRef) => sourceRef.startsWith('https://'))
    .sort();

  assert.deepEqual(homePage.internal_links, [
    '/estimate-request-intake',
    '/quote-ready-checklist',
    '/site-visit-handoff',
    '/works-with-your-tools'
  ]);
  assert.deepEqual(homePage.proof_refs, [
    'source_architecture_brief',
    'source_jobber_request_basics',
    'source_google_local_services_leads',
    'source_housecallpro_feature_scope'
  ]);
  assert.match(app, /publicHomePage\.internal_links\.map/);
  assert.match(app, /<a href=\{resource\.route\}>\{resource\.label\}<\/a>/);
  assert.match(app, /publicHomePage\.proof_refs\.map/);
  assert.match(app, /QuoteRivet product scope \(internal product scope\)/);
  assert.match(app, /Jobber Request Basics/);
  assert.match(app, /Google Local Services lead documentation/);
  assert.match(app, /Housecall Pro features/);
  assert.match(app, /source\.href \? <a href=\{source\.href\} target="_blank" rel="noopener noreferrer">\{source\.label\}<\/a> : <span>\{source\.label\}<\/span>/);
  assert.deepEqual(externalUrls, [
    'https://help.getjobber.com/en/articles/request-basics/',
    'https://support.google.com/localservices/answer/6224859?hl=en',
    'https://www.housecallpro.com/features/'
  ]);
  for (const externalUrl of externalUrls) assert.ok(app.includes(externalUrl));
  for (const route of homePage.internal_links) {
    const linkedPage = discovery.strategy.public_pages.find((page) => page.route === route);
    assert.ok(app.includes(linkedPage.primary_heading));
  }
});

test('public copy omits every phrase blocked by the verified clarity review', () => {
  const app = source('../src/App.jsx');
  const marketingPage = source('../src/components/MarketingPage.jsx');
  const publicEntry = app.split('function PublicEntry')[1].split('function Workspace')[0];
  const publicSource = [
    '../src/pages/index.jsx',
    '../src/pages/estimate-request-intake.jsx',
    '../src/pages/quote-ready-checklist.jsx',
    '../src/pages/site-visit-handoff.jsx',
    '../src/pages/works-with-your-tools.jsx'
  ].map(source).concat(publicEntry).join('\n');
  assert.match(publicSource, /Keep every site-visit detail with the estimate request/);
  assert.doesNotMatch(publicSource, /Hand off the same request the estimator must complete/i);
  assert.doesNotMatch(publicSource, /visible, owned next step|accountable next step|quote-ready decision|Capture the first request|source facts|accountable decision|policy exceptions|supported intake|retained decline reason|request package|field evidence|accountable estimator|fixed criteria|current versions|not-ready decision|handoff pattern|requester-visible scope|readiness review|permitted window|attributable sources|named correction|owner decision|focused intake path|replacing your stack|request qualification|site evidence|quote-readiness review|package handoff|won-work records|existing owners|later approved integration/i);
  assert.match(marketingPage, /Sources:/);
  assert.match(marketingPage, /QuoteRivet product scope \(internal product scope\)/);
  assert.match(marketingPage, /Jobber Request Basics/);
  assert.match(marketingPage, /Google Local Services lead documentation/);
  assert.doesNotMatch(marketingPage, /Evidence references:/);
  assert.doesNotMatch(marketingPage, /proof_refs\.join/);
});

test('marketing proof footer links retained external sources without exposing source IDs', () => {
  const marketingPage = source('../src/components/MarketingPage.jsx');
  const discovery = JSON.parse(source('../../organic-discovery.json'));
  const evidenceSources = Object.fromEntries(
    discovery.strategy.evidence_sources.map((evidenceSource) => [evidenceSource.source_id, evidenceSource])
  );
  const proofSources = marketingPage
    .split('const proofSources = {')[1]
    .split('\n};')[0];
  const internalSource = proofSources
    .split('source_architecture_brief:')[1]
    .split('source_google_local_services_leads:')[0];
  const proofFooter = marketingPage
    .split('{page.proof_refs?.length ? (')[1]
    .split(') : null}')[0];

  assert.match(internalSource, /QuoteRivet product scope \(internal product scope\)/);
  assert.doesNotMatch(internalSource, /href:/);
  assert.match(proofSources, new RegExp(evidenceSources.source_jobber_request_basics.source_ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(proofSources, new RegExp(evidenceSources.source_google_local_services_leads.source_ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(proofFooter, /page\.proof_refs\.map/);
  assert.match(proofFooter, /<a href=\{source\.href\} target="_blank" rel="noopener noreferrer">\s*\{source\.label\}\s*<\/a>/);
  assert.match(proofFooter, /<span>\{source\.label\}<\/span>/);
  assert.doesNotMatch(proofFooter, /source_architecture_brief|source_jobber_request_basics|source_google_local_services_leads|\{proofRef\}<\/span>/);
});

test('authenticated workbench uses focused modes and keeps the request context', () => {
  const app = source('../src/App.jsx');
  const styles = source('../src/styles.css');
  assert.match(app, /value="request">Request/);
  assert.match(app, /value="evidence">Evidence/);
  assert.match(app, /value="decision">Decision/);
  assert.match(app, /className="dossier-context"/);
  assert.match(app, /More actions/);
  assert.match(app, /Confirm quote-ready decision/);
  assert.match(app, /checked={confirmed}/);
  assert.match(styles, /\.quote-workspace \.route-heading \{[^}]*display: block;/);
});

test('authenticated Sign out stays labeled, high contrast, focused, and touch sized', () => {
  const app = source('../src/App.jsx');
  const styles = source('../src/styles.css');
  const workspace = app.split('function Workspace')[1].split('export default function App')[0];
  const stateSelectors = [
    '.workspace-user .sign-out-control',
    '.workspace-user .sign-out-control:hover',
    '.workspace-user .sign-out-control:active',
    '.workspace-user .sign-out-control:disabled'
  ];

  assert.match(workspace, /<Button className="sign-out-control" onClick=\{onLogout\}><LogOut aria-hidden="true" size=\{16\} \/>Sign out<\/Button>/);
  for (const selector of stateSelectors) {
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rule = styles.match(new RegExp(`${escapedSelector} \\{([^}]*)\\}`));
    assert.ok(rule, `missing ${selector} rule`);
    const background = rule[1].match(/(?:^|;)\s*background:\s*(#[\da-f]{6})/i)?.[1];
    const foreground = rule[1].match(/(?:^|;)\s*color:\s*(#[\da-f]{6})/i)?.[1];
    assert.ok(background && foreground, `${selector} needs explicit foreground and background colors`);
    assert.ok(contrastRatio(foreground, background) >= 4.5, `${selector} text contrast must meet WCAG AA`);
  }

  assert.match(styles, /\.workspace-user \.sign-out-control:focus-visible \{[^}]*outline: 3px solid #ffd591;[^}]*outline-offset: 3px;/);
  assert.match(styles, /@media \(max-width: 900px\) \{[\s\S]*?\.workspace-user > span, \.workspace-user > svg \{ display: none; \}/);
  const mobileRule = styles.match(/@media \(max-width: 600px\) \{[\s\S]*?\.workspace-user \.sign-out-control \{([^}]*)\}/)?.[1];
  assert.ok(mobileRule, 'missing mobile Sign out rule');
  assert.match(mobileRule, /font-size: 0\.75rem;/);
  assert.match(mobileRule, /min-height: 44px;/);
  assert.match(mobileRule, /min-width: 44px;/);
  assert.doesNotMatch(mobileRule, /font-size:\s*0(?:[;\s]|$)/);
});

test('design-contract markers stay separated by authenticated and public roots', () => {
  const app = source('../src/App.jsx');
  const publicEntry = app.split('function PublicEntry')[1].split('function Workspace')[0];
  const workspace = app.split('function Workspace')[1].split('export default function App')[0];

  assert.match(publicEntry, /<main className="public-entry" data-product-public-entry>/);
  assert.doesNotMatch(publicEntry, /data-design-contract/);
  assert.match(workspace, /<div className="quote-workspace" data-design-contract>/);
  assert.doesNotMatch(workspace, /data-product-public-entry/);
});

test('mobile decision mode can shrink to the viewport without a min-content overflow chain', () => {
  const styles = source('../src/styles.css');
  assert.match(
    styles,
    /\.focused-workbench,\s*\.focused-workbench \.ui-tabs-content,\s*\.decision-mode,\s*\.decision-seam,[^{]*\{\s*min-width: 0;/
  );
  assert.match(styles, /\.decision-seam strong,[^{]*\{\s*overflow-wrap: anywhere;/);
});

test('restored sessions hydrate from the same public entry rendered by the server', () => {
  const app = source('../src/App.jsx');
  assert.match(app, /const \[session, setSession\] = useState\(null\)/);
  assert.match(app, /useEffect\(\(\) => \{\s*setInitialDraft\(readStoredDraft\(\)\?\.draft \|\| emptyDraft\);\s*setSession\(readStoredSession\(\)\);\s*\}, \[\]\)/);
  assert.doesNotMatch(app, /useState\(readStoredSession\)/);
});

test('every blueprint panel has a product component and stable marker', () => {
  const bindings = {
    'request-spine.tsx': 'request_spine_panel',
    'evidence-rail.tsx': 'evidence_rail_panel',
    'decision-seam.tsx': 'decision_seam_panel',
    'next-move-dock.tsx': 'next_move_dock_panel'
  };
  for (const [file, marker] of Object.entries(bindings)) {
    assert.match(source(`../src/components/quote-rivet/${file}`), new RegExp(`data-experience-panel=["']${marker}["']`));
  }
});

test('visible mutations bind immutable command refs to the typed command endpoint', () => {
  const app = source('../src/App.jsx');
  assert.match(app, /\/commands\/\$\{encodeURIComponent\(commandRef\)\}/);
  assert.doesNotMatch(app, /cmd_service_request_update_v1/);
  assert.match(app, /quote-rivet-request-draft-v1/);
  assert.match(app, /localStorage\.setItem\(DRAFT_KEY/);
  assert.match(app, /cmd_service_request_intake_and_qualification_coordinator_captures_request_v1/);
  assert.match(app, /cmd_service_request_intake_and_qualification_coordinator_records_supported_v1/);
  assert.match(app, /cmd_request_evidence_control_submit_evidence_version_v1/);
  assert.match(app, /cmd_quote_readiness_review_estimator_records_quote_ready_v1/);
});

test('agent discovery includes route intent, stop, escalation, command, evidence, and handoff fields', () => {
  const contract = JSON.parse(source('../../agent-interface.json'));
  assert.equal(contract.product_id, 'quote-intake-demo');
  assert.ok(contract.route_intents.length >= 8);
  for (const intent of contract.route_intents) {
    assert.ok(intent.intent_id);
    assert.ok(intent.required_context.length);
    assert.ok(intent.command_refs.length);
    assert.ok(intent.success_evidence.length);
    assert.ok(intent.stop_conditions.length);
    assert.ok(intent.escalation_conditions.length);
    assert.ok(intent.handoff_fields.length);
  }
});
