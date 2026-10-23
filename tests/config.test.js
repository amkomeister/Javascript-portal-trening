import { it, expect } from 'vitest';
import { configuration } from '../server/config.js';
it('fails closed instead of exposing test identities or a real database accidentally', () => {
  expect(() => configuration({})).toThrow();
  expect(() => configuration({ SCHOOL_LOCAL: '1' })).toThrow();
  expect(() =>
    configuration({ SCHOOL_LOCAL: '1', FIRESTORE_EMULATOR_HOST: 'evil.test:8085' }),
  ).toThrow();
  expect(configuration({ SCHOOL_LOCAL: '1', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8085' }).host).toBe(
    '127.0.0.1',
  );
  expect(() =>
    configuration({
      NODE_ENV: 'production',
      SCHOOL_LOCAL: '1',
      FIRESTORE_EMULATOR_HOST: '127.0.0.1:8085',
    }),
  ).toThrow();
  expect(() =>
    configuration({
      GOOGLE_CLIENT_ID: 'client',
      GOOGLE_CLOUD_PROJECT: 'school',
      ALLOWED_DOMAINS: 'school.test',
      APP_ORIGIN: 'http://example.test',
    }),
  ).toThrow();
});
