import { newQuickJSWASMModuleFromVariant } from 'quickjs-emscripten-core';
import variant from '@jitl/quickjs-singlefile-browser-release-sync';
let modulePromise;
const getQuickJS = () => (modulePromise ??= newQuickJSWASMModuleFromVariant(variant));

// This function is serialized into QuickJS. It never executes in the host realm.
function guestBootstrap(seeds) {
  const send = globalThis.__send;
  delete globalThis.__send;
  const emit = (value) => send(JSON.stringify(value));
  let now = 0,
    next = 0;
  const timers = new Map(),
    keys = [],
    listeners = new Map();
  globalThis.width = 480;
  globalThis.height = 320;
  globalThis.clear = (color = '#f8faf1') => emit({ op: 'clear', color });
  globalThis.rect = (x, y, w, h, color = '#2453db') => emit({ op: 'rect', x, y, w, h, color });
  globalThis.circle = (x, y, r, color = '#2453db') => emit({ op: 'circle', x, y, r, color });
  globalThis.text = (value, x, y, color = '#172b37', size = 22) =>
    emit({ op: 'text', text: String(value), x, y, color, size });
  globalThis.print = (...values) =>
    emit({
      op: 'log',
      text: values.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' '),
    });
  globalThis.console = Object.freeze({ log: print, warn: print, error: print });
  globalThis.random = (max) => Math.floor(Math.random() * max);
  globalThis.millis = () => now;
  globalThis.every = (ms, fn) => {
    if (typeof fn !== 'function') throw Error('every treng ein funksjon.');
    const id = ++next;
    timers.set(id, { ms: Math.max(30, Number(ms) || 30), at: now, fn, once: false });
    return id;
  };
  globalThis.after = (ms, fn) => {
    const id = every(ms, fn);
    timers.get(id).once = true;
    return id;
  };
  globalThis.cancel = (id) => timers.delete(id);
  globalThis.onKey = (fn) => {
    if (keys.length < 50 && typeof fn === 'function') keys.push(fn);
  };
  function listen(id, type, fn) {
    if (!['click', 'input', 'change', 'keydown', 'keyup'].includes(type))
      throw Error('Denne hendinga er ikkje støtta i verkstaden.');
    const key = id + ':' + type;
    const list = listeners.get(key) || [];
    if (list.length < 50) list.push(fn);
    listeners.set(key, list);
  }
  const nodes = seeds.map((s) => {
    const n = { id: s.id, tagName: s.tag.toUpperCase() };
    let content = s.text || '',
      value = s.value || '',
      classes = (s.classes || '').split(' ').filter(Boolean);
    Object.defineProperty(n, 'textContent', {
      get: () => content,
      set: (v) => {
        content = String(v);
        emit({ op: 'dom', id: n.id, property: 'text', value: content });
      },
    });
    Object.defineProperty(n, 'value', {
      get: () => value,
      set: (v) => {
        value = String(v);
        emit({ op: 'dom', id: n.id, property: 'value', value });
      },
    });
    n.style = new Proxy(
      {},
      {
        set: (target, key, v) => {
          target[key] = String(v);
          emit({ op: 'dom', id: n.id, property: 'style', key, value: String(v) });
          return true;
        },
      },
    );
    n.classList = {
      add: (c) => {
        if (!classes.includes(c)) classes.push(c);
        emit({ op: 'dom', id: n.id, property: 'classes', value: classes.join(' ') });
      },
      remove: (c) => {
        classes = classes.filter((x) => x !== c);
        emit({ op: 'dom', id: n.id, property: 'classes', value: classes.join(' ') });
      },
      toggle: (c) => {
        const had = classes.includes(c);
        had ? n.classList.remove(c) : n.classList.add(c);
        return !had;
      },
      contains: (c) => classes.includes(c),
    };
    n.addEventListener = (type, fn) => listen(n.id, type, fn);
    n.matches = (selector) =>
      selector === '#' + n.id ||
      selector.toLowerCase() === s.tag ||
      (selector[0] === '.' && classes.includes(selector.slice(1)));
    return n;
  });
  globalThis.document = {
    querySelector: (s) => nodes.find((n) => n.matches(s)) || null,
    querySelectorAll: (s) => nodes.filter((n) => n.matches(s)),
    getElementById: (id) => nodes.find((n) => n.id === id) || null,
    addEventListener: (t, f) => listen('document', t, f),
  };
  globalThis.__tick = (delta) => {
    now += delta;
    for (const [id, t] of [...timers]) {
      if (now - t.at >= t.ms) {
        t.at = now;
        if (t.once) timers.delete(id);
        t.fn();
      }
    }
  };
  globalThis.__event = (e) => {
    const node = nodes.find((n) => n.id === e.id);
    if (node && typeof e.value === 'string') node.value = e.value;
    let stopped = false;
    const event = {
      type: e.type,
      key: e.key || '',
      target: node,
      currentTarget: null,
      preventDefault() {},
      stopPropagation() {
        stopped = true;
      },
    };
    // Ancestry comes from sanitized markup, never from a student event message.
    const visited = new Set();
    let current = node;
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      event.currentTarget = current;
      for (const f of listeners.get(current.id + ':' + e.type) || []) f(event);
      if (stopped) break;
      const parentId = seeds.find((s) => s.id === current.id)?.parentId;
      current = nodes.find((n) => n.id === parentId);
    }
    if (!stopped) {
      event.currentTarget = document;
      for (const f of listeners.get('document:' + e.type) || []) f(event);
    }
    if (e.type === 'keydown') {
      for (const f of keys) f(e.key);
    }
  };
}

const finite = (...numbers) =>
  numbers.every((n) => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= 10000);
const colors = (value) =>
  typeof value === 'string' &&
  value.length <= 80 &&
  /^(#[\da-f]{3,8}|[a-z]+|rgba?\([\d.,%\s]+\))$/i.test(value);
const styles = new Set([
  'color',
  'backgroundColor',
  'display',
  'fontSize',
  'borderRadius',
  'padding',
  'width',
  'height',
]);
export async function createRuntime({
  dom = [],
  cpuMs = 1000,
  memoryBytes = 32 * 1024 * 1024,
} = {}) {
  const q = await getQuickJS(),
    rt = q.newRuntime();
  rt.setMemoryLimit(memoryBytes);
  rt.setMaxStackSize(256 * 1024);
  let deadline = 0,
    disposed = false,
    emissions = 0,
    error = '';
  rt.setInterruptHandler(() => Date.now() > deadline);
  const vm = rt.newContext();
  const state = { draws: [], logs: [], background: '#f8faf1', dom: structuredClone(dom) };
  const send = vm.newFunction('__send', (handle) => {
    if (++emissions > 2500) return;
    const raw = vm.getString(handle);
    if (raw.length > 12000) return;
    let m;
    try {
      m = JSON.parse(raw);
    } catch {
      return;
    }
    if (!m || typeof m !== 'object') return;
    if (m.op === 'log') {
      if (state.logs.length < 100) state.logs.push(String(m.text).slice(0, 2000));
      else if (state.logs.length === 100) state.logs.push('… Utskrifta er avgrensa.');
      return;
    }
    if (m.op === 'clear') {
      state.draws = [];
      if (colors(m.color)) state.background = m.color;
      return;
    }
    if (m.op === 'dom') {
      const n = state.dom.find((n) => n.id === m.id);
      if (!n || typeof m.value !== 'string' || m.value.length > 4000) return;
      if (['text', 'value', 'classes'].includes(m.property)) n[m.property] = m.value;
      if (
        m.property === 'style' &&
        styles.has(m.key) &&
        !/[<>]|url\s*\(|expression/i.test(m.value)
      ) {
        n.style ??= {};
        n.style[m.key] = m.value;
      }
      return;
    }
    if (state.draws.length >= 1500 || !colors(m.color) || !finite(m.x, m.y)) return;
    if (m.op === 'rect' && finite(m.w, m.h))
      state.draws.push({ op: m.op, x: m.x, y: m.y, w: m.w, h: m.h, color: m.color });
    if (m.op === 'circle' && finite(m.r) && m.r >= 0)
      state.draws.push({ op: m.op, x: m.x, y: m.y, r: m.r, color: m.color });
    if (
      m.op === 'text' &&
      finite(m.size) &&
      m.size > 0 &&
      m.size <= 150 &&
      typeof m.text === 'string'
    )
      state.draws.push({
        op: m.op,
        x: m.x,
        y: m.y,
        size: m.size,
        text: m.text.slice(0, 1000),
        color: m.color,
      });
  });
  vm.setProp(vm.global, '__send', send);
  send.dispose();
  function evaluate(code, budget = cpuMs) {
    if (disposed) return { error: 'Køyringa er avslutta.' };
    deadline = Date.now() + budget;
    emissions = 0;
    error = '';
    const result = vm.evalCode(code, 'elevkode.js');
    if (result.error) {
      const details = vm.dump(result.error);
      result.error.dispose();
      error = /interrupt/i.test(details.message || '')
        ? 'Koden blei stoppa fordi han brukte for lang tid. Sjekk løkker og vilkår.'
        : String(details.message || details).slice(0, 1000);
      return { error };
    }
    result.value.dispose();
    return { error: '' };
  }
  const init = evaluate('(' + guestBootstrap.toString() + ')(' + JSON.stringify(dom) + ');');
  if (init.error) {
    vm.dispose();
    rt.dispose();
    throw Error(init.error);
  }
  return {
    run: (code) =>
      typeof code === 'string' && code.length <= 100000
        ? evaluate(code)
        : { error: 'Koden er for stor.' },
    tick: (ms) =>
      evaluate(
        '__tick(' + JSON.stringify(Math.max(0, Math.min(1000, ms))) + ');',
        Math.min(100, cpuMs),
      ),
    event: (e) =>
      evaluate(
        '__event(' + JSON.stringify({ type: e.type, id: e.id, key: e.key, value: e.value }) + ');',
        Math.min(100, cpuMs),
      ),
    snapshot: () => structuredClone({ ...state, error }),
    read: (expression) => {
      deadline = Date.now() + cpuMs;
      const r = vm.evalCode('JSON.stringify((' + expression + '))');
      if (r.error) {
        r.error.dispose();
        return undefined;
      }
      const text = vm.dump(r.value);
      r.value.dispose();
      try {
        return JSON.parse(text);
      } catch {
        return undefined;
      }
    },
    dispose() {
      if (!disposed) {
        disposed = true;
        vm.dispose();
        rt.dispose();
      }
    },
  };
}
