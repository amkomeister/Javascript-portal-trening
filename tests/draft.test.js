import { it, expect, vi } from 'vitest';
import { Draft } from '../src/draft.js';
it('serializes saves and catches changes typed during an in-flight write', async () => {
  let resolve;
  const put = vi
    .fn()
    .mockImplementationOnce(() => new Promise((r) => (resolve = r)))
    .mockResolvedValue({ revision: 2 });
  const d = new Draft(put, { revision: 0, data: { value: 0 } });
  d.update({ value: 1 });
  const saving = d.flush();
  d.update({ value: 2 });
  resolve({ revision: 1 });
  await saving;
  expect(put).toHaveBeenCalledTimes(2);
  expect(put.mock.calls[1][0]).toEqual({ revision: 1, data: { value: 2 } });
  expect(d.dirty).toBe(false);
  d.dispose();
});
it('keeps unsaved work after network failure and blocks retries on conflict', async () => {
  const put = vi
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockRejectedValueOnce(
      Object.assign(new Error('conflict'), {
        status: 409,
        payload: { current: { revision: 2, data: { value: 8 } }, conflict: { id: 'c' } },
      }),
    );
  const d = new Draft(put, { revision: 0, data: { value: 0 } });
  d.update({ value: 1 });
  await expect(d.flush()).rejects.toThrow('offline');
  expect(d.data.value).toBe(1);
  expect(d.dirty).toBe(true);
  await expect(d.flush()).rejects.toThrow('conflict');
  await expect(d.flush()).rejects.toThrow();
  expect(put).toHaveBeenCalledTimes(2);
  expect(d.conflict.current.data.value).toBe(8);
  d.dispose();
});
