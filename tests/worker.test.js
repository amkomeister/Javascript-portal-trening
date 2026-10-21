import { it, expect, vi } from 'vitest';
const mocked = vi.hoisted(() => ({ createRuntime: vi.fn() }));
vi.mock('../src/runtime/engine.js', () => mocked);
it('delivers input received while QuickJS is still starting', async () => {
  vi.useFakeTimers();
  let resolve;
  mocked.createRuntime.mockReturnValue(new Promise((r) => (resolve = r)));
  globalThis.onmessage = null;
  globalThis.postMessage = vi.fn();
  const engine = {
    run: vi.fn(),
    event: vi.fn(),
    snapshot: () => ({ draws: [], logs: [], dom: [], error: '' }),
    tick: vi.fn(),
    dispose: vi.fn(),
  };
  try {
    await import('../src/runtime/worker.js');
    const starting = globalThis.onmessage({
      data: { type: 'start', runId: 11, code: '', dom: [] },
    });
    await globalThis.onmessage({
      data: { type: 'event', runId: 11, event: { type: 'click', id: 'knapp' } },
    });
    resolve(engine);
    await starting;
    expect(engine.event).toHaveBeenCalledWith({ type: 'click', id: 'knapp' });
  } finally {
    vi.clearAllTimers();
    vi.useRealTimers();
    delete globalThis.onmessage;
    delete globalThis.postMessage;
  }
});
