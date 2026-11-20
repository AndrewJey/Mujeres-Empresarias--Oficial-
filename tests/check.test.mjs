import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(root, 'ME', 'MEf.html'), 'utf8');

test('MEf.html has valid HTML5 viewport, accessible ARIA tabs, and safe external links', () => {
  assert.match(html, /<!DOCTYPE html>/i);
  assert.match(html, /<meta[^>]+name="viewport"/i);
  assert.match(html, /role="tablist"/);
  assert.equal((html.match(/<button\b[^>]*role="tab"/g) || []).length, 3);
  assert.equal((html.match(/<div\b[^>]*role="tabpanel"/g) || []).length, 3);
  for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) {
    assert.match(m[0], /rel="noopener noreferrer"/i, `Unsafe _blank link: ${m[0]}`);
  }
  assert.ok(!/<font\b/i.test(html), 'Legacy <font> removed');
});

test('all referenced local images exist on disk', () => {
  for (const m of html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/gi)) {
    const src = m[1];
    assert.ok(fs.existsSync(path.join(root, 'ME', src)), `Missing image: ME/${src}`);
  }
  assert.ok(fs.existsSync(path.join(root, 'index.html')));
});
