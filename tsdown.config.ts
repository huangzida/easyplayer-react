import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  deps: {
    neverBundle: ['react', 'react-dom'],
  },
  jsx: {
    runtime: 'automatic',
  },
  shims: true,
  external: [/\.css$/],
  outDir: 'dist',
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.js' : '.cjs',
      dts: '.d.ts',
    };
  },
});
