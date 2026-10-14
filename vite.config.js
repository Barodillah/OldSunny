import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-icons/hi2',
      'react-icons/ri',
      'gsap',
      'gsap/ScrollTrigger'
    ],
  },
})
