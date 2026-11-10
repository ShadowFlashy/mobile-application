// Vite config for Cypress component tests: renders the React Native components in the browser
// through react-native-web, the same way the boilerplate's Storybook setup does.
const { transformAsync } = require('@babel/core');
const { readFileSync } = require('fs');

const REACT_NATIVE_PACKAGE_REGEX = /node_modules[\\/](react-native|@react-native|@expo|expo(-[a-z-]+)?)[\\/].*\.js$/;
const WEB_FIRST_EXTENSIONS = [
  '.web.tsx',
  '.web.ts',
  '.web.jsx',
  '.web.js',
  '.tsx',
  '.ts',
  '.jsx',
  '.js',
  '.mjs',
  '.json',
];

async function stripFlowAndJsx(code, filename) {
  const result = await transformAsync(code, {
    filename,
    babelrc: false,
    configFile: false,
    sourceType: 'unambiguous',
    presets: ['@babel/preset-flow', ['@babel/preset-react', { runtime: 'automatic' }]],
  });
  return result && result.code ? result.code : code;
}

const reactNativeVitePlugin = {
  name: 'react-native-node-modules',
  enforce: 'pre',
  async transform(code, id) {
    if (!REACT_NATIVE_PACKAGE_REGEX.test(id)) return null;
    return { code: await stripFlowAndJsx(code, id) };
  },
};

const reactNativeEsbuildPlugin = {
  name: 'react-native-flow-strip',
  setup(build) {
    build.onLoad({ filter: REACT_NATIVE_PACKAGE_REGEX }, async (args) => {
      const code = readFileSync(args.path, 'utf8');
      return { contents: await stripFlowAndJsx(code, args.path), loader: 'js' };
    });
  },
};

module.exports = {
  resolve: {
    alias: { 'react-native': 'react-native-web' },
    extensions: WEB_FIRST_EXTENSIONS,
  },
  define: {
    __DEV__: 'true',
    'process.env.EXPO_OS': JSON.stringify('web'),
    'process.env.EXPO_PUBLIC_SUPABASE_URL': JSON.stringify('https://example.supabase.co'),
    'process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify('component-test-key'),
  },
  plugins: [reactNativeVitePlugin],
  esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
  optimizeDeps: {
    // Pre-bundled up front, so Vite does not re-optimise (and reload) in the middle of the first run.
    include: ['react-native-svg', 'expo-linear-gradient'],
    esbuildOptions: {
      plugins: [reactNativeEsbuildPlugin],
      jsx: 'automatic',
      jsxImportSource: 'react',
      resolveExtensions: WEB_FIRST_EXTENSIONS,
      loader: { '.js': 'jsx' },
    },
  },
};
