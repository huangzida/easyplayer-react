import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src/index.ts'] }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'EasyPlayerReact',
      fileName: 'index.js',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', /^node:.*/],
      output: {
        assetFileNames: 'easyplayer-react.css',
      },
    },
    cssCodeSplit: false,
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
});
