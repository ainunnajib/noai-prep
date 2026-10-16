import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

// With accounts on, only the first two modules are free, so the page description drops "free"
// (same switch as src/lib/accounts/config.ts: the mock, or all four Firebase web config values). It reads the same
// values the app sees as import.meta.env, .env files included.
function accountsDescription(): Plugin {
  let on = false
  return {
    name: 'accounts-description',
    configResolved({ env }) {
      on =
        env.VITE_ACCOUNTS_MOCK === '1' ||
        ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID'].every((k) => env[k])
    },
    transformIndexHtml: (html) => (on ? html.replace('A free, step-by-step course', 'A step-by-step course') : html),
  }
}

export default defineConfig({
  // Relative asset paths so the build works on GitHub Pages sub-paths and any static host.
  base: './',
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [[rehypeKatex, { strict: false, throwOnError: false }]],
        providerImportSource: '@mdx-js/react',
      }),
    },
    react({ include: /\.(mdx|tsx|ts)$/ }),
    accountsDescription(),
  ],
  build: {
    // The largest chunk is the practice question bank (about 1.3 MB of JSON, 0.4 MB gzipped), which only
    // the Practice and Mock exam pages load, on demand.
    chunkSizeWarningLimit: 1500,
  },
})
