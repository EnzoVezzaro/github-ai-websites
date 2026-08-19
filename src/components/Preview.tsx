import type { ProjectContent, LayoutFiles } from '../types';
import { useMemo } from 'react';
import { injectZoneEngine, markZonePanels } from '../lib/zoneEngine';

export function Preview({ project, layout }: { project: ProjectContent; layout: LayoutFiles | null; editMode?: boolean }) {
  const htmlContent = useMemo(() => {
    if (!layout) return '';
    let html = layout.html;
    let css = layout.css;

    let mediaHtml = project.media;
    const imgMatch = project.media.match(/!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      mediaHtml = `<img src="${imgMatch[2]}" alt="${imgMatch[1]}" />`;
    }

    html = html
      .replace(/{{intro}}/g, project.intro)
      .replace(/{{story}}/g, project.story)
      .replace(/{{ideas}}/g, project.ideas)
      .replace(/{{media}}/g, mediaHtml)
      .replace(/{{closing}}/g, project.closing)
      .replace(/{{css}}/g, css);

    // The universe's own content panels become movable `.zone` containers.
    html = markZonePanels(html, layout.meta.id);
    return injectZoneEngine(html);
  }, [project, layout]);

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <iframe
        srcDoc={htmlContent}
        title={layout?.meta.name ?? 'Preview'}
        className="w-full h-full border-0 bg-black"
        sandbox="allow-scripts"
      />
    </div>
  );
}
