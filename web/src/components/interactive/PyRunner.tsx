import { useRef, useState } from 'react'

/*
  Runs Python in the browser with Pyodide, loaded from the jsDelivr CDN only when a
  learner first presses Run. numpy / pandas / scikit-learn can be requested via
  `packages`. PyTorch is not available in the browser: lessons should show PyTorch
  code with <CodeBlock> plus its printed output instead.
*/

const PYODIDE_VERSION = '0.27.7'
const BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

interface Pyodide {
  runPythonAsync: (code: string) => Promise<unknown>
  loadPackage: (pkgs: string[]) => Promise<void>
  setStdout: (o: { batched: (s: string) => void }) => void
  setStderr: (o: { batched: (s: string) => void }) => void
}

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<Pyodide>
  }
}

let pyodidePromise: Promise<Pyodide> | null = null
const loadedPackages = new Set<string>()

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Could not load ' + src))
    document.head.appendChild(s)
  })
}

function getPyodide(): Promise<Pyodide> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      if (!window.loadPyodide) await loadScript(BASE + 'pyodide.js')
      if (!window.loadPyodide) throw new Error('Pyodide failed to initialise')
      return window.loadPyodide({ indexURL: BASE })
    })()
    pyodidePromise.catch(() => {
      pyodidePromise = null
    })
  }
  return pyodidePromise
}

export function PyRunner({ code: initial, packages = [], title = 'Try it: Python', rows }: { code: string; packages?: string[]; title?: string; rows?: number }) {
  const [code, setCode] = useState(initial.replace(/^\n/, '').replace(/\n$/, ''))
  const [out, setOut] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'running' | 'error'>('idle')
  const taRef = useRef<HTMLTextAreaElement>(null)

  const run = async () => {
    setOut('')
    try {
      setStatus('loading')
      const py = await getPyodide()
      const need = packages.filter((p) => !loadedPackages.has(p))
      if (need.length) {
        await py.loadPackage(need)
        need.forEach((p) => loadedPackages.add(p))
      }
      setStatus('running')
      let buf = ''
      py.setStdout({ batched: (s) => (buf += s + '\n') })
      py.setStderr({ batched: (s) => (buf += s + '\n') })
      const result = await py.runPythonAsync(code)
      if (result !== undefined && result !== null && String(result) !== 'undefined') buf += String(result) + '\n'
      setOut(buf || '(no output — add a print(...) to see values)')
      setStatus('idle')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      const offline = /load|network|fetch|initialise/i.test(msg) && !/Traceback/.test(msg)
      setOut(
        offline
          ? 'Python could not start here (it downloads from cdn.jsdelivr.net the first time). Copy the code into Google Colab (colab.research.google.com) or a local Python to run it.'
          : msg,
      )
      setStatus('error')
    }
  }

  const reset = () => {
    setCode(initial.replace(/^\n/, '').replace(/\n$/, ''))
    setOut('')
    setStatus('idle')
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      const ta = e.currentTarget
      const { selectionStart: a, selectionEnd: b } = ta
      const next = code.slice(0, a) + '    ' + code.slice(b)
      setCode(next)
      requestAnimationFrame(() => {
        if (taRef.current) taRef.current.selectionStart = taRef.current.selectionEnd = a + 4
      })
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      void run()
    }
  }

  return (
    <div className="pyrunner">
      <div className="pyrunner-bar">
        <span className="pyrunner-title">{title}</span>
        <span className="pyrunner-actions">
          <button type="button" className="btn btn-ghost btn-small" onClick={reset}>
            Reset
          </button>
          <button type="button" className="btn btn-primary btn-small" onClick={run} disabled={status === 'loading' || status === 'running'}>
            {status === 'loading' ? 'Starting Python…' : status === 'running' ? 'Running…' : 'Run'}
          </button>
        </span>
      </div>
      <textarea
        ref={taRef}
        className="pyrunner-code"
        value={code}
        spellCheck={false}
        wrap="off"
        aria-label="Python code editor"
        rows={rows ?? Math.min(18, code.split('\n').length + 1)}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {(out || status !== 'idle') && (
        <pre className={`pyrunner-out${status === 'error' ? ' is-error' : ''}`} aria-live="polite">
          {status === 'loading' ? 'Starting Python in your browser (first run takes a few seconds)…' : out}
        </pre>
      )}
      <div className="pyrunner-hint">Edit the code and press Run (Ctrl/⌘ + Enter). Runs entirely in your browser.</div>
    </div>
  )
}
