// @vitest-environment jsdom
import { it, expect, vi } from 'vitest';
import { teacherRoom } from '../src/teacher.js';
const lesson = 'skule-v1-start-01';
function work(name) {
  return {
    user: { name, grade: 9 },
    reviews: [],
    projects: [],
    progress: [
      {
        id: lesson,
        data: {
          files: { js: 'print(1);' },
          reflection: 'Forklaring',
          autoPassed: false,
          selfChecked: false,
        },
      },
    ],
  };
}
async function setup(read, write = async () => ({ revision: 1 })) {
  document.body.innerHTML = '<div id="notice"></div><main></main>';
  Element.prototype.scrollIntoView = vi.fn();
  const root = document.querySelector('main');
  const api = vi.fn(async (path, method) => {
    if (method === 'PUT') return write(path);
    if (path === '/api/groups') return { groups: [{ id: 'g', name: '9A', code: 'ABC123' }] };
    if (path.endsWith('/members'))
      return {
        members: ['a', 'b'].map((id) => ({
          userId: id,
          approved: true,
          user: { name: id, grade: 9 },
        })),
      };
    return read(path.split('/').at(-1));
  });
  const controller = await teacherRoom(root, api);
  return {
    root,
    controller,
    api,
    click: (id) => root.querySelector(`[data-read="${id}"]`).onclick(),
  };
}

it('does not show an older pupil response after selecting a newer pupil', async () => {
  let resolve;
  const delayed = new Promise((r) => (resolve = r));
  const page = await setup((id) => (id === 'a' ? delayed : work('Elev B')));
  const first = page.click('a');
  await vi.waitFor(() => expect(page.api).toHaveBeenCalledWith('/api/groups/g/students/a'));
  await page.click('b');
  resolve(work('Elev A'));
  await first;
  expect(page.root.querySelector('#student-work h2').textContent).toContain('Elev B');
  page.controller.dispose();
});

it('preserves a note typed while another pupil request is still pending', async () => {
  let resolve;
  const delayed = new Promise((r) => (resolve = r));
  const page = await setup((id) => (id === 'b' ? delayed : work('Elev A')));
  await page.click('a');
  const next = page.click('b');
  await vi.waitFor(() => expect(page.api).toHaveBeenCalledWith('/api/groups/g/students/b'));
  page.root.querySelector('textarea').value = 'Hald på denne forklaringa.';
  resolve(work('Elev B'));
  await next;
  expect(page.root.querySelector('#student-work h2').textContent).toContain('Elev A');
  expect(page.root.querySelector('textarea').value).toBe('Hald på denne forklaringa.');
  await expect(page.controller.flush()).rejects.toThrow('ulagrede tilbakemeldingar');
  page.controller.dispose();
});

it('does not call a note saved when the teacher types more during its save', async () => {
  let resolve;
  const pending = new Promise((r) => (resolve = r));
  const page = await setup(
    () => work('Elev A'),
    () => pending,
  );
  await page.click('a');
  const form = page.root.querySelector('[data-review]');
  form.elements.note.value = 'Første tekst';
  const saving = form.onsubmit({ preventDefault() {} });
  form.elements.note.value = 'Nyare tekst';
  resolve({ revision: 1 });
  await saving;
  expect(form.querySelector('[role=status]').textContent).toContain(
    'Nyare endringar er ikkje lagra',
  );
  expect(page.controller.dirty()).toBe(true);
  await expect(page.controller.flush()).rejects.toThrow('ulagrede tilbakemeldingar');
  page.controller.dispose();
});
