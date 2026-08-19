import { describe, it, expect } from 'vitest';
import {
  validateUniverseHTML,
  validateUniverseMeta,
  validateUniverse,
  validateUniverseFile,
} from '../../scripts/validate-universe';

describe('validate-universe', () => {
  const VALID_HTML = `<!doctype html>
<html><head><style>.zone{}</style></head>
<body>
<div class="zone" data-zone="intro"><p>Intro content</p></div>
<div class="zone" data-zone="story"><p>Story content</p></div>
<div class="zone" data-zone="ideas"><p>Ideas content</p></div>
<div class="zone" data-zone="media"><img src="test.jpg"/></div>
<div class="zone" data-zone="closing"><p>Closing content</p></div>
</body></html>`;

  describe('validateUniverseHTML', () => {
    it('returns no errors for valid HTML', () => {
      const errors = validateUniverseHTML(VALID_HTML, 'test.html');
      expect(errors).toHaveLength(0);
    });

    it('detects missing zone containers', () => {
      const html = '<div class="zone" data-zone="intro">Hi</div>';
      const errors = validateUniverseHTML(html, 'test.html');
      expect(errors.length).toBeGreaterThan(0);
      const missing = errors.map(e => e.zone);
      expect(missing).toContain('story');
      expect(missing).toContain('ideas');
      expect(missing).toContain('media');
      expect(missing).toContain('closing');
    });

    it('detects duplicate zones', () => {
      const html = VALID_HTML.replace(
        'data-zone="intro"',
        'data-zone="intro"\n<div class="zone" data-zone="intro">Duplicate</div>'
      );
      const errors = validateUniverseHTML(html, 'test.html');
      const dupes = errors.filter(e => e.message.includes('appears'));
      expect(dupes.length).toBeGreaterThan(0);
    });

    it('detects missing DOCTYPE', () => {
      const html = '<html><body><div class="zone" data-zone="intro">A</div><div class="zone" data-zone="story">B</div><div class="zone" data-zone="ideas">C</div><div class="zone" data-zone="media">D</div><div class="zone" data-zone="closing">E</div></body></html>';
      const errors = validateUniverseHTML(html, 'test.html');
      expect(errors.some(e => e.message.includes('doctype'))).toBe(true);
    });

    it('detects missing html tags', () => {
      const html = '<!doctype html><body><div class="zone" data-zone="intro">A</div><div class="zone" data-zone="story">B</div><div class="zone" data-zone="ideas">C</div><div class="zone" data-zone="media">D</div><div class="zone" data-zone="closing">E</div></body>';
      const errors = validateUniverseHTML(html, 'test.html');
      expect(errors.some(e => e.message.includes('<html>'))).toBe(true);
    });

    it('detects missing body tags', () => {
      const html = '<!doctype html><html><head></head></html>';
      const errors = validateUniverseHTML(html, 'test.html');
      expect(errors.some(e => e.message.includes('<body>'))).toBe(true);
    });
  });

  describe('validateUniverseMeta', () => {
    const validMeta = { id: 'test', name: 'Test', version: '1.0' };

    it('returns no errors for valid meta', () => {
      expect(validateUniverseMeta(validMeta, 'test.json')).toHaveLength(0);
    });

    it('detects missing id', () => {
      const errors = validateUniverseMeta({ name: 'Test', version: '1.0' }, 'test.json');
      expect(errors.some(e => e.message.includes('meta.id'))).toBe(true);
    });

    it('detects missing name', () => {
      const errors = validateUniverseMeta({ id: 'test', version: '1.0' }, 'test.json');
      expect(errors.some(e => e.message.includes('meta.name'))).toBe(true);
    });

    it('detects missing version', () => {
      const errors = validateUniverseMeta({ id: 'test', name: 'Test' }, 'test.json');
      expect(errors.some(e => e.message.includes('meta.version'))).toBe(true);
    });

    it('detects null/undefined meta', () => {
      expect(validateUniverseMeta(null, 'test.json').length).toBeGreaterThan(0);
      expect(validateUniverseMeta(undefined, 'test.json').length).toBeGreaterThan(0);
    });
  });

  describe('validateUniverse', () => {
    const validUniverse = {
      meta: { id: 'test', name: 'Test', version: '1.0' },
      html: VALID_HTML,
      css: 'body{margin:0}',
    };

    it('returns no errors for valid universe', () => {
      expect(validateUniverse(validUniverse, 'test.json')).toHaveLength(0);
    });

    it('detects missing meta', () => {
      const errors = validateUniverse({ html: VALID_HTML, css: 'a{}' }, 'test.json');
      expect(errors.some(e => e.message.includes('meta'))).toBe(true);
    });

    it('detects missing html', () => {
      const errors = validateUniverse({ meta: validUniverse.meta, css: 'a{}' }, 'test.json');
      expect(errors.some(e => e.message.includes('html'))).toBe(true);
    });

    it('detects missing css', () => {
      const errors = validateUniverse({ meta: validUniverse.meta, html: VALID_HTML }, 'test.json');
      expect(errors.some(e => e.message.includes('css'))).toBe(true);
    });
  });

  describe('validateUniverseFile', () => {
    it('validates valid JSON', () => {
      const content = JSON.stringify({
        meta: { id: 'test', name: 'Test', version: '1.0' },
        html: VALID_HTML,
        css: 'body{}',
      });
      expect(validateUniverseFile(content, 'test.json')).toHaveLength(0);
    });

    it('returns error for invalid JSON', () => {
      const errors = validateUniverseFile('not json', 'test.json');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Invalid JSON');
    });

    it('validates JSON with zone errors', () => {
      const content = JSON.stringify({
        meta: { id: 'test', name: 'Test', version: '1.0' },
        html: '<html><body><div data-zone="intro">X</div></body></html>',
        css: 'body{}',
      });
      const errors = validateUniverseFile(content, 'test.json');
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
