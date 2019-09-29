import Vue from 'vue'

export default {
  updateBreadcrumbs (state, transition) {
    state.breadcrumbs = [
      {
        text: state.config.institution,
        external: true,
        to: 'https://www.univie.ac.at'
      },
      {
        text: state.config.title,
        to: '/'
      }
    ]
    if (transition.to.name === 'search') {
      state.breadcrumbs.push(
        {
          text: 'Search',
          to: transition.to.name,
          disabled: true
        }
      )
    }
    if (transition.to.name === 'detail') {
      if (transition.from.name === 'search') {
        state.breadcrumbs.push(
          {
            text: 'Search',
            to: '/search'
          }
        )
      }
      state.breadcrumbs.push(
        {
          text: 'Detail ' + transition.to.params.pid,
          to: { name: transition.to.name, params: { pid: transition.to.params.pid } },
          disabled: true
        }
      )
    }
    if (transition.to.name === 'metadataeditor') {
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
          text: 'Metadata editor ' + transition.to.params.pid,
          to: { name: transition.to.name, params: { pid: transition.to.params.pid } },
          disabled: true
        }
      )
    }
    if (transition.to.name === 'submit') {
      state.breadcrumbs.push(
        {
          text: 'Submit',
          disabled: true
        }
      )
    }
    if (transition.to.name === 'submit-ir') {
      state.breadcrumbs.push(
        {
          text: 'Submit',
          to: '/submit'
        }
      )
      state.breadcrumbs.push(
        {
          text: 'Submit ' + transition.to.params.submitform,
          disabled: true
        }
      )
    }
    if (transition.to.name === 'admin') {
      state.breadcrumbs.push(
        {
          text: 'Admin',
          disabled: true
        }
      )
    }
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
    for (let a of alerts) {
      if (a.type === 'success') {
        state.snackbar = true
      }
    }
    state.alerts = alerts
  },
  clearAlert (state, alert) {
    state.alerts = state.alerts.filter(e => e !== alert)
  },
  setUsername (state, username) {
    Vue.set(state.user, 'username', username)
  },
  setToken (state, token) {
    Vue.set(state.user, 'token', token)
  },
  setLoginData (state, logindata) {
    Vue.set(state.user, 'username', logindata.username)
    Vue.set(state.user, 'firstname', logindata.firstname)
    Vue.set(state.user, 'lastname', logindata.lastname)
    Vue.set(state.user, 'email', logindata.email)
    Vue.set(state.user, 'org_units_l1', logindata.org_units_l1)
    Vue.set(state.user, 'org_units_l2', logindata.org_units_l2)
  },
  clearUser (state) {
    state.user = {}
  },
  clearStore (state) {
    state.alerts = []
    state.objectInfo = null
    state.objectMembers = []
    state.user = {}
    state.groups = []
    // document.cookie = 'X-XSRF-TOKEN='
  }
}
