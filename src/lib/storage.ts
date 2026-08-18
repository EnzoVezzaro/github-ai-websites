const LS_PREFIX = 'random-web:';

export function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function lsSet<T>(key: string, value: T) {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  } catch {}
}

export function lsRemove(key: string) {
  try {
    localStorage.removeItem(LS_PREFIX + key);
  } catch {}
}

export const Keys = {
  githubClientId: 'github.clientId',
  githubToken: 'github.token',
  githubUser: 'github.user',
  explorerState: 'explorer.state',
  aiApiKey: 'ai.apiKey',
} as const;