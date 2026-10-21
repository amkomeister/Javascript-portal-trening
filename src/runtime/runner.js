export class Runner {
  constructor(onFrame) {
    this.onFrame = onFrame;
    this.serial = 0;
  }
  start(code, dom = []) {
    this.stop();
    const runId = this.serial;
    this.worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    const fail = () => {
      this.stop();
      this.onFrame({
        draws: [],
        logs: [],
        dom: [],
        error: 'Køyringa svara ikkje og blei stoppa. Koden din er bevart.',
      });
    };
    this.watchdog = setTimeout(fail, 12000);
    this.worker.onmessage = ({ data: m }) => {
      if (
        m.runId !== this.serial ||
        m.type !== 'frame' ||
        !m.state ||
        !Array.isArray(m.state.draws) ||
        m.state.draws.length > 1500
      )
        return;
      clearTimeout(this.watchdog);
      this.watchdog = setTimeout(fail, 3000);
      this.onFrame(m.state);
      if (m.state.error) this.stop();
    };
    this.worker.onerror = fail;
    this.worker.postMessage({ type: 'start', runId, code, dom });
  }
  event(event) {
    this.worker?.postMessage({ type: 'event', runId: this.serial, event });
  }
  stop() {
    this.serial++;
    clearTimeout(this.watchdog);
    this.worker?.terminate();
    this.worker = null;
  }
}
