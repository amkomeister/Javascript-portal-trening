import { describe, it, expect } from 'vitest';
import { createRuntime } from '../src/runtime/engine.js';
describe('isolated student runtime', () => {
  it('enforces the heap limit independently of the loop deadline', async () => {
    const r = await createRuntime({ cpuMs: 5000, memoryBytes: 4 * 1024 * 1024 });
    try {
      expect(r.run('const huge=new Array(2000000).fill(42);').error).toMatch(/memory|alloc/i);
    } finally {
      r.dispose();
    }
  });
  it('renders real JavaScript calculations and preserves state across ticks', async () => {
    const r = await createRuntime();
    try {
      expect(
        r.run(
          'let x = 2 * 20; function draw(){ clear(); rect(x, 20, 30, 30, "blue"); x += 2; } every(100, draw); draw();',
        ).error,
      ).toBe('');
      expect(r.snapshot().draws.at(-1).x).toBe(40);
      r.tick(100);
      expect(r.snapshot().draws.at(-1).x).toBe(42);
    } finally {
      r.dispose();
    }
  });
  it('exposes no host network, storage, process, messages or browser globals', async () => {
    const r = await createRuntime();
    try {
      r.run(
        'print([typeof fetch, typeof XMLHttpRequest, typeof indexedDB, typeof localStorage, typeof process, typeof postMessage, typeof window].join(","));',
      );
      expect(r.snapshot().logs).toEqual([
        'undefined,undefined,undefined,undefined,undefined,undefined,undefined',
      ]);
    } finally {
      r.dispose();
    }
  });
  it('interrupts infinite loops and memory exhaustion without losing the host', async () => {
    const r = await createRuntime({ cpuMs: 30, memoryBytes: 4 * 1024 * 1024 });
    try {
      expect(r.run('while(true){}').error).toMatch(/stoppa|tid/i);
      expect(r.run('let a=[]; while(true) a.push("x".repeat(100000));').error).toBeTruthy();
    } finally {
      r.dispose();
    }
  });
  it('bridges a limited DOM and input callbacks without executing host code', async () => {
    const r = await createRuntime({
      dom: [
        { id: 'button', tag: 'button', text: 'Trykk' },
        { id: 'answer', tag: 'p', text: 'Vent' },
      ],
    });
    try {
      expect(
        r.run(
          'document.querySelector("#button").addEventListener("click", () => { document.querySelector("#answer").textContent = "Hei!"; });',
        ).error,
      ).toBe('');
      r.event({ type: 'click', id: 'button' });
      expect(r.snapshot().dom.find((n) => n.id === 'answer').text).toBe('Hei!');
      expect(r.run('document.cookie = "stolen"; print(typeof document.location);').error).toBe('');
      expect(r.snapshot().logs.at(-1)).toBe('undefined');
    } finally {
      r.dispose();
    }
  });
  it('bounds output, draw messages and invalid numeric coordinates', async () => {
    const r = await createRuntime();
    try {
      r.run('rect(Infinity,0,10,10,"red"); for(let i=0;i<3000;i++) print("hello");');
      expect(r.snapshot().draws).toEqual([]);
      expect(r.snapshot().logs.length).toBeLessThanOrEqual(101);
    } finally {
      r.dispose();
    }
  });
});
