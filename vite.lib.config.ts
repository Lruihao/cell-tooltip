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
      fileName: 'cell-tooltip',
      formats: ['es', 'umd'],
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
