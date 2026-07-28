import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        name: 'unit',
        testMatch: ['tests/unit/**/*.test.{ts,tsx}'],
        environment: 'node',
      },
      {
        name: 'integration',
        testMatch: ['tests/integration/**/*.test.{ts,tsx}'],
        environment: 'node',
        setupFiles: ['tests/utils/setup.ts'],
      },
      {
        name: 'e2e',
        testMatch: ['tests/e2e/**/*.test.{ts,tsx}'],
        environment: 'node',
        setupFiles: ['tests/utils/setup.ts'],
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['packages/*/src/**', 'src/**'],
      exclude: ['**/*.d.ts', '**/types/**'],
    },
  },
});
