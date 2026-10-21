import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/app.js';
import { memoryStore } from '../server/store.js';
function setup() {
  return createApp({
    store: memoryStore(),
    local: true,
    origin: 'http://127.0.0.1:5175',
    teacherSubs: ['teacher'],
    verifyGoogle: async (token) => ({
      sub: token,
      hd: 'skule.test',
      email: token + '@skule.test',
      name: token,
    }),
    domains: ['skule.test'],
  });
}
async function login(app, account = 'student1') {
  const a = request.agent(app);
  const r = await a
    .post('/api/auth/local')
    .set('Origin', 'http://127.0.0.1:5175')
    .send({ account });
  expect(r.status).toBe(200);
  a.token = r.body.csrf;
  return a;
}
const write = (a, path, body, method = 'put') =>
  a[method](path).set('Origin', 'http://127.0.0.1:5175').set('X-CSRF-Token', a.token).send(body);
const data = {
  files: { js: 'print(2);', html: '', css: '' },
  reflection: 'Eg endra talet.',
  support: 'standard',
  selfChecked: false,
  autoPassed: false,
};
describe('school API', () => {
  it('revokes a teacher role for already-existing sessions when the explicit allowlist changes', async () => {
    const store = memoryStore(),
      options = { store, local: true, origin: 'http://127.0.0.1:5175', domains: ['skule.test'] };
    const first = createApp({ ...options, teacherSubs: ['teacher'] });
    const logged = await request(first)
      .post('/api/auth/local')
      .set('Origin', options.origin)
      .send({ account: 'teacher' });
    const cookie = logged.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    const changed = createApp({ ...options, teacherSubs: [] });
    const profile = await request(changed).get('/api/me').set('Cookie', cookie);
    expect(profile.body.user.role).toBe('student');
    expect(
      (
        await request(changed)
          .post('/api/groups')
          .set('Cookie', cookie)
          .set('Origin', options.origin)
          .set('X-CSRF-Token', logged.body.csrf)
          .send({ name: 'No longer allowed' })
      ).status,
    ).toBe(403);
  });
  it('requires authentication and blocks cross-origin mutations', async () => {
    const app = setup();
    expect((await request(app).get('/api/progress')).status).toBe(401);
    const a = await login(app);
    expect((await a.put('/api/profile').send({ grade: 8 })).status).toBe(403);
    expect((await write(a, '/api/profile', { grade: 8 })).body.user.grade).toBe(8);
  });
  it('keeps user records separate and preserves both concurrent revisions', async () => {
    const app = setup(),
      a = await login(app),
      b = await login(app, 'student2');
    const first = await write(a, '/api/progress/start-01', { revision: 0, data });
    expect(first.status).toBe(200);
    expect(first.body.revision).toBe(1);
    const conflict = await write(a, '/api/progress/start-01', {
      revision: 0,
      data: { ...data, files: { ...data.files, js: 'print(3);' } },
    });
    expect(conflict.status).toBe(409);
    expect(conflict.body.current.data.files.js).toBe('print(2);');
    expect(conflict.body.conflict.data.files.js).toBe('print(3);');
    expect((await b.get('/api/progress')).body.records).toEqual([]);
    expect((await a.get('/api/conflicts')).body.records).toHaveLength(1);
  });
  it('allows teachers to read only approved members of their own groups', async () => {
    const app = setup(),
      t = await login(app, 'teacher'),
      a = await login(app);
    const g = await write(t, '/api/groups', { name: '8A' }, 'post');
    expect(g.status).toBe(201);
    expect((await write(a, '/api/groups', { name: 'Fake' }, 'post')).status).toBe(403);
    const member = await write(a, '/api/groups/join', { code: g.body.code }, 'post');
    expect(member.status).toBe(200);
    expect(
      (await t.get('/api/groups/' + g.body.id + '/students/' + member.body.userId)).status,
    ).toBe(403);
    expect(
      (
        await write(t, '/api/groups/' + g.body.id + '/members/' + member.body.userId, {
          approved: true,
        })
      ).status,
    ).toBe(200);
    expect(
      (await t.get('/api/groups/' + g.body.id + '/students/' + member.body.userId)).status,
    ).toBe(200);
    expect(
      (await a.get('/api/groups/' + g.body.id + '/students/' + member.body.userId)).status,
    ).toBe(403);
  });
  it('invalidates sessions on logout and rejects invalid records', async () => {
    const app = setup(),
      a = await login(app);
    expect(
      (await write(a, '/api/progress/x', { revision: 0, data: { files: { js: 5 } } })).status,
    ).toBe(400);
    expect((await write(a, '/api/logout', {}, 'post')).status).toBe(200);
    expect((await a.get('/api/me')).status).toBe(401);
  });
  it('supports ten independent students saving in parallel', async () => {
    const app = setup();
    const users = await Promise.all(
      Array.from({ length: 10 }, (_, i) => login(app, 'student' + (i + 1))),
    );
    await Promise.all(
      users.map((a, i) =>
        write(a, '/api/projects/own', {
          revision: 0,
          data: { ...data, files: { ...data.files, js: 'print(' + i + ');' } },
        }),
      ),
    );
    for (let i = 0; i < 10; i++)
      expect((await users[i].get('/api/projects/own')).body.data.files.js).toBe(
        'print(' + i + ');',
      );
  });
  it('fails closed for production test logins, domains and role claims', async () => {
    const app = createApp({
      store: memoryStore(),
      local: false,
      origin: 'https://school.test',
      domains: ['skule.test'],
      teacherSubs: [],
      verifyGoogle: async () => ({ sub: '123', hd: 'evil.test' }),
    });
    expect((await request(app).post('/api/auth/local').send({ account: 'teacher' })).status).toBe(
      404,
    );
    const r = await request(app)
      .post('/api/auth/google')
      .set('Origin', 'https://school.test')
      .set('Cookie', 'g_csrf_token=abc')
      .send({ credential: 'bad', g_csrf_token: 'abc' });
    expect(r.status).toBe(403);
  });
});
