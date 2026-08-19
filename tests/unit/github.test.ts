import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getGitHubToken, logoutGitHub } from '../../src/lib/github';
import { lsSet } from '../../src/lib/storage';

describe('github', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getGitHubToken', () => {
    it('returns null when no token stored', () => {
      expect(getGitHubToken()).toBeNull();
    });

    it('returns stored token', () => {
      lsSet('github.token', 'ghp_test123');
      expect(getGitHubToken()).toBe('ghp_test123');
    });
  });

  describe('logoutGitHub', () => {
    it('removes token and user from storage', () => {
      lsSet('github.token', 'ghp_test');
      lsSet('github.user', { login: 'test', avatar_url: 'url' });
      logoutGitHub();
      expect(getGitHubToken()).toBeNull();
    });
  });

  describe('githubFetch', () => {
    it('makes fetch call to GitHub API', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ content: 'test' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const { githubFetch } = await import('../../src/lib/github');
      const result = await githubFetch('test/path', 'token123');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('api.github.com'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token123',
          }),
        })
      );
      expect(result).toEqual({ content: 'test' });

      vi.unstubAllGlobals();
    });
  });

  describe('fetchGitHubUser', () => {
    it('returns user data on success', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ login: 'testuser', avatar_url: 'avatar.png', name: 'Test' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const { fetchGitHubUser } = await import('../../src/lib/github');
      const user = await fetchGitHubUser('token');
      expect(user).toEqual({ login: 'testuser', avatar_url: 'avatar.png', name: 'Test' });

      vi.unstubAllGlobals();
    });

    it('returns null on failure', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', mockFetch);

      const { fetchGitHubUser } = await import('../../src/lib/github');
      const user = await fetchGitHubUser('token');
      expect(user).toBeNull();

      vi.unstubAllGlobals();
    });
  });
});
