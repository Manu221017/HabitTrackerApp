// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');
const { defineConfig } = require('eslint/config');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  {
    files: ['**/__tests__/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      // Los tests reasignan mocks de módulos ES (`Device`, etc.)
      'import/namespace': 'off',
    },
  },
  {
    ignores: ['node_modules/**', '.expo/**', 'dist/**', 'web-build/**'],
  },
]);
