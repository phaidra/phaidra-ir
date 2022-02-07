import Vue from 'vue'
import axios from 'axios'
import config from '../config/phaidra-ir'

export const state = () => ({
  loading: false,
  config,
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
  user: {
    token: null
  },
  groups: [],
  breadcrumbs: [],
  pagetitle: null,
  skipsubmitrouteleavehook: false
})

export const mutations = {
  updateBreadcrumbs (state, transition) {
    let pagetitle
    let usepagetitle = true
    state.breadcrumbs = [
      {
        text: state.config.institution,
        external: true,
        to: state.config.institutionurl
      },
      {
        text: state.config.title,
        to: '/'
      }
    ]
    if (transition.to.path.includes('search')) {
      pagetitle = 'Search'
      state.breadcrumbs.push(
        {
          text: pagetitle,
          to: transition.to.name,
          disabled: true
        }
      )
    }
    if (transition.to.path.includes('detail')) {
      usepagetitle = false
      if (transition.from.path.includes('search')) {
        state.breadcrumbs.push(
          {
            text: 'Search',
            to: '/search'
          }
        )
      }
      state.breadcrumbs.push(
        {
          text: pagetitle,
          to: transition.to.path
        }
      )
    }
    if (transition.to.name === 'stats') {
      if (transition.from.name === 'detail') {
        state.breadcrumbs.push(
          {
            text: 'Detail ' + transition.from.params.pid,
            to: { name: transition.from.name, params: { pid: transition.from.params.pid } }
          }
        )
      }
      state.breadcrumbs.push(
        {
          text: 'Statistics of object ' + transition.to.params.pid,
          to: { name: transition.to.name, params: { pid: transition.to.params.pid } },
          disabled: true
        }
      )
    }
    if (transition.to.name === 'metadataeditor') {
      pagetitle = 'Metadata editor ' + transition.to.params.pid
      if (transition.from.name === 'admin') {
        state.breadcrumbs.push(
          {
            text: 'Admin',
            to: { name: 'admin' }
          }
        )
      }
      state.breadcrumbs.push(
        {
          text: pagetitle,
          to: { name: transition.to.name, params: { pid: transition.to.params.pid } },
          disabled: true
        }
      )
    }
    if (transition.to.name === 'submit') {
      pagetitle = 'Upload'
      state.breadcrumbs.push(
        {
          text: pagetitle,
          disabled: true
        }
      )
    }
    if (transition.to.name === 'submit-ir') {
      pagetitle = 'Upload ' + transition.to.params.submitform
      state.breadcrumbs.push(
        {
          text: 'Upload',
          to: '/submit'
        }
      )
      state.breadcrumbs.push(
        {
          text: pagetitle,
          disabled: true
        }
      )
    }
    if (transition.to.name === 'adminsubmit') {
      pagetitle = 'Upload'
      state.breadcrumbs.push(
        {
          text: 'Admin',
          to: { name: 'admin' }
        }
      )
      state.breadcrumbs.push(
        {
          text: pagetitle,
          disabled: true
        }
      )
    }
    if (transition.to.name === 'adminsubmitform') {
      pagetitle = 'Upload ' + transition.to.params.submitform
      state.breadcrumbs.push(
        {
          text: 'Admin',
          to: { name: 'admin' }
        }
      )
      state.breadcrumbs.push(
        {
          text: 'Upload',
          to: '/admin/submit'
        }
      )
      state.breadcrumbs.push(
        {
          text: pagetitle,
          disabled: true
        }
      )
    }
    if (transition.to.name === 'admin') {
      pagetitle = 'Admin'
      state.breadcrumbs.push(
        {
          text: pagetitle,
          disabled: true
        }
      )
    }
    if (transition.to.name === 'about') {
      pagetitle = 'About'
      state.breadcrumbs.push(
        {
          text: pagetitle,
          disabled: true
        }
      )
    }
    if (transition.to.path.includes('policy')) {
      pagetitle = 'Policy'
      state.breadcrumbs.push(
        {
          text: pagetitle,
          disabled: true
        }
      )
    }
    if (transition.to.path.includes('contact')) {
      pagetitle = 'Contact'
      state.breadcrumbs.push(
        {
          text: pagetitle,
          disabled: true
        }
      )
    }
    if (transition.to.path.includes('impressum')) {
      pagetitle = 'Impressum'
      state.breadcrumbs.push(
        {
          text: pagetitle,
          disabled: true
        }
      )
    }
    if (transition.to.path.includes('metadatapolicy')) {
      pagetitle = 'Metadata policy'
      state.breadcrumbs.push(
        {
          text: pagetitle,
          disabled: true
        }
      )
    }
    if (transition.to.path.includes('terms')) {
      pagetitle = 'Terms of use'
      state.breadcrumbs.push(
        {
          text: pagetitle,
          disabled: true
        }
      )
    }

    if (pagetitle) {
      state.pagetitle = state.config.title + ' - ' + pagetitle
    } else {
      state.pagetitle = state.config.title
    }

    if (usepagetitle && process.browser) {
      document.title = state.pagetitle
    }
  },
  setLoading (state, loading) {
    state.loading = loading
  },
  setGroups (state, groups) {
    state.groups = groups
  },
  setObjectInfo (state, objectInfo) {
    state.objectInfo = objectInfo
  },
  setObjectMembers (state, objectMembers) {
    state.objectMembers = objectMembers
  },
  switchInstance (state, instance) {
    state.instance = state.config.instances[instance]
  },
  hideSnackbar (state) {
    state.snackbar = false
  },
  setAlerts (state, alerts) {
    for (const a of alerts) {
      if (a.type === 'success') {
        state.snackbar = true
      }
    }
    state.alerts = alerts
  },
  clearAlert (state, alert) {
    state.alerts = state.alerts.filter(e => e !== alert)
  },
  setUserData (state, user) {
    const data = {
      ...state.user,
      ...user
    }
    state.user = data
    if (user) {
      this.$cookies.set('user', user)
    }
  },
  setUserToken (state, token) {
    const data = {
      ...state.user,
      token
    }
    state.user = data
    if (token) {
      this.$cookies.set('token', token)
    }
  },
  setUsername (state, username) {
    Vue.set(state.user, 'username', username)
  },
  setToken (state, token) {
    this.$cookies.set('token', token)
    Vue.set(state.user, 'token', token)
  },
  setLoginData (state, logindata) {
    const user = {
      username: logindata.username,
      firstname: logindata.firstname,
      lastname: logindata.lastname,
      email: logindata.email,
      org_units_l1: logindata.org_units_l1,
      org_units_l2: logindata.org_units_l2
    }
    const data = {
      ...state.user,
      ...user
    }
    state.user = data
    this.$cookies.set('user', user)
  },
  setSkipsubmitrouteleavehook (state, value) {
    state.skipsubmitrouteleavehook = value
  },
  clearUser (state) {
    state.user = {}
    this.$cookies.remove('token')
    this.$cookies.remove('user')
  },
  clearStore (state) {
    state.alerts = []
    state.objectInfo = null
    state.objectMembers = []
    state.user = {}
    state.groups = []
    this.$cookies.remove('token')
    this.$cookies.remove('user')
    // document.cookie = 'X-XSRF-TOKEN='
  }
}

export const actions = {

  nuxtServerInit ({ commit }, { req }) {
    const token = this.$cookies.get('token')
    const user = this.$cookies.get('user')
    commit('setUserData', user)
    commit('setToken', token)
  },

  async fetchObjectInfo ({ commit, state }, pid) {
    try {
      let response
      if (state.user.token) {
        response = await axios.get(state.instanceconfig.api + '/object/' + pid + '/info',
          {
            headers: {
              'X-XSRF-TOKEN': state.user.token
            }
          }
        )
      } else {
        response = await axios.get(state.instanceconfig.api + '/object/' + pid + '/info')
      }
      commit('setObjectInfo', response.data.info)
    } catch (error) {
    }
  },
  async fetchObjectMembers ({ dispatch, commit, state }, parent) {
    commit('setObjectMembers', [])
    try {
      if (parent.members.length > 0) {
        const members = []
        for (const doc of parent.members) {
          let memresponse
          if (state.user.token) {
            memresponse = await axios.get(state.instanceconfig.api + '/object/' + doc.pid + '/info',
              {
                headers: {
                  'X-XSRF-TOKEN': state.user.token
                }
              }
            )
          } else {
            memresponse = await axios.get(state.instanceconfig.api + '/object/' + doc.pid + '/info')
          }
          members.push(memresponse.data.info)
        }
        commit('setObjectMembers', members)
      } else {
        commit('setObjectMembers', [])
      }
    } catch (error) {
    }
  },
  async getLoginData ({ commit, dispatch, state }) {
    try {
      const response = await axios.get(state.instanceconfig.api + '/directory/user/data', {
        headers: {
          'X-XSRF-TOKEN': state.user.token
        }
      })
      if (response.data.alerts && response.data.alerts.length > 0) {
        commit('setAlerts', response.data.alerts)
      }
      commit('setLoginData', response.data.user_data)
    } catch (error) {
      if (error.response.status === 401) {
        commit('setAlerts', [{ type: 'danger', msg: 'You have been logged out' }])
        commit('setToken', null)
        commit('setLoginData', { username: null, firstname: null, lastname: null, email: null, org_units_l1: null, org_units_l2: null })
        if (process.browser) {
          document.cookie = 'X-XSRF-TOKEN=; domain=' + window.location.hostname + '; path=/; secure; samesite=strict; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        }
      }
    }
  },
  async login ({ commit, dispatch, state }, credentials) {
    commit('clearStore')
    commit('setUsername', credentials.username)
    try {
      const response = await axios.get(state.instanceconfig.api + '/signin', {
        headers: {
          Authorization: 'Basic ' + btoa(credentials.username + ':' + credentials.password)
        }
      })
      if (response.data.alerts && response.data.alerts.length > 0) {
        commit('setAlerts', response.data.alerts)
      }
      if (response.status === 200) {
        if (process.browser) {
          document.cookie = 'X-XSRF-TOKEN=' + response.data['XSRF-TOKEN'] + '; domain=' + window.location.hostname + '; path=/; secure; samesite=strict'
        }
        commit('setToken', response.data['XSRF-TOKEN'])
        dispatch('getLoginData')
      }
    } catch (error) {
      commit('setAlerts', [{ type: 'danger', msg: 'Login failed' }])
    }
  },
  async logout ({ commit, dispatch, state }) {
    this.$cookies.remove('token')
    this.$cookies.remove('user')
    commit('clearStore')
    if (process.browser) {
      document.cookie = 'X-XSRF-TOKEN=; domain=' + window.location.hostname + '; path=/; secure; samesite=strict; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    }
    try {
      const response = await axios.get(state.instanceconfig.api + '/signout', {
        headers: {
          'X-XSRF-TOKEN': state.user.token
        }
      })
      commit('clearStore')
      if (response.data.alerts && response.data.alerts.length > 0) {
        // commit('setAlerts', response.data.alerts)
      }
    } catch (error) {
      commit('clearStore')
    }
  },
  async getUserGroups ({ commit, state }) {
    commit('clearAlerts')
    try {
      const response = await axios.get(state.instanceconfig.api + '/groups', {
        headers: {
          'X-XSRF-TOKEN': state.user.token
        }
      })
      if (response.data.alerts && response.data.alerts.length > 0) {
        commit('setAlerts', response.data.alerts)
      }
      commit('setGroups', response.data.groups)
    } catch (error) {
    }
  },
  switchInstance ({ commit }, instance) {
    commit('switchInstance', instance)
  }
}

export const getters = {
  token: state => state.user.token
}
