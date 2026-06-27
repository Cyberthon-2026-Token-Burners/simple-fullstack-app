// Vitest configuration for React component testing with jsdom environment
// Loads React plugin for JSX support and runs setup files before each test
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, 'src/setup.js')],
  },
});
