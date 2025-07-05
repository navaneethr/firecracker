import * as React from "react";

export function CopyIcon({ copied }: { copied?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={copied ? "stroke-green-500" : "stroke-muted-foreground"}
      style={{ display: 'block' }}
    >
      <rect x="6" y="6" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" fill={copied ? '#22c55e' : 'none'} />
      <rect x="3" y="3" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M9 9H12V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
