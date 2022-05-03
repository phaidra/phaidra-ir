import axios from "axios"
import config from '../config/phaidra-ir'

export default ({ app, store }) => {
  app.router.beforeEach(async (to, from, next) => {
    if (store.state.user.token) {
      try {
        await axios.request({
          method: 'GET',
          url: config.api + '/keepalive',
          headers: {
            'X-XSRF-TOKEN': store.state.user.token
          }
        })
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            console.log('failed keepalive, logging out ' + error)
            await store.dispatch('logout')
          }
        }
      } finally {
        next()
      }
    } else {
      next()
    }
  })
  app.router.beforeEach(async (to, from, next) => {
    if ((to.path.includes('admin'))) {
      let token
      if (process.browser) {
        let value = '; ' + document.cookie
        let parts = value.split('; X-XSRF-TOKEN=')
        if (parts.length === 2) {
          let val = parts.pop().split(';').shift()
          token = val === ' ' ? null : val
        }
      }
      if (!token) {
        console.log('admin access rejected: no token')
        next('/')
        return
      } else {
        try {
          // let response = await axios.get(config.api + '/directory/user/data', { headers: { 'X-XSRF-TOKEN': token } })
          if (app.store && app.store.state.user.username) {
            if (app.store.state.user.username === config.iraccount) {
              next()
              return
            }
          }
          console.log('admin access rejected: wrong user: ' + app.store.state.user.username)
          next('/')
        } catch (error) {
          console.log('admin access rejected: user data request error:')
          console.log(error)
          next('/')
        }
      }
    }
    next()
  })
}
