import { marked, Renderer, type Tokens } from 'marked';

// Configure marked for safe rendering
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Custom renderer to add target="_blank" to external links
const renderer = new Renderer();

renderer.link = function ({ href, title, tokens }: Tokens.Link): string {
  const text = this.parser.parseInline(tokens);
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}"${titleAttr} target="_blank" rel="nofollow noopener">${text}</a>`;
};

marked.use({ renderer });

export function renderMarkdown(content: string): string {
  // Sanitize by escaping potentially dangerous HTML
  const sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/on\w+\s*=/gi, '');

  return marked(sanitized) as string;
}
