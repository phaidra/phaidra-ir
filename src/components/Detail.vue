<template>
    <v-container v-if="objectInfo" fluid>

      <v-row v-if="isIrObject">

        <v-col cols="12" md="9">

          <v-alert type="info" color="primary" outlined v-if="!isApproved">
            {{ $t('This item needs to be cleared by the repository management.') }}
          </v-alert>

          <v-row no-gutters>
            <v-col cols="12" md="11">
              <p-d-jsonld :showLang="false" :labelColMd="'3'" :valueColMd="'9'" v-if="objectInfo.dshash['JSON-LD']" :jsonld="objectInfo.metadata['JSON-LD']" :pid="objectInfo.pid" :limitRoles="4" :predicatesToHide="objectInfo.cmodel === 'Resource' ? ['ebucore:filename', 'ebucore:hasMimeType', 'role:uploader', 'oaire:version', 'dcterms:accessRights', 'edm:rights'] : ['ebucore:filename', 'ebucore:hasMimeType', 'role:uploader']"></p-d-jsonld>
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
                <template v-if="objectInfo.readrights && accessRights === 'open'">
                  <v-btn v-if="objectInfo.cmodel === 'Resource'" color="primary" :href="config.api + '/object/' + objectInfo.pid + '/diss/Resource/get'" primary>{{ $t('To resource') }}</v-btn>
                  <v-btn v-else color="primary" @click="trackDownload()" :href="config.api + '/object/' + objectInfo.pid + '/diss/Content/download'" primary>{{ getFormatLabel(objectInfo) }}</v-btn>
                </template>
                <template v-else-if="(!objectInfo.readrights && accessRights === 'open') || (accessRights === 'restricted')">
                  <p>{{ $t('Not publicly available via {name}', { name: config.title }) }}</p>
                </template>
                <template v-else-if="accessRights === 'embargoed'">
                  <p>{{ $t('Not available via {name} until {embargoEnd}', { name: config.title, embargoEnd: embargoEnd }) }}</p>
                </template>
                <template v-else-if="accessRights === 'closed'">
                  <p>{{ $t('Not available via {name}', { name: config.title }) }}</p>
                </template>
              </v-row>
            </v-col>
          </v-row>

          <client-only>
            <v-row class="mb-6" v-if="objectInfo.readrights && accessRights === 'open'">
              <v-col>
                <v-row>
                  <h3 class="title font-weight-light pl-3 primary--text"><router-link :to="{ name: 'stats', params: { pid: objectInfo.pid } }">{{ $t('Usage statistics') }}</router-link></h3>
                </v-row>
                <v-divider></v-divider>
                <v-row no-gutters class="pt-2">
                  <v-col>
                    <v-icon>mdi-eye-outline</v-icon><span class="ml-2">{{ stats.detail }}</span>
                  </v-col>
                  <v-col v-if="objectInfo.cmodel !== 'Resource'">
                    <v-icon>mdi-download</v-icon><span class="ml-2">{{ stats.download }}</span>
                  </v-col>
                  <v-spacer></v-spacer>
                </v-row>
              </v-col>
            </v-row>
          </client-only>

          <v-row v-if="objectInfo.alternativeversions.length > 0" class="mb-6">
            <v-col>
              <v-row>
                <h3 class="title font-weight-light pl-3 primary--text">{{ $t('Alternative versions') }}</h3>
              </v-row>
              <v-divider></v-divider>
              <v-row no-gutters class="pt-2" v-for="(rel, i) in objectInfo.alternativeversions" :key="'version'+i">
                <v-col cols="12" md="12">
                  <router-link :to="{ name: 'detail', params: { pid: rel.pid } }">{{ getLocalizedTermLabel('versiontypes', rel.oaire_version_id[0]) }}</router-link>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <v-row v-if="objectInfo.alternativeformats.length > 0" class="mb-6">
            <v-col>
              <v-row>
                <h3 class="title font-weight-light pl-3 primary--text">{{ $t('Alternative formats') }}</h3>
              </v-row>
              <v-divider></v-divider>
              <v-row no-gutters class="pt-2" v-for="(rel, i) in objectInfo.alternativeformats" :key="'formats'+i">
                <v-col cols="12" md="12">
                  <router-link :to="{ name: 'detail', params: { pid: rel.pid } }">{{ getLocalizedTermLabel('mimetypes', rel.dc_format[0]) }}</router-link>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

        </v-col>
      </v-row>

      <v-row v-else justify="center">
        <h3 class="title font-weight-light primary--text mt-12">
          {{ $t('This item is not part of the {name} collection', { name: config.title }) }}
        </h3>
      </v-row>
    </v-container>
</template>

<script>
import ClientOnly from 'vue-client-only'
import moment from 'moment'
import { vocabulary } from 'phaidra-vue-components/src/mixins/vocabulary'
import { context } from '../mixins/context'
import { config } from '../mixins/config'

export default {
  name: 'detail',
  mixins: [ context, config, vocabulary ],
  components: {
    ClientOnly
  },
  metaInfo () {
    let metaInfo = {}
    if (this.objectInfo) {
      if (this.objectInfo.metatags) {
        metaInfo.title = this.objectInfo.metatags.citation_title + ' (' + this.config.title + ' - ' + this.objectInfo.pid + ')'
        metaInfo.meta = []
        Object.entries(this.objectInfo.metatags).forEach(([name, value]) => {
          if (name === 'citation_pdf_url') {
            let ext = 'download'
            if (this.objectInfo.cmodel === 'PDFDocument') {
              ext = 'pdf'
            }
            value = 'https://' + this.config.baseurl + '/detail/' + this.objectInfo.pid + '.' + ext
          }
          if (Array.isArray(value)) {
            for (let v of value) {
              metaInfo.meta.push({
                name: name,
                content: v
              })
            }
          } else {
            metaInfo.meta.push({
              name: name,
              content: value
            })
          }
        })
      }
    }
    return metaInfo
  },
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
    },
    isIrObject: function () {
      if (this.objectInfo['isinadminset']) {
        if (Array.isArray(this.objectInfo['isinadminset'])) {
          return this.objectInfo['isinadminset'][0] === this.config.adminset
        }
      }
      return false
    },
    accessRights: function () {
      let access
      if (this.objectInfo.dshash['JSON-LD']) {
        Object.entries(this.objectInfo.metadata['JSON-LD']).forEach(([predicate, value]) => {
          if (predicate === 'dcterms:accessRights') {
            for (let v of value) {
              if (v.hasOwnProperty('skos:exactMatch') && Array.isArray(v['skos:exactMatch'])) {
                for (let id of v['skos:exactMatch']) {
                  switch (id) {
                    case 'https://pid.phaidra.org/vocabulary/QNGE-V02H':
                      access = 'closed'
                      break
                    case 'https://pid.phaidra.org/vocabulary/KC3K-CCGM':
                      access = 'restricted'
                      break
                    case 'https://pid.phaidra.org/vocabulary/AVFC-ZZSZ':
                      access = 'embargoed'
                      break
                    case 'https://pid.phaidra.org/vocabulary/QW5R-NG4J':
                      access = 'open'
                      break
                    default:
                      console.error('unknown dcterms:accessRights value: ' + id)
                      access = 'unknown'
                      break
                  }
                }
              }
            }
          }
        })
      }
      return access
    },
    embargoEnd: function () {
      let embargo
      if (this.objectInfo.dshash['JSON-LD']) {
        Object.entries(this.objectInfo.metadata['JSON-LD']).forEach(([predicate, value]) => {
          if (predicate === 'dcterms:available') {
            for (let v of value) {
              embargo = moment(String(v)).format('DD.MM.YYYY')
            }
          }
        })
      }
      return embargo
    }
  },
  data () {
    return {
      alternativeVersions: [],
      alternativeFormats: [],
      stats: {
        download: '-',
        detail: '-'
      }
    }
  },
  methods: {
    trackDownload () {
      this.$matomo.setCustomUrl('https://' + this.config.baseurl + '/download/' + this.routepid)
      this.$matomo.setDocumentTitle('Download ' + this.routepid)
      this.$matomo.trackPageView()
    },
    async fetchUsageStats (self, pid) {
      self.stats.download = null
      self.stats.detail = null
      try {
        let response = await self.$http.get(self.config.api + '/ir/stats/' + pid,
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
            let lab = 'Data'
            lab = this.getLocalizedTermLabel('mimetypes', objectInfo.metadata['JSON-LD']['ebucore:hasMimeType'][0])
            return lab
          }
        }
      }
      return this.$t('Download')
    },
    async fetchAsyncData (self, pid) {
      await self.$store.dispatch('fetchObjectInfo', pid)
      await self.$store.dispatch('loadOrgUnits', self.$i18n.locale)
    },
    setTitle (self) {
      if (process.browser) {
        document.title = self.objectInfo.metatags.citation_title + ' (' + self.config.title + ' - ' + self.objectInfo.pid + ')'
      }
    }
  },
  serverPrefetch () {
    console.log('[' + this.$store.state.route.params.pid + '] prefetch')
    return this.fetchAsyncData(this, this.$store.state.route.params.pid)
  },
  beforeRouteEnter: async function (to, from, next) {
    next(async function (vm) {
      vm.$store.commit('setLoading', true)
      vm.$store.commit('setObjectInfo', null)
      await vm.fetchAsyncData(vm, to.params.pid)
      vm.fetchUsageStats(vm, to.params.pid)
      vm.setTitle(vm)
      vm.$store.commit('setLoading', false)
    })
  },
  beforeRouteUpdate: async function (to, from, next) {
    this.$store.commit('setLoading', true)
    this.$store.commit('setObjectInfo', null)
    await this.fetchAsyncData(this, to.params.pid)
    this.fetchUsageStats(this, to.params.pid)
    this.setTitle(this)
    this.$store.commit('setLoading', false)
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
