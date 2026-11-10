const { defineConfig } = require('cypress');
const componentViteConfig = require('./cypress/vite.config');

module.exports = defineConfig({
  // End-to-end tests run against the production web build (`npm run test:e2e` builds and serves it):
  // course ch. 12 — test on the build, not on the development server.
  e2e: {
    baseUrl: 'http://localhost:8081',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    viewportWidth: 390,
    viewportHeight: 844,
    video: false,
    defaultCommandTimeout: 10000,
    // Keep the build's real Content-Security-Policy (dist/serve.json) in force, so the photo upload,
    // the EXIF read and every Supabase call are tested under connect-src / img-src. With `true`
    // Cypress still strips the directives it cannot run under (script-src, default-src, frame-src…).
    experimentalCspAllowList: true,
    setupNodeEvents() {},
  },
  // Unit tests (pure functions) and component tests, both with Cypress as the course recommends.
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: componentViteConfig,
    },
    specPattern: ['cypress/unit/**/*.cy.ts', 'cypress/component/**/*.cy.tsx'],
    viewportWidth: 390,
    viewportHeight: 844,
    video: false,
  },
});
