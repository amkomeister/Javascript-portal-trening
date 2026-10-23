import { Firestore } from '@google-cloud/firestore';
export function memoryStore() {
  const collections = new Map();
  let queue = Promise.resolve();
  const col = (name) => {
    if (!collections.has(name)) collections.set(name, new Map());
    return collections.get(name);
  };
  return {
    async get(c, id) {
      return structuredClone(col(c).get(id) || null);
    },
    async set(c, id, data) {
      col(c).set(id, structuredClone(data));
    },
    async delete(c, id) {
      col(c).delete(id);
    },
    async list(c, field, value) {
      return [...col(c).values()]
        .filter((v) => !field || v[field] === value)
        .map((v) => structuredClone(v));
    },
    async mutate(c, id, fn) {
      const work = queue.then(() => {
        const { value, result, writes = [] } = fn(structuredClone(col(c).get(id) || null));
        if (value) col(c).set(id, structuredClone(value));
        for (const w of writes) col(w.collection).set(w.id, structuredClone(w.value));
        return structuredClone(result);
      });
      queue = work.catch(() => {});
      return work;
    },
  };
}
export function firestoreStore(projectId) {
  const db = new Firestore({ projectId, ignoreUndefinedProperties: true });
  return {
    db,
    async get(c, id) {
      const s = await db.collection(c).doc(id).get();
      return s.exists ? s.data() : null;
    },
    async set(c, id, data) {
      await db.collection(c).doc(id).set(data);
    },
    async delete(c, id) {
      await db.collection(c).doc(id).delete();
    },
    async list(c, field, value) {
      const q = field ? db.collection(c).where(field, '==', value) : db.collection(c);
      return (await q.get()).docs.map((d) => d.data());
    },
    async mutate(c, id, fn) {
      return db.runTransaction(async (tx) => {
        const ref = db.collection(c).doc(id),
          snap = await tx.get(ref);
        const { value, result, writes = [] } = fn(snap.exists ? snap.data() : null);
        if (value) tx.set(ref, value);
        for (const w of writes) tx.create(db.collection(w.collection).doc(w.id), w.value);
        return result;
      });
    },
  };
}
