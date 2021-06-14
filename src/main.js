// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'core-js'

import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import VueI18n from 'vue-i18n'
import VueMeta from 'vue-meta'
import App from './App'
import { createRouter } from './router'
import { createStore } from './store'
import { sync } from 'vuex-router-sync'
import * as svgicon from 'vue-svgicon'
import eng from './i18n/eng'
import deu from './i18n/deu'
import moment from 'moment'
import axios from 'axios'
import PhaidraVueComponents from 'phaidra-vue-components/src/components'
import vuetify from './plugins/vuetify'

export async function createApp ({
  beforeApp = () => {},
  afterApp = () => {}
} = {}, context) {
  Vue.config.productionTip = false

  Vue.use(Vuetify)
  Vue.use(VueI18n)
  Vue.use(VueMeta)
  Vue.use(PhaidraVueComponents)

  Vue.prototype.$http = axios

  Vue.use(svgicon, {
    tagName: 'icon',
    defaultWidth: '1em',
    defaultHeight: '1em'
  })

  const messages = { eng, deu }
  const i18n = new VueI18n({
    locale: 'deu',
    fallbackLocale: 'eng',
    silentTranslationWarn: true,
    messages
  })

  Vue.filter('date', function (value) {
    if (value) {
      return moment(String(value)).format('DD.MM.YYYY')
    }
  })

  Vue.filter('dateyear', function (value) {
    if (value) {
      if (String(value).match(/^\d{4}$/g)) {
        return value
      } else {
        return moment(String(value)).format('YYYY')
      }
    }
  })

  Vue.filter('time', function (value) {
    if (value) {
      return moment(String(value)).format('DD.MM.YYYY hh:mm:ss')
    }
  })

  Vue.filter('unixtime', function (value) {
    if (value) {
      return moment.unix(String(value)).format('DD.MM.YYYY hh:mm:ss')
    }
  })

  Vue.filter('capitalize', function (value) {
    if (!value) return ''
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
  })

  Vue.filter('bytes', function (bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-'
    if (typeof precision === 'undefined') precision = 1
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB']
    var number = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number]
  })

  Vue.filter('truncate', function (text, length, clamp) {
    clamp = clamp || '...'
    length = length || 30

    if (text.length <= length) return text

    var tcText = text.slice(0, length - clamp.length)
    var last = tcText.length - 1

    while (last > 0 && tcText[last] !== ' ' && tcText[last] !== clamp[0]) last -= 1

    // Fix for case when text does not have any space
    last = last || length - clamp.length

    tcText = tcText.slice(0, last)

    return tcText + clamp
  })

  // create router and store instances
  const router = createRouter()

  let token
  if (context) {
    let value = '; ' + context.req.headers.cookie
    let parts = value.split('; X-XSRF-TOKEN=')
    if (parts.length === 2) {
      let val = parts.pop().split(';').shift()
      token = val === ' ' ? null : val
    }
  }
  const store = createStore(token)

  router.afterEach((to, from) => {
    store.commit('updateBreadcrumbs', { to, from })
  })

  // sync so that route state is available as part of the store
  sync(store, router)

  await beforeApp({
    router,
    store,
    i18n,
    vuetify
  })

  const app = new Vue({
    router,
    store,
    i18n,
    vuetify,
    render: h => h(App)
  })

  const result = {
    app,
    router,
    store,
    i18n,
    vuetify
  }

  await afterApp(result)

  return result
}
