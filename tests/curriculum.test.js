import { it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { modules, lessons } from '../src/content/curriculum.js';
import { checkLesson } from '../src/runtime/check.js';
import { createRuntime } from '../src/runtime/engine.js';
import { sanitizeMarkup } from '../src/runtime/preview.js';
const Parser = new JSDOM('').window.DOMParser;
it('contains 50 complete, stable lessons across eight open modules', () => {
  expect(modules.map((m) => lessons.filter((l) => l.module === m.id).length)).toEqual([
    6, 6, 6, 8, 6, 6, 8, 4,
  ]);
  expect(new Set(lessons.map((l) => l.id)).size).toBe(50);
  expect(lessons.every((l) => l.id.startsWith('skule-v1-'))).toBe(true);
  for (const l of lessons) {
    expect(l.title.length).toBeGreaterThan(3);
    for (const k of ['goal', 'explain', 'solutionExplanation', 'extension', 'selfCheck'])
      expect(l[k]?.length, l.id + ' ' + k).toBeGreaterThan(15);
    expect(l.hints).toHaveLength(3);
    expect(Object.keys(l.glossary).length).toBeGreaterThan(0);
    expect(l.example.length).toBeGreaterThan(5);
  }
});
it.each(lessons.map((l) => [l.id, l]))(
  '%s accepts an alternative declaration style and rejects empty answers',
  async (id, lesson) => {
    const files = { ...lesson.solution, js: lesson.solution.js.replace(/\bconst /g, 'let ') };
    const clean = sanitizeMarkup(files.html, Parser),
      r = await createRuntime({ dom: clean.dom });
    try {
      expect((await checkLesson(lesson, files, r, clean, Parser)).passed).toBe(
        lesson.check.manual ? null : true,
      );
    } finally {
      r.dispose();
    }
    const empty = { html: '', css: '', js: '' },
      blank = await createRuntime();
    try {
      expect((await checkLesson(lesson, empty, blank, { dom: [] }, Parser)).passed).toBe(
        lesson.check.manual ? null : false,
      );
    } finally {
      blank.dispose();
    }
  },
);
it('accepts structurally different correct drawings and event handlers', async () => {
  for (const [suffix, js] of [
    ['start-01', 'const palette = ["#00ff00"]; rect(170,90,140,150,palette[0]);'],
    ['art-02', '[0,1,2,3,4,5].forEach(n => rect(60+n*50,140,40,40,"blue"));'],
    [
      'dom-02',
      'document.getElementById("knapp").addEventListener("click", () => document.getElementById("svar").textContent = ["Du", "er", "på", "lista!"].join(" "));',
    ],
  ]) {
    const lesson = lessons.find((l) => l.id === 'skule-v1-' + suffix),
      files = { ...lesson.solution, js },
      clean = sanitizeMarkup(files.html, Parser),
      r = await createRuntime({ dom: clean.dom });
    try {
      expect((await checkLesson(lesson, files, r, clean, Parser)).passed, suffix).toBe(true);
    } finally {
      r.dispose();
    }
  }
});
it('executes every reference solution and accepts behavior, not exact source text', async () => {
  expect(lessons.length).toBe(50);
  for (const lesson of lessons) {
    const files = lesson.solution;
    const clean = sanitizeMarkup(files.html, Parser);
    const r = await createRuntime({ dom: clean.dom });
    try {
      const result = await checkLesson(lesson, files, r, clean, Parser);
      expect(result.error, lesson.id).toBe('');
      expect(result.passed, lesson.id).toBe(lesson.check.manual ? null : true);
    } finally {
      r.dispose();
    }
  }
});
