import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Login from '@/components/Login'
import PSearch from 'phaidra-vue-components/src/components/search/PSearch'
import Detail from '@/components/Detail'
import Metadata from '@/components/Metadata'
import MetadataEditor from '@/components/MetadataEditor'
import SubmitIr from '@/components/SubmitIr'
import Submit from '@/components/Submit'
import Admin from '@/components/Admin'

Vue.use(Router)

export function createRouter () {
  return new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home
      },
      {
        path: '/login',
        name: 'login',
        component: Login
      },
      {
        path: '/search',
        name: 'search',
        component: PSearch
      },
      {
        path: '/detail/:pid',
        name: 'detail',
        component: Detail
      },
      {
        path: '/metadata/:pid',
        name: 'metadata',
        component: Metadata
      },
      {
        path: '/metadata/:pid/edit',
        name: 'metadataeditor',
        component: MetadataEditor
      },
      {
        path: '/submit',
        name: 'submit',
        component: Submit
      },
      {
        path: '/submit/:submitform',
        name: 'submit-ir',
        component: SubmitIr
      },
      {
        path: '/admin',
        name: 'admin',
        component: Admin
      }
    ]
  })
}
