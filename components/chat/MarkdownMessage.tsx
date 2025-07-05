"use client"

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

interface MarkdownMessageProps {
  content: string;
}

export default function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
              <SyntaxHighlighter
                style={atomOneDark}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  borderRadius: 8,
                  fontSize: 13,
                  margin: 0,
                  background: '#23272e',
                  color: '#fff',
                  padding: '1em',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  overflowX: 'auto',
                  maxWidth: '100%',
                }}
                codeTagProps={{
                  style: {
                    fontFamily: 'Fira Mono, Menlo, Monaco, Consolas, monospace',
                    fontSize: 13,
                  }
                }}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code
              className={className}
              style={{
                background: "#222",
                color: "#fff",
                borderRadius: 4,
                padding: "2px 6px",
                fontSize: 13,
                overflowX: 'auto',
                maxWidth: '100%',
                display: 'inline-block',
                wordBreak: 'break-word',
              }}
              {...props}
            >
              {children}
            </code>
          );
        },
        a({ node, ...props }: any) {
          return <a {...props} className="underline text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer" />;
        },
        table({ node, ...props }: any) {
          return <table className="border-collapse border border-border my-2" {...props} />;
        },
        th({ node, ...props }: any) {
          return <th className="border border-border px-2 py-1 bg-muted" {...props} />;
        },
        td({ node, ...props }: any) {
          return <td className="border border-border px-2 py-1" {...props} />;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}