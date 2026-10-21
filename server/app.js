import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { bridgeScript } from '../src/runtime/preview.js';
const hash = (s) => createHash('sha256').update(s).digest('hex');
const id = (s) =>
  typeof s === 'string' &&
  /^[a-zA-Z0-9_-]{1,100}$/.test(s) &&
  !['__proto__', 'constructor', 'prototype'].includes(s);
const equal = (a, b) =>
  typeof a === 'string' &&
  typeof b === 'string' &&
  Buffer.byteLength(a) === Buffer.byteLength(b) &&
  timingSafeEqual(Buffer.from(a), Buffer.from(b));
const fail = (status, message) => Object.assign(new Error(message), { status });
function cleanData(d) {
  if (
    !d ||
    !d.files ||
    !['html', 'css', 'js'].every(
      (k) => typeof d.files[k] === 'string' && d.files[k].length <= 100000,
    ) ||
    typeof d.reflection !== 'string' ||
    d.reflection.length > 5000 ||
    !['help', 'standard', 'challenge'].includes(d.support) ||
    typeof d.selfChecked !== 'boolean' ||
    typeof d.autoPassed !== 'boolean'
  )
    throw fail(400, 'Lagringa har ugyldig format. Koden er bevart i editoren.');
  return {
    files: { html: d.files.html, css: d.files.css, js: d.files.js },
    reflection: d.reflection,
    support: d.support,
    selfChecked: d.selfChecked,
    autoPassed: d.autoPassed,
    hints: Math.max(0, Math.min(3, Number.isInteger(d.hints) ? d.hints : 0)),
    title: typeof d.title === 'string' ? d.title.slice(0, 120) : '',
    presentationMode: d.presentationMode === 'web' ? 'web' : 'draw',
  };
}
export function createApp({
  store,
  local = false,
  origin,
  domains = [],
  teacherSubs = [],
  verifyGoogle = async () => {
    throw fail(503, 'Google er ikkje konfigurert.');
  },
  clientId = '',
}) {
  const app = express();
  const teacherIds = new Set(teacherSubs.map(hash));
  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'wasm-unsafe-eval'",
            "'sha256-" + createHash('sha256').update(bridgeScript).digest('base64') + "'",
            'https://accounts.google.com',
          ],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://accounts.google.com'],
          frameSrc: ["'self'", 'https://accounts.google.com'],
          connectSrc: [
            "'self'",
            'https://accounts.google.com',
            ...(local ? ['ws://127.0.0.1:*'] : []),
          ],
          imgSrc: ["'self'", 'data:'],
          workerSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'none'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: local ? null : [],
        },
      },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      strictTransportSecurity: local ? false : undefined,
    }),
  );
  app.use(
    express.json({ limit: '350kb' }),
    express.urlencoded({ extended: false, limit: '10kb' }),
    cookieParser(),
  );
  const rates = new Map();
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    const key = req.socket.remoteAddress;
    const now = Date.now(),
      r = rates.get(key) || { count: 0, at: now };
    if (now - r.at > 60000) {
      r.count = 0;
      r.at = now;
    }
    rates.set(key, r);
    if (++r.count > 1500) return res.status(429).json({ error: 'Vent litt før du prøver igjen.' });
    next();
  });
  app.get('/health', (_, res) => res.json({ ok: true }));
  app.get('/api/config', (_, res) => {
    const loginCsrf = randomBytes(24).toString('hex');
    res.cookie('g_csrf_token', loginCsrf, {
      httpOnly: true,
      secure: !local,
      sameSite: 'strict',
      path: '/api/auth/google',
      maxAge: 600000,
    });
    res.json({ local, clientId, loginCsrf });
  });
  function checkOrigin(req) {
    if (req.get('origin') !== origin) throw fail(403, 'Førespurnaden kom frå feil adresse.');
  }
  async function signIn(req, res, claims) {
    if (!claims || typeof claims.sub !== 'string' || !domains.includes(claims.hd))
      throw fail(403, 'Bruk den godkjende Google-skulekontoen din.');
    if (req.body.resumeUserId && req.body.resumeUserId !== hash(claims.sub))
      throw fail(403, 'Vel den same skulekontoen som arbeidet er ope for. Koden din er bevart.');
    if (req.cookies.schoolSession) await store.delete('sessions', hash(req.cookies.schoolSession));
    const userId = hash(claims.sub),
      prior = await store.get('users', userId);
    const user = {
      id: userId,
      name: String(claims.name || claims.email || 'Elev').slice(0, 120),
      email: String(claims.email || '').slice(0, 254),
      role: teacherSubs.includes(claims.sub) ? 'teacher' : 'student',
      grade: prior?.grade ?? null,
    };
    await store.set('users', userId, user);
    const token = randomBytes(32).toString('hex'),
      csrf = randomBytes(24).toString('hex');
    const expires = Date.now() + 8 * 3600000;
    await store.set('sessions', hash(token), {
      userId,
      csrf,
      expires,
      expiresAt: new Date(expires),
    });
    res.cookie('schoolSession', token, {
      httpOnly: true,
      secure: !local,
      sameSite: 'strict',
      path: '/',
    });
    res.json({ user, csrf });
  }
  app.post('/api/auth/local', async (req, res) => {
    if (!local) return res.status(404).json({ error: 'Ikkje tilgjengeleg.' });
    checkOrigin(req);
    if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress))
      throw fail(403, 'Testkontoar er berre lokale.');
    const account = req.body.account;
    if (!/^(student([1-9]|10)|teacher|teacher2)$/.test(account || ''))
      throw fail(400, 'Vel ein testkonto.');
    await signIn(req, res, {
      sub: account,
      hd: 'skule.test',
      email: account + '@skule.test',
      name:
        account === 'teacher'
          ? 'Lærar Liv'
          : account === 'teacher2'
            ? 'Lærar Ola'
            : 'Elev ' + account.slice(7),
    });
  });
  app.post('/api/auth/google', async (req, res) => {
    checkOrigin(req);
    if (!equal(req.cookies.g_csrf_token, req.body.g_csrf_token))
      throw fail(403, 'Innlogginga må startast på nytt.');
    if (typeof req.body.credential !== 'string') throw fail(400, 'Manglar Google-innlogging.');
    let claims;
    try {
      claims = await verifyGoogle(req.body.credential);
    } catch {
      throw fail(401, 'Google-innlogginga kunne ikkje stadfestast.');
    }
    await signIn(req, res, claims);
  });
  app.use('/api', async (req, res, next) => {
    const token = req.cookies.schoolSession;
    const s =
      typeof token === 'string' && token.length === 64
        ? await store.get('sessions', hash(token))
        : null;
    if (!s || s.expires < Date.now()) throw fail(401, 'Logg inn for å halde fram.');
    req.user = await store.get('users', s.userId);
    if (!req.user) throw fail(401, 'Logg inn på nytt.');
    req.user = { ...req.user, role: teacherIds.has(req.user.id) ? 'teacher' : 'student' };
    req.session = s;
    if (!['GET', 'HEAD'].includes(req.method)) {
      checkOrigin(req);
      if (!equal(req.get('X-CSRF-Token'), s.csrf))
        throw fail(403, 'Oppdater innlogginga før du lagrar.');
    }
    next();
  });
  const teacher = (req) => {
    if (req.user.role !== 'teacher') throw fail(403, 'Dette krev lærartilgang.');
  };
  async function ownGroup(req, gid) {
    teacher(req);
    if (!id(gid)) throw fail(400, 'Ugyldig gruppe.');
    const g = await store.get('groups', gid);
    if (!g || g.teacherId !== req.user.id)
      throw fail(403, 'Du har ikkje tilgang til denne gruppa.');
    return g;
  }
  async function member(req, gid, uid) {
    await ownGroup(req, gid);
    const m = await store.get('memberships', gid + '_' + uid);
    if (!m?.approved) throw fail(403, 'Eleven er ikkje godkjend i denne gruppa.');
  }
  app.get('/api/me', (req, res) => res.json({ user: req.user, csrf: req.session.csrf }));
  app.post('/api/logout', async (req, res) => {
    await store.delete('sessions', hash(req.cookies.schoolSession));
    res.clearCookie('schoolSession', {
      path: '/',
      secure: !local,
      httpOnly: true,
      sameSite: 'strict',
    });
    res.json({ ok: true });
  });
  app.put('/api/profile', async (req, res) => {
    if (![8, 9, 10].includes(req.body.grade)) throw fail(400, 'Vel 8., 9. eller 10. trinn.');
    const user = { ...req.user, grade: req.body.grade };
    await store.set('users', user.id, user);
    res.json({ user });
  });
  for (const collection of ['progress', 'projects']) {
    app.get('/api/' + collection, async (req, res) =>
      res.json({ records: await store.list(collection, 'userId', req.user.id) }),
    );
    app.get('/api/' + collection + '/:id', async (req, res) => {
      if (!id(req.params.id)) throw fail(400, 'Ugyldig ID.');
      res.json(
        (await store.get(collection, req.user.id + '_' + req.params.id)) || {
          id: req.params.id,
          revision: 0,
          data: null,
        },
      );
    });
    app.put('/api/' + collection + '/:id', async (req, res) => {
      if (!id(req.params.id) || !Number.isInteger(req.body.revision) || req.body.revision < 0)
        throw fail(400, 'Ugyldig lagringsversjon.');
      const data = cleanData(req.body.data),
        key = req.user.id + '_' + req.params.id;
      const result = await store.mutate(collection, key, (prior) => {
        if ((prior?.revision || 0) !== req.body.revision) {
          const copy = {
            id: randomBytes(12).toString('hex'),
            userId: req.user.id,
            collection,
            recordId: req.params.id,
            data,
            serverVersion: prior,
            baseRevision: req.body.revision,
            createdAt: new Date().toISOString(),
          };
          return {
            writes: [{ collection: 'conflicts', id: copy.id, value: copy }],
            result: { conflict: true, current: prior, copy },
          };
        }
        const value = {
          id: req.params.id,
          userId: req.user.id,
          schemaVersion: 1,
          revision: (prior?.revision || 0) + 1,
          updatedAt: new Date().toISOString(),
          data,
        };
        return { value, result: value };
      });
      if (result.conflict) {
        return res.status(409).json({
          error:
            'Arbeidet er endra i ei anna fane eller på ei anna maskin. Begge versjonane er tekne vare på.',
          current: result.current,
          conflict: result.copy,
        });
      }
      res.json(result);
    });
  }
  app.get('/api/conflicts', async (req, res) =>
    res.json({ records: await store.list('conflicts', 'userId', req.user.id) }),
  );
  app.get('/api/groups', async (req, res) => {
    if (req.user.role === 'teacher')
      return res.json({ groups: await store.list('groups', 'teacherId', req.user.id) });
    const ms = await store.list('memberships', 'userId', req.user.id);
    const groups = await Promise.all(
      ms.map(async (m) => {
        const g = await store.get('groups', m.groupId);
        return { id: m.groupId, name: g?.name || 'Gruppe', approved: m.approved };
      }),
    );
    res.json({ groups });
  });
  app.post('/api/groups', async (req, res) => {
    teacher(req);
    if (typeof req.body.name !== 'string' || !req.body.name.trim() || req.body.name.length > 80)
      throw fail(400, 'Skriv eit gruppenamn.');
    const g = {
      id: randomBytes(12).toString('hex'),
      name: req.body.name.trim(),
      code: randomBytes(6).toString('hex').toUpperCase(),
      teacherId: req.user.id,
    };
    await store.set('groups', g.id, g);
    res.status(201).json(g);
  });
  app.post('/api/groups/join', async (req, res) => {
    if (
      typeof req.body.code !== 'string' ||
      !/^[A-F0-9]{12}$/.test(req.body.code.trim().toUpperCase())
    )
      throw fail(400, 'Kontroller gruppekoden.');
    const [g] = await store.list('groups', 'code', req.body.code.trim().toUpperCase());
    if (!g) throw fail(404, 'Fann ikkje gruppa.');
    const key = g.id + '_' + req.user.id,
      prior = await store.get('memberships', key);
    const m = prior || { groupId: g.id, userId: req.user.id, approved: false };
    await store.set('memberships', key, m);
    res.json(m);
  });
  app.get('/api/groups/:id/members', async (req, res) => {
    await ownGroup(req, req.params.id);
    const ms = await store.list('memberships', 'groupId', req.params.id);
    res.json({
      members: await Promise.all(
        ms.map(async (m) => ({ ...m, user: await store.get('users', m.userId) })),
      ),
    });
  });
  app.put('/api/groups/:id/members/:uid', async (req, res) => {
    await ownGroup(req, req.params.id);
    if (typeof req.body.approved !== 'boolean') throw fail(400, 'Ugyldig medlemskap.');
    const key = req.params.id + '_' + req.params.uid,
      m = await store.get('memberships', key);
    if (!m) throw fail(404, 'Fann ikkje eleven.');
    await store.set('memberships', key, { ...m, approved: req.body.approved });
    res.json({ ok: true });
  });
  app.get('/api/groups/:id/students/:uid', async (req, res) => {
    await member(req, req.params.id, req.params.uid);
    res.json({
      user: await store.get('users', req.params.uid),
      progress: await store.list('progress', 'userId', req.params.uid),
      projects: await store.list('projects', 'userId', req.params.uid),
      reviews: (await store.list('reviews', 'groupId', req.params.id)).filter(
        (r) => r.userId === req.params.uid,
      ),
    });
  });
  app.put('/api/groups/:id/reviews/:uid/:lesson', async (req, res) => {
    await member(req, req.params.id, req.params.uid);
    if (!id(req.params.lesson) || typeof req.body.note !== 'string' || req.body.note.length > 2000)
      throw fail(400, 'Ugyldig vurdering.');
    const r = {
      groupId: req.params.id,
      userId: req.params.uid,
      lessonId: req.params.lesson,
      note: req.body.note,
      teacherId: req.user.id,
      reviewedAt: new Date().toISOString(),
    };
    await store.set('reviews', r.groupId + '_' + r.userId + '_' + r.lessonId, r);
    res.json(r);
  });
  app.get('/api/reviews', async (req, res) =>
    res.json({ records: await store.list('reviews', 'userId', req.user.id) }),
  );
  app.use('/api', (_, res) => res.status(404).json({ error: 'Fann ikkje denne funksjonen.' }));
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (!err.status) console.error('api_error', err.code || err.name);
    res.status(err.status || 503).json({
      error: err.status
        ? err.message
        : 'Lagringstenesta svarar ikkje. Koden din er bevart i editoren.',
    });
  });
  return app;
}
