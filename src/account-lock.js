// A shared Web Lock keeps an authenticated tab from being cleared while it has work.
// Account changes need the exclusive lock. Every open tab flushes before releasing it.
export class AccountLock {
  constructor({ channel, isActive, flush, suspend }) {
    this.channel = channel;
    this.isActive = isActive;
    this.flush = flush;
    this.suspend = suspend;
    channel.addEventListener('message', (e) => this.receive(e.data));
  }
  hold() {
    if (this.holding) return this.holding;
    let grant;
    this.holding = new Promise((resolve) => {
      grant = resolve;
    });
    navigator.locks.request(
      'kodeverkstad-skule-session-v1',
      { mode: 'shared' },
      () =>
        new Promise((release) => {
          this.releaseLock = release;
          grant();
        }),
    );
    return this.holding;
  }
  release() {
    this.releaseLock?.();
    this.releaseLock = null;
    this.holding = null;
  }
  reset() {
    this.remoteId = null;
    this.release();
    this.suspend(false);
  }
  async receive(message) {
    if (message.type === 'prepare-account' && this.isActive()) {
      if (this.changeId) {
        this.channel.postMessage({ type: 'account-blocked', id: message.id });
        return;
      }
      this.remoteId = message.id;
      this.suspend(true);
      try {
        await this.flush();
        if (this.remoteId === message.id) this.release();
      } catch {
        if (this.remoteId === message.id) {
          this.remoteId = null;
          this.suspend(false);
          this.channel.postMessage({ type: 'account-blocked', id: message.id });
        }
      }
    }
    if (message.type === 'account-blocked' && message.id === this.changeId)
      this.controller?.abort();
    if (message.type === 'cancel-account' && message.id === this.remoteId) {
      this.remoteId = null;
      if (this.isActive()) await this.hold();
      this.suspend(false);
    }
  }
  async change(action) {
    if (this.changeId) throw Error('Vent til kontobytet er ferdig.');
    this.changeId = crypto.randomUUID();
    this.controller = new AbortController();
    this.suspend(true);
    const id = this.changeId,
      timer = setTimeout(() => this.controller?.abort(), 10000);
    this.channel.postMessage({ type: 'prepare-account', id });
    try {
      await this.flush();
      this.release();
      return await navigator.locks.request(
        'kodeverkstad-skule-session-v1',
        { mode: 'exclusive', signal: this.controller.signal },
        action,
      );
    } catch (error) {
      this.channel.postMessage({ type: 'cancel-account', id });
      if (this.isActive()) await this.hold();
      if (this.controller.signal.aborted)
        throw Error(
          'Ei anna fane har ulagrat arbeid eller svarar ikkje. Opne fana og lagre eller ta ein kodekopi før du prøver igjen.',
        );
      throw error;
    } finally {
      clearTimeout(timer);
      this.changeId = null;
      this.controller = null;
      this.suspend(false);
    }
  }
}
