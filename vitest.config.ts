import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    watch: false,
    browser: {
      enabled: true,
      provider: 'playwright',
      // https://vitest.dev/guide/browser/playwright
      instances: [
      { browser: 'chromium' },
      // { browser: 'firefox' },
      // { browser: 'webkit' },
      ],
    },
  },
})
