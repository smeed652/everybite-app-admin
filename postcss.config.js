// PostCSS configuration in CommonJS so Node can load it without ESM warnings.
// This fixes Tailwind not being processed after the directory restructure.
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
};
