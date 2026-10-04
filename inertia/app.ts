import './app/design/index.css'
import { createInertiaApp, usePage } from '@inertiajs/vue3'
import { createSSRApp, type DefineComponent, h, watch } from 'vue'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

createInertiaApp({
  title: (title) => title || 'HoneyChic',
  resolve: (name) =>
    resolvePageComponent(
      `./pages/${name}.vue`,
      import.meta.glob<DefineComponent>('./pages/**/*.vue')
    ),
  setup({ el, App, props, plugin }) {
    createSSRApp({
      setup() {
        const page = usePage()
        watch(
          () => page.props?.locale,
          (locale) => {
            if (locale === 'en' || locale === 'vi') document.documentElement.lang = locale
          },
          { immediate: true }
        )
        return () => h(App, props)
      },
    })
      .use(plugin)
      .mount(el)
  },
  progress: { color: '#e5802e' },
})
