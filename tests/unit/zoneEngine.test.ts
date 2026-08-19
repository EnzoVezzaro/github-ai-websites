import { describe, it, expect } from 'vitest';
import { injectZoneEngine, ZONE_ENGINE_SCRIPT } from '../../src/lib/zoneEngine';

describe('zoneEngine', () => {
  describe('ZONE_ENGINE_SCRIPT', () => {
    it('is a non-empty string', () => {
      expect(ZONE_ENGINE_SCRIPT).toBeTruthy();
      expect(typeof ZONE_ENGINE_SCRIPT).toBe('string');
    });

    it('contains interactjs CDN reference', () => {
      expect(ZONE_ENGINE_SCRIPT).toContain('interactjs');
      expect(ZONE_ENGINE_SCRIPT).toContain('cdn.jsdelivr.net');
    });

    it('contains ZoneEngine API', () => {
      expect(ZONE_ENGINE_SCRIPT).toContain('window.ZoneEngine');
      expect(ZONE_ENGINE_SCRIPT).toContain('makeDraggable');
      expect(ZONE_ENGINE_SCRIPT).toContain('makeResizable');
      expect(ZONE_ENGINE_SCRIPT).toContain('protectZones');
      expect(ZONE_ENGINE_SCRIPT).toContain('snapToOriginal');
    });

    it('protects zones from removal', () => {
      expect(ZONE_ENGINE_SCRIPT).toContain('protectZones');
      expect(ZONE_ENGINE_SCRIPT).toContain('Cannot remove protected zone');
    });
  });

  describe('injectZoneEngine', () => {
    it('injects script before </body>', () => {
      const html = '<html><body><div class="zone"></div></body></html>';
      const result = injectZoneEngine(html);
      expect(result).toContain(ZONE_ENGINE_SCRIPT);
      expect(result).toContain('</body>');
      expect(result.indexOf(ZONE_ENGINE_SCRIPT)).toBeLessThan(result.indexOf('</body>'));
    });

    it('appends script when no </body> tag', () => {
      const html = '<div class="zone"></div>';
      const result = injectZoneEngine(html);
      expect(result).toContain(ZONE_ENGINE_SCRIPT);
      expect(result).toContain(ZONE_ENGINE_SCRIPT);
    });

    it('includes custom JS when provided', () => {
      const html = '<html><body></body></html>';
      const customJs = 'console.log("custom")';
      const result = injectZoneEngine(html, customJs);
      expect(result).toContain(customJs);
      expect(result).toContain('<script>');
    });

    it('does not add custom JS section when empty string', () => {
      const html = '<html><body></body></html>';
      const result = injectZoneEngine(html, '');
      const scriptCount = (result.match(/<script>/g) || []).length;
      expect(scriptCount).toBe(1);
    });

    it('does not add custom JS section when whitespace only', () => {
      const html = '<html><body></body></html>';
      const result = injectZoneEngine(html, '   ');
      const scriptCount = (result.match(/<script>/g) || []).length;
      expect(scriptCount).toBe(1);
    });

    it('preserves original HTML structure', () => {
      const html = '<!doctype html><html><head><style>.a{}</style></head><body><div class="zone">content</div></body></html>';
      const result = injectZoneEngine(html);
      expect(result).toContain('.a{}');
      expect(result).toContain('content');
      expect(result).toContain('<style>');
    });
  });
});
