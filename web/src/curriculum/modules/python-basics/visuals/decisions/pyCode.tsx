import type { ReactNode } from 'react'

/*
  A tiny Python syntax colourer for the code panes in the decisions, loops and lists visuals.
  It reuses the site's global token classes (.tok.keyword, .tok.string, …) so the colours
  match the fenced code blocks (Prism) in both themes.
*/

const KEYWORDS = new Set([
  'and', 'or', 'not', 'in', 'is', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue', 'pass',
  'def', 'return', 'import', 'from', 'as', 'lambda', 'print',
])
const BOOLEANS = new Set(['True', 'False', 'None'])
const BUILTINS = new Set(['len', 'type', 'int', 'float', 'str', 'bool', 'range', 'list', 'abs', 'sum', 'min', 'max', 'input', 'enumerate', 'round'])

export function highlightPy(code: string): ReactNode[] {
  const re = /(#.*$)|([fF]?"(?:[^"\\]|\\.)*"?|[fF]?'(?:[^'\\]|\\.)*'?)|(\b\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)|([A-Za-z_]\w*)|(\s+)|(==|!=|<=|>=|\*\*|\/\/|[-+*/%<>=])|([\s\S])/gm
  const out: ReactNode[] = []
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(code))) {
    const [tok, comment, str, num, name, , op] = m
    let cls = ''
    if (comment) cls = 'tok comment'
    else if (str) cls = 'tok string'
    else if (num) cls = 'tok number'
    else if (name) cls = KEYWORDS.has(name) ? 'tok keyword' : BOOLEANS.has(name) ? 'tok boolean' : BUILTINS.has(name) ? 'tok builtin' : ''
    else if (op) cls = 'tok operator'
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

/** Inline code chip with Python colouring, for use inside visual captions and status lines. */
export function Py({ children }: { children: string }) {
  return <code>{highlightPy(children)}</code>
}
