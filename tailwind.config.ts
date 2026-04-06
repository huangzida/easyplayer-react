import type { Config } from 'tailwindcss';

export default {
  content: ['./playground/index.html', './playground/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
