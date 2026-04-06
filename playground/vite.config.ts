import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const playgroundRoot = fileURLToPath(new URL('./', import.meta.url));
const isGithubPages = process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY;
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'easyplayer-react';

export default defineConfig({
  root: playgroundRoot,
  base: isGithubPages ? `/${repoName}/` : '/',
  plugins: [react()],
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url)),
      '@playground': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 4174,
    fs: {
      allow: ['..'],
    },
  },
  optimizeDeps: {
    exclude: ['easyplayer-react'],
  },
  assetsInclude: ['**/*.wasm'],
});
