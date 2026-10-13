import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanLine, composeEmail, originAllowed, recipientFor, validate } from './lib.ts';

const form = (fields: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  return f;
};
const good = { category: 'supplier', name: 'Alex Chen', email: 'alex@factory.example', company: 'Factory Co', message: 'We make laptop stands and would like to talk.', consent: 'on' };

test('accepts a complete inquiry', () => {
  const { inquiry, errors } = validate(form(good));
  assert.deepEqual(errors, {});
  assert.equal(inquiry?.category, 'supplier');
});

test('flags each invalid field', () => {
  const { inquiry, errors } = validate(form({ category: 'spam', name: '', email: 'nope', message: 'short' }));
  assert.equal(inquiry, undefined);
  assert.deepEqual(Object.keys(errors).sort(), ['category', 'consent', 'email', 'message', 'name']);
});

test('strips header-injection characters from single-line fields', () => {
  assert.equal(cleanLine('Alex\r\nBcc: evil@example.com', 120), 'Alex Bcc: evil@example.com');
  const { inquiry } = validate(form({ ...good, name: 'Alex\r\nBcc: x@y.z' }));
  assert.ok(!inquiry?.name.includes('\n'));
});

test('caps field lengths', () => {
  const { inquiry } = validate(form({ ...good, message: 'x'.repeat(9000) }));
  assert.equal(inquiry?.message.length, 5000);
});

test('subject carries the category label', () => {
  const { inquiry } = validate(form(good));
  const { subject, text } = composeEmail(inquiry!, { receivedAt: '2026-10-13T00:00:00Z', host: 'benjaire.com' });
  assert.equal(subject, '[Supplier / Manufacturing] Alex Chen · Factory Co');
  assert.match(text, /Email:\s+alex@factory\.example/);
});

test('routes categories with an optional map and falls back otherwise', () => {
  assert.equal(recipientFor('supplier', 'inbox@x.com'), 'inbox@x.com');
  assert.equal(recipientFor('supplier', 'inbox@x.com', '{"supplier":"src@x.com"}'), 'src@x.com');
  assert.equal(recipientFor('general', 'inbox@x.com', '{"supplier":"src@x.com"}'), 'inbox@x.com');
  assert.equal(recipientFor('supplier', 'inbox@x.com', 'not json'), 'inbox@x.com');
});

test('only our own origins may post', () => {
  const hosts = 'benjaire.com,www.benjaire.com,benjaire-com.benjaireco.workers.dev';
  assert.ok(originAllowed('https://benjaire.com', hosts));
  assert.ok(originAllowed('https://benjaire-com.benjaireco.workers.dev', hosts));
  assert.ok(originAllowed('https://abc123-benjaire-com.benjaireco.workers.dev', hosts));
  assert.ok(!originAllowed('https://evil.example', hosts));
  assert.ok(!originAllowed('http://benjaire.com', hosts));
  assert.ok(!originAllowed(null, hosts));
});
