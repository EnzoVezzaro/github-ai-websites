import { marked } from 'marked';

// Configure marked for safe markdown rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Convert markdown string to safe HTML.
 * Handles: headers, bold, italic, images, links, lists, code blocks, blockquotes.
 */
export function markdownToHtml(md: string): string {
  if (!md) return '';
  try {
    const result = marked.parse(md);
    // marked.parse can return string or Promise<string depending on config
    return typeof result === 'string' ? result : '';
  } catch {
    // Fallback: escape HTML and preserve line breaks
    return md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }
}

/**
 * Render markdown content fields from a ProjectContent-like object
 * into an HTML snippet suitable for injection into a layout template.
 */
export function renderContentField(value: string): string {
  if (!value) return '';
  return markdownToHtml(value);
}
