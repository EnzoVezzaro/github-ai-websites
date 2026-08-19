import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Preview } from '../../src/components/Preview';
import type { ProjectContent, LayoutFiles } from '../../src/types';

const makeProject = (overrides?: Partial<ProjectContent>): ProjectContent => ({
  id: 'test',
  title: 'Test Project',
  slug: 'test',
  intro: 'Welcome',
  story: 'The story',
  ideas: 'Ideas go here',
  media: '![img](test.jpg)',
  closing: 'The end',
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const makeLayout = (overrides?: Partial<LayoutFiles>): LayoutFiles => ({
  meta: {
    id: 'test-layout',
    name: 'Test Layout',
    version: '1.0',
    updatedAt: new Date().toISOString(),
  },
  html: `<!doctype html><html><head><style>{{css}}</style></head><body>
<div class="zone" data-zone="intro"><h1>{{intro}}</h1></div>
<div class="zone" data-zone="story"><p>{{story}}</p></div>
<div class="zone" data-zone="ideas"><p>{{ideas}}</p></div>
<div class="zone" data-zone="media">{{media}}</div>
<div class="zone" data-zone="closing"><p>{{closing}}</p></div>
</body></html>`,
  css: 'body{margin:0}.zone{padding:1rem}',
  ...overrides,
});

describe('Preview component', () => {
  it('renders an iframe', () => {
    render(<Preview project={makeProject()} layout={makeLayout()} />);
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
  });

  it('shows fallback when layout is null', () => {
    render(<Preview project={makeProject()} layout={null} />);
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe?.getAttribute('title')).toBe('Preview');
  });

  it('sets iframe title from layout name', () => {
    render(<Preview project={makeProject()} layout={makeLayout({ meta: { id: '1', name: 'My Layout', version: '1.0', updatedAt: '' } })} />);
    const iframe = document.querySelector('iframe');
    expect(iframe?.getAttribute('title')).toBe('My Layout');
  });

  it('injects zone engine into srcdoc', () => {
    render(<Preview project={makeProject()} layout={makeLayout()} />);
    const iframe = document.querySelector('iframe');
    const srcdoc = iframe?.getAttribute('srcdoc') || '';
    expect(srcdoc).toContain('data-zone="intro"');
    expect(srcdoc).toContain('data-zone="story"');
    expect(srcdoc).toContain('data-zone="ideas"');
    expect(srcdoc).toContain('data-zone="media"');
    expect(srcdoc).toContain('data-zone="closing"');
  });

  it('replaces content placeholders', () => {
    render(<Preview project={makeProject()} layout={makeLayout()} />);
    const iframe = document.querySelector('iframe');
    const srcdoc = iframe?.getAttribute('srcdoc') || '';
    expect(srcdoc).toContain('Welcome');
    expect(srcdoc).toContain('The story');
    expect(srcdoc).toContain('Ideas go here');
    expect(srcdoc).toContain('The end');
  });

  it('injects CSS', () => {
    render(<Preview project={makeProject()} layout={makeLayout()} />);
    const iframe = document.querySelector('iframe');
    const srcdoc = iframe?.getAttribute('srcdoc') || '';
    expect(srcdoc).toContain('body{margin:0}');
  });
});
