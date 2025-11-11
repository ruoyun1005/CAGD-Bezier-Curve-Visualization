import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // 用相對路徑，之後也方便用 file server/Pages
  server: {
    open: true
  }
});