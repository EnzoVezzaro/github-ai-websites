import { lsGet, lsSet, Keys } from './storage';

export type AIProvider = 'openai' | 'openai-compatible' | 'anthropic';

export interface Settings {
  githubClientId?: string;
  githubToken?: string; // PAT for local demo
  githubUser?: { login: string; avatar_url: string; name?: string };
  aiProvider: AIProvider;
  aiApiKey?: string;
  aiBaseUrl?: string; // for openai-compatible
  aiModel?: string;
}

const DEFAULTS: Settings = {
  aiProvider: 'openai-compatible',
  aiModel: 'gpt-4o-mini',
};

export function loadSettings(): Settings {
  const s = {
    githubClientId: lsGet<string>(Keys.githubClientId) || import.meta.env.VITE_GITHUB_CLIENT_ID || undefined,
    githubToken: lsGet<string>(Keys.githubToken) || undefined,
    githubUser: lsGet<any>(Keys.githubUser) || undefined,
    aiApiKey: lsGet<string>(Keys.aiApiKey) || undefined,
  };
  return { ...DEFAULTS, ...s };
}

export function saveSettings(patch: Partial<Settings>) {
  if (patch.githubClientId !== undefined) lsSet(Keys.githubClientId, patch.githubClientId);
  if (patch.githubToken !== undefined) lsSet(Keys.githubToken, patch.githubToken);
  if (patch.githubUser !== undefined) lsSet(Keys.githubUser, patch.githubUser);
  if (patch.aiApiKey !== undefined) lsSet(Keys.aiApiKey, patch.aiApiKey);
  const current = loadSettings();
  lsSet('settings.meta', { aiProvider: patch.aiProvider ?? current.aiProvider, aiModel: patch.aiModel ?? current.aiModel, aiBaseUrl: patch.aiBaseUrl ?? current.aiBaseUrl });
}

export function loadMeta() {
  return lsGet<{ aiProvider: AIProvider; aiModel: string; aiBaseUrl?: string }>('settings.meta');
}
