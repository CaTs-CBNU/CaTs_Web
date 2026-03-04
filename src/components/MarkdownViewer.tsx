"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  
  // ✅ 추가된 로직: 앞쪽의 불필요한 공백을 제거하는 함수
  const cleanContent = content.replace(/\n\s+/g, "\n"); 
  // 또는 더 강력한 방법: 모든 줄의 앞쪽 공백 제거 (주의: 의도한 들여쓰기도 사라질 수 있음)
  // const cleanContent = content.split('\n').map(line => line.trimStart()).join('\n');

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              {...props}
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              className="rounded-xl text-sm my-4 shadow-lg"
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code {...props} className={`${className} bg-white/10 rounded px-1 py-0.5 font-mono text-sm text-blue-300`}>
              {children}
            </code>
          );
        },
      }}
    >
      {/* ✅ 수정된 content 사용 */}
      {cleanContent} 
    </ReactMarkdown>
  );
}