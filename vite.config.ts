import { defineConfig } from 'vite'

export default defineConfig({
  base: '/easy-family-holiday-plan/',
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
})
