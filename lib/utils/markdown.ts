import { marked, Renderer, type Tokens } from 'marked';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;

  // Disallow invisible/control chars and whitespace (common obfuscation).
  if (/[\u0000-\u001F\u007F\s]/.test(trimmed)) return false;

  // Allow hash links and relative paths.
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) return true;

  // Allow common safe schemes only.
  let protocol = '';
  try {
    const url = new URL(trimmed);
    protocol = url.protocol.toLowerCase();
  } catch {
    // If it's not a valid absolute URL and it's not a relative/hash link, reject.
    return false;
  }

  return protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:' || protocol === 'tel:';
}

// Configure marked for safer rendering
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Custom renderer to add target="_blank" to external links
const renderer = new Renderer();

renderer.link = function ({ href, title, tokens }: Tokens.Link): string {
  const text = this.parser.parseInline(tokens);
  const safeHref = typeof href === 'string' && isSafeHref(href) ? href : null;
  if (!safeHref) return text;

  const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
  const isExternal = !(safeHref.startsWith('#') || safeHref.startsWith('/'));

  return `<a href="${escapeHtml(safeHref)}"${titleAttr}${
    isExternal ? ' target="_blank" rel="nofollow noopener noreferrer"' : ' rel="nofollow"'
  }>${text}</a>`;
};

renderer.image = function ({ href, title, text }: Tokens.Image): string {
  const safeSrc = typeof href === 'string' && isSafeHref(href) ? href : null;
  const alt = escapeHtml(text ?? '');
  if (!safeSrc) return alt;

  const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
  return `<img src="${escapeHtml(safeSrc)}" alt="${alt}" loading="lazy" decoding="async"${titleAttr} />`;
};

// Never render raw HTML from user-provided markdown.
renderer.html = function ({ text }: Tokens.HTML): string {
  return escapeHtml(text);
};

marked.use({ renderer });

export function renderMarkdown(content: string): string {
  return marked(content) as string;
}
