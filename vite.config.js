import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // base แบบ relative → ใช้ได้ทั้ง local และ GitHub Pages (subpath /NOMFON/)
  base: './',
})
