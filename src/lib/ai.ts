import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createAnthropic } from '@ai-sdk/anthropic';
import { loadSettings } from './settings';

type AIProvider = 'openai' | 'openai-compatible' | 'anthropic';

export async function suggestContent(prompt: string, slot: string) {
  const settings = loadSettings();
  const apiKey = settings.aiApiKey;
  if (!apiKey) throw new Error('AI API key not set');

  const provider = settings.aiProvider as AIProvider;
  let model: any;
  switch (provider) {
    case 'openai':
      const openai = createOpenAI({ apiKey });
      model = openai(settings.aiModel || 'gpt-4o-mini');
      break;
    case 'openai-compatible':
      const compat = createOpenAICompatible({
        name: 'openai-compatible',
        baseURL: settings.aiBaseUrl || 'https://api.openai.com/v1',
        apiKey,
      });
      model = compat(settings.aiModel || 'gpt-4o-mini');
      break;
    case 'anthropic':
      const anth = createAnthropic({ apiKey });
      model = anth(settings.aiModel || 'claude-3-5-sonnet-20241022');
      break;
    default:
      throw new Error('Unknown AI provider');
  }

  const { text } = await generateText({
    model,
    prompt: `Improve the "${slot}" section for a collaborative web experiment. Keep it concise and markdown-friendly.\n\nOriginal:\n${prompt}\n\nSuggestion:`,
  });
  return text;
}
