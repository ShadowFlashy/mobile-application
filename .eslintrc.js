// ESLint config (Expo guide: https://docs.expo.dev/guides/using-eslint/).
// The custom rules enforce the course's development guidelines automatically.

// LIVERY (SPEC §7.11): colours live only in src/theme tokens. Every LIVERY rule below is an `error`
// (switched from `warn` by I10).
const NO_COLOUR_LITERALS = [
  {
    selector: 'Literal[value=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
    message: 'Colours live in src/theme tokens.',
  },
  { selector: 'Literal[value=/^rgba?\\(/]', message: 'Colours live in src/theme tokens.' },
];

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
    // Order matters: ESLint does not merge options of the same rule across overrides (the later one
    // wins), so the colour override comes first and the screen override repeats its selectors.
    {
      files: ['src/**/*.{ts,tsx}', 'app/**/*.tsx'],
      excludedFiles: ['src/theme/**'],
      rules: { 'no-restricted-syntax': ['error', ...NO_COLOUR_LITERALS] },
    },
    {
      // Screens contain zero styling (lecturer: use only style components).
      files: ['app/**/*.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'react-native',
                importNames: [
                  'StyleSheet',
                  'View',
                  'Text',
                  'Image',
                  'Pressable',
                  'ScrollView',
                  'FlatList',
                  'TouchableOpacity',
                  'SectionList',
                ],
                message: 'Screens compose src/components only (lecturer: use only style components).',
              },
            ],
            patterns: [
              {
                group: ['**/theme', '**/theme/*'],
                importNames: ['useTheme', 'createThemedStyles', 'StyleSheet'],
                message: 'No styling in screens.',
              },
            ],
          },
        ],
        'no-restricted-syntax': [
          'error',
          ...NO_COLOUR_LITERALS,
          {
            selector:
              'JSXAttribute[name.name=/^(style|contentContainerStyle|columnWrapperStyle|ListHeaderComponentStyle|ListFooterComponentStyle|color|backgroundColor|textColor)$/]',
            message: 'No styling props in screens: use component variants/tones.',
          },
        ],
      },
    },
    {
      // The hand-written service worker runs in the service worker scope (self, caches, clients).
      files: ['public/sw.js'],
      env: { serviceworker: true, browser: true },
    },
    {
      // Supabase Edge Functions run on Deno: `Deno` global and jsr:/npm: import specifiers.
      files: ['supabase/functions/**/*.ts'],
      globals: { Deno: 'readonly' },
      rules: { 'import/no-unresolved': 'off' },
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
    },
  ],
};
