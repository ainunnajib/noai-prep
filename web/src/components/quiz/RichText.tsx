import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { MdxPre } from '../content/CodeBlock'

/** Renders question/explanation strings: Markdown + GFM tables + $math$ + fenced code. */
export function RichText({ text, inline }: { text: string; inline?: boolean }) {
  return (
    <div className={inline ? 'rich rich-inline' : 'rich'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={{
          pre: MdxPre,
          a: (p) => <a {...p} target="_blank" rel="noreferrer" />,
          table: (p) => (
            <div className="table-wrap">
              <table {...p} />
            </div>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}
