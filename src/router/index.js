import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Login from '@/components/Login'
import Search from '@/components/Search'
import Detail from '@/components/Detail'
import Metadata from '@/components/Metadata'
import MetadataEditor from '@/components/MetadataEditor'
import SubmitIr from '@/components/SubmitIr'
import Submit from '@/components/Submit'
import Admin from '@/components/Admin'
import AdminSubmitIr from '@/components/AdminSubmitIr'
import AdminSubmit from '@/components/AdminSubmit'

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
        component: Search
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
      },
      {
        path: '/admin/submit',
        name: 'adminsubmit',
        component: AdminSubmit
      },
      {
        path: '/admin/submit/:submitform',
        name: 'adminsubmitform',
        component: AdminSubmitIr
      }
    ]
  })
}
