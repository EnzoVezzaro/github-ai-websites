import { describe, it, expect } from 'vitest';
import { measureTextHeight, calculateZoneSize } from '../../src/lib/pretext';

describe('pretext', () => {
  describe('measureTextHeight', () => {
    it('returns height and lineCount', () => {
      const result = measureTextHeight('Hello world', 200);
      expect(result.height).toBeGreaterThan(0);
      expect(result.lineCount).toBeGreaterThan(0);
    });

    it('longer text produces more lines', () => {
      const short = measureTextHeight('Hi', 200);
      const long = measureTextHeight('This is a much longer piece of text that should wrap across multiple lines', 200);
      expect(long.lineCount).toBeGreaterThanOrEqual(short.lineCount);
    });

    it('wider max width produces fewer lines', () => {
      const text = 'This is some sample text for testing line wrapping behavior';
      const narrow = measureTextHeight(text, 100);
      const wide = measureTextHeight(text, 500);
      expect(wide.lineCount).toBeLessThanOrEqual(narrow.lineCount);
    });

    it('returns minimum 1 line for non-empty text', () => {
      const result = measureTextHeight('x', 1000);
      expect(result.lineCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateZoneSize', () => {
    it('returns width and height above minimums', () => {
      const result = calculateZoneSize('Hello world');
      expect(result.width).toBeGreaterThanOrEqual(80);
      expect(result.height).toBeGreaterThanOrEqual(40);
    });

    it('respects minWidth and minHeight', () => {
      const result = calculateZoneSize('', { minWidth: 200, minHeight: 100 });
      expect(result.width).toBeGreaterThanOrEqual(200);
      expect(result.height).toBeGreaterThanOrEqual(100);
    });

    it('includes padding in height', () => {
      const result = calculateZoneSize('Test', { paddingY: 50 });
      expect(result.height).toBeGreaterThanOrEqual(50);
    });

    it('uses maxWidth as width', () => {
      const result = calculateZoneSize('Test', { maxWidth: 300 });
      expect(result.width).toBe(300);
    });

    it('handles empty content', () => {
      const result = calculateZoneSize('');
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });
  });
});
