export const collections = [
  'users',
  'groups',
  'memberships',
  'progress',
  'projects',
  'conflicts',
  'reviews',
];
export async function exportData(db) {
  const data = {};
  for (const name of collections) {
    const snap = await db.collection(name).get();
    data[name] = snap.docs.map((d) => ({ id: d.id, value: d.data() }));
  }
  return {
    format: 'kodeverkstad-skule-backup',
    version: 1,
    createdAt: new Date().toISOString(),
    data,
  };
}
export function validateBackup(backup) {
  if (
    backup?.format !== 'kodeverkstad-skule-backup' ||
    backup.version !== 1 ||
    !backup.data ||
    Object.keys(backup.data).length !== collections.length
  )
    throw Error('Ugyldig sikkerheitskopi.');
  for (const name of collections) {
    const rows = backup.data[name];
    if (!Array.isArray(rows)) throw Error('Manglar samling: ' + name);
    const seen = new Set();
    for (const row of rows) {
      if (
        typeof row.id !== 'string' ||
        !/^[a-zA-Z0-9_-]{1,220}$/.test(row.id) ||
        seen.has(row.id) ||
        !row.value ||
        typeof row.value !== 'object' ||
        Array.isArray(row.value)
      )
        throw Error('Ugyldig eller gjenteken post i ' + name);
      seen.add(row.id);
    }
  }
  return backup;
}
export async function restoreData(db, backup) {
  validateBackup(backup);
  // Fail closed: restoration never overwrites existing learner work.
  for (const name of [...collections, 'sessions'])
    if (!(await db.collection(name).limit(1).get()).empty)
      throw Error('Gjenoppretting krev ein tom database. Bruk ein ny testdatabase.');
  for (const name of collections) {
    const rows = backup.data[name];
    for (let i = 0; i < rows.length; i += 400) {
      const batch = db.batch();
      for (const row of rows.slice(i, i + 400))
        batch.create(db.collection(name).doc(row.id), row.value);
      await batch.commit();
    }
  }
}
