import assert from 'node:assert/strict';
import test from 'node:test';
import { api, ApiError } from '../src/api.js';

test('typed command call retains evidence and returns the completed state', async () => {
  const originalFetch = global.fetch;
  let received;
  global.fetch = async (url, options) => {
    received = { url, options };
    return new Response(JSON.stringify({
      state: { records: [{ id: 'request-1', status: 'captured', requested_work: 'Customer-entered work' }], resources: { request_evidence: [{ id: 'evidence-1', status: 'submitted' }] } },
      record: { id: 'request-1', status: 'captured' },
      event: { event_name: 'service_request.created.v1', record_id: 'request-1' }
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  try {
    const result = await api('/commands/cmd_service_request_intake_and_qualification_coordinator_captures_request_v1', {
      method: 'POST',
      token: 'local.office_coordinator.test',
      idempotencyKey: 'capture-request-1',
      body: { record_id: 'request-1', fields: { source_channel: 'Customer entered' }, evidence_refs: ['evidence-1'] }
    });
    assert.equal(result.record.status, 'captured');
    assert.equal(result.state.resources.request_evidence[0].id, 'evidence-1');
    assert.match(received.url, /\/commands\/cmd_service_request_intake_and_qualification_coordinator_captures_request_v1$/);
    assert.equal(received.options.headers.authorization, 'Bearer local.office_coordinator.test');
    assert.equal(received.options.headers['idempotency-key'], 'capture-request-1');
  } finally {
    global.fetch = originalFetch;
  }
});

test('permission denial fails closed without reporting completion', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ detail: 'Permission required: qualification.record' }), { status: 403, headers: { 'content-type': 'application/json' } });
  try {
    await assert.rejects(
      api('/commands/cmd_service_request_intake_and_qualification_coordinator_records_supported_v1', {
        method: 'POST',
        token: 'local.service_requester.test',
        idempotencyKey: 'deny-supported-1',
        body: { record_id: 'request-1', fields: {} }
      }),
      (error) => error instanceof ApiError && error.status === 403 && /Permission required/.test(error.message)
    );
  } finally {
    global.fetch = originalFetch;
  }
});

test('network error remains an error and cannot be mistaken for a saved result', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => { throw new Error('connection unavailable'); };
  try {
    await assert.rejects(api('/state', { token: 'local.office_coordinator.test' }), /connection unavailable/);
  } finally {
    global.fetch = originalFetch;
  }
});
