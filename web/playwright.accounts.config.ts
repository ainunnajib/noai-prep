import { defineConfig } from '@playwright/test'

/*
  End-to-end tests for accounts, against a build with the pretend account backend (VITE_ACCOUNTS_MOCK=1: no network,
  everything in localStorage, see src/lib/accounts/mock-adapter.ts). It builds into dist-accounts/ and serves it on
  port 4174, so it never clashes with the normal suite (accounts off, dist/, port 4173).
  Run: npx playwright test -c playwright.accounts.config.ts
*/

const executablePath = process.env.PW_CHROMIUM ?? (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome')

export default defineConfig({
  testDir: 'tests/e2e-accounts',
  timeout: 120_000,
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4174/',
    launchOptions: executablePath ? { executablePath } : {},
  },
  webServer: {
    command: 'npx vite build --outDir dist-accounts && npx vite preview --outDir dist-accounts --port 4174 --strictPort',
    env: { VITE_ACCOUNTS_MOCK: '1', NODE_OPTIONS: '--max-old-space-size=8192' },
    port: 4174,
    reuseExistingServer: true,
    timeout: 240_000,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'phone', use: { viewport: { width: 375, height: 800 }, isMobile: true, hasTouch: true } },
  ],
})
