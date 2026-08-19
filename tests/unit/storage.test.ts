import { describe, it, expect, beforeEach } from 'vitest';
import { lsGet, lsSet, lsRemove, Keys } from '../../src/lib/storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('lsSet / lsGet', () => {
    it('stores and retrieves a string value', () => {
      lsSet('test-key', 'hello');
      expect(lsGet<string>('test-key')).toBe('hello');
    });

    it('stores and retrieves an object value', () => {
      const obj = { foo: 42, bar: 'baz' };
      lsSet('obj-key', obj);
      expect(lsGet<typeof obj>('obj-key')).toEqual(obj);
    });

    it('returns null for non-existent key', () => {
      expect(lsGet('missing')).toBeNull();
    });

    it('prefixes keys with "random-web:"', () => {
      lsSet('my-key', true);
      expect(localStorage.getItem('random-web:my-key')).toBe('true');
    });
  });

  describe('lsRemove', () => {
    it('removes a stored key', () => {
      lsSet('remove-me', 'data');
      expect(lsGet('remove-me')).toBe('data');
      lsRemove('remove-me');
      expect(lsGet('remove-me')).toBeNull();
    });

    it('does not throw when removing non-existent key', () => {
      expect(() => lsRemove('ghost')).not.toThrow();
    });
  });

  describe('Keys', () => {
    it('has all expected key constants', () => {
      expect(Keys.githubClientId).toBe('github.clientId');
      expect(Keys.githubToken).toBe('github.token');
      expect(Keys.githubUser).toBe('github.user');
      expect(Keys.explorerState).toBe('explorer.state');
      expect(Keys.aiApiKey).toBe('ai.apiKey');
    });
  });

  describe('edge cases', () => {
    it('handles corrupted JSON gracefully', () => {
      localStorage.setItem('random-web:corrupt', '{invalid json');
      expect(lsGet('corrupt')).toBeNull();
    });

    it('handles storing null', () => {
      lsSet('null-val', null);
      expect(lsGet('null-val')).toBeNull();
    });

    it('handles storing empty string', () => {
      lsSet('empty', '');
      expect(lsGet<string>('empty')).toBe('');
    });

    it('handles overwriting a value', () => {
      lsSet('overwrite', 'first');
      lsSet('overwrite', 'second');
      expect(lsGet<string>('overwrite')).toBe('second');
    });
  });
});
