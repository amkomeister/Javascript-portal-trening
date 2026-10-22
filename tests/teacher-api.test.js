import { it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/app.js';
import { memoryStore } from '../server/store.js';
const origin = 'http://127.0.0.1:5175';
const lesson = 'skule-v1-start-01';
const data = {
  files: { js: 'print("private");', html: '', css: '' },
  reflection: 'Mi forklaring',
  support: 'help',
  selfChecked: true,
  autoPassed: false,
};
function setup(store = memoryStore()) {
  return createApp({
    store,
    local: true,
    origin,
    domains: ['skule.test'],
    teacherSubs: ['teacher', 'teacher2'],
  });
}
async function login(app, account) {
  const agent = request.agent(app);
  const response = await agent.post('/api/auth/local').set('Origin', origin).send({ account });
  expect(response.status).toBe(200);
  return { agent, ...response.body };
}
const put = (a, path, body, method = 'put') =>
  a.agent[method](path).set('Origin', origin).set('X-CSRF-Token', a.csrf).send(body);

it('remembers a completed teacher guide across sessions and preserves the profile', async () => {
  const app = setup(),
    a = await login(app, 'teacher');
  await put(a, '/api/profile', { grade: 10 });
  expect((await put(a, '/api/teacher/guide', { version: 1 })).status).toBe(200);
  const again = await login(app, 'teacher');
  expect(again.user.teacherGuideVersion).toBe(1);
  expect(again.user.grade).toBe(10);
  const other = await login(app, 'teacher2');
  expect(other.user.teacherGuideVersion || 0).toBe(0);
});
it('rejects pupil guide writes and unsupported guide versions', async () => {
  const app = setup(),
    s = await login(app, 'student1'),
    t = await login(app, 'teacher');
  expect((await put(s, '/api/teacher/guide', { version: 1 })).status).toBe(403);
  for (const version of [0, 2, '1', null])
    expect((await put(t, '/api/teacher/guide', { version })).status).toBe(400);
});
it('keeps group joining a pupil action', async () => {
  const app = setup(),
    t = await login(app, 'teacher');
  const group = (await put(t, '/api/groups', { name: '9A' }, 'post')).body;
  expect((await put(t, '/api/groups/join', { code: group.code }, 'post')).status).toBe(403);
});
it('authorizes every teacher action by group owner and approved membership', async () => {
  const app = setup(),
    t = await login(app, 'teacher'),
    other = await login(app, 'teacher2'),
    s = await login(app, 'student1'),
    stranger = await login(app, 'student2');
  const group = (await put(t, '/api/groups', { name: '9A' }, 'post')).body;
  const base = '/api/groups/' + group.id;
  await put(s, '/api/progress/' + lesson, { revision: 0, data });
  await put(s, '/api/projects/snake', { revision: 0, data });
  await put(s, '/api/groups/join', { code: group.code }, 'post');
  const work = base + '/students/' + s.user.id;
  const membership = base + '/members/' + s.user.id;
  const review = base + '/reviews/' + s.user.id + '/' + lesson;
  expect((await t.agent.get(work)).status).toBe(403);
  expect((await put(t, review, { note: 'pending' })).status).toBe(403);
  for (const actor of [s, stranger, other]) {
    expect((await actor.agent.get(base + '/members')).status).toBe(403);
    expect((await put(actor, membership, { approved: true })).status).toBe(403);
    expect((await actor.agent.get(work)).status).toBe(403);
    expect((await put(actor, review, { note: 'forbidden' })).status).toBe(403);
  }
  await put(t, membership, { approved: true });
  const allowed = await t.agent.get(work);
  expect(allowed.status).toBe(200);
  expect(allowed.body.progress[0].data.reflection).toBe(data.reflection);
  expect(allowed.body.projects[0].data.files.js).toBe(data.files.js);
  expect((await other.agent.get(work)).status).toBe(403);
  expect((await put(t, review, { note: 'Prøv ein annan farge.' })).status).toBe(200);
  expect((await s.agent.get('/api/reviews')).body.records[0].note).toBe('Prøv ein annan farge.');
  expect((await stranger.agent.get('/api/reviews')).body.records).toEqual([]);
  expect((await other.agent.get('/api/progress')).body.records).toEqual([]);
  await put(t, membership, { approved: false });
  await put(s, '/api/groups/join', { code: group.code }, 'post');
  expect((await t.agent.get(work)).status).toBe(403);
  expect((await put(t, review, { note: 'revoked' })).status).toBe(403);
  expect((await s.agent.get('/api/progress/' + lesson)).body.data).toMatchObject(data);
});

it('does not restore approval when a pupil joins again during a revocation', async () => {
  const baseStore = memoryStore();
  let revoke = null;
  const store = {
    ...baseStore,
    async get(c, key) {
      const prior = await baseStore.get(c, key);
      if (c === 'memberships' && revoke) {
        const action = revoke;
        revoke = null;
        await action();
      }
      return prior;
    },
    async mutate(c, key, fn) {
      if (c === 'memberships' && revoke) {
        const action = revoke;
        revoke = null;
        await action();
      }
      return baseStore.mutate(c, key, fn);
    },
  };
  const app = setup(store),
    t = await login(app, 'teacher'),
    s = await login(app, 'student1');
  const group = (await put(t, '/api/groups', { name: 'Revocation' }, 'post')).body;
  await put(s, '/api/groups/join', { code: group.code }, 'post');
  const memberPath = `/api/groups/${group.id}/members/${s.user.id}`;
  await put(t, memberPath, { approved: true });
  revoke = () => put(t, memberPath, { approved: false });
  await put(s, '/api/groups/join', { code: group.code }, 'post');
  expect((await t.agent.get(`/api/groups/${group.id}/students/${s.user.id}`)).status).toBe(403);
});

it('preserves both teacher feedback versions instead of overwriting a concurrent save', async () => {
  const app = setup(),
    t = await login(app, 'teacher'),
    s = await login(app, 'student1');
  const group = (await put(t, '/api/groups', { name: 'Feedback' }, 'post')).body;
  await put(s, '/api/groups/join', { code: group.code }, 'post');
  await put(t, `/api/groups/${group.id}/members/${s.user.id}`, { approved: true });
  const path = `/api/groups/${group.id}/reviews/${s.user.id}/${lesson}`;
  const first = await put(t, path, { note: 'Frå maskin A', revision: 0 });
  expect(first.status).toBe(200);
  expect(first.body.revision).toBe(1);
  const second = await put(t, path, { note: 'Frå maskin B', revision: 0 });
  expect(second.status).toBe(409);
  expect(second.body.current.note).toBe('Frå maskin A');
  const copies = (await t.agent.get('/api/conflicts')).body.records;
  expect(copies[0].data.note).toBe('Frå maskin B');
  expect(copies[0].serverVersion.note).toBe('Frå maskin A');
  expect((await s.agent.get('/api/conflicts')).body.records).toEqual([]);
  expect((await put(t, path, { note: 'Samla tilbakemelding', revision: 1 })).status).toBe(200);
  expect((await s.agent.get('/api/reviews')).body.records[0].note).toBe('Samla tilbakemelding');
});
