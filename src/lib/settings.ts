import { lsGet, lsSet, lsRemove, Keys } from './storage';

export type AIProvider = string;

/** Config for the AI agent prompt builder. */
export interface AgentConfig {
  systemPrompt?: string;
  selectedSkills?: string[];
}

/** A connected/existing MCP server connection visible to the agent. */
export interface MCPConnection {
  name: string;
  enabled: boolean;
  url?: string;
}

export interface Settings {
  githubClientId?: string;
  githubToken?: string; // PAT for local demo
  githubUser?: { login: string; avatar_url: string; name?: string };
  aiProvider: AIProvider;
  aiApiKey?: string;
  aiBaseUrl?: string; // for openai-compatible
  aiModel?: string;
  agent?: AgentConfig;
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
    agent: lsGet<AgentConfig>('settings.agent') || undefined,
  };
  const meta = loadMeta();
  return { ...DEFAULTS, ...s, ...meta };
}

export function saveSettings(patch: Partial<Settings>) {
  if (patch.githubClientId !== undefined) {
    if (patch.githubClientId) lsSet(Keys.githubClientId, patch.githubClientId);
    else lsRemove(Keys.githubClientId);
  }
  if (patch.githubToken !== undefined) {
    if (patch.githubToken) lsSet(Keys.githubToken, patch.githubToken);
    else lsRemove(Keys.githubToken);
  }
  if (patch.githubUser !== undefined) {
    if (patch.githubUser) lsSet(Keys.githubUser, patch.githubUser);
    else lsRemove(Keys.githubUser);
  }
  if (patch.aiApiKey !== undefined) {
    if (patch.aiApiKey) lsSet(Keys.aiApiKey, patch.aiApiKey);
    else lsRemove(Keys.aiApiKey);
  }
  if (patch.agent !== undefined) {
    if (patch.agent) lsSet('settings.agent', patch.agent);
    else lsRemove('settings.agent');
  }
  const current = loadSettings();
  lsSet('settings.meta', { aiProvider: patch.aiProvider ?? current.aiProvider, aiModel: patch.aiModel ?? current.aiModel, aiBaseUrl: patch.aiBaseUrl ?? current.aiBaseUrl });
}

export function loadMeta() {
  return lsGet<{ aiProvider: AIProvider; aiModel: string; aiBaseUrl?: string }>('settings.meta');
}
