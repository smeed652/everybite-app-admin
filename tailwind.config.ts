import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#4338CA',
        'brand-dark': '#211C65',
        gray: {
          50: '#FFFFFF',
          100: '#F7F7F7',
          200: '#DDDFE2',
          300: '#C5CAD0',
          400: '#7E8998',
          500: '#526176',
          600: '#071D3B',
        },
        success: '#6ED196',
        error: '#FF7373',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};

export default config;
