<template>
  <v-container>
    <template v-for="(doc, i) in this.docs">
      <v-row :key="'doc'+i">
        <v-col cols="1" class="text-right">
          {{ doc.created | date }}
        </v-col>
        <v-col cols="1">
          <span v-if="doc.uploader">{{ doc.uploader }}</span>
          <span v-else>{{ doc.owner }}</span>
        </v-col>
        <v-col cols="1">
          <a target="_blank" :href="'https://' + config.phaidrabaseurl + '/' + doc.pid">{{ doc.pid }}</a>
        </v-col>
        <v-col cols="3">
          <nuxt-link class="font-weight-light primary--text" :to="{ path: `/detail/${doc.pid}`}">{{ doc.dc_title[0] | truncate(100) }}</nuxt-link>
        </v-col>
        <v-col cols="2" v-if="doc.requestedlicense === doc.currentlicense">
          {{ doc.requestedlicense }}
        </v-col>
        <v-col cols="2" v-else>
          <div>{{ doc.currentlicense }}</div>
          <div class="grey--text pt-2">{{ doc.requestedlicense }}</div>
        </v-col>
        <v-col cols="2">
          <v-btn icon :color="'grey darken-1'" @click="downloadFile(config.api + '/object/' + doc.pid + '/diss/Content/download')">
            <v-icon>mdi-download</v-icon>
          </v-btn>
          <v-btn icon :color="'grey darken-1'" @click="openHistory(doc.pid)">
            <v-icon dark>history</v-icon>
          </v-btn>
          <v-btn v-if="doc.datastreams.includes('POLICY')" icon :color="'error'" @click="openRights(doc.pid)">
            <v-icon dark>mdi-lock</v-icon>
          </v-btn>
          <v-btn v-else icon :color="'grey darken-1'" @click="openRights(doc.pid)">
            <v-icon dark>mdi-lock-open-outline</v-icon>
          </v-btn>
        </v-col>
        <v-col cols="2">
          <v-spacer></v-spacer>
          <v-btn :disabled="loading[doc.pid]" :loading="loading[doc.pid]" class="mx-1 font-weight-regular" color="primary" v-if="isNew(doc)" @click="accept(doc.pid)">Accept</v-btn>
          <v-btn :disabled="loading[doc.pid]" :loading="loading[doc.pid]" class="mx-1 font-weight-regular" color="grey darken-1 white--text" v-if="isNew(doc)" @click="reject(doc.pid)">Reject</v-btn>
          <v-btn :disabled="loading[doc.pid]" :loading="loading[doc.pid]" class="mx-1 font-weight-regular" color="grey darken-1 white--text" v-if="isAccepted(doc)" :to="{ path: `/metadata/${doc.pid}/edit`}">Edit</v-btn>
          <v-btn :disabled="loading[doc.pid]" :loading="loading[doc.pid]" class="mx-1 font-weight-regular" color="primary" @click="approve(doc.pid)" v-if="isAccepted(doc) && !isApproved(doc)">Approve</v-btn>
          <v-icon class="mx-1" v-if="isApproved(doc)">mdi-check</v-icon>
        </v-col>
      </v-row>
      <v-divider :key="'div'+doc.pid" class="my-4 mr-2"></v-divider>
    </template>
    <v-dialog v-model="historyDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <h3 class="title font-weight-light primary--text">{{ $t('History') }}</h3>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-container>
            <template v-for="(e, i) in events">
              <v-row :key="'row'+i">
                <v-col>{{ e.event }}</v-col>
                <v-col>{{ e.username }}</v-col>
                <v-col>{{ e.ts | time }}</v-col>
              </v-row>
              <v-divider v-if="i < (events.length - 1)" :key="'div'+i"></v-divider>
            </template>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click.stop="historyDialog=false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="rightsDialog" max-width="1200px">
      <v-card>
        <v-card-title>
          <h3 class="title font-weight-light primary--text">{{ $t('Access rights') }}</h3>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-container>
            <p-m-rights :pid="rightsPid" :rights="rights" :enableGroups="false" v-on:load-rights="loadRights()"></p-m-rights>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click.stop="rightsDialog=false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import Vue from 'vue'
import { config } from '@/mixins/config'
import { context } from '@/mixins/context'
import axios from 'axios'

export default {
  name: 'admin-search-results',
  mixins: [ config, context ],
  props: {
    docs: {
      type: Array
    },
    total: Number,
    search: Function
  },
  data () {
    return {
      loading: {},
      historyDialog: false,
      events: [],
      rightsDialog: false,
      rights: {},
      rightsPid: {}
    }
  },
  methods: {
    downloadFile: async function (downloadUrl) {
      let response = await axios.get(downloadUrl, {
        headers: {
          'X-XSRF-TOKEN': this.$store.state.user.token
        },
        responseType: 'blob'
      })
      console.log('response', response)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      let fileName = response.headers['content-disposition'].split('filename=')[1]
      link.setAttribute('download', fileName.replaceAll('"', ''))
      link.click()
      window.URL.revokeObjectURL(url)

    },
    isApproved: function (doc) {
      return (doc.owner === this.config.iraccount) && doc.ispartof && doc.ispartof.includes(this.config.ircollection)
    },
    isAccepted: function (doc) {
      return doc.owner === this.config.iraccount
    },
    isNew: function (doc) {
      return doc.owner !== this.config.iraccount
    },
    loadRights: async function () {
      Vue.set(this.loading, this.rightsPid, true)
      try {
        let response = await axios.get(this.config.api + '/object/' + this.rightsPid + '/rights', {
          headers: {
            'X-XSRF-TOKEN': this.$store.state.user.token
          }
        })
        if (response.status === 200) {
          this.rights = response.data.metadata.rights
        } else {
          if (response.data.alerts && response.data.alerts.length > 0) {
            this.$store.commit('setAlerts', response.data.alerts)
          }
        }
      } catch (error) {
        console.log(error)
        this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      } finally {
        Vue.set(this.loading, this.rightsPid, false)
      }
    },
    openRights: async function (pid) {
      this.rightsPid = pid
      Vue.set(this.loading, this.rightsPid, true)
      try {
        let response = await axios.get(this.config.api + '/object/' + this.rightsPid + '/rights', {
          headers: {
            'X-XSRF-TOKEN': this.$store.state.user.token
          }
        })
        if (response.status === 200) {
          this.rights = response.data.metadata.rights
          this.rightsDialog = true
        } else {
          if (response.data.alerts && response.data.alerts.length > 0) {
            this.$store.commit('setAlerts', response.data.alerts)
          }
        }
      } catch (error) {
        console.log(error)
        this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      } finally {
        Vue.set(this.loading, this.rightsPid, false)
      }
    },
    openHistory: async function (pid) {
      Vue.set(this.loading, pid, true)
      try {
        let response = await axios.get(this.config.api + '/ir/' + pid + '/events',
          {
            headers: {
              'X-XSRF-TOKEN': this.user.token
            }
          }
        )
        if (response.data.alerts && response.data.alerts.length > 0) {
          this.$store.commit('setAlerts', response.data.alerts)
        }
        if (response.data.events) {
          this.events = response.data.events
          this.historyDialog = true
        }
      } catch (error) {
        console.error(error)
      } finally {
        Vue.set(this.loading, pid, false)
      }
    },
    approve: async function (pid) {
      Vue.set(this.loading, pid, true)
      try {
        let response = await axios.post(this.config.api + '/ir/' + pid + '/approve',
          null,
          {
            headers: {
              'X-XSRF-TOKEN': this.user.token
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
        let response = await axios.post(this.config.api + '/ir/' + pid + '/accept',
          null,
          {
            headers: {
              'X-XSRF-TOKEN': this.user.token
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
        let response = await axios.post(this.config.api + '/ir/' + pid + '/reject',
          null,
          {
            headers: {
              'X-XSRF-TOKEN': this.user.token
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
