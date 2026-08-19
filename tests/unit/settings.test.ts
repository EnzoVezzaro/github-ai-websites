import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadSettings,
  saveSettings,
  loadMeta,
} from '../../src/lib/settings';
import { lsSet, lsGet } from '../../src/lib/storage';

describe('settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadSettings', () => {
    it('returns defaults when no stored settings exist', () => {
      const s = loadSettings();
      expect(s.aiProvider).toBe('openai-compatible');
      expect(s.aiModel).toBe('gpt-4o-mini');
      expect(s.githubToken).toBeUndefined();
      expect(s.aiApiKey).toBeUndefined();
    });

    it('merges persisted meta with defaults', () => {
      lsSet('settings.meta', { aiProvider: 'local', aiModel: 'llama3.2' });
      const s = loadSettings();
      expect(s.aiProvider).toBe('local');
      expect(s.aiModel).toBe('llama3.2');
    });

    it('loads github token from individual key', () => {
      lsSet('github.token', 'ghp_test123');
      const s = loadSettings();
      expect(s.githubToken).toBe('ghp_test123');
    });

    it('loads ai api key from individual key', () => {
      lsSet('ai.apiKey', 'sk-test');
      const s = loadSettings();
      expect(s.aiApiKey).toBe('sk-test');
    });
  });

  describe('saveSettings', () => {
    it('persists provider settings', () => {
      saveSettings({ aiProvider: 'local', aiModel: 'qwen2.5' });
      const s = loadSettings();
      expect(s.aiProvider).toBe('local');
      expect(s.aiModel).toBe('qwen2.5');
    });

    it('persists ai base url', () => {
      saveSettings({ aiBaseUrl: 'http://localhost:8080' });
      const s = loadSettings();
      expect(s.aiBaseUrl).toBe('http://localhost:8080');
    });

    it('persists github token and api key', () => {
      saveSettings({ githubToken: 'ghp_test123', aiApiKey: 'sk-test' });
      const s = loadSettings();
      expect(s.githubToken).toBe('ghp_test123');
      expect(s.aiApiKey).toBe('sk-test');
    });

    it('removes github token when falsy value passed', () => {
      lsSet('github.token', 'old-token');
      saveSettings({ githubToken: '' });
      expect(lsGet('github.token')).toBeNull();
    });

    it('removes ai api key when falsy value passed', () => {
      lsSet('ai.apiKey', 'old-key');
      saveSettings({ aiApiKey: '' });
      expect(lsGet('ai.apiKey')).toBeNull();
    });
  });

  describe('loadMeta', () => {
    it('returns null when no meta stored', () => {
      expect(loadMeta()).toBeNull();
    });

    it('returns stored meta', () => {
      lsSet('settings.meta', { aiProvider: 'openai', aiModel: 'gpt-4o' });
      const meta = loadMeta();
      expect(meta?.aiProvider).toBe('openai');
      expect(meta?.aiModel).toBe('gpt-4o');
    });
  });
});
