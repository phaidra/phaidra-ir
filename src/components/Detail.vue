<template>
  <v-container fluid>

    <v-row v-if="objectInfo">

        <v-col cols="12" md="9">

          <v-alert type="info" color="primary" outlined v-if="!isApproved">
            {{ $t('This item needs to be cleared by the repository management.') }}
          </v-alert>

          <v-row no-gutters>
            <v-col cols="12" md="11">
              <p-d-jsonld v-if="objectInfo.dshash['JSON-LD']" :jsonld="objectInfo.metadata['JSON-LD']" :pid="objectInfo.pid" :limitRoles="4" :predicatesToHide="['ebucore:filename', 'ebucore:hasMimeType', 'role:uploader']"></p-d-jsonld>
            </v-col>
            <v-col cols="12" md="1"></v-col>
          </v-row>
        </v-col>

        <v-col cols="12" md="3" class="col-border">

          <v-row class="mb-6">
            <v-col >
              <v-row>
                <h3 class="title font-weight-light pl-3 primary--text">{{ $t('Download') }}</h3>
              </v-row>
              <v-divider></v-divider>
              <v-row no-gutters class="pt-2">
                <v-btn color="primary" @click="trackDownload()" :href="config.api + '/object/' + objectInfo.pid + '/diss/Content/download'" primary>{{ getFormatLabel(objectInfo) }}</v-btn>
              </v-row>
            </v-col>
          </v-row>

          <v-row class="mb-6" v-show="stats.detail || stats.download">
            <v-col>
              <v-row>
                <h3 class="title font-weight-light pl-3 primary--text">{{ $t('Usage statistics') }}</h3>
              </v-row>
              <v-divider></v-divider>
              <v-row no-gutters class="pt-2">
                <v-col cols="3" v-show="stats.detail">
                  <v-icon>mdi-eye-outline</v-icon><span class="ml-2">{{ stats.detail }}</span>
                </v-col>
                <v-col cols="3" v-show="stats.download">
                  <v-icon>mdi-download</v-icon><span class="ml-2">{{ stats.download }}</span>
                </v-col>
                <v-spacer></v-spacer>
              </v-row>
            </v-col>
          </v-row>

        </v-col>
    </v-row>

    <v-row v-else>
      <v-alert :value="true" transition="slide-y-transition">{{$t('Object not found')}}</v-alert>
    </v-row>

  </v-container>
</template>

<script>
import { vocabulary } from 'phaidra-vue-components/src/mixins/vocabulary'
import { context } from '../mixins/context'
import { config } from '../mixins/config'
import configjs from '../config/phaidra-ir'
import axios from 'axios'

export default {
  name: 'detail',
  mixins: [ context, config, vocabulary ],
  computed: {
    routepid: function () {
      return this.$store.state.route.params.pid
    },
    objectInfo: function () {
      return this.$store.state.objectInfo
    },
    objectMembers: function () {
      return this.$store.state.objectMembers
    },
    downloadable: function () {
      switch (this.objectInfo.cmodel) {
        case 'PDFDocument':
        case 'Video':
        case 'Audio':
        case 'Picture':
        case 'Unknown':
        case 'Book':
          return true
        default:
          return false
      }
    },
    viewable: function () {
      switch (this.objectInfo.cmodel) {
        case 'PDFDocument':
        case 'Video':
        case 'Audio':
        case 'Picture':
        case 'Book':
          return true
        default:
          return false
      }
    },
    isApproved: function () {
      return (this.objectInfo.owner.username === this.config.iraccount) && this.objectInfo.ispartof && this.objectInfo.ispartof.includes(this.config.ircollection)
    }
  },
  data () {
    return {
      alternativeVersions: [],
      alternativeFormats: [],
      stats: {
        download: null,
        detail: null
      }
    }
  },
  methods: {
    trackDownload () {
      this.$matomo.setCustomUrl('https://' + this.config.baseurl + '/download/' + this.routepid)
      this.$matomo.setDocumentTitle('Download ' + this.routepid)
      this.$matomo.trackPageView()
    },
    async fetchUsageStats (self) {
      self.stats.download = null
      self.stats.detail = null
      try {
        let response = await axios.get(self.config.api + '/ir/stats/' + self.routepid,
          {
            headers: {
              'X-XSRF-TOKEN': self.user.token
            }
          }
        )
        if (response.data.stats) {
          self.stats.download = response.data.stats.downloads
          self.stats.detail = response.data.stats.detail_page
        }
      } catch (error) {
        console.log(error)
      }
    },
    getFormatLabel (objectInfo) {
      if (objectInfo.metadata) {
        if (objectInfo.metadata['JSON-LD']) {
          if (objectInfo.metadata['JSON-LD']['ebucore:hasMimeType']) {
            return this.getLocalizedTermLabel('mimetypes', objectInfo.metadata['JSON-LD']['ebucore:hasMimeType'][0])
          }
        }
      }
      return this.$t('Download')
    },
    async fetchAsyncData (self, pid) {
      await self.$store.dispatch('fetchObjectInfo', pid)
      await self.$store.dispatch('loadOrgUnits', self.$i18n.locale)
    }
  },
  serverPrefetch () {
    console.log('[' + this.$store.state.route.params.pid + '] prefetch')
    return this.fetchAsyncData(this, this.$store.state.route.params.pid)
  },
  beforeRouteEnter: async function (to, from, next) {
    // see https://router.vuejs.org/guide/advanced/data-fetching.html#fetching-before-navigation
    // here the component does not exist yet so we don't have 'this' or access to the store
    let inforesponse
    try {
      console.log('[' + to.params.pid + '] fetching object info')
      inforesponse = await axios.get(configjs.api + '/object/' + to.params.pid + '/info')
    } catch (error) {
      console.error(error)
    }
    next(vm => {
      if (inforesponse) {
        vm.$store.commit('setObjectInfo', inforesponse.data.info)
      }
      vm.fetchUsageStats(vm)
    })
  },
  beforeRouteUpdate: async function (to, from, next) {
    await this.fetchAsyncData(this, to.params.pid)
    this.fetchUsageStats(this)
    next()
  }
}
</script>

<style lang="stylus" scoped>
@require '../stylus/colors'

h3
  color: $phaidragrey.darken-4
</style>

<style scoped>
.container {
  padding: 0px;
}

.col-border {
  display: block;
  border: solid;
  border-width: 0 0 0 thin;
  border-color: rgba(0, 0, 0, 0.12);
  padding-top: 0px;
}

.showmembers {
  text-decoration: underline;
}
</style>
