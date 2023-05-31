import config from './config/phaidra-ir'
const path = require('path')

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - phaidra-ir',
    title: 'phaidra-ir',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon-uni.png' }
    ]
  },

  router: {
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      }

      return { x: 0, y: 0 };
    }
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/css/main.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/svg-icon' },
    { src: '~/plugins/vuetify.js', mode: 'client' },
    { src: '~/plugins/phaidra-vue-components' },
    { src: '~/plugins/after-each.js' },
    { src: '~/plugins/before-each.js' },
    { src: '~/plugins/vue-meta.js' },
    { src: '~/plugins/vue-http.js', mode: 'client' },
    { src: '~/plugins/underscore', mode: 'client' },
    { src: '~/plugins/jsonViewer.js', mode: 'client' }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    'nuxt-i18n',
    '@nuxt/http',
    ['cookie-universal-nuxt', { alias: 'cookies' }],
    '@nuxtjs/sentry'
  ],
  sentry: {
    dsn: config?.monitor?.sentry?.dsn
  },
  i18n: {
    langDir: 'locales/',
    locales: [
      {
        name: 'English',
        code: 'eng',
        iso: 'en', // keep 2-letters, used for browser language detection
        file: 'eng'
      },
      {
        name: 'Deutsch',
        code: 'deu',
        iso: 'de',
        file: 'deu'
      }
    ],
    strategy: 'no_prefix',
    fallbackLocale: 'eng',
    defaultLocale: 'deu',
    vueI18n: {
      silentTranslationWarn: true,
      silentFallbackWarn: true
    },
    detectBrowserLanguage: {
      useCookie: true,
      redirectOn: 'root',
      alwaysRedirect: true
    }
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      themes: {
        light: {
          primary: config.primary
        },
        dark: {
          primary: config.primary
        }
      }
    }
  },

  alias: {
    vue: path.resolve(path.join(__dirname, 'node_modules', 'vue')),
    vuetify: path.resolve(path.join(__dirname, 'node_modules', 'vuetify'))
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend (config, { isDev, isClient }) {
      config.node = {
        fs: 'empty'
      }
    },
    transpile: ['phaidra-vue-components', 'vuetify/lib']
  }
}
