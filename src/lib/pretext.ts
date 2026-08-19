/**
 * Pretext helpers for the AI agent.
 *
 * Provides text measurement and layout utilities using @chenglou/pretext
 * so the AI can calculate element sizing before rendering universes.
 */

// @chenglou/pretext — pure text measurement without DOM
let _prepare: ((text: string, font: string) => unknown) | null = null;
let _layout: ((prepared: unknown, maxWidth: number, lineHeight: number) => { height: number; lineCount: number }) | null = null;

try {
  const mod = await import('@chenglou/pretext');
  _prepare = mod.prepare as (text: string, font: string) => unknown;
  _layout = mod.layout as (prepared: unknown, maxWidth: number, lineHeight: number) => { height: number; lineCount: number };
} catch (e) {
  console.warn('[pretext] @chenglou/pretext not available:', e);
}

/** Fallback estimate used when the canvas-backed lib is unavailable (SSR/jsdom). */
function estimate(text: string, maxWidth: number, lineHeight: number): { height: number; lineCount: number } {
  const charsPerLine = Math.floor(maxWidth / 8);
  const lineCount = Math.ceil(text.length / Math.max(charsPerLine, 1));
  return { height: lineCount * lineHeight, lineCount };
}

/**
 * Measure text height without touching the DOM.
 * Uses @chenglou/pretext when a canvas is available; otherwise falls back
 * to a deterministic estimate.
 */
export function measureTextHeight(text: string, maxWidth: number, lineHeight: number = 20, font: string = '16px system-ui'): { height: number; lineCount: number } {
  if (_prepare && _layout) {
    try {
      const prepared = _prepare(text, font) as any;
      if (prepared) return _layout(prepared, maxWidth, lineHeight);
    } catch {
      // fall through to the estimate (e.g. no canvas in this environment)
    }
  }
  return estimate(text, maxWidth, lineHeight);
}

/**
 * Calculate optimal zone dimensions for content.
 * AI agent can call this to determine how big a container should be
 * before placing it in the layout.
 */
export function calculateZoneSize(
  content: string,
  options: {
    maxWidth?: number;
    lineHeight?: number;
    font?: string;
    paddingX?: number;
    paddingY?: number;
    minWidth?: number;
    minHeight?: number;
  } = {}
): { width: number; height: number } {
  const {
    maxWidth = 400,
    lineHeight = 20,
    font = '16px system-ui',
    paddingX = 32,
    paddingY = 32,
    minWidth = 80,
    minHeight = 40,
  } = options;

  const { height } = measureTextHeight(content, maxWidth - paddingX, lineHeight, font);
  return {
    width: Math.max(minWidth, maxWidth),
    height: Math.max(minHeight, height + paddingY),
  };
}
