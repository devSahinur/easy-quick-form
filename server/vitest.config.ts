import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    // Share a single in-memory MongoDB across the run.
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 30000,
    // The first run downloads the MongoDB binary (~hundreds of MB), so allow time.
    hookTimeout: 300000,
  },
});
