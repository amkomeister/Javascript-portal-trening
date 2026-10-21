import { sanitizeMarkup, previewDocument, drawFrame } from './runtime/preview.js';
const files = window.KV_FILES;
delete window.KV_FILES;
const source = window.KV_WORKER;
delete window.KV_WORKER;
const canvas = document.querySelector('canvas'),
  frame = document.querySelector('iframe'),
  output = document.querySelector('#output'),
  status = document.querySelector('#status');
let worker,
  token,
  runId = 0,
  watchdog,
  latest,
  ready = false,
  url;
function stop() {
  clearTimeout(watchdog);
  worker?.terminate();
  worker = null;
  runId++;
  if (url) URL.revokeObjectURL(url);
  status.textContent = 'Stoppa';
}
function run() {
  stop();
  const id = runId;
  const clean = sanitizeMarkup(files.html);
  token = crypto.randomUUID();
  ready = false;
  latest = null;
  frame.srcdoc = previewDocument(clean.html, files.css, token);
  frame.hidden = !files.html.trim();
  canvas.hidden = !!files.html.trim();
  url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  worker = new Worker(url);
  const fail = () => {
    stop();
    status.textContent = 'Køyringa blei stoppa. Sjekk løkker og minnebruk.';
  };
  watchdog = setTimeout(fail, 12000);
  worker.onmessage = ({ data: m }) => {
    if (m.runId !== runId || m.type !== 'frame') return;
    clearTimeout(watchdog);
    watchdog = setTimeout(fail, 3000);
    latest = m.state;
    drawFrame(canvas, m.state);
    output.textContent = m.state.logs.join('\n');
    if (ready) frame.contentWindow.postMessage({ type: 'render', token, dom: m.state.dom }, '*');
    if (m.state.error) {
      stop();
      status.textContent = m.state.error;
    }
  };
  worker.onerror = fail;
  worker.postMessage({ type: 'start', runId: id, code: files.js, dom: clean.dom });
  status.textContent = 'Køyrer';
}
canvas.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  worker?.postMessage({
    type: 'event',
    runId,
    event: { type: 'keydown', id: 'document', key: e.key },
  });
});
window.addEventListener('message', (e) => {
  if (e.source !== frame.contentWindow || e.data?.token !== token) return;
  if (e.data.type === 'ready') {
    ready = true;
    if (latest) frame.contentWindow.postMessage({ type: 'render', token, dom: latest.dom }, '*');
  }
  if (e.data.type === 'event') worker?.postMessage({ type: 'event', runId, event: e.data.event });
});
document.querySelector('#run').onclick = run;
document.querySelector('#stop').onclick = stop;
run();
