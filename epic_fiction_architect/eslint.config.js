import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Enforce strict typing
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Code quality
      'no-console': 'off', // Allow for CLI tool
      'prefer-const': 'error',
      'no-var': 'error',

      // Relaxed rules for this codebase
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',

      // Database wrapper patterns (single-use generics for type inference)
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',

      // Type checking edge cases
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',

      // Test file flexibility
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/no-confusing-void-expression': 'off',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', '*.js', 'eslint.config.js'],
  }
);
