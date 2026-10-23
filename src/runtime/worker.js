import { createRuntime } from './engine.js';
import { lessonById } from '../content/curriculum.js';
import { checkLesson } from './check.js';
let engine, runId, timer;
let pendingEvents = [];
onmessage = async ({ data: m }) => {
  if (m.type === 'check') {
    try {
      const r = await createRuntime({ dom: m.dom || [] });
      try {
        const lesson = lessonById(m.lessonId);
        if (!lesson) throw Error('Ukjent oppdrag.');
        postMessage({
          type: 'checked',
          result: await checkLesson(lesson, m.files, r, { markupPassed: m.markupPassed }),
        });
      } finally {
        r.dispose();
      }
    } catch (e) {
      postMessage({ type: 'checked', result: { passed: false, error: String(e.message) } });
    }
    return;
  }
  if (m.type === 'start') {
    clearInterval(timer);
    engine?.dispose();
    engine = null;
    pendingEvents = [];
    runId = m.runId;
    try {
      engine = await createRuntime({ dom: m.dom || [] });
      engine.run(m.code);
      for (const event of pendingEvents) {
        if (engine.snapshot().error) break;
        engine.event(event);
      }
      pendingEvents = [];
      postMessage({ type: 'frame', runId, state: engine.snapshot() });
      if (!engine.snapshot().error)
        timer = setInterval(() => {
          engine.tick(33);
          postMessage({ type: 'frame', runId, state: engine.snapshot() });
          if (engine.snapshot().error) clearInterval(timer);
        }, 33);
    } catch (e) {
      postMessage({
        type: 'frame',
        runId,
        state: { draws: [], logs: [], dom: [], error: String(e.message) },
      });
    }
  } else if (m.type === 'event' && m.runId === runId) {
    if (!engine) {
      if (pendingEvents.length < 100) pendingEvents.push(m.event);
      return;
    }
    engine.event(m.event);
    const state = engine.snapshot();
    postMessage({ type: 'frame', runId, state });
    if (state.error) clearInterval(timer);
  }
};
