import type { ReactNode } from 'react'

/*
  A tiny Python syntax colourer for the code panes in this lesson's visuals.
  It reuses the site's global token classes (.tok.string, .tok.comment, …) so the
  colours match fenced code blocks in both themes.
*/

const BUILTINS = new Set(['print', 'len', 'type', 'int', 'float', 'str', 'bool', 'input', 'range'])
const KEYWORDS = new Set(['True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'if', 'elif', 'else', 'for', 'while', 'def', 'return', 'import'])

export function highlightPy(code: string): ReactNode[] {
  const re = /(#.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)|(\b\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)|([A-Za-z_]\w*)|(\s+)|([\s\S])/g
  const out: ReactNode[] = []
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(code))) {
    const [tok, comment, str, num, name] = m
    let cls = ''
    if (comment) cls = 'tok comment'
    else if (str) cls = 'tok string'
    else if (num) cls = 'tok number'
    // Prism (used by the site's code blocks) colours print as a keyword and other built-ins as builtins; match it.
    else if (name) cls = KEYWORDS.has(name) || name === 'print' ? 'tok keyword' : BUILTINS.has(name) ? 'tok builtin' : ''
    else if (!/^\s+$/.test(tok)) cls = 'tok punctuation'
    out.push(
      cls ? (
        <span key={k++} className={cls}>
          {tok}
        </span>
      ) : (
        tok
      ),
    )
  }
  return out
}
