import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    copyPublicDir: false,
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: 'src/index.ts',
      name: 'CellTooltip',
      fileName: (format: string) => {
        const formatMap: Record<string, string> = {
          'es': 'cell-tooltip.es.js',
          'umd': 'cell-tooltip.umd.js',
          'iife': 'cell-tooltip.iife.js'
        }
        return formatMap[format] || `cell-tooltip.${format}.js`
      },
      formats: ['es', 'umd', 'iife'],
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.names.some((name) => name.endsWith('.css'))) {
            return 'cell-tooltip.css'
          }
          return '[name][extname]'
        },
      },
    },
  },
})
