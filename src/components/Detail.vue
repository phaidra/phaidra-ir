<template>
  <v-container fluid>

    <v-row v-if="objectInfo">

        <v-col cols="12" md="8">

          <v-alert type="info" color="primary" outlined v-if="!isApproved">
            {{ $t('This item needs to be cleared by the repository management.') }}
          </v-alert>

          <p-d-jsonld v-if="objectInfo.dshash['JSON-LD']" :jsonld="objectInfo.metadata['JSON-LD']" :pid="objectInfo.pid"></p-d-jsonld>
          <!--  -->

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

          <v-row class="my-6" v-if="objectInfo.isalternativeformatof || objectInfo.isalternativeversionof">
            <v-col class="pt-0">
              <v-row>
                <h3 class="title font-weight-light pl-3 primary--text">{{ $t('Relationships') }}</h3>
              </v-row>
              <v-divider></v-divider>
              <v-row v-if="objectInfo.isalternativeformatof" no-gutters class="pt-2">
                <v-col class="caption grey--text text--darken-2" cols="4">{{ $t('Is alternative format of') }}</v-col>
                <v-col cols="7" offset="1">
                  <template v-if="objectInfo.isalternativeformatof.length > 1">
                    <v-row>
                      <v-col v-for="(oId,i) in objectInfo.isalternativeformatof" :key="i">
                        <router-link :to="{ name: 'detail', params: { pid: oId } }">{{ oId }}</router-link>
                      </v-col>
                    </v-row>
                  </template>
                  <router-link :to="{ name: 'detail', params: { pid: objectInfo.isalternativeformatof[0] } }">{{ objectInfo.isalternativeformatof[0] }}</router-link>
                </v-col>
              </v-row>
              <v-row v-if="objectInfo.isalternativeversionof" no-gutters class="pt-2">
                <v-col class="caption grey--text text--darken-2" cols="4">{{ $t('Is alternative version of') }}</v-col>
                <v-col cols="7" offset="1">
                  <template v-if="objectInfo.isalternativeversionof.length > 1">
                    <v-row>
                      <v-col v-for="(oId,i) in objectInfo.isalternativeversionof" :key="i">
                        <router-link :to="{ name: 'detail', params: { pid: oId } }">{{ oId }}</router-link>
                      </v-col>
                    </v-row>
                  </template>
                  <router-link :to="{ name: 'detail', params: { pid: objectInfo.isalternativeversionof[0] } }">{{ objectInfo.isalternativeversionof[0] }}</router-link>
                </v-col>
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
import qs from 'qs'

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
    },
    coverPid: function () {
      // HACK
      var pidNumStr = this.objectInfo.pid.substr(2)
      var coverPidNum = parseInt(pidNumStr) + 1
      return 'o:' + coverPidNum
    }
  },
  methods: {
    async fetchAsyncData (self, pid) {
      await self.$store.dispatch('fetchObjectInfo', pid)
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
    let members = []
    try {
      console.log('[' + to.params.pid + '] fetching object info')
      inforesponse = await axios.get(configjs.api + '/object/' + to.params.pid + '/info')
      console.log('[' + to.params.pid + '] fetching object info done, querying object members')
      let params = {
        q: 'ismemberof:"' + to.params.pid + '"',
        defType: 'edismax',
        wt: 'json',
        qf: 'ismemberof^5',
        fl: 'pid',
        sort: 'pos_in_' + to.params.pid.replace(':', '_') + ' asc'
      }
      let query = qs.stringify(params, { encodeValuesOnly: true, indices: false })
      let membersresponse = await axios.get(configjs.solr + '/select?' + query)
      console.log('[' + to.params.pid + '] object has ' + membersresponse.data.response.numFound + ' members')
      if (membersresponse.data.response.numFound > 0) {
        for (let doc of membersresponse.data.response.docs) {
          console.log('[' + to.params.pid + '] fetching object info of member ' + doc.pid)
          let memresponse = await axios.get(configjs.api + '/object/' + doc.pid + '/info')
          console.log('[' + to.params.pid + '] fetching object info of member ' + doc.pid + ' done')
          members.push(memresponse.data.info)
        }
      }
    } catch (error) {
      console.error(error)
    }
    // on next() the component will be rendered, waits for no async calls, but we can put data to store since we already have them
    next(vm => {
      vm.$store.commit('setObjectInfo', inforesponse.data.info)
      vm.$store.commit('setObjectMembers', members)
    })
  },
  beforeRouteUpdate: async function (to, from, next) {
    await this.fetchAsyncData(this, to.params.pid)
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
