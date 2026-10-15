import { expect, test, type CDPSession, type Locator, type Page } from '@playwright/test'

/*
  Touch gestures on plots, sent as real touch events through CDP (Chromium only). A swipe over a plot must scroll
  the page; a drag that starts on a handle must move the handle and leave the page where it is.
*/

test.skip(({ isMobile }) => !isMobile, 'touch gestures run in the phone project')

type XY = [number, number]

async function open(page: Page, route: string) {
  await page.goto('./#' + route)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('.loading-block')).toHaveCount(0, { timeout: 30_000 })
}

/** Scroll so the element sits in the middle of the screen, leaving room to scroll both ways. */
async function centre(el: Locator) {
  await el.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await el.page().waitForTimeout(200)
}

const scrollY = (page: Page) => page.evaluate(() => window.scrollY)

/** One finger down at `path[0]`, through each point in turn, then up. */
async function touch(cdp: CDPSession, path: XY[], steps = 10) {
  const send = (type: string, [x, y]: XY) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [{ x, y, id: 1 }] } as never)
  await send('touchStart', path[0])
  for (let i = 1; i < path.length; i++) {
    const [x0, y0] = path[i - 1]
    const [x1, y1] = path[i]
    for (let s = 1; s <= steps; s++) {
      await send('touchMove', [x0 + ((x1 - x0) * s) / steps, y0 + ((y1 - y0) * s) / steps])
      await new Promise((r) => setTimeout(r, 16))
    }
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

async function box(el: Locator) {
  const b = await el.boundingBox()
  if (!b) throw new Error('element has no box')
  return b
}

/** A point in the svg, given in its viewBox units. */
async function svgPoint(svg: Locator, vx: number, vy: number): Promise<XY> {
  return svg.evaluate(
    (s, [x, y]) => {
      const m = (s as SVGSVGElement).getScreenCTM()!
      return [m.a * x + m.e, m.d * y + m.f] as [number, number]
    },
    [vx, vy] as const,
  )
}

test('a swipe over a plot scrolls the page and a drag on its handle moves the handle', async ({ page }) => {
  await open(page, '/learn/trees-and-ensembles/decision-trees')
  const svg = page.locator('svg.plot[aria-label^="Gini and entropy"]')
  await centre(svg)
  const cdp = await page.context().newCDPSession(page)
  const handle = await box(svg.locator('.plot-drag circle').nth(1))
  const hx = handle.x + handle.width / 2

  // swipe up over the background, well away from the handle
  const b = await box(svg)
  const sx = hx > b.x + b.width / 2 ? b.x + b.width * 0.2 : b.x + b.width * 0.8
  const before = await scrollY(page)
  await touch(cdp, [
    [sx, b.y + b.height * 0.7],
    [sx, b.y + b.height * 0.7 - 160],
  ])
  await expect.poll(() => scrollY(page)).toBeGreaterThan(before + 60)

  // drag the handle up and to the side: it moves, the page does not
  await centre(svg)
  const h2 = await box(svg.locator('.plot-drag circle').nth(1))
  const label0 = await svg.getAttribute('aria-label')
  const y0 = await scrollY(page)
  const [x, y] = [h2.x + h2.width / 2, h2.y + h2.height / 2]
  await touch(cdp, [
    [x, y],
    [x + (x > b.x + b.width / 2 ? -70 : 70), y - 60],
  ])
  await page.waitForTimeout(300)
  expect(await scrollY(page)).toBe(y0)
  expect(await svg.getAttribute('aria-label')).not.toBe(label0)
})

test('a plot that drags on its background still drags on touch', async ({ page }) => {
  await open(page, '/learn/python-basics/decisions')
  const svg = page.locator('svg.plot[aria-label^="Number line from 0 to 10"]').first()
  await centre(svg)
  const cdp = await page.context().newCDPSession(page)
  const b = await box(svg)
  const label0 = await svg.getAttribute('aria-label')
  const y0 = await scrollY(page)
  const fromLeft = /x is [0-4]\b/.test(label0 ?? '') ? 0.85 : 0.15
  await touch(cdp, [
    [b.x + b.width * (1 - fromLeft), b.y + b.height * 0.8],
    [b.x + b.width * fromLeft, b.y + b.height * 0.3],
  ])
  await page.waitForTimeout(300)
  expect(await scrollY(page)).toBe(y0)
  expect(await svg.getAttribute('aria-label')).not.toBe(label0)
})

test('a plot that picks on a press scrolls on a swipe and picks on a tap', async ({ page }) => {
  await open(page, '/learn/unsupervised-learning/k-means')
  const chart = page.locator('svg.plot[aria-label*="for k = 1 to 10"]')
  const scatter = page.locator('svg.plot[aria-label*="true blobs clustered by K-means with k = "]')
  await centre(chart)
  const cdp = await page.context().newCDPSession(page)
  const kOf = async () => Number((await scatter.getAttribute('aria-label'))!.match(/with k = (\d+)/)![1])
  const k0 = await kOf()
  const target = k0 === 7 ? 8 : 7
  const vw = await chart.evaluate((s) => (s as SVGSVGElement).viewBox.baseVal.width)
  // Plot x-domain [0.4, 10.6] over [left margin 50, width - 16]; tap near the top, clear of the dots
  const at = await svgPoint(chart, 50 + ((target - 0.4) / 10.2) * (vw - 66), 30)

  const before = await scrollY(page)
  await touch(cdp, [at, [at[0], at[1] - 160]])
  await expect.poll(() => scrollY(page)).toBeGreaterThan(before + 60)
  expect(await kOf()).toBe(k0)

  await centre(chart)
  const tap = await svgPoint(chart, 50 + ((target - 0.4) / 10.2) * (vw - 66), 30)
  await touch(cdp, [tap], 0)
  await expect.poll(kOf).toBe(target)
})

test('a hand-made plot svg keeps its drag handle and scrolls elsewhere', async ({ page }) => {
  await open(page, '/learn/calculus-and-gradient-descent/chain-rule')
  const svg = page.locator('svg.plot[aria-label^="Three gears"]')
  await centre(svg)
  const cdp = await page.context().newCDPSession(page)
  const gear = svg.locator('path').first() // gear x, the one with the handle
  const g = await box(gear)
  const [cx, cy, r] = [g.x + g.width / 2, g.y + g.height / 2, Math.min(g.width, g.height) / 2]
  const d0 = await gear.getAttribute('d')
  const y0 = await scrollY(page)
  // turn gear x clockwise, starting straight down its right-hand side (the move a pan-y svg would scroll)
  await touch(cdp, [
    [cx + r * 0.6, cy - r * 0.3],
    [cx + r * 0.6, cy + r * 0.3],
    [cx + r * 0.3, cy + r * 0.6],
  ])
  await page.waitForTimeout(300)
  expect(await scrollY(page)).toBe(y0)
  expect(await gear.getAttribute('d')).not.toBe(d0)

  // a swipe over the last gear scrolls the page
  const last = await box(svg.locator('path').last())
  const lx = last.x + last.width / 2
  await touch(cdp, [
    [lx, last.y + last.height * 0.7],
    [lx, last.y + last.height * 0.7 - 160],
  ])
  await expect.poll(() => scrollY(page)).toBeGreaterThan(y0 + 60)
})
