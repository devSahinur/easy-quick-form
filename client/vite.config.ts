/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Allows access from local network
    port: 4400, // Default port (you can change this if needed)
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendor libraries into their own chunks so the main
        // bundle stays small and chunks can be cached independently.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          editor: ['@tiptap/react', '@tiptap/starter-kit'],
          dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/modifiers'],
          query: ['@tanstack/react-query', '@tanstack/react-table'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
});
