import { configApp } from '@adonisjs/eslint-config'
import { vue } from '@adonisjs/eslint-config/vue'

export default configApp(
  {
    ignores: ['.honeychic-tools/**', 'vendor/**', 'storage/**', 'bootstrap/**', 'public/assets/**'],
  },
  ...vue,
  // Use Inertia's standard URL links without adding a generated route client.
  { files: ['inertia/**/*.vue'], rules: { '@adonisjs/prefer-adonisjs-inertia-link': 'off' } },
  { files: ['inertia/**/*.ts'], rules: { 'vue/component-api-style': 'off' } },
  {
    files: ['inertia/app/**/*.vue', 'inertia/features/**/*.vue', 'inertia/modules/**/*.vue'],
    rules: { '@unicorn/filename-case': ['error', { case: 'pascalCase' }] },
  }
)
