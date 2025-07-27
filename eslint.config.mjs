import antfu from '@antfu/eslint-config';
import boundaries from 'eslint-plugin-boundaries';
import playwright from 'eslint-plugin-playwright';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default antfu(
  {
    formatters: {
      css: true,
    },
    ignores: [
      'migrations/**/*',
      'src/components/ui',
      'next-env.d.ts',
      'src/router.ts',
      'supabase/functions/**/*',
    ],

    isInEditor: false,
    lessOpinionated: true,

    react: true,

    stylistic: {
      semi: true,
    },

    typescript: true,
  },
  {
    // ...
    settings: {
      'better-tailwindcss': {
        // tailwindcss 4: the path to the entry file of the css based tailwind config (eg: `src/global.css`)
        entryPoint: 'src/global.css',
        // tailwindcss 3: the path to the tailwind config file (eg: `tailwind.config.js`)
        tailwindConfig: 'tailwind.config.js',
      },
    },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.e2e.ts'],
    ...playwright.configs['flat/recommended'],
  },
  {
    plugins: {
      boundaries,
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          {
            from: 'page-index',
            allow: ['page-ui', 'page-container', 'page-hooks', 'lib-searchParams'],
          },
          {
            from: 'page-ui',
            allow: ['shared-components'],
          },
          {
            from: 'page-hooks',
            disallow: ['shared-components'],
          },
          {
            from: 'page-container',
            allow: ['page-ui', 'page-hooks'],
          },
        ],
      }],
    },
    settings: {
      'boundaries/elements': [
        { type: 'page-index', pattern: 'src/pages/**/index.tsx' },
        { type: 'page-ui', pattern: 'src/pages/**/_ui/**/*' },
        { type: 'page-hooks', pattern: 'src/pages/**/_hooks/**/*' },
        { type: 'page-container', pattern: 'src/pages/**/_container/**/*' },
        { type: 'shared-components', pattern: 'src/components/**/*' },
        { type: 'lib-searchParams', pattern: 'src/lib/useAllSearchParams.ts' },
      ],
    },
  },
  {
    rules: {
      'import/order': 'off',
      'node/prefer-global/process': 'off',
      'react/prefer-destructuring-assignment': 'off',
      'sort-imports': 'off',
      'perfectionist/sort-imports': 'off',
      'style/brace-style': ['error', '1tbs'],
      'test/padding-around-all': 'error',
      'test/prefer-lowercase-title': 'off',
      'ts/consistent-type-definitions': ['error', 'type'],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-router-dom',
              importNames: ['redirect', 'useNavigate', 'Link'],
              message: 'Please use @/router instead.',
            },
            {
              name: '@radix-ui/react-select',
              importNames: ['Label'],
              message: 'Please use @/components/ui/label instead.',
            },
            {
              name: '@radix-ui/react-dropdown-menu',
              importNames: ['Label'],
              message: 'Please use @/components/ui/label instead.',
            },
            {
              name: '@radix-ui/react-label',
              message: 'Please use @/components/ui/label instead.',
            },
            {
              name: '@radix-ui/react-select',
              message: 'Please use @/components/ui/select instead.',
            },
          ],
        },
      ],
    },
  },
);
