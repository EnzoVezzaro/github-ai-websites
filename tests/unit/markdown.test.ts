import { describe, it, expect } from 'vitest';
import { markdownToHtml, renderContentField } from '../../src/lib/markdown';

describe('markdown', () => {
  describe('markdownToHtml', () => {
    it('converts bold text', () => {
      expect(markdownToHtml('**bold**')).toContain('<strong>bold</strong>');
    });

    it('converts italic text', () => {
      expect(markdownToHtml('*italic*')).toContain('<em>italic</em>');
    });

    it('converts headers', () => {
      expect(markdownToHtml('# Title')).toContain('<h1');
    });

    it('converts links', () => {
      expect(markdownToHtml('[link](https://example.com)')).toContain('href="https://example.com"');
    });

    it('converts images', () => {
      expect(markdownToHtml('![alt](img.jpg)')).toContain('<img');
      expect(markdownToHtml('![alt](img.jpg)')).toContain('src="img.jpg"');
    });

    it('converts unordered lists', () => {
      const html = markdownToHtml('- item 1\n- item 2');
      expect(html).toContain('<li');
    });

    it('converts inline code', () => {
      expect(markdownToHtml('`code`')).toContain('<code');
    });

    it('returns empty string for empty input', () => {
      expect(markdownToHtml('')).toBe('');
    });

    it('handles plain text', () => {
      expect(markdownToHtml('hello world')).toContain('hello world');
    });

    it('converts blockquotes', () => {
      expect(markdownToHtml('> quote')).toContain('<blockquote');
    });
  });

  describe('renderContentField', () => {
    it('converts markdown to HTML', () => {
      const result = renderContentField('**bold text**');
      expect(result).toContain('<strong>bold text</strong>');
    });

    it('returns empty string for falsy input', () => {
      expect(renderContentField('')).toBe('');
    });

    it('handles complex markdown', () => {
      const md = '## Title\n\nParagraph with **bold** and *italic*.\n\n- List item';
      const html = renderContentField(md);
      expect(html).toContain('Title');
      expect(html).toContain('bold');
      expect(html).toContain('italic');
    });
  });
});
