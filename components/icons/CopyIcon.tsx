import * as React from "react";

export function CopyIcon({ copied }: { copied?: boolean }) {
  // Use currentColor for stroke, set color via parent className
  return copied ? (
    <svg className="text-black dark:text-[hsl(var(--primary))]" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 10.5L9 13.5L14 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg className="text-black dark:text-[hsl(var(--primary))]" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="7" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
