<template>
  <v-container>
    <template v-for="(doc, i) in this.docs">
      <v-row :key="'doc'+i">
        <v-col cols="1" class="text-right">
          {{ doc.created | date }}
        </v-col>
        <v-col cols="2">
          <span v-if="doc.bib_roles_pers_uploader && doc.bib_roles_pers_uploader[0]">{{ doc.bib_roles_pers_uploader[0] }}</span>
          <span v-else>{{ doc.owner }}</span>
        </v-col>
        <v-col cols="1">
          {{ doc.pid }}
        </v-col>
        <v-col cols="3">
          <router-link class="font-weight-light primary--text" :to="{ name: 'detail', params: { pid: doc.pid } }">{{ doc.dc_title[0] | truncate(100) }}</router-link>
        </v-col>
        <v-col cols="2">
          {{ doc.requestedlicense }}
        </v-col>
        <v-col cols="1">
          <v-btn icon :color="'grey darken-1'" @click="openHistory(doc.pid)">
            <v-icon dark>history</v-icon>
          </v-btn>
        </v-col>
        <v-col cols="2">
          <v-spacer></v-spacer>
          <v-btn :disabled="loading[doc.pid]" :loading="loading[doc.pid]" class="mx-2 font-weight-regular" color="primary" v-if="isNew(doc)" @click="accept(doc.pid)">Accept</v-btn>
          <v-btn :disabled="loading[doc.pid]" :loading="loading[doc.pid]" class="mx-2 font-weight-regular" color="grey darken-1 white--text" v-if="isNew(doc)" @click="reject(doc.pid)">Reject</v-btn>
          <v-btn :disabled="loading[doc.pid]" :loading="loading[doc.pid]" class="mx-2 font-weight-regular" color="grey darken-1 white--text" v-if="isAccepted(doc)" :to="{ name: 'metadataeditor', params: { pid: doc.pid } }">Edit</v-btn>
          <v-btn :disabled="loading[doc.pid]" :loading="loading[doc.pid]" class="mx-2 font-weight-regular" color="primary" @click="approve(doc.pid)" v-if="isAccepted(doc) && !isApproved(doc)">Approve</v-btn>
          <v-icon class="mx-2" v-if="isApproved(doc)">mdi-check</v-icon>
        </v-col>
      </v-row>
      <v-divider :key="'div'+doc.pid" class="my-4 mr-2"></v-divider>
    </template>
    <v-dialog v-model="historyDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <h3 class="title font-weight-light primary--text">{{ $t('History') }}</h3>
        </v-card-title>
        <v-card-text>history</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click.stop="historyDialog=false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import { config } from '@/mixins/config'
import { context } from '@/mixins/context'

export default {
  name: 'admin-search-results',
  mixins: [ config, context ],
  props: {
    getallresults: {
      type: Function,
      required: true
    },
    docs: {
      type: Array
    },
    total: Number,
    search: Function
  },
  data () {
    return {
      historyDialog: false,
      loading: {}
    }
  },
  methods: {
    isApproved: function (doc) {
      return (doc.owner === this.config.iraccount) && doc.ispartof && doc.ispartof.includes(this.config.ircollection)
    },
    isAccepted: function (doc) {
      return doc.owner === this.config.iraccount
    },
    isNew: function (doc) {
      return doc.owner !== this.config.iraccount
    },
    openHistory: function (pid) {
      this.historyDialog = true
    },
    approve: async function (pid) {
      Vue.set(this.loading, pid, true)
      try {
        let response = await axios.post(this.config.api + '/ir/approve',
          null,
          {
            headers: {
              'X-XSRF-TOKEN': this.user.token
            },
            params: {
              pid: pid
            }
          }
        )
        if (response.data.alerts && response.data.alerts.length > 0) {
          this.$store.commit('setAlerts', response.data.alerts)
        }
      } catch (error) {
        console.error(error)
      } finally {
        Vue.set(this.loading, pid, false)
        this.search()
      }
    },
    accept: async function (pid) {
      Vue.set(this.loading, pid, true)
      try {
        let response = await axios.post(this.config.api + '/ir/accept',
          null,
          {
            headers: {
              'X-XSRF-TOKEN': this.user.token
            },
            params: {
              pid: pid
            }
          }
        )
        if (response.data.alerts && response.data.alerts.length > 0) {
          this.$store.commit('setAlerts', response.data.alerts)
        }
      } catch (error) {
        console.error(error)
      } finally {
        Vue.set(this.loading, pid, false)
        this.search()
      }
    },
    reject: async function (pid) {
      Vue.set(this.loading, pid, true)
      try {
        let response = await axios.post(this.config.api + '/ir/reject',
          null,
          {
            headers: {
              'X-XSRF-TOKEN': this.user.token
            },
            params: {
              pid: pid
            }
          }
        )
        if (response.data.alerts && response.data.alerts.length > 0) {
          this.$store.commit('setAlerts', response.data.alerts)
        }
      } catch (error) {
        console.error(error)
      } finally {
        Vue.set(this.loading, pid, false)
        this.search()
      }
    }
  }
}
</script>

<style scoped>
.preview-maxwidth {
  max-width: 120px;
}

.card__title--primary {
  padding-top: 10px;
}

.card__text {
  padding-top: 0px;
}

.container {
  padding: 0;
}

.v-application a {
  text-decoration: none;
}

</style>
