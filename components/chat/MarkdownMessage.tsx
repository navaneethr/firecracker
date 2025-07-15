"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs"
import remarkGfm from "remark-gfm"

export default function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1({ node, ...props }: any) {
          return (
            <h1
              className="text-2xl font-bold mb-4 mt-6 text-foreground border-b border-border pb-2"
              {...props}
            />
          )
        },
        h2({ node, ...props }: any) {
          return (
            <h2
              className="text-xl font-semibold mb-3 mt-5 text-foreground"
              {...props}
            />
          )
        },
        h3({ node, ...props }: any) {
          return (
            <h3
              className="text-lg font-medium mb-2 mt-4 text-foreground"
              {...props}
            />
          )
        },
        h4({ node, ...props }: any) {
          return (
            <h4
              className="text-base font-medium mb-2 mt-3 text-foreground"
              {...props}
            />
          )
        },
        h5({ node, ...props }: any) {
          return (
            <h5
              className="text-sm font-medium mb-1 mt-2 text-foreground"
              {...props}
            />
          )
        },
        h6({ node, ...props }: any) {
          return (
            <h6
              className="text-xs font-medium mb-1 mt-2 text-muted-foreground"
              {...props}
            />
          )
        },
        ul({ node, ...props }: any) {
          return (
            <ul
              className="list-disc list-inside mb-4 space-y-1 text-foreground"
              {...props}
            />
          )
        },
        ol({ node, ...props }: any) {
          return (
            <ol
              className="list-decimal list-inside mb-4 space-y-1 text-foreground"
              {...props}
            />
          )
        },
        li({ node, ...props }: any) {
          return <li className="text-foreground leading-relaxed" {...props} />
        },
        p({ node, ...props }: any) {
          return (
            <p className="mb-4 text-foreground leading-relaxed" {...props} />
          )
        },
        blockquote({ node, ...props }: any) {
          return (
            <blockquote
              className="border-l-4 border-border pl-4 py-2 mb-4 bg-muted/30 text-muted-foreground italic"
              {...props}
            />
          )
        },
        strong({ node, ...props }: any) {
          return <strong className="font-semibold text-foreground" {...props} />
        },
        em({ node, ...props }: any) {
          return <em className="italic text-foreground" {...props} />
        },
        code({ inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "")
          return !inline && match ? (
            <div style={{ maxWidth: "100%", overflowX: "auto" }}>
              <SyntaxHighlighter
                style={atomOneDark}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  borderRadius: 8,
                  fontSize: 13,
                  margin: 0,
                  background: "#23272e",
                  color: "#fff",
                  padding: "1em",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  overflowX: "auto",
                  maxWidth: "100%",
                }}
                codeTagProps={{
                  style: {
                    fontFamily: "Fira Mono, Menlo, Monaco, Consolas, monospace",
                    fontSize: 13,
                  },
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
                overflowX: "auto",
                maxWidth: "100%",
                display: "inline-block",
                wordBreak: "break-word",
              }}
              {...props}
            >
              {children}
            </code>
          )
        },
        a({ node, ...props }: any) {
          return (
            <a
              {...props}
              className="underline text-blue-600 hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            />
          )
        },
        table({ node, ...props }: any) {
          return (
            <table
              className="border-collapse border border-border my-2"
              {...props}
            />
          )
        },
        th({ node, ...props }: any) {
          return (
            <th
              className="border border-border px-2 py-1 bg-muted"
              {...props}
            />
          )
        },
        td({ node, ...props }: any) {
          return <td className="border border-border px-2 py-1" {...props} />
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
