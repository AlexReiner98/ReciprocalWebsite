import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        canvas: resolve(__dirname, '3dCanvas.html'),
      },
    },
  },
  resolve: {
    dedupe: ['three'],
  },
  optimizeDeps: {
    include: ['three', 'three/examples/jsm/controls/TransformControls'],
  },
  server: {
    watch: {
      usePolling: false, // try true if on WSL or networked drive
    },
    fs: {
      strict: false // allow access outside Vite root
    },
    watch: {
      ignored: ['!**/*.js'] // include all .js files
    }
  }
})