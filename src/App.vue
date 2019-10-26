<template>
  <v-app>
    <v-container fluid>
      <v-row no-gutters>
        <v-col>

          <quicklinks :showquicklinks="quicklinksenabled"></quicklinks>

          <v-row no-gutters>
            <v-col cols="12" md="10" offset-md="1" class="header">

              <v-row no-gutters>
                <v-col class="text-left" cols="3" >
                  <router-link :to="'/'">
                    <img src="./assets/Uni_Logo_2016.png" class="logo" alt="logo" />
                  </router-link>
                </v-col>

                <v-col cols="9">

                  <v-row justify="end">
                    <icon v-if="signedin" class="personicon mr-2 univie-grey" name="material-social-person" width="24px" height="24px"></icon>
                    <span v-if="signedin" class="subheading displayname univie-grey">{{ user.firstname }} {{ user.lastname }}</span>

                    <v-menu bottom transition="slide-y-transition" class="v-align-top">
                      <template v-slot:activator="{ on }">
                        <v-btn text v-on="on" class="top-margin-lang">
                          <span class="grey--text text--darken-1">{{$i18n.locale}}</span>
                          <icon name="univie-sprache" class="lang-icon grey--text text--darken-1"></icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="$i18n.locale='eng'">
                          <v-list-item-title>English</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="$i18n.locale='deu'">
                          <v-list-item-title>Deutsch</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="$i18n.locale='ita'">
                          <v-list-item-title>Italiano</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>

                    <a id="quicklinks-button" class="ph-button" v-on:click="quicklinksenabled = !quicklinksenabled">Quicklinks</a>

                  </v-row>

                  <v-row>
                    <v-col class="text-left" cols="10" offset="1" v-if="config.title">
                      <icon left dark name="univie-right" color="#a4a4a4" width="14px" height="14px" class="mb-1"></icon>
                      <router-link class="subheading primary--text mx-3" :to="'/'">{{ config.title }}</router-link>
                    </v-col>
                  </v-row>

                  <v-row>

                    <v-toolbar flat color="white" dense>
                      <client-only placeholder="loading" placeholder-tag="span">
                        <v-app-bar-nav-icon class="hidden-md-and-up">
                          <v-menu offset-y>
                            <template v-slot:activator="{ on }">
                              <v-btn text icon color="grey lighten-1" v-on="on"><icon name="material-navigation-menu" width="24px" height="24px"></icon></v-btn>
                            </template>
                            <v-list>
                              <v-list-item @click="$router.push('about')"><v-list-item-title>{{ $t('ABOUT_LINK', { name: config.title })}}</v-list-item-title></v-list-item>
                              <v-list-item @click="$router.push('policy')"><v-list-item-title>{{ $t("Policy") }}</v-list-item-title></v-list-item>
                              <v-list-item @click="$router.push('contact')"><v-list-item-title>{{ $t("Contact") }}</v-list-item-title></v-list-item>
                              <v-list-item @click="$router.push('search')"><v-list-item-title>{{ $t("Search") }}</v-list-item-title></v-list-item>
                              <v-list-item v-if="signedin" @click="$router.push('submit')"><v-list-item-title>{{ $t("Submit") }}</v-list-item-title></v-list-item>
                              <v-list-item v-if="signedin && (user.username === config.iraccount)" @click="$router.push('admin')"><v-list-item-title>{{ $t("Admin") }}</v-list-item-title></v-list-item>
                              <v-list-item v-if="!signedin && config.enablelogin" @click="$router.push('login')"><v-list-item-title>{{ $t("Login") }}</v-list-item-title></v-list-item>
                              <v-list-item v-if="signedin" @click="logout()"><v-list-item-title>{{ $t("Logout") }}</v-list-item-title></v-list-item>
                            </v-list>
                          </v-menu>
                        </v-app-bar-nav-icon>
                      </client-only>
                      <v-spacer></v-spacer>
                      <v-toolbar-items class="hidden-sm-and-down no-height-inherit">
                        <v-hover v-slot:default="{ hover }">
                          <router-link :class="hover ? 'ph-button primary' : 'ph-button grey'" :to="{ path: '/info/about' }">{{ $t('ABOUT_LINK', { name: config.title })}}</router-link>
                        </v-hover>
                        <v-hover v-slot:default="{ hover }">
                          <router-link :class="hover ? 'ph-button primary' : 'ph-button grey'" :to="{ path: '/info/policy' }">{{ $t("Policy") }}</router-link>
                        </v-hover>
                        <v-hover v-slot:default="{ hover }">
                          <router-link :class="hover ? 'ph-button primary' : 'ph-button grey'" :to="{ path: '/info/contact' }">{{ $t("Contact") }}</router-link>
                        </v-hover>
                        <v-hover v-slot:default="{ hover }">
                          <router-link :class="hover ? 'ph-button primary' : 'ph-button grey'" :to="{ path: '/search' }">{{ $t("Search") }}</router-link>
                        </v-hover>
                        <v-hover v-slot:default="{ hover }">
                          <router-link :class="hover ? 'ph-button primary' : 'ph-button grey'" v-if="signedin" :to="'/submit'">{{ $t("Submit") }}</router-link>
                        </v-hover>
                        <v-hover v-slot:default="{ hover }">
                          <router-link :class="hover ? 'ph-button primary' : 'ph-button grey'" v-if="signedin && (user.username === config.iraccount)" :to="'/admin'">{{ $t("Admin") }}</router-link>
                        </v-hover>
                        <v-hover v-slot:default="{ hover }">
                          <router-link :class="hover ? 'ph-button primary' : 'ph-button grey'" v-if="!signedin" :to="'/login'">{{ $t("Login") }}</router-link>
                        </v-hover>
                        <v-hover v-slot:default="{ hover }">
                          <a class="flat dark ph-button grey" v-if="signedin" @click="logout()" >{{ $t("Logout") }}</a>
                        </v-hover>
                      </v-toolbar-items>
                    </v-toolbar>

                  </v-row>

                </v-col>
              </v-row>

            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="10" offset-md="1" class="content">
              <p-breadcrumbs :items="breadcrumbs"></p-breadcrumbs>

              <v-row justify="center" v-for="(alert, i) in alerts" :key="i">
                <v-col cols="12">
                  <v-snackbar class="font-weight-regular" top color="success" v-if="alert.type === 'success'" v-model="showSnackbar">
                    {{alert.msg}}
                    <v-btn dark text @click.native="dismiss(alert)">OK</v-btn>
                  </v-snackbar>
                  <v-alert v-else prominent :type="(alert.type === 'danger' ? 'error' : alert.type)" :value="true" transition="slide-y-transition">
                    <v-row align="center">
                      <v-col class="grow">{{alert.msg}}</v-col>
                      <v-col class="shrink">
                        <v-btn icon @click.native="dismiss(alert)"><v-icon>mdi-close</v-icon></v-btn>
                      </v-col>
                    </v-row>
                  </v-alert>
                </v-col>
              </v-row>

              <transition name="fade" mode="out-in">
                <keep-alive>
                  <router-view class="mb-3"></router-view>
                </keep-alive>
              </transition>

            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <quicklinks-footer></quicklinks-footer>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="10" offset-md="1">
              <v-row   class="my-5">
                <v-col class="text-left" >
                  <span class="grey--text text--darken-2"><address>{{ config.address }} | <abbr title="Telefon">T</abbr> {{ config.phone }}</address></span>
                </v-col>
                <v-col class="text-right" >
                  <router-link :to="'/info/impressum'">{{ $t('Impressum') }}</router-link> | <router-link :to="'/info/metadata_policy'">{{ $t('Metadata policy') }}</router-link> | <router-link :to="'/info/terms'">{{ $t('Terms of use') }}</router-link> | powered by <a :href="'https://' + config.phaidrabaseurl">Phaidra</a>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import '@/assets/css/material-icons.css'
import Quicklinks from '@/components/Quicklinks'
import QuicklinksFooter from '@/components/QuicklinksFooter'
import '@/compiled-icons/material-social-person'
import '@/compiled-icons/material-navigation-menu'
import '@/compiled-icons/univie-sprache'
import ClientOnly from 'vue-client-only'
import { context } from '@/mixins/context'
import { config } from '@/mixins/config'

export default {
  name: 'app',
  mixins: [ context, config ],
  components: {
    Quicklinks,
    QuicklinksFooter,
    ClientOnly
  },
  data () {
    return {
      quicklinksenabled: 0
    }
  },
  computed: {
    showSnackbar: {
      get: function () {
        return this.$store.state.snackbar
      },
      set: function (newValue) {
        if (!newValue) {
          this.$store.commit('hideSnackbar')
        }
      }
    },
    breadcrumbs () {
      return this.$store.state.breadcrumbs
    },
    alerts () {
      return this.$store.state.alerts
    },
    instances () {
      return Object.keys(this.$store.state.config.instances)
    }
  },
  methods: {
    logout: function () {
      this.$store.dispatch('logout')
    },
    getCookie: function (name) {
      var value = '; ' + document.cookie
      var parts = value.split('; ' + name + '=')
      if (parts.length === 2) {
        var val = parts.pop().split(';').shift()
        return val === ' ' ? null : val
      }
    },
    dismiss: function (alert) {
      this.$store.commit('clearAlert', alert)
    },
    switchInstance: function (e) {
      this.$store.dispatch('switchInstance', e).then(() => {
        this.$store.commit('clearStore')
        this.$router.push('/search')
        this.$store.dispatch('search')
        this.$vuetify.theme.primary = this.$store.state.config.primary
      })
    }
  },
  mounted: function () {
    // TODO read to cookie serverside too
    var token = this.getCookie('X-XSRF-TOKEN')
    if (token) {
      this.$store.commit('setToken', token)
      if (!this.user.username) {
        this.$store.dispatch('getLoginData')
      }
    }
  },
  created: function () {
    this.$vuetify.theme.themes.light.primary = this.$store.state.config.primary
  }
}
</script>

<style lang="sass">
  @require './stylus/main'
</style>

<style>

.no-padding {
  padding: 0px;
}

.svg-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  color: inherit;
  vertical-align: middle;
  fill: none;
  stroke: currentColor;
}

.svg-fill {
  fill: currentColor;
  stroke: none;
}

.svg-up {
  transform: rotate(0deg);
}

.svg-right {
  transform: rotate(90deg);
}

.svg-down {
  transform: rotate(180deg);
}

.svg-left {
  transform: rotate(-90deg);
}

.ie-fixMinHeight {
    display:flex;
}

html, body{
    height:100%;
}

section { overflow: auto; }

#app {
  font-family: "Roboto", sans-serif, Arial, Helvetica, sans-serif;
  font-size: 11.5pt;
  line-height: 1.42857143;
  color: black;
  background-color: white;
  font-weight: 300;
  text-rendering: optimizeLegibility;
}

a {
  text-decoration: none;
}

.logo {
  height: auto;
  width: auto;
  max-width: 250px;
  max-height: 150px;
}

.header {
  -webkit-box-shadow: 48px 0 0 0 white, -48px 0 0 0 white, 0 8px 40px -6px rgba(70, 70, 70, 0.4);
  box-shadow: 48px 0 0 0 white, -48px 0 0 0 white, 0 8px 40px -6px rgba(70, 70, 70, 0.4);
  background-color: white;
  z-index: 1;
}

address {
  font-style: normal;
}

.v-align-top {
  vertical-align: top;
}

.theme--light.v-card > .v-card__text {
  color: black;
}

.lang-icon {
  margin-left: 5px;
}

.displayname {
  vertical-align: top;
  display: inline-block;
  margin-top: 10px;
}

.ph-button  {
  color: white !important;
  box-sizing: border-box;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  position: relative;
  outline: 0;
  border: 0;
  border-radius: 0px;
  display: inline-block;
  -ms-flex-align: center;
  align-items: center;
  padding: 0 6px;
  margin: 6px 1px 6px 0px;
  height: 30px;
  line-height: 30px;
  min-height: 30px;
  white-space: nowrap;
  min-width: 88px;
  text-align: center;
  font-weight: 300;
  font-size: 14px;
  font-style: inherit;
  font-variant: inherit;
  font-family: inherit;
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  letter-spacing: .010em;
  font-weight: 400;
}

.ph-button:hover {
  background-color: #267ab3;
  text-decoration: none;
  color: white;
  font-weight: 400;
}

#quicklinks-button {
  background-color: #1a74b0;
  text-decoration: none;
  color: white;
  margin-top: 0px;
  width: 263px;
}

#quicklinks-button:hover {
  color: white;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.1s
}
.fade-enter, .fade-leave-to {
  opacity: 0
}

.select-instance {
  max-width: 300px;
}

.border-bottom {
  border-bottom: 1px solid #bdbdbd;
}

.border-top {
  border-top: 1px solid #bdbdbd;
}

#app .v-btn {
  text-transform: none;
}
#app .v-tabs__div {
  text-transform: none;
  font-weight: 300;
}

.univie-grey {
  color: #7b7b7b
}
</style>

<style scoped>
.top-margin-lang {
  margin-top: 0px;
}

.content {
  min-height: 800px;
}

.container {
  padding: 0px;
}

.no-height-inherit {
  height: unset;
}

.personicon {
  align-self: center;
}

.float-right {
  float: right;
}

</style>
