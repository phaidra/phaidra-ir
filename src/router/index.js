import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Search from '@/components/Search'
import Detail from '@/components/Detail'
import Stats from '@/components/Stats'
import Metadata from '@/components/Metadata'
import MetadataEditor from '@/components/MetadataEditor'
import SubmitIr from '@/components/SubmitIr'
import Submit from '@/components/Submit'
import AdminSearch from '@/components/AdminSearch'
import AdminSubmitIr from '@/components/AdminSubmitIr'
import AdminSubmit from '@/components/AdminSubmit'
import Credits from '@/components/info/Credits'
import Policy from '@/components/info/Policy'
import Contact from '@/components/info/Contact'
import Impressum from '@/components/info/Impressum'
import MetadataPolicy from '@/components/info/MetadataPolicy'
import TermsOfUse from '@/components/info/TermsOfUse'
import Home from '@/components/info/Home'
import NotFound from '@/components/NotFound'

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
        path: '/detail/:pid/stats',
        name: 'stats',
        component: Stats
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
        component: AdminSearch
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
      },
      {
        path: '/info/credits',
        name: 'credits',
        component: Credits
      },
      {
        path: '/info/policy',
        name: 'policy',
        component: Policy
      },
      {
        path: '/info/contact',
        name: 'contact',
        component: Contact
      },
      {
        path: '/info/impressum',
        name: 'impressum',
        component: Impressum
      },
      {
        path: '/info/metadata_policy',
        name: 'metadata-policy',
        component: MetadataPolicy
      },
      {
        path: '/info/terms',
        name: 'terms',
        component: TermsOfUse
      },
      {
        path: '*',
        name: 'notfound',
        component: NotFound
      }
    ],
    scrollBehavior () {
      return { x: 0, y: 0 }
    }
  })
}
