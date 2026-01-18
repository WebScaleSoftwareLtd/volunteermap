import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & {
  title?: string;
};

export function MagnifyingGlassIcon({ title = 'Search', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : 'presentation'}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function ClipboardListIcon({ title = 'List', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : 'presentation'}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d="M9 5h6" />
      <path d="M9 3h6a2 2 0 012 2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2z" />
      <path d="M9 9h6" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </svg>
  );
}

export function PlusIcon({ title = 'Add', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : 'presentation'}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function XIcon({ title = 'Close', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : 'presentation'}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export function BookmarkIcon({ title = 'Bookmark', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : 'presentation'}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d="M7 3h10a2 2 0 012 2v16l-7-4-7 4V5a2 2 0 012-2z" />
    </svg>
  );
}

export function GlobeIcon({ title = 'Globe', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : 'presentation'}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15 15 0 010 20" />
      <path d="M12 2a15 15 0 000 20" />
    </svg>
  );
}

export function CogIcon({ title = 'Settings', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : 'presentation'}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d="M12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
      <path d="M19.4 15a7.97 7.97 0 00.1-1 7.97 7.97 0 00-.1-1l2-1.6-2-3.5-2.4 1a8.2 8.2 0 00-1.7-1l-.4-2.6H10l-.4 2.6a8.2 8.2 0 00-1.7 1l-2.4-1-2 3.5 2 1.6a7.97 7.97 0 00-.1 1 7.97 7.97 0 00.1 1l-2 1.6 2 3.5 2.4-1a8.2 8.2 0 001.7 1l.4 2.6h4l.4-2.6a8.2 8.2 0 001.7-1l2.4 1 2-3.5-2-1.6z" />
    </svg>
  );
}

