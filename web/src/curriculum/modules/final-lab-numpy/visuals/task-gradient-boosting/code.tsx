import { Highlight, themes } from 'prism-react-renderer'
import type { CSSProperties } from 'react'

/** One or more lines of syntax-coloured Python. Token colours come from the site's global .tok classes. */
export function Py({ code, style }: { code: string; style?: CSSProperties }) {
  return (
    <Highlight code={code} language="python" theme={themes.vsLight}>
      {({ tokens, getTokenProps }) => (
        <span style={style}>
          {tokens.map((line, i) => (
            <span key={i}>
              {i > 0 && '\n'}
              {line.map((token, k) => {
                if (token.empty) return null
                const tp = getTokenProps({ token })
                return (
                  <span key={k} className={`tok ${token.types.join(' ')}`}>
                    {String(tp.children ?? '').replace(/\n/g, '')}
                  </span>
                )
              })}
            </span>
          ))}
        </span>
      )}
    </Highlight>
  )
}
