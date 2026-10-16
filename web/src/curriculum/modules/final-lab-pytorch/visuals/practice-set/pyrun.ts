/*
  A small Python-in-the-browser runner for the practice-set visuals. It uses the same Pyodide build
  and CDN as the kit's PyRunner, and loads it only when a learner first presses a Run button.
  Unlike PyRunner, it returns structured test results, so the visuals can tick tests off.
*/
import { DRIVER } from './tasks'

const PYODIDE_VERSION = '0.27.7'
const BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

interface Py {
  runPython: (code: string) => unknown
  loadPackage: (pkgs: string[]) => Promise<void>
  setStdout: (o: { batched: (s: string) => void }) => void
  setStderr: (o: { batched: (s: string) => void }) => void
  globals: { set: (k: string, v: unknown) => void }
}

type Loader = (opts: { indexURL: string }) => Promise<Py>

let ready: Promise<Py> | null = null

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

function getPy(): Promise<Py> {
  if (!ready) {
    ready = (async () => {
      const w = window as unknown as { loadPyodide?: Loader }
      if (!w.loadPyodide) await loadScript(BASE + 'pyodide.js')
      if (!w.loadPyodide) throw new Error('Pyodide failed to initialise')
      const py = await w.loadPyodide({ indexURL: BASE })
      await py.loadPackage(['numpy'])
      py.runPython(DRIVER)
      return py
    })()
    ready.catch(() => {
      ready = null
    })
  }
  return ready
}

export interface TestRun {
  error: string | null
  results: [string, boolean, string][]
  stdout: string
}

/** Run the learner's code, then the given test functions, in a fresh namespace. */
export async function runTests(userCode: string, testCode: string): Promise<TestRun> {
  const py = await getPy()
  let out = ''
  py.setStdout({ batched: (s) => (out += s + '\n') })
  py.setStderr({ batched: (s) => (out += s + '\n') })
  py.globals.set('USER_CODE', userCode)
  py.globals.set('TEST_CODE', testCode)
  const json = String(py.runPython('_run(USER_CODE, TEST_CODE)'))
  const parsed = JSON.parse(json) as { error: string | null; results: [string, boolean, string][] }
  return { ...parsed, stdout: out.trim() }
}

/** Run plain Python code and return what it printed. */
export async function runCode(code: string): Promise<string> {
  const py = await getPy()
  let out = ''
  py.setStdout({ batched: (s) => (out += s + '\n') })
  py.setStderr({ batched: (s) => (out += s + '\n') })
  try {
    py.runPython(code)
  } catch (e) {
    out += e instanceof Error ? e.message : String(e)
  }
  return out.trim()
}

export const OFFLINE_MESSAGE =
  'Python could not start here (it downloads from cdn.jsdelivr.net the first time). Copy the code into Google Colab or a local Python with NumPy, and run the tests there.'
