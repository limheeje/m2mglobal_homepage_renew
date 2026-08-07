// @ts-check
import eslintPluginAstro from 'eslint-plugin-astro'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  ...tseslint.configs.recommended,
  eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.{js,mjs,ts,astro}'],
    plugins: {
      prettier: eslintPluginPrettier,
      'unused-imports': unusedImports
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          semi: false,
          singleQuote: true,
          arrowParens: 'always',
          bracketSpacing: false,
          endOfLine: 'auto',
          printWidth: 120,
          proseWrap: 'preserve',
          tabWidth: 2,
          trailingComma: 'none',
          useTabs: false
        }
      ],
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'all',
          argsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  },
  {
    files: ['**/*.astro', '**/*.astro/*.js', '**/*.astro/*.ts'],
    rules: {
      'prettier/prettier': 'off'
    }
  },
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**']
  }
)
