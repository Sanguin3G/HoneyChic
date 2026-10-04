import { createInertiaApp } from '@inertiajs/vue3'
import type { Page } from '@inertiajs/core'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h, type DefineComponent } from 'vue'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

export default function render(page: Page) {
  return createInertiaApp({
    page,
    render: renderToString,
    title: (title) => title || 'HoneyChic',
    resolve: (name) =>
      resolvePageComponent(
        `./pages/${name}.vue`,
        import.meta.glob<DefineComponent>('./pages/**/*.vue', { eager: true })
      ),
    setup: ({ App, props, plugin }) => createSSRApp({ render: () => h(App, props) }).use(plugin),
  })
}
