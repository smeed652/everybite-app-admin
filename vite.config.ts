import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for EveryBite Admin Panel
// This is minimal for now; additional aliases or env handling can be added later.
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
});
