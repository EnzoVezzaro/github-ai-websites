import { describe, it, expect } from 'vitest';
import {
  validateZonesTool,
  generateHTMLTool,
  generateCSSTool,
  generateJSTool,
  measureLayoutTool,
  applyThemeTool,
} from '../../src/lib/agentTools';

describe('agentTools', () => {
  describe('validateZonesTool', () => {
    it('validates HTML with all 5 zones', async () => {
      const html = `
        <div class="zone" data-zone="intro">Hello</div>
        <div class="zone" data-zone="story">Story</div>
        <div class="zone" data-zone="ideas">Ideas</div>
        <div class="zone" data-zone="media">Media</div>
        <div class="zone" data-zone="closing">Closing</div>
      `;
      const result = await validateZonesTool.execute!({ html }, '') as any;
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
      expect(result.found).toHaveLength(5);
    });

    it('detects missing zones', async () => {
      const html = `
        <div class="zone" data-zone="intro">Hello</div>
        <div class="zone" data-zone="story">Story</div>
      `;
      const result = await validateZonesTool.execute!({ html }, '') as any;
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('ideas');
      expect(result.missing).toContain('media');
      expect(result.missing).toContain('closing');
    });

    it('detects when no zones present', async () => {
      const html = '<div>No zones here</div>';
      const result = await validateZonesTool.execute!({ html }, '') as any;
      expect(result.valid).toBe(false);
      expect(result.missing).toHaveLength(5);
    });
  });

  describe('generateHTMLTool', () => {
    it('generates HTML with all 5 zones', async () => {
      const result = await generateHTMLTool.execute!(
        {
          name: 'Test Universe',
          introContent: '<h1>Intro</h1>',
          storyContent: '<p>Story</p>',
          ideasContent: '<p>Ideas</p>',
          mediaContent: '<img src="test.jpg"/>',
          closingContent: '<p>The End</p>',
        },
        ''
      ) as any;
      expect(result.html).toContain('data-zone="intro"');
      expect(result.html).toContain('data-zone="story"');
      expect(result.html).toContain('data-zone="ideas"');
      expect(result.html).toContain('data-zone="media"');
      expect(result.html).toContain('data-zone="closing"');
      expect(result.html).toContain('Test Universe');
    });

    it('includes extra elements when provided', async () => {
      const result = await generateHTMLTool.execute!(
        {
          name: 'Test',
          introContent: 'a',
          storyContent: 'b',
          ideasContent: 'c',
          mediaContent: 'd',
          closingContent: 'e',
          extraElements: '<div class="decoration">★</div>',
        },
        ''
      ) as any;
      expect(result.html).toContain('decoration');
      expect(result.html).toContain('★');
    });

    it('has valid HTML structure', async () => {
      const result = await generateHTMLTool.execute!(
        {
          name: 'Structure Test',
          introContent: 'i',
          storyContent: 's',
          ideasContent: 'id',
          mediaContent: 'm',
          closingContent: 'c',
        },
        ''
      ) as any;
      expect(result.html).toContain('<!doctype html>');
      expect(result.html).toContain('<html>');
      expect(result.html).toContain('</html>');
      expect(result.html).toContain('<body>');
      expect(result.html).toContain('</body>');
    });
  });

  describe('generateCSSTool', () => {
    it('generates CSS with theme comment', async () => {
      const result = await generateCSSTool.execute!(
        {
          theme: 'dark',
          bodyStyles: 'body{background:#000}',
          zoneStyles: '.zone{padding:1rem}',
          contentStyles: 'p{color:#fff}',
        },
        ''
      ) as any;
      expect(result.css).toContain('Theme: dark');
      expect(result.css).toContain('body{background:#000}');
      expect(result.css).toContain('.zone{padding:1rem}');
      expect(result.css).toContain('p{color:#fff}');
    });

    it('includes optional animations and custom CSS', async () => {
      const result = await generateCSSTool.execute!(
        {
          theme: 'neon-80s',
          bodyStyles: '',
          zoneStyles: '',
          contentStyles: '',
          animations: '@keyframes glow{}',
          customCSS: '.extra{color:red}',
        },
        ''
      ) as any;
      expect(result.css).toContain('@keyframes glow{}');
      expect(result.css).toContain('.extra{color:red}');
    });
  });

  describe('generateJSTool', () => {
    it('generates JS with interactivity only', async () => {
      const result = await generateJSTool.execute!(
        { interactivity: 'document.querySelector(".zone").addEventListener("click", () => {})' },
        ''
      ) as any;
      expect(result.js).toContain('addEventListener');
    });

    it('includes animations and effects when provided', async () => {
      const result = await generateJSTool.execute!(
        {
          interactivity: 'console.log("hi")',
          animations: 'window.addEventListener("scroll", () => {})',
          effects: 'document.body.style.opacity = "1"',
        },
        ''
      ) as any;
      expect(result.js).toContain('Animations');
      expect(result.js).toContain('Effects');
      expect(result.js).toContain('scroll');
      expect(result.js).toContain('opacity');
    });
  });

  describe('measureLayoutTool', () => {
    it('returns width and height', async () => {
      const result = await measureLayoutTool.execute!(
        { content: 'Hello world, this is some text' },
        ''
      ) as any;
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
      expect(result.lineCount).toBeGreaterThan(0);
    });

    it('respects maxWidth parameter', async () => {
      const result = await measureLayoutTool.execute!(
        { content: 'A very long piece of text that should wrap', maxWidth: 100 },
        ''
      ) as any;
      expect(result.width).toBe(100);
    });
  });

  describe('applyThemeTool', () => {
    const themes = ['neon-80s', 'retro-90s', 'y2k', 'bw-film', 'minimal', 'dark'];

    themes.forEach(theme => {
      it(`returns CSS for "${theme}" theme`, async () => {
        const result = await applyThemeTool.execute!({ theme }, '') as any;
        expect(result.css).toBeTruthy();
        expect(result.description).toBeTruthy();
        expect(typeof result.css).toBe('string');
        expect(result.css.length).toBeGreaterThan(50);
      });
    });

    it('falls back to dark theme for unknown theme', async () => {
      const result = await applyThemeTool.execute!({ theme: 'nonexistent' }, '') as any;
      expect(result.css).toContain('#0a0a0c');
      expect(result.description).toContain('dark');
    });

    it('all themes contain .zone styling', async () => {
      for (const theme of themes) {
        const result = await applyThemeTool.execute!({ theme }, '') as any;
        expect(result.css).toContain('.zone');
      }
    });
  });

  describe('tool schemas', () => {
    it('each tool has description and inputSchema', () => {
      const tools = [validateZonesTool, generateHTMLTool, generateCSSTool, generateJSTool, measureLayoutTool, applyThemeTool];
      tools.forEach(tool => {
        expect(tool.description).toBeTruthy();
        expect(tool.inputSchema).toBeDefined();
        expect(typeof tool.execute).toBe('function');
      });
    });
  });
});
