import type { HTMLAttributes, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  compact?: boolean;
  extraCompact?: boolean;
}

const styles = {
  normal: {
    h1: "text-3xl sm:text-4xl font-bold mt-10 mb-6 text-white font-sans tracking-tight",
    h2: "text-2xl sm:text-3xl font-bold mt-9 mb-5 text-white font-sans tracking-tight",
    h3: "text-xl sm:text-2xl font-semibold mt-7 mb-3 text-white font-sans tracking-tight",
    p: "text-lg sm:text-xl text-[#d8dde0] leading-8 sm:leading-9 mb-6 font-serif",
    ul: "list-disc list-inside text-lg sm:text-xl text-[#d8dde0] mb-6 space-y-3 font-serif",
    ol: "list-decimal list-inside text-lg sm:text-xl text-[#d8dde0] mb-6 space-y-3 font-serif",
    li: "leading-8 sm:leading-9",
    blockquote:
      "border-l-4 border-[#2eff8c] pl-5 py-3 my-6 bg-[#1e2529] rounded-r-lg text-lg sm:text-xl text-[#d8dde0] leading-8 sm:leading-9 font-serif",
    table: "w-full text-base border-collapse border border-[#434e54]",
    th: "border border-[#434e54] px-3 py-2.5 text-left text-white font-semibold",
    td: "border border-[#434e54] px-4 py-3 text-base text-[#d8dde0] font-serif leading-7",
  },
  compact: {
    h1: "text-xl sm:text-2xl font-bold mt-7 mb-3 text-white font-sans tracking-tight",
    h2: "text-lg sm:text-xl font-bold mt-6 mb-3 text-white font-sans tracking-tight",
    h3: "text-base sm:text-lg font-semibold mt-4 mb-2 text-white font-sans tracking-tight",
    p: "text-sm sm:text-base text-[#d8dde0] leading-6 sm:leading-7 mb-4 font-serif",
    ul: "list-disc list-inside text-sm sm:text-base text-[#d8dde0] mb-4 space-y-2 font-serif",
    ol: "list-decimal list-inside text-sm sm:text-base text-[#d8dde0] mb-4 space-y-2 font-serif",
    li: "leading-6 sm:leading-7",
    blockquote:
      "border-l-4 border-[#2eff8c] pl-4 py-2 my-4 bg-[#1e2529] rounded-r-lg text-sm sm:text-base text-[#d8dde0] leading-6 sm:leading-7 font-serif",
    table: "w-full text-sm border-collapse border border-[#434e54]",
    th: "border border-[#434e54] px-2 py-1.5 text-left text-white font-semibold",
    td: "border border-[#434e54] px-3 py-2 text-sm text-[#d8dde0] font-serif leading-6",
  },
  extraCompact: {
    h1: "text-base sm:text-lg font-bold mt-4 mb-1.5 text-white font-sans tracking-tight",
    h2: "text-sm sm:text-base font-bold mt-3 mb-1.5 text-white font-sans tracking-tight",
    h3: "text-xs sm:text-sm font-semibold mt-2 mb-1 text-white font-sans tracking-tight",
    p: "text-xs text-[#d8dde0] leading-[1.45] mb-2 font-sans",
    ul: "list-disc list-inside text-xs text-[#d8dde0] mb-2 space-y-1 font-sans",
    ol: "list-decimal list-inside text-xs text-[#d8dde0] mb-2 space-y-1 font-sans",
    li: "leading-[1.45]",
    blockquote:
      "border-l-4 border-[#2eff8c] pl-3 py-1 my-2 bg-[#1e2529] rounded-r-lg text-xs text-[#d8dde0] leading-[1.45] font-sans",
    table: "w-full text-xs border-collapse border border-[#434e54]",
    th: "border border-[#434e54] px-1.5 py-1 text-left text-white font-semibold",
    td: "border border-[#434e54] px-2 py-1 text-xs text-[#d8dde0] font-sans leading-[1.4]",
  },
};

export default function MarkdownRenderer({
  content,
  className = "",
  compact = false,
  extraCompact = false,
}: MarkdownRendererProps) {
  const c = extraCompact
    ? styles.extraCompact
    : compact
      ? styles.compact
      : styles.normal;

  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { output: "html" }]]}
        components={{
          h1: ({ children }) => <h1 className={c.h1}>{children}</h1>,
          h2: ({ children }) => <h2 className={c.h2}>{children}</h2>,
          h3: ({ children }) => <h3 className={c.h3}>{children}</h3>,
          p: ({ children }) => <p className={c.p}>{children}</p>,
          ul: ({ children }) => <ul className={c.ul}>{children}</ul>,
          ol: ({ children }) => <ol className={c.ol}>{children}</ol>,
          li: ({ children }) => <li className={c.li}>{children}</li>,
          strong: ({ children }) => (
            <strong className="text-white font-semibold font-sans">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-[#d8dde0] italic">{children}</em>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-[#2eff8c] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || ""}
              className="rounded-lg max-w-full my-4 border border-[#434e54]"
            />
          ),
          blockquote: ({ children }) => (
            <blockquote className={c.blockquote}>{children}</blockquote>
          ),
          hr: () => <hr className="border-[#434e54] my-6" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-5">
              <table className={c.table}>{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#1e2529]">{children}</thead>
          ),
          th: ({ children }) => <th className={c.th}>{children}</th>,
          td: ({ children }) => <td className={c.td}>{children}</td>,
          code: ({
            inline,
            className,
            children,
            ...props
          }: {
            inline?: boolean;
            className?: string;
            children?: ReactNode;
          } & HTMLAttributes<HTMLElement>) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <pre className="bg-[#1e2529] border border-[#434e54] rounded-lg p-4 overflow-x-auto my-5 text-sm">
                <code className="text-[#2eff8c] font-mono" {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code
                className="bg-[#1e2529] px-1.5 py-0.5 rounded text-[#2eff8c] text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
