<template>
  <v-app>
    <v-container fluid>
      <quicklinks
        v-if="config.quicklinks"
        :showquicklinks="quicklinksenabled"
      ></quicklinks>
      <v-row no-gutters>
        <v-col cols="12" md="8" offset-md="2">
          <v-row justify="end" class="no-margin">
            <icon
              v-if="signedin"
              class="personicon mr-2 univie-grey"
              name="material-social-person"
              width="24px"
              height="24px"
            ></icon>
            <span v-if="signedin" class="subheading displayname univie-grey"
              >{{ user.firstname }} {{ user.lastname }}</span
            >

            <v-menu bottom transition="slide-y-transition" class="v-align-top">
              <template v-slot:activator="{ on }">
                <v-btn text v-on="on" class="top-margin-lang">
                  <span class="grey--text text--darken-1">{{
                    $i18n.locale
                  }}</span>
                  <icon
                    name="univie-sprache"
                    class="lang-icon grey--text text--darken-1"
                  ></icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="changeLocale('eng')">
                  <v-list-item-title>English</v-list-item-title>
                </v-list-item>
                <v-list-item @click="changeLocale('deu')">
                  <v-list-item-title>Deutsch</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <a
              v-if="config.quicklinks"
              id="quicklinks-button"
              class="ph-button hidden-sm-and-down quicklinks"
              v-on:click="quicklinksenabled = !quicklinksenabled"
              >Quicklinks</a
            >
          </v-row>

          <v-row no-gutters justify="start">
            <v-col style="min-width: 250px" class="text-left mt-4" cols="3">
              <InfoLogo></InfoLogo>
            </v-col>

            <v-col cols="3" align-self="center">
              <client-only placeholder-tag="span">
                <v-app-bar-nav-icon class="hidden-md-and-up">
                  <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                      <v-btn text icon color="grey lighten-1" v-on="on"
                        ><icon
                          name="material-navigation-menu"
                          width="24px"
                          height="24px"
                        ></icon
                      ></v-btn>
                    </template>
                    <v-list>
                      <v-list-item
                        @click="$router.push({ path: '/info/policy' })"
                        ><v-list-item-title>{{
                          $t("Policy")
                        }}</v-list-item-title></v-list-item
                      >
                      <v-list-item
                        @click="$router.push({ path: '/info/contact' })"
                        ><v-list-item-title>{{
                          $t("Contact")
                        }}</v-list-item-title></v-list-item
                      >
                      <v-list-item
                        @click="
                          $router.push({
                            path: '/search',
                            query: { reset: true },
                          })
                        "
                        ><v-list-item-title>{{
                          $t("Search")
                        }}</v-list-item-title></v-list-item
                      >
                      <v-list-item
                        v-if="signedin"
                        @click="$router.push({ path: '/submit' })"
                        ><v-list-item-title>{{
                          $t("Upload")
                        }}</v-list-item-title></v-list-item
                      >
                      <v-list-item
                        v-if="signedin && user.username === config.iraccount"
                        @click="$router.push({ path: '/admin' })"
                        ><v-list-item-title>{{
                          $t("Admin")
                        }}</v-list-item-title></v-list-item
                      >
                      <v-list-item
                        v-if="!signedin"
                        @click="$router.push('login')"
                        ><v-list-item-title>{{
                          $t("Upload")
                        }}</v-list-item-title></v-list-item
                      >
                      <v-list-item v-if="signedin" @click="logout()"
                        ><v-list-item-title>{{
                          $t("Logout")
                        }}</v-list-item-title></v-list-item
                      >
                    </v-list>
                  </v-menu>
                </v-app-bar-nav-icon>
              </client-only>
              <div class="text-left hidden-sm-and-down" v-if="config.title">
                <icon
                  left
                  dark
                  name="univie-right"
                  color="#a4a4a4"
                  width="14px"
                  height="14px"
                  class="mb-1"
                ></icon>
                <nuxt-link class="subheading primary--text mx-3" :to="'/'">{{
                  config.title
                }}</nuxt-link>
              </div>
            </v-col>
          </v-row>

          <v-row no-gutters class="hidden-md-and-up header pb-1">
            <span class="text-left ml-3 mt-4" v-if="config.title">
              <icon
                left
                dark
                name="univie-right"
                color="#a4a4a4"
                width="14px"
                height="14px"
                class="mb-1"
              ></icon>
              <nuxt-link class="name primary--text ma-3" :to="'/'">{{
                config.title
              }}</nuxt-link>
            </span>
          </v-row>
          <v-row no-gutters class="hidden-sm-and-down header">
            <v-toolbar flat color="white" dense class="no-padding">
              <v-spacer></v-spacer>
              <v-toolbar-items class="hidden-sm-and-down no-height-inherit">
                <v-hover v-slot:default="{ hover }">
                  <nuxt-link
                    :class="hover ? 'ph-button primary' : 'ph-button grey'"
                    :to="{ path: '/info/policy' }"
                    >{{ $t("Policy") }}</nuxt-link
                  >
                </v-hover>
                <v-hover v-slot:default="{ hover }">
                  <nuxt-link
                    :class="hover ? 'ph-button primary' : 'ph-button grey'"
                    :to="{ path: '/info/contact' }"
                    >{{ $t("Contact") }}</nuxt-link
                  >
                </v-hover>
                <v-hover v-slot:default="{ hover }">
                  <nuxt-link
                    :class="hover ? 'ph-button primary' : 'ph-button grey'"
                    :to="{ path: '/search?reset=true' }"
                    >{{ $t("Search") }}</nuxt-link
                  >
                </v-hover>
                <v-hover v-slot:default="{ hover }">
                  <a
                    :class="hover ? 'ph-button primary' : 'ph-button grey'"
                    v-show="signedin"
                    @click="goToSubmit()"
                    >{{ $t("Upload") }}</a
                  >
                </v-hover>
                <v-hover v-slot:default="{ hover }">
                  <nuxt-link
                    :class="hover ? 'ph-button primary' : 'ph-button grey'"
                    v-show="signedin && user.username === config.iraccount"
                    :to="{ path: '/admin' }"
                    >{{ $t("Admin") }}</nuxt-link
                  >
                </v-hover>
                <v-hover v-slot:default="{ hover }">
                  <nuxt-link
                    :class="hover ? 'ph-button primary' : 'ph-button grey'"
                    v-show="!signedin"
                    :to="{ path: '/login' }"
                    >{{ $t("Upload") }}</nuxt-link
                  >
                </v-hover>
                <v-hover>
                  <a
                    class="flat dark ph-button grey"
                    v-show="signedin"
                    @click="logout()"
                    >{{ $t("Logout") }}</a
                  >
                </v-hover>
              </v-toolbar-items>
            </v-toolbar>
          </v-row>

          <InfoBanner v-if="$route.path === '/'"></InfoBanner>

          <v-row no-gutters class="mt-2">
            <v-col cols="12">
              <p-breadcrumbs :items="breadcrumbs" class="mt-2"></p-breadcrumbs>

              <v-row justify="center" v-for="(alert, i) in alerts" :key="i">
                <v-col cols="12">
                  <v-snackbar
                    class="font-weight-regular"
                    top
                    color="success"
                    v-if="alert.type === 'success'"
                    v-model="showSnackbar"
                  >
                    {{ $t(alert.msg) }}
                    <v-btn dark text @click.native="dismiss(alert)">OK</v-btn>
                  </v-snackbar>
                  <v-alert
                    v-else
                    prominent
                    :type="alert.type === 'danger' ? 'error' : alert.type"
                    :value="true"
                    transition="slide-y-transition"
                  >
                    <v-row align="center">
                      <v-col class="grow">{{ $t(alert.msg) }}</v-col>
                      <v-col class="shrink">
                        <v-btn icon @click.native="dismiss(alert)"
                          ><v-icon>mdi-close</v-icon></v-btn
                        >
                      </v-col>
                    </v-row>
                  </v-alert>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="content">
              <transition name="fade" mode="out-in">
                <keep-alive>
                  <nuxt />
                </keep-alive>
              </transition>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row v-if="config.quicklinks">
        <quicklinks-footer></quicklinks-footer>
      </v-row>

      <v-row>
        <v-col cols="12" md="8" offset-md="2">
          <v-divider v-if="!config.quicklinks"></v-divider>
          <v-row>
            <v-col class="text-left">
              <span class="grey--text text--darken-2"
                ><address>
                  {{ $t(config.address) }} | <abbr title="Telefon">T</abbr>
                  {{ config.phone }}
                </address></span
              >
            </v-col>
            <v-col class="text-right">
              <nuxt-link :to="'/info/impressum'">{{
                $t("Impressum")
              }}</nuxt-link>
              |
              <nuxt-link :to="'/info/credits'">{{ $t("Credits") }}</nuxt-link>
              |
              <nuxt-link :to="'/info/metadatapolicy'">{{
                $t("Metadata policy")
              }}</nuxt-link>
              |
              <nuxt-link :to="'/info/terms'">{{
                $t("Terms of use")
              }}</nuxt-link>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import '@/assets/css/material-icons.css'
import { context } from "@/mixins/context";
import { config } from "@/mixins/config";
import "@/compiled-icons/univie-sprache";
import "@/compiled-icons/univie-right";

export default {
  mixins: [context, config],
  metaInfo: {
    title: config.title,
    meta: [],
  },
  data() {
    return {
      quicklinksenabled: 0,
    };
  },
  computed: {
    showSnackbar: {
      get: function () {
        return this.$store.state.snackbar;
      },
      set: function (newValue) {
        if (!newValue) {
          this.$store.commit("hideSnackbar");
        }
      },
    },
    breadcrumbs() {
      return this.$store.state.breadcrumbs;
    },
    alerts() {
      return this.$store.state.alerts;
    },
    instances() {
      return Object.keys(this.$store.state.config.instances);
    },
  },
  methods: {
    changeLocale: function (lang) {
      this.$i18n.locale = lang;
      this.$i18n.setLocaleCookie(lang)
      this.$router.push(this.switchLocalePath(lang));
    },
    goToSubmit: function () {
      this.$store.commit("setSkipsubmitrouteleavehook", true);
      this.$router.push("/submit");
    },
    logout: async function () {
      await this.$store.dispatch("logout");
      this.$router.push("/");
    },
    getCookie: function (name) {
      let value = "; " + document.cookie;
      let parts = value.split("; " + name + "=");
      if (parts.length === 2) {
        let val = parts.pop().split(";").shift();
        return val === " " ? null : val;
      }
    },
    dismiss: function (alert) {
      this.$store.commit("clearAlert", alert);
    },
    loadTracking: async function () {
      const scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.async = true;
        script.defer = true;
        script.src = "//" + this.config.stats.trackerbaseurl + "/matomo.js";

        const head = document.head || document.getElementsByTagName("head")[0];
        head.appendChild(script);

        script.onload = resolve;
        script.onerror = reject;
      });

      scriptPromise.catch((error) => {
        console.error(
          "An error occurred trying to load " +
            error.target.src +
            ". If the file exists you may have an ad- or trackingblocker enabled."
        );
      });

      return scriptPromise;
    },
  },
  serverPrefetch: async function () {
    if (this.$store.state.user.token) {
      await this.$store.dispatch("getLoginData");
      console.log(
        "fetched login: firstname[" +
          this.$store.state.user.firstname +
          "] lastname[" +
          this.$store.state.user.lastname +
          "] username[" +
          this.$store.state.user.username +
          "]"
      );
    }
    await this.$store.dispatch("vocabulary/loadOrgUnits", this.$i18n.locale);
    await this.$store.dispatch("vocabulary/loadLanguages", this.$i18n.locale);
  },
  mounted: async function () {
    if (!this.user.token) {
      var token = this.getCookie("X-XSRF-TOKEN");
      if (token) {
        this.$store.commit("setToken", token);
        await this.$store.dispatch("getLoginData");
      }
    }
    await this.loadTracking();
    let Matomo;
    if (process.browser) {
      Matomo = window.Piwik.getTracker(
        "https://" + this.config.stats.trackerbaseurl + "/matomo.php",
        this.config.stats.siteid
      );
    }
    Matomo.trackPageView();
    Matomo.enableLinkTracking();
    Vue.prototype.$matomo = Matomo;
    this.$router.afterEach((to, from) => {
      this.$matomo.setCustomUrl("https://" + this.config.baseurl + to.path);
      this.$matomo.setDocumentTitle(this.$store.state.pagetitle);
      this.$matomo.trackPageView();
    });
  },
  created: function () {
    Vue.filter("date", function (value) {
      if (value) {
        return moment(String(value)).format("DD.MM.YYYY");
      }
    });

    Vue.filter("dateyear", function (value) {
      if (value) {
        if (String(value).match(/^\d{4}$/g)) {
          return value;
        } else {
          return moment(String(value)).format("YYYY");
        }
      }
    });

    Vue.filter("time", function (value) {
      if (value) {
        return moment(String(value)).format("DD.MM.YYYY hh:mm:ss");
      }
    });

    Vue.filter("unixtime", function (value) {
      if (value) {
        return moment.unix(String(value)).format("DD.MM.YYYY hh:mm:ss");
      }
    });

    Vue.filter("capitalize", function (value) {
      if (!value) return "";
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    });

    Vue.filter("bytes", function (bytes, precision) {
      if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return "-";
      if (typeof precision === "undefined") precision = 1;
      var units = ["bytes", "kB", "MB", "GB", "TB", "PB"];
      var number = Math.floor(Math.log(bytes) / Math.log(1024));
      return (
        (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +
        " " +
        units[number]
      );
    });

    Vue.filter("truncate", function (text, length, clamp) {
      clamp = clamp || "...";
      length = length || 30;

      if (text.length <= length) return text;

      var tcText = text.slice(0, length - clamp.length);
      var last = tcText.length - 1;

      while (last > 0 && tcText[last] !== " " && tcText[last] !== clamp[0])
        last -= 1;

      // Fix for case when text does not have any space
      last = last || length - clamp.length;

      tcText = tcText.slice(0, last);

      return tcText + clamp;
    });
  },
};
</script>

<style lang="sass">
@require '../stylus/main'
@require '../stylus/colors'
</style>

<style>
.row {
  margin: 0px !important;
}

.mdeditor-header {
  justify-content: center;
}

.no-padding > .v-toolbar__content {
  padding: 0px;
}

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
  display: flex;
}

html,
body {
  height: 100%;
}

section {
  overflow: auto;
}

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
  -webkit-box-shadow: 48px 0 0 0 white, -48px 0 0 0 white,
    0 30px 30px -16px rgba(70, 70, 70, 0.3);
  box-shadow: 48px 0 0 0 white, -48px 0 0 0 white,
    0 30px 30px -16px rgba(70, 70, 70, 0.3);
  background-color: white;
  z-index: 1;
}

.name {
  font-size: 18.6667px;
  font-weight: 400;
}
.name:hover {
  text-decoration: underline;
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

.ph-button {
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
  letter-spacing: 0.01em;
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
  margin-right: 12px;
}

#quicklinks-button:hover {
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.select-instance {
  max-width: 300px;
}

.border-bottom {
  border-bottom: 1px solid;
  border-color: rgba(0, 0, 0, 0.12);
}

.border-right {
  border-right: 1px solid;
  border-color: rgba(0, 0, 0, 0.12);
}

.border-left {
  border-left: 1px solid;
  border-color: rgba(0, 0, 0, 0.12);
}

.jsonld-border-left {
  border-left: 1px solid;
  border-color: rgba(0, 0, 0, 0.12);
}

.border-top {
  border-top: 1px solid;
  border-color: rgba(0, 0, 0, 0.12);
}

#app .v-btn {
  text-transform: none;
}

#app .v-input {
  font-weight: 400;
}

#app .v-tabs__div {
  text-transform: none;
  font-weight: 300;
}

.v-application .subtitle-1 {
  line-height: 1.25rem;
}

.univie-grey {
  color: #7b7b7b;
}

.pdlabel {
  font-weight: 500;
}
</style>

<style scoped>
.top-margin-lang {
  margin-top: 0px;
}

.content {
  min-height: 300px;
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
