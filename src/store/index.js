import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import vocabulary from 'phaidra-vue-components/src/store/modules/vocabulary'
import config from '../config/phaidra-ir'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export function createStore () {
  return new Vuex.Store({
    state: () => ({
      config: config,
      instanceconfig: {
        baseurl: config.phaidrabaseurl,
        api: config.api,
        solr: config.solr,
        primary: config.primary,
        institution: config.institution,
        address: config.address,
        phone: config.phone,
        email: config.email
      },
      appconfig: config,
      snackbar: false,
      alerts: [],
      objectInfo: null,
      objectMembers: [],
      user: {},
      groups: [],
      breadcrumbs: [],
      pagetitle: null,
      skipsubmitrouteleavehook: false
    }),
    modules: {
      vocabulary
    },
    mutations,
    actions,
    strict: debug
  })
}
