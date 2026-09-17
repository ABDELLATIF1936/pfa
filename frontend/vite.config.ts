import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

const rootDir = import.meta.dirname

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(rootDir, './src') },
    dedupe: ['react', 'react-dom'],
  },
})
