// ESLint config (Expo guide: https://docs.expo.dev/guides/using-eslint/).
// The custom rules enforce the course's development guidelines automatically.
module.exports = {
  extends: ['expo', 'prettier'],
  // Dot-folders are skipped by ESLint unless re-included: the Storybook config is linted too.
  ignorePatterns: ['/dist/*', '/storybook-static/*', '/.expo/*', '/node_modules/*', '!.storybook'],
  rules: {
    // "Everything is typed": no any, no non-null assertions, no `as` casts (`as const` stays allowed).
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
    // Course ch. 8: correct dependency arrays.
    'react-hooks/exhaustive-deps': 'error',
    // Course ch. 4: no browser-only APIs in shared code (they do not exist in the native app).
    'no-restricted-globals': [
      'error',
      { name: 'localStorage', message: 'Use AsyncStorage through a service instead.' },
      { name: 'sessionStorage', message: 'Use AsyncStorage through a service instead.' },
      { name: 'alert', message: 'Use ConfirmDialog or a toast instead of alert().' },
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  overrides: [
    {
      // The hand-written service worker runs in the service worker scope (self, caches, clients).
      files: ['public/sw.js'],
      env: { serviceworker: true, browser: true },
    },
    {
      // Small Node build scripts: printing is their output.
      files: ['scripts/**/*.mjs'],
      env: { node: true },
      rules: { 'no-console': 'off' },
    },
    {
      files: ['cypress/**/*.ts', '*.cy.ts', '*.cy.tsx', 'cypress.config.js', 'scripts/**/*.mjs'],
      env: { mocha: true, node: true },
      globals: { cy: 'readonly', Cypress: 'readonly' },
      rules: { '@typescript-eslint/consistent-type-assertions': 'off' },
    },
  ],
};
