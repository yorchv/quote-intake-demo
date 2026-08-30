import http from 'node:http';

const port = 4317;
const requestId = 'request-browser-001';
let state = {
  records: [{
    id: requestId,
    entity: 'service_request',
    status: 'not_created',
    owner: 'Office coordinator',
    revision: 0,
    contact_name: '',
    contact_email: '',
    service_location: '',
    requested_work: '',
    source_channel: '',
    created_at: '2026-08-29T16:00:00Z'
  }],
  resources: {
    request_evidence: [],
    quote_readiness_decision: [{ id: 'readiness-browser-001', service_request_id: requestId, status: 'in_review' }]
  },
  activity: []
};

const eventFor = {
  cmd_service_request_intake_and_qualification_coordinator_captures_request_v1: 'service_request.created.v1',
  cmd_service_request_intake_and_qualification_coordinator_records_supported_v1: 'qualification_decision.recorded.v1',
  cmd_qualified_request_assignment_prioritize_supported_request_v1: 'estimator_assignment.prioritized.v1',
  cmd_request_evidence_control_submit_evidence_version_v1: 'request_evidence.submitted.v1',
  cmd_quote_readiness_review_estimator_records_quote_ready_v1: 'quote_readiness.quote_ready_recorded.v1'
};

function send(response, status, payload) {
  response.writeHead(status, {
    'access-control-allow-headers': 'authorization,content-type,idempotency-key',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-origin': '*',
    'content-type': 'application/json'
  });
  response.end(JSON.stringify(payload));
}

async function bodyOf(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return send(response, 204, {});
  if (request.method === 'POST' && request.url === '/auth/local-session') {
    return send(response, 200, { token: 'local.office_coordinator.browser', persona_id: 'office_coordinator' });
  }
  if (request.method === 'GET' && request.url === '/state') return send(response, 200, { state });
  if (request.method !== 'POST' || !request.url?.startsWith('/commands/')) {
    return send(response, 404, { detail: 'Not found' });
  }

  const commandRef = decodeURIComponent(request.url.slice('/commands/'.length));
  const token = String(request.headers.authorization || '').replace(/^Bearer\s+/, '');
  if (token.includes('service_requester') && commandRef.includes('coordinator_')) {
    return send(response, 403, { detail: 'Permission required: office coordinator' });
  }
  if (!eventFor[commandRef]) return send(response, 422, { detail: `Undeclared browser fixture command: ${commandRef}` });

  const payload = await bodyOf(request);
  const record = state.records[0];
  const fields = payload.fields || {};
  if (commandRef.includes('coordinator_captures_request')) {
    Object.assign(record, fields, { status: 'captured', revision: record.revision + 1 });
  } else if (commandRef.includes('coordinator_records_supported')) {
    Object.assign(record, fields, { status: 'supported' });
  } else if (commandRef.includes('prioritize_supported_request')) {
    record.priority = fields.priority || 'standard';
  } else if (commandRef.includes('submit_evidence_version')) {
    state.resources.request_evidence.push({
      id: `evidence-browser-${state.resources.request_evidence.length + 1}`,
      service_request_id: fields.service_request_id,
      note: fields.note,
      status: 'submitted',
      version: fields.version || 1,
      kind: 'note'
    });
  } else if (commandRef.includes('records_quote_ready')) {
    state.resources.quote_readiness_decision[0].status = 'quote_ready';
  }

  const event = {
    event_name: eventFor[commandRef],
    record_id: requestId,
    persona_id: token.includes('estimator') ? 'estimator' : 'office_coordinator',
    created_at: new Date().toISOString()
  };
  state.activity.push(event);
  return send(response, 200, { event, record, state });
});

server.listen(port, '127.0.0.1', () => process.stdout.write(`mock api listening on ${port}\n`));
