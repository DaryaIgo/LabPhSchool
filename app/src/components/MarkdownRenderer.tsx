import type { HTMLAttributes, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { output: "html" }]]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl sm:text-4xl font-bold mt-10 mb-6 text-white font-sans tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl sm:text-3xl font-bold mt-9 mb-5 text-white font-sans tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl sm:text-2xl font-semibold mt-7 mb-3 text-white font-sans tracking-tight">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-lg sm:text-xl text-[#d8dde0] leading-8 sm:leading-9 mb-6 font-serif">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-lg sm:text-xl text-[#d8dde0] mb-6 space-y-3 font-serif">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-lg sm:text-xl text-[#d8dde0] mb-6 space-y-3 font-serif">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-8 sm:leading-9">{children}</li>
          ),
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
            <blockquote className="border-l-4 border-[#2eff8c] pl-5 py-3 my-6 bg-[#1e2529] rounded-r-lg text-lg sm:text-xl text-[#d8dde0] leading-8 sm:leading-9 font-serif">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-[#434e54] my-6" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-5">
              <table className="w-full text-base border-collapse border border-[#434e54]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#1e2529]">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-[#434e54] px-3 py-2.5 text-left text-white font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[#434e54] px-4 py-3 text-base text-[#d8dde0] font-serif leading-7">
              {children}
            </td>
          ),
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
