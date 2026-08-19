import { describe, it, expect, vi } from 'vitest';
import {
  loadSdkCatalog,
  loadProviders,
  listModelsForProvider,
  buildModel,
  PROVIDER_META,
} from '../../src/lib/ai';

describe('ai', () => {
  const gatewayBody = JSON.stringify({
    data: [
      { id: 'gpt-4o', owned_by: 'openai', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', owned_by: 'openai', name: 'GPT-4o mini' },
      { id: 'claude-3-5-sonnet', owned_by: 'anthropic', name: 'Claude 3.5 Sonnet' },
      { id: 'llama-3.3-70b', owned_by: 'nvidia', name: 'Llama 3.3 70B' },
      { id: 'gemini-2.5-pro', owned_by: 'google', name: 'Gemini 2.5 Pro' },
      { id: 'grok-2', owned_by: 'xai', name: 'Grok 2' },
    ],
  });

  function stubGateway(ok = true) {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok,
      json: () => Promise.resolve(JSON.parse(gatewayBody)),
    }));
  }

  describe('loadSdkCatalog / loadProviders', () => {
    it('maps the gateway registry owned_by into providers', async () => {
      stubGateway();
      const catalog = await loadSdkCatalog();
      expect(catalog).toContainEqual({ id: 'gpt-4o', provider: 'openai', name: 'GPT-4o' });
      expect(catalog).toContainEqual({ id: 'grok-2', provider: 'xai', name: 'Grok 2' });
      vi.unstubAllGlobals();
    });

    it('derives unique providers like getAvailableModels + Set', async () => {
      stubGateway();
      const providers = await loadProviders();
      expect(providers).toEqual(['anthropic', 'google', 'nvidia', 'openai', 'xai']);
      vi.unstubAllGlobals();
    });

    it('returns an empty catalog when the gateway registry is unavailable', async () => {
      stubGateway(false);
      expect(await loadSdkCatalog()).toEqual([]);
      expect(await loadProviders()).toEqual([]);
      vi.unstubAllGlobals();
    });
  });

  describe('listModelsForProvider', () => {
    it('lists cloud models from the SDK registry', async () => {
      stubGateway();
      const models = await listModelsForProvider('openai', 'key');
      expect(models).toContain('gpt-4o-mini');
      expect(models).toContain('gpt-4o');
      vi.unstubAllGlobals();
    });

    it('returns an empty list for an unknown provider', async () => {
      stubGateway();
      const models = await listModelsForProvider('unknown-provider', 'key');
      expect(models).toEqual([]);
      vi.unstubAllGlobals();
    });
  });

  describe('buildModel', () => {
    it('throws without a key for cloud providers', () => {
      expect(() => buildModel({ aiProvider: 'openai' } as any)).toThrow('AI API key not set');
      expect(() => buildModel({ aiProvider: 'gemini' } as any)).toThrow('AI API key not set');
    });

    it('builds a model for local provider without a key', () => {
      const model = buildModel({ aiProvider: 'local', aiBaseUrl: 'http://localhost:11434/v1' } as any);
      expect(model).toBeDefined();
      expect(typeof model).toBe('object');
    });

    it('builds a model for every known provider', () => {
      for (const id of Object.keys(PROVIDER_META)) {
        const model = buildModel({ aiProvider: id, aiApiKey: 'key' } as any);
        expect(model).toBeDefined();
      }
    });
  });
});
