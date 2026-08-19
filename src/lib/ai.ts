import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { loadSettings } from './settings';

export type AIProviderMethod = 'providers' | 'local';

export const LOCAL_DEFAULT_BASE_URL = 'http://localhost:11434/v1';

/** Labels / endpoints / defaults for cloud providers (used by buildModel + live fetch). */
export const PROVIDER_META: Record<string, { label: string; baseUrl: string; needsKey: boolean; defaultModel: string }> = {
  openai: { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', needsKey: true, defaultModel: 'gpt-4o-mini' },
  anthropic: { label: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1', needsKey: true, defaultModel: 'claude-3-5-sonnet-20241022' },
  'openai-compatible': { label: 'OpenAI Compatible', baseUrl: 'https://api.openai.com/v1', needsKey: true, defaultModel: 'gpt-4o-mini' },
  openrouter: { label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', needsKey: true, defaultModel: 'openai/gpt-4o-mini' },
  nvidia: { label: 'NVIDIA NIM', baseUrl: 'https://integrate.api.nvidia.com/v1', needsKey: true, defaultModel: 'meta/llama-3.3-70b-instruct' },
  gemini: { label: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', needsKey: true, defaultModel: 'gemini-2.5-pro' },
  google: { label: 'Google', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', needsKey: true, defaultModel: 'gemini-2.5-pro' },
  mistral: { label: 'Mistral', baseUrl: 'https://api.mistral.ai/v1', needsKey: true, defaultModel: 'mistral-large-latest' },
  xai: { label: 'xAI', baseUrl: 'https://api.x.ai/v1', needsKey: true, defaultModel: 'grok-2' },
  deepseek: { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', needsKey: true, defaultModel: 'deepseek-chat' },
  groq: { label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', needsKey: true, defaultModel: 'llama-3.3-70b-versatile' },
};

export interface SDKModelInfo {
  id: string;
  provider: string;
  name: string;
}

/** Public AI Gateway model registry (same source as the SDK's getAvailableModels). */
const GATEWAY_MODELS_URL = 'https://ai-gateway.vercel.sh/v1/models';

/**
 * Load the model catalog dynamically from the AI Gateway registry.
 * `owned_by` is the provider slug. Returns an empty list when unavailable —
 * nothing is hardcoded.
 */
export async function loadSdkCatalog(): Promise<SDKModelInfo[]> {
  try {
    const mod = (await import('@ai-sdk/gateway')) as {
      getAvailableModels?: () => Promise<{
        models?: Array<{
          id?: string;
          name?: string;
          provider?: string;
          specification?: { provider?: string; modelId?: string };
        }>;
      }>;
    };
    if (typeof mod.getAvailableModels === 'function') {
      const res = await mod.getAvailableModels();
      const models = (res.models ?? [])
        .map(m => ({
          id: m.id ?? m.specification?.modelId ?? '',
          provider: m.provider ?? m.specification?.provider ?? '',
          name: m.name ?? m.id ?? '',
        }))
        .filter(m => m.id && m.provider);
      if (models.length) return models;
    }
  } catch {
    // gateway client unavailable — try the public registry below
  }

  try {
    const res = await fetch(GATEWAY_MODELS_URL);
    if (res.ok) {
      const data = (await res.json()) as {
        data?: Array<{ id?: string; name?: string; owned_by?: string }>;
      };
      return (data.data ?? [])
        .map(m => ({ id: m.id ?? '', provider: m.owned_by ?? '', name: m.name ?? m.id ?? '' }))
        .filter(m => m.id && m.provider);
    }
  } catch {
    // offline — no catalog available
  }

  return [];
}

/** Unique provider slugs from the registry (like `getAvailableModels` + Set). */
export async function loadProviders(): Promise<string[]> {
  const catalog = await loadSdkCatalog();
  return [...new Set(catalog.map(m => m.provider))].sort();
}

/**
 * List models for a provider. Local models are fetched live from the base
 * URL; cloud providers are filtered from the SDK registry with a live
 * `/models` fallback.
 */
export async function listModelsForProvider(provider: string, apiKey: string, localBaseUrl?: string): Promise<string[]> {
  if (provider === 'local') {
    const baseUrl = localBaseUrl || LOCAL_DEFAULT_BASE_URL;
    const headers: HeadersInit = { Accept: 'application/json' };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    try {
      const res = await fetch(`${baseUrl.replace(/\/$/, '')}/models`, { headers });
      if (res.ok === false) throw new Error(`models fetch failed ${res.status}`);
      const data = (await res.json()) as { data?: Array<{ id: string }> };
      const ids = (data.data ?? []).map(m => m.id).filter(Boolean);
      if (ids.length) return ids;
    } catch {
      // fall back to a local catalog
      return ['llama3.2', 'llama3.1', 'mistral', 'gemma2', 'qwen2.5'];
    }
  }

  const catalog = await loadSdkCatalog();
  const fromRegistry = catalog.filter(m => m.provider === provider).map(m => m.id);
  if (fromRegistry.length) return fromRegistry;

  const meta = PROVIDER_META[provider];
  if (meta) {
    const headers: HeadersInit = { Accept: 'application/json' };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    try {
      const res = await fetch(`${meta.baseUrl.replace(/\/$/, '')}/models`, { headers });
      if (res.ok === false) throw new Error(`models fetch failed ${res.status}`);
      const data = (await res.json()) as { data?: Array<{ id: string }> };
      const ids = (data.data ?? []).map(m => m.id).filter(Boolean);
      if (ids.length) return ids;
    } catch {
      // fall through
    }
  }

  return [];
}

/** Build an AI SDK v5 model instance from the current settings. */
export function buildModel(settings = loadSettings()): any {
  const apiKey = settings.aiApiKey || '';
  const isLocal = settings.aiProvider === 'local';
  if (!apiKey && !isLocal) throw new Error('AI API key not set');

  switch (settings.aiProvider) {
    case 'openai':
      return createOpenAI({ apiKey })(settings.aiModel || 'gpt-4o-mini');
    case 'anthropic':
      return createAnthropic({ apiKey })(settings.aiModel || 'claude-3-5-sonnet-20241022');
    default: {
      const meta = PROVIDER_META[settings.aiProvider];
      return createOpenAICompatible({
        name: 'openai-compatible',
        baseURL: settings.aiBaseUrl || (isLocal ? LOCAL_DEFAULT_BASE_URL : meta?.baseUrl || 'https://api.openai.com/v1'),
        apiKey: apiKey || undefined,
      })(settings.aiModel || meta?.defaultModel || 'gpt-4o-mini');
    }
  }
}

export interface GeneratedTheme {
  name: string;
  description?: string;
  accent: string;
  cardBackground: string;
  cardBorder: string;
  radius: number;
  glow: string;
}

/**
 * Generate a spatial theme with AI based on a website URL or a free-form
 * description. Uses the provider configured in settings (AI SDK v5).
 */
export async function generateThemeWithAI(prompt: string): Promise<GeneratedTheme> {
  const { text } = await generateText({
    model: buildModel(),
    prompt: `You are a spatial UI theme designer. Based on the user's description, design a theme for a spatial canvas (cards, drag handles, connections).

User: ${prompt}

Return ONLY a JSON object with these fields (no other text):
{
  "name": "short theme name",
  "description": "one sentence about the mood",
  "accent": "hex color for highlights",
  "cardBackground": "css background color for cards (can use rgba)",
  "cardBorder": "css border color (can use rgba)",
  "radius": "number in px for card corner radius (0-28)",
  "glow": "rgba glow color for shadows"
}`,
  });

  const parsed = JSON.parse(text.trim());
  return {
    name: String(parsed.name ?? 'AI Theme'),
    description: parsed.description ? String(parsed.description) : undefined,
    accent: String(parsed.accent ?? '#58a6ff'),
    cardBackground: String(parsed.cardBackground ?? 'rgba(13,17,23,0.85)'),
    cardBorder: String(parsed.cardBorder ?? 'rgba(88,166,255,0.25)'),
    radius: Number(parsed.radius ?? 12),
    glow: String(parsed.glow ?? 'rgba(88,166,255,0.12)'),
  };
}

export async function suggestContent(prompt: string, slot: string) {
  const { text } = await generateText({
    model: buildModel(),
    prompt: `Improve the "${slot}" section for a collaborative web experiment. Keep it concise and markdown-friendly.\n\nOriginal:\n${prompt}\n\nSuggestion:`,
  });
  return text;
}
