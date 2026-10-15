#!/usr/bin/env node
/*
  Screenshot site routes and report console errors + horizontal overflow.
  Usage: node scripts/screenshot.mjs --out <dir> [--width 1280] [--theme light|dark] [--viewport-only] <route> [<route> ...]
  Example: node scripts/screenshot.mjs --out /tmp/shots --width 390 --theme dark /learn/linear-algebra/vectors
  Env: BASE (default http://localhost:5173/#), PW_CHROMIUM (browser binary)
  Each page is captured only once it has finished loading (see settle below). A route that is still loading
  after READY_TIMEOUT prints STILL-LOADING, gets no screenshot, and makes the script exit non-zero.
*/
import { chromium, errors as pwErrors } from 'playwright'
import { mkdirSync, rmSync } from 'node:fs'

const READY_TIMEOUT = 60000
// how long the network must be quiet and the page height unchanged before the capture
const SETTLE_MS = 500

const args = process.argv.slice(2)
const opt = { out: '/tmp/shots', width: 1280, theme: 'light', full: true }
const routes = []
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a === '--out') opt.out = args[++i]
  else if (a === '--width') opt.width = Number(args[++i])
  else if (a === '--theme') opt.theme = args[++i]
  else if (a === '--viewport-only') opt.full = false
  else routes.push(a)
}
mkdirSync(opt.out, { recursive: true })

/**
 * Wait until the page is ready to capture: the app has rendered <main>, no lazy page, lesson or past-paper question
 * is still loading, no request is in flight (the lesson checkpoint loads without a placeholder), web fonts are in,
 * and the page height has stopped changing (KaTeX and visuals settling). Returns null when ready, or what was still
 * pending when `timeout` ran out.
 */
async function settle(page, net, timeout) {
  const deadline = Date.now() + timeout
  let height = -1
  let heightSince = Date.now()
  let pending = 'nothing checked yet'
  while (Date.now() < deadline) {
    const s = await page.evaluate(() => ({
      main: document.querySelector('main') !== null,
      loading: [...document.querySelectorAll('.loading-block, .pastq-loading')].map((e) => e.textContent.trim() || e.className),
      fonts: document.fonts.status,
      height: document.documentElement.scrollHeight,
    }))
    const now = Date.now()
    if (s.height !== height) [height, heightSince] = [s.height, now]
    pending = !s.main
      ? 'the app has not rendered'
      : s.loading.length
        ? `showing "${s.loading[0]}"`
        : net.inflight.size
          ? `${net.inflight.size} request(s) in flight, e.g. ${[...net.inflight][0].url().slice(0, 200)}`
          : s.fonts !== 'loaded'
            ? 'web fonts still loading'
            : now - net.last < SETTLE_MS || now - heightSince < SETTLE_MS
              ? 'page still changing'
              : null
    if (!pending) return null
    await page.waitForTimeout(100)
  }
  return pending
}

const base = process.env.BASE ?? 'http://localhost:5173/#'
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const ctx = await browser.newContext({ viewport: { width: opt.width, height: 900 }, colorScheme: opt.theme })
let failed = false
for (const r of routes) {
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 400)))
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 400)))
  const net = { inflight: new Set(), last: Date.now() }
  const done = (q) => {
    net.inflight.delete(q)
    net.last = Date.now()
  }
  page.on('request', (q) => {
    net.inflight.add(q)
    net.last = Date.now()
  })
  page.on('requestfinished', done)
  page.on('requestfailed', done)
  const name = `${opt.out}/${r.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home'}_${opt.width}_${opt.theme}.png`
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(base + r, { waitUntil: 'networkidle', timeout: 60000 })
      const pending = await settle(page, net, READY_TIMEOUT)
      if (pending) {
        // a capture of a half-loaded page is useless: fail instead, and drop any shot of this route from an earlier run
        rmSync(name, { force: true })
        console.log(`${r}: STILL-LOADING after ${READY_TIMEOUT / 1000} s (${pending}); no screenshot saved`)
        failed = true
        break
      }
      await page.screenshot({ path: name, fullPage: opt.full })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      const broken = await page.locator('text=Something on this page failed to load').count()
      const textLen = await page.evaluate(() => document.querySelector('main')?.textContent?.trim().length ?? 0)
      const blank = textLen < 40
      console.log(`${name}  overflow=${overflow}px${broken ? '  LESSON-ERROR-BOUNDARY-TRIGGERED' : ''}${blank ? '  BLANK-PAGE (app failed to render)' : ''}`)
      if (overflow > 1 || broken || blank) failed = true
      break
    } catch (e) {
      if (attempt === 2) { console.log(`${r}: ${e instanceof pwErrors.TimeoutError ? 'STILL-LOADING: ' : ''}${e.message}`); failed = true }
      else await page.waitForTimeout(1500)
    }
  }
  if (errors.length) { failed = true; console.log(`  console errors on ${r}:\n   - ` + errors.join('\n   - ')) }
  await page.close()
}
await browser.close()
process.exit(failed ? 1 : 0)
