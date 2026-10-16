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
    // The largest chunk is the practice question bank (about 1.3 MB of JSON, 0.4 MB gzipped), which only
    // the Practice and Mock exam pages load, on demand.
    chunkSizeWarningLimit: 1500,
  },
})
