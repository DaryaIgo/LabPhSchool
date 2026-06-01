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
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-8 mb-4 text-white">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mt-6 mb-3 text-white">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mt-5 mb-2 text-white">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-[#c8cdd1] leading-relaxed mb-4">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-sm text-[#c8cdd1] mb-4 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-sm text-[#c8cdd1] mb-4 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="text-white font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-[#c8cdd1] italic">{children}</em>
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
            <blockquote className="border-l-4 border-[#2eff8c] pl-4 py-1 my-4 bg-[#1e2529] rounded-r-lg">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-[#434e54] my-6" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full text-sm border-collapse border border-[#434e54]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#1e2529]">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-[#434e54] px-3 py-2 text-left text-[#798389] font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[#434e54] px-3 py-2 text-[#c8cdd1]">
              {children}
            </td>
          ),
          code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <pre className="bg-[#1e2529] border border-[#434e54] rounded-lg p-4 overflow-x-auto my-4 text-sm">
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
