export class Draft {
  constructor(put, record, onStatus = () => {}) {
    this.put = put;
    this.data = structuredClone(record.data);
    this.revision = record.revision;
    this.onStatus = onStatus;
    this.version = 0;
    this.savedVersion = 0;
    this.pending = null;
    this.conflict = null;
    this.disposed = false;
  }
  get dirty() {
    return this.version !== this.savedVersion;
  }
  update(change) {
    if (this.disposed) return;
    this.data = { ...this.data, ...structuredClone(change) };
    this.version++;
    clearTimeout(this.timer);
    this.onStatus(this.conflict ? 'conflict' : 'pending');
    if (!this.conflict) this.timer = setTimeout(() => this.flush().catch(() => {}), 650);
  }
  async flush() {
    clearTimeout(this.timer);
    if (this.disposed) return;
    if (this.conflict)
      throw Object.assign(
        new Error('Lagringskonflikt. Vel kva versjon du vil arbeide vidare med.'),
        { status: 409 },
      );
    if (this.pending) {
      await this.pending;
      return this.flush();
    }
    if (!this.dirty) return;
    const version = this.version,
      payload = { revision: this.revision, data: structuredClone(this.data) };
    this.onStatus('saving');
    this.pending = this.put(payload)
      .then((record) => {
        if (this.disposed) return;
        this.revision = record.revision;
        this.savedVersion = version;
        this.onStatus(this.dirty ? 'pending' : 'saved');
      })
      .catch((e) => {
        if (!this.disposed) {
          if (e.status === 409) this.conflict = e.payload;
          this.onStatus(this.conflict ? 'conflict' : 'error', e);
        }
        throw e;
      })
      .finally(() => {
        this.pending = null;
      });
    await this.pending;
    if (this.dirty && !this.disposed) return this.flush();
  }
  resolve(record, keepMine) {
    if (this.pending) throw Error('Vent til lagringa er ferdig.');
    this.revision = record.revision;
    this.conflict = null;
    if (!keepMine) this.data = structuredClone(record.data);
    this.version++;
    if (!keepMine) this.savedVersion = this.version;
    this.onStatus(keepMine ? 'pending' : 'saved');
  }
  dispose() {
    this.disposed = true;
    clearTimeout(this.timer);
  }
}
