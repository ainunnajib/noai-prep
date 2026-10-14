import { defineConfig } from '@playwright/test'

const executablePath = process.env.PW_CHROMIUM ?? (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome')

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120_000,
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173/',
    launchOptions: executablePath ? { executablePath } : {},
  },
  webServer: {
    command: 'npx vite build && npx vite preview --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: true,
    timeout: 240_000,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'phone', use: { viewport: { width: 375, height: 800 }, isMobile: true, hasTouch: true } },
  ],
})
