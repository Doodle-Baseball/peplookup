import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyWebhookSignature } from '@/lib/vendor-listing/webhook-signature';

const SECRET = 'ws_test_secret_value';
const NOW = 1_800_000_000;
const BODY = '{"type":"payment.succeeded"}';

function sign(id: string, timestamp: number, body: string, key: Buffer | string = SECRET): string {
  return `v1,${createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64')}`;
}

function headers(signature: string, timestamp = NOW) {
  return { id: 'msg_1', timestamp: String(timestamp), signature };
}

describe('verifyWebhookSignature', () => {
  it('accepts a correctly signed webhook', () => {
    expect(verifyWebhookSignature(BODY, headers(sign('msg_1', NOW, BODY)), SECRET, NOW)).toEqual({ ok: true });
  });

  it('accepts the Standard Webhooks base64-decoded key form', () => {
    const base64Secret = `whsec_${Buffer.from('raw-key-bytes').toString('base64')}`;
    const signature = sign('msg_1', NOW, BODY, Buffer.from('raw-key-bytes'));
    expect(verifyWebhookSignature(BODY, headers(signature), base64Secret, NOW).ok).toBe(true);
  });

  it('accepts any matching signature in a rotated, space-separated list', () => {
    const list = `v1,bm90LXRoZS1yaWdodC1vbmU= ${sign('msg_1', NOW, BODY)}`;
    expect(verifyWebhookSignature(BODY, headers(list), SECRET, NOW).ok).toBe(true);
  });

  it('rejects a tampered body', () => {
    const result = verifyWebhookSignature('{"type":"payment.failed"}', headers(sign('msg_1', NOW, BODY)), SECRET, NOW);
    expect(result.ok).toBe(false);
  });

  it('rejects the wrong secret', () => {
    expect(verifyWebhookSignature(BODY, headers(sign('msg_1', NOW, BODY)), 'ws_other', NOW).ok).toBe(false);
  });

  it('rejects a replayed webhook outside the five minute window', () => {
    const old = NOW - 6 * 60;
    expect(verifyWebhookSignature(BODY, headers(sign('msg_1', old, BODY), old), SECRET, NOW).ok).toBe(false);
  });

  it('rejects missing headers', () => {
    expect(verifyWebhookSignature(BODY, { id: null, timestamp: null, signature: null }, SECRET, NOW).ok).toBe(false);
  });
});
