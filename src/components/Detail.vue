<template>
  <v-container fluid>

    <v-row v-if="objectInfo">

        <v-col cols="12" md="8">

          <v-alert type="info" color="primary" outlined v-if="!isApproved">
            {{ $t('This item needs to be cleared by the repository management.') }}
          </v-alert>

          <p-d-jsonld v-if="objectInfo.dshash['JSON-LD']" :jsonld="objectInfo.metadata['JSON-LD']" :pid="objectInfo.pid" :limitRoles="3"></p-d-jsonld>

        </v-col>

        <v-col cols="12" md="3" offset-md="1" class="col-border">

          <v-row class="mb-6">
            <v-col class="pt-0">
              <v-row>
                <h3 class="title font-weight-light pl-3 primary--text">{{ $t('Download') }}</h3>
              </v-row>
              <v-divider></v-divider>
              <v-row no-gutters class="pt-2">
                <v-btn color="primary" :href="config.api + '/object/' + objectInfo.pid + '/diss/Content/download'" primary>{{ getFormatLabel(objectInfo) }}</v-btn>
              </v-row>
            </v-col>
          </v-row>

          <v-row class="mb-6">
            <v-col class="pt-0">
              <v-row>
                <h3 class="title font-weight-light pl-3 primary--text">{{ $t('Usage statistics') }}</h3>
              </v-row>
              <v-divider></v-divider>
              <v-row no-gutters class="pt-2">
                <v-col cols="3">
                  <v-icon>mdi-eye-outline</v-icon><span class="ml-2">64</span>
                </v-col>
                <v-col cols="3">
                  <v-icon>mdi-download</v-icon><span class="ml-2">32</span>
                </v-col>
                <v-spacer></v-spacer>
              </v-row>
            </v-col>
          </v-row>

          <v-row class="my-6" v-if="alternativeVersions.length > 0">
            <v-col class="pt-0">
              <v-row>
                <h3 class="title font-weight-light pl-3 primary--text">{{ $t('Alternative versions') }}</h3>
              </v-row>
              <v-divider></v-divider>
              <v-row v-for="(version,i) in alternativeVersions" :key="i" no-gutters class="pt-2">
                <span class="caption grey--text text--darken-2 mr-3">{{ version.label }}</span>
                <span>
                  <router-link :to="{ name: 'detail', params: { pid: version.pid } }">{{ version.pid }}</router-link>
                </span>
              </v-row>
            </v-col>
          </v-row>

          <v-row class="my-6" v-if="alternativeFormats.length > 0">
            <v-col class="pt-0">
              <v-row>
                <h3 class="title font-weight-light pl-3 primary--text">{{ $t('Alternative formats') }}</h3>
              </v-row>
              <v-divider></v-divider>
              <v-row v-for="(format,i) in alternativeFormats" :key="i" no-gutters class="pt-2">
                <span class="caption grey--text text--darken-2 mr-3">{{ format.label }}</span>
                <span>
                  <router-link :to="{ name: 'detail', params: { pid: format.pid } }">{{ format.pid }}</router-link>
                </span>
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
      alternativeFormats: []
    }
  },
  methods: {
    async fetchAsyncData (self, pid) {
      await self.$store.dispatch('fetchObjectInfo', pid)
    },
    async fetchAlternatives (self) {
      self.alternativeFormats = []
      self.alternativeVersions = []
      if (self.objectInfo.isalternativeformatof) {
        for (let o of self.objectInfo.isalternativeformatof) {
          self.fetchAlternativesRec(self, o, 'isalternativeformatof', 'ebucore:hasMimeType', 'mimetypes', self.alternativeFormats)
        }
      }
      if (self.objectInfo.isalternativeversionof) {
        for (let o of self.objectInfo.isalternativeversionof) {
          self.fetchAlternativesRec(self, o, 'isalternativeversionof', 'oaire:version', 'versiontypes', self.alternativeVersions)
        }
      }
    },
    async fetchAlternativesRec (self, pid, property, predicate, vocabulary, array) {
      try {
        // avoid infinite loops
        if (pid === self.objectInfo.pid) {
          console.log('fetchAlternatives skipping ' + pid + ' (source pid)')
          return
        }
        for (let o of array) {
          if (o.pid === pid) {
            console.log('fetchAlternatives skipping ' + pid + ' (already visited)')
            return
          }
        }
        console.log('fetchAlternatives [' + predicate + '] fetching ' + pid)
        let response = await axios.get(self.config.api + '/object/' + pid + '/info',
          {
            headers: {
              'X-XSRF-TOKEN': self.user.token
            }
          }
        )
        let objectInfo = response.data.info
        if (objectInfo) {
          let jsonld = objectInfo.metadata['JSON-LD']
          if (jsonld) {
            if (jsonld[predicate]) {
              let objarr = jsonld[predicate]
              if (objarr.length > 0) {
                let id
                if (predicate === 'oaire:version') {
                  if (objarr[0]['skos:exactMatch']) {
                    if (objarr[0]['skos:exactMatch'].length > 0) {
                      id = objarr[0]['skos:exactMatch'][0]
                    }
                  }
                }
                if (predicate === 'ebucore:hasMimeType') {
                  id = objarr[0]
                }
                array.push(
                  {
                    label: self.getLocalizedTermLabel(vocabulary, id),
                    pid: pid
                  }
                )
              }
            }
          }
        }
        if (objectInfo[property]) {
          for (let o of self.objectInfo[property]) {
            self.fetchAlternatives(self, o, property, predicate, vocabulary, array)
          }
        }
        console.log('[' + pid + '] fetching object info done')
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
      vm.$store.commit('setObjectInfo', inforesponse.data.info)
      vm.fetchAlternatives(vm)
    })
  },
  beforeRouteUpdate: async function (to, from, next) {
    await this.fetchAsyncData(this, to.params.pid)
    this.fetchAlternatives(this)
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
