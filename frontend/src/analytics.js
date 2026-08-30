import posthog from 'posthog-js';

const PRODUCT_ID = "quote-intake-demo";
const GENERATED_BUILD_ID = "build_quote_intake_demo_2ef739047aad";
let initialized = false;

export function initProductAnalytics() {
  if (initialized || typeof window === 'undefined') return initialized;
  const token = window.__POSTHOG_PROJECT_TOKEN__ || process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || '';
  if (!token) return false;
  posthog.init(token, {
    api_host: window.__POSTHOG_HOST__ || process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    defaults: '2026-05-30',
    autocapture: true,
    capture_pageview: 'history_change',
    capture_pageleave: true,
    person_profiles: 'identified_only',
    disable_session_recording: true,
    mask_all_text: true,
    mask_all_element_attributes: true,
    loaded: (client) => client.register({
      product_id: PRODUCT_ID,
      build_id: window.__PRODUCT_BUILD_ID__ || GENERATED_BUILD_ID,
      release_sha: window.__PRODUCT_RELEASE_SHA__ || '',
      environment: window.__PRODUCT_ENV__ || 'production',
      telemetry_source: 'browser',
    }),
  });
  initialized = true;
  return true;
}

export function captureProductEvent(eventName, properties = {}) {
  if (!initProductAnalytics()) return;
  posthog.capture(eventName, { product_id: PRODUCT_ID, ...properties });
}

async function organizationKey(organizationId) {
  if (!organizationId || !window.crypto?.subtle) return '';
  const input = new TextEncoder().encode(`${PRODUCT_ID}:${String(organizationId)}`);
  const digest = await window.crypto.subtle.digest('SHA-256', input);
  return Array.from(new Uint8Array(digest)).slice(0, 12).map((value) => value.toString(16).padStart(2, '0')).join('');
}

export async function identifyProductUser(userId, organizationId = '', properties = {}) {
  if (!userId || !initProductAnalytics()) return;
  const identityProperties = { product_id: PRODUCT_ID, ...properties };
  const groupKey = await organizationKey(organizationId);
  if (groupKey) {
    identityProperties.organization_key = groupKey;
    posthog.group('organization', groupKey, { product_id: PRODUCT_ID });
  }
  posthog.identify(String(userId), identityProperties);
}

export function resetProductAnalytics() {
  if (!initialized) return;
  posthog.reset();
}
