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
