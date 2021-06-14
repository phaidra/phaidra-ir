import Vue from 'vue'

export default {
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
    if (transition.to.name === 'search') {
      pagetitle = 'Search'
      state.breadcrumbs.push(
        {
          text: pagetitle,
          to: transition.to.name,
          disabled: true
        }
      )
    }
    if (transition.to.name === 'detail') {
      usepagetitle = false
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
          text: pagetitle,
          to: { name: transition.to.name, params: { pid: transition.to.params.pid } },
          disabled: true
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
    if (transition.to.name === 'policy') {
      pagetitle = 'Policy'
      state.breadcrumbs.push(
        {
          text: pagetitle,
          disabled: true
        }
      )
    }
    if (transition.to.name === 'contact') {
      pagetitle = 'Contact'
      state.breadcrumbs.push(
        {
          text: pagetitle,
          disabled: true
        }
      )
    }
    if (transition.to.name === 'impressum') {
      pagetitle = 'Impressum'
      state.breadcrumbs.push(
        {
          text: pagetitle,
          disabled: true
        }
      )
    }
    if (transition.to.name === 'metadata-policy') {
      pagetitle = 'Metadata policy'
      state.breadcrumbs.push(
        {
          text: pagetitle,
          disabled: true
        }
      )
    }
    if (transition.to.name === 'terms-of-use') {
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
  setSkipsubmitrouteleavehook (state, value) {
    state.skipsubmitrouteleavehook = value
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
