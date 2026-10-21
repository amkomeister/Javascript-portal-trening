import { it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { sanitizeMarkup, previewDocument } from '../src/runtime/preview.js';
const parser = () => new JSDOM('').window.DOMParser;
it('keeps useful semantic markup but removes executable, remote and nested documents', () => {
  const P = parser();
  const result = sanitizeMarkup(
    '<h1 id="a" onclick="alert(1)">Hei</h1><script>evil()</script><iframe src="https://bad.test"></iframe><img src=x onerror=evil()><a href="javascript:evil()">Lenkje</a><input id="name" value="Ada">',
    P,
  );
  expect(result.html).not.toMatch(/onclick|script|iframe|onerror|src=|javascript:/i);
  expect(result.dom.find((n) => n.id === 'a').text).toBe('Hei');
  expect(result.dom.find((n) => n.id === 'name').value).toBe('Ada');
});
it('uses a restrictive opaque preview and unique identifiers without breaking nesting', () => {
  const P = parser();
  const r = sanitizeMarkup('<main><p id="x">One</p><p id="x">Two</p></main>', P);
  expect(new Set(r.dom.map((n) => n.id)).size).toBe(r.dom.length);
  const doc = previewDocument(r.html, 'body{color:red}</style><script>evil()</script>', 'token');
  expect(doc).toContain("default-src 'none'");
  expect(doc).not.toContain('<script>evil()');
});
