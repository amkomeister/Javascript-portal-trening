export function configuration(env = process.env) {
  const local = env.SCHOOL_LOCAL === '1',
    port = Number(env.PORT || 5175);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('Ugyldig PORT.');
  if (local) {
    if (
      env.NODE_ENV === 'production' ||
      !/^127\.0\.0\.1:\d+$/.test(env.FIRESTORE_EMULATOR_HOST || '')
    )
      throw Error('Testkontoar krev lokal Firestore-emulator og utviklingsmodus.');
    return {
      local,
      port,
      host: '127.0.0.1',
      origin: 'http://127.0.0.1:' + port,
      projectId: env.GOOGLE_CLOUD_PROJECT || 'demo-kodeverkstad',
      domains: ['skule.test'],
      teacherSubs: ['teacher', 'teacher2'],
      clientId: '',
    };
  }
  if (env.FIRESTORE_EMULATOR_HOST) throw Error('Produksjon kan ikkje bruke emulator.');
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLOUD_PROJECT || !env.ALLOWED_DOMAINS || !env.APP_ORIGIN)
    throw Error('Set GOOGLE_CLIENT_ID, GOOGLE_CLOUD_PROJECT, ALLOWED_DOMAINS og APP_ORIGIN.');
  const url = new URL(env.APP_ORIGIN);
  if (url.protocol !== 'https:' || url.origin !== env.APP_ORIGIN)
    throw Error('APP_ORIGIN må vere ei HTTPS-adresse utan sti.');
  const domains = env.ALLOWED_DOMAINS.split(',').map((s) => s.trim().toLowerCase());
  if (domains.some((d) => !/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(d)))
    throw Error('Ugyldige skuledomene.');
  return {
    local,
    port,
    host: '0.0.0.0',
    origin: url.origin,
    projectId: env.GOOGLE_CLOUD_PROJECT,
    domains,
    teacherSubs: (env.TEACHER_GOOGLE_SUBS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    clientId: env.GOOGLE_CLIENT_ID,
  };
}
