#!/usr/bin/env node
/*
  Screenshot site routes and report console errors + horizontal overflow.
  Usage: node scripts/screenshot.mjs --out <dir> [--width 1280] [--theme light|dark] [--viewport-only] <route> [<route> ...]
  Example: node scripts/screenshot.mjs --out /tmp/shots --width 390 --theme dark /learn/linear-algebra/vectors
  Env: BASE (default http://localhost:5173/#), PW_CHROMIUM (browser binary)
*/
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

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
const base = process.env.BASE ?? 'http://localhost:5173/#'
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const ctx = await browser.newContext({ viewport: { width: opt.width, height: 900 }, colorScheme: opt.theme })
let failed = false
for (const r of routes) {
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 400)))
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 400)))
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(base + r, { waitUntil: 'networkidle', timeout: 60000 })
      // wait until lazy lessons and embedded past-paper questions have rendered
      const loaded = await page
        .waitForFunction(
          // no loading placeholders left, and real content in <main> (guards against checking before the lazy lesson has even started loading)
          () => !document.querySelector('.loading-block, .pastq-loading') && (document.querySelector('main')?.textContent?.trim().length ?? 0) > 200,
          null,
          { timeout: 30000 },
        )
        .then(() => true)
        .catch(() => false)
      if (!loaded) {
        // a capture of a half-loaded page is useless: retry, and fail on the last attempt
        if (attempt < 2) throw new Error('still loading after 30 s')
        console.log(`  ${r}: STILL LOADING after 30 s (the screenshot shows a partly loaded page)`)
        failed = true
      }
      await page.waitForTimeout(500)
      const name = `${opt.out}/${r.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home'}_${opt.width}_${opt.theme}.png`
      await page.screenshot({ path: name, fullPage: opt.full })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      const broken = await page.locator('text=Something on this page failed to load').count()
      const textLen = await page.evaluate(() => document.querySelector('main')?.textContent?.trim().length ?? 0)
      const blank = textLen < 40
      console.log(`${name}  overflow=${overflow}px${broken ? '  LESSON-ERROR-BOUNDARY-TRIGGERED' : ''}${blank ? '  BLANK-PAGE (app failed to render)' : ''}`)
      if (overflow > 1 || broken || blank) failed = true
      break
    } catch (e) {
      if (attempt === 2) { console.log(`${r}: ${e.message}`); failed = true }
      else await page.waitForTimeout(1500)
    }
  }
  if (errors.length) { failed = true; console.log(`  console errors on ${r}:\n   - ` + errors.join('\n   - ')) }
  await page.close()
}
await browser.close()
process.exit(failed ? 1 : 0)
