import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

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
  ],
  build: {
    chunkSizeWarningLimit: 1200,
  },
})
