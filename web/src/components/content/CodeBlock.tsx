import { Highlight, themes } from 'prism-react-renderer'
import { useState, type ReactElement, type ReactNode, isValidElement } from 'react'

interface Props {
  code: string
  language?: string
  title?: string
  /** highlight these 1-based line numbers */
  highlight?: number[]
  showLineNumbers?: boolean
}

const LANG_ALIASES: Record<string, string> = { py: 'python', sh: 'bash', shell: 'bash', txt: 'text', plaintext: 'text' }

export function CodeBlock({ code, language = 'python', title, highlight = [], showLineNumbers }: Props) {
  const [copied, setCopied] = useState(false)
  const lang = LANG_ALIASES[language] ?? language
  const src = code.replace(/\n$/, '')
  const lineNums = showLineNumbers ?? src.split('\n').length > 4

  const copy = () => {
    navigator.clipboard?.writeText(src).then(
      () => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1400)
      },
      () => setCopied(false),
    )
  }

  return (
    <div className="codeblock">
      <div className="codeblock-bar">
        <span className="codeblock-title">{title ?? (lang === 'text' ? 'output' : lang)}</span>
        <button type="button" className="codeblock-copy" onClick={copy} aria-label="Copy code">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <Highlight code={src} language={lang === 'text' ? 'markup' : lang} theme={themes.vsLight}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="codeblock-pre" tabIndex={0}>
            <code>
              {tokens.map((line, i) => {
                const lp = getLineProps({ line })
                const hl = highlight.includes(i + 1)
                return (
                  <span key={i} {...lp} style={undefined} className={`code-line${hl ? ' is-hl' : ''}`}>
                    {lineNums && <span className="code-ln" aria-hidden="true">{i + 1}</span>}
                    <span className="code-text">
                      {line.map((token, k) => {
                        const tp = getTokenProps({ token })
                        return <span key={k} className={`tok ${token.types.join(' ')}`}>{tp.children}</span>
                      })}
                    </span>
                  </span>
                )
              })}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  )
}

/** MDX `pre` override: turns fenced code blocks into CodeBlock. */
export function MdxPre(props: { children?: ReactNode }) {
  const child = props.children as ReactElement<{ className?: string; children?: ReactNode }>
  if (isValidElement(child)) {
    const p = child.props as { className?: string; children?: ReactNode }
    const lang = /language-([\w-]+)/.exec(p.className ?? '')?.[1] ?? 'text'
    const code = typeof p.children === 'string' ? p.children : String(p.children ?? '')
    return <CodeBlock code={code} language={lang} />
  }
  return <pre>{props.children}</pre>
}
