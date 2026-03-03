module.exports = {
  root: true,
  ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**'],
  overrides: [
    {
      files: ['apps/api/**/*.js'],
      env: {
        node: true,
        es2021: true,
        jest: true,
      },
      parserOptions: {
        ecmaVersion: 'latest',
      },
      extends: ['eslint:recommended'],
      rules: {
        eqeqeq: 'error',
        curly: 'error',
        'prefer-const': 'error',
        'no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
        'no-console': 'off',
      },
    },
    {
      files: ['apps/ui/**/*.{js,jsx}'],
      env: {
        browser: true,
        es2021: true,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
      ],
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        eqeqeq: 'error',
        'prefer-const': 'error',
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
      },
    },
  ],
};
