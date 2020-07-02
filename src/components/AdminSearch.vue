<template>
    <v-row no-gutters>
      <v-col cols="12">
        <v-row justify="space-between">
          <v-col cols="4">
            <autocomplete
              placeholder="Search..."
              name="autocomplete"
              :initValue="q"
              :suggester="'titlesuggester'"
              :customParams="{ token: 'dev' }"
              :classes="{ input: 'form-control', wrapper: 'input-wrapper' }"
              :onSelect="handleSelect"
              solo
              :messages="[ total + ' ' + $t('objects') ]"
            ></autocomplete>
          </v-col>
          <v-col cols="4">
            <v-btn-toggle v-model="toggleFilter">
              <template v-for="(f, i) in adminFacetQueries">
                <template v-for="(q, j) in f.queries">
                  <v-btn primary @click="toggleFacet(q,f)" :key="'bt'+i+j">
                    <span>{{ $t(q.label) }} </span><span class="font-weight-light facet-count grey--text" v-if="q.count > 0">({{q.count}})</span>
                  </v-btn>
                </template>
              </template>
            </v-btn-toggle>
          </v-col>
          <v-col cols="3">
            <v-spacer></v-spacer>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn class="mx-2" icon @click="setSort('title asc')" :color="sortIsActive('title asc') ? 'primary' : 'grey darken-1'" v-on="on">
                  <icon width="16px" height="16px" name="fontello-sort-name-up"></icon>
                </v-btn>
              </template>
              <span>{{ $t('Title ascending')}}</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn class="mx-2" icon @click="setSort('title desc')" :color="sortIsActive('title desc') ? 'primary' : 'grey darken-1'" v-on="on">
                  <icon width="16px" height="16px" name="fontello-sort-name-down"></icon>
                </v-btn>
              </template>
              <span>{{ $t('Title descending')}}</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn class="mx-2" icon @click="setSort('created asc')" :color="sortIsActive('created asc') ? 'primary' : 'grey darken-1'" v-on="on">
                  <icon width="16px" height="16px" name="fontello-sort-number-up"></icon>
                </v-btn>
              </template>
              <span>{{ $t('Upload date ascending')}}</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn class="mx-2" icon @click="setSort('created desc')" :color="sortIsActive('created desc') ? 'primary' : 'grey darken-1'" v-on="on">
                  <icon width="16px" height="16px" name="fontello-sort-number-down"></icon>
                </v-btn>
              </template>
              <span>{{ $t('Upload date descending')}}</span>
            </v-tooltip>
          </v-col>
          <v-col cols="1">
            <v-btn raised color="primary float-right" :to="'/admin/submit'">
              <v-icon dark left>mdi-plus</v-icon> {{$t('Upload')}}
            </v-btn>
          </v-col>
        </v-row>
        <v-row justify="start">
          <p-pagination v-if="total>pagesize" v-bind:length="totalPages" total-visible="10" v-model="currentPage"/>
          <v-spacer></v-spacer>
        </v-row>
        <v-divider class="my-3"></v-divider>
        <v-row no-gutters>
          <admin-search-results
            :docs="docs"
            :total="total"
            :search="search">
          </admin-search-results>
          <p-pagination v-if="total>pagesize" v-bind:length="totalPages" total-visible="10" v-model="currentPage" class="mb-3" />
        </v-row>
      </v-col>
    </v-row>
</template>

<script>
import qs from 'qs'
import Vue from 'vue'
import Autocomplete from './Autocomplete'
import AdminSearchResults from './AdminSearchResults'
import PPagination from 'phaidra-vue-components/src/components/utils/PPagination'
import { vocabulary } from 'phaidra-vue-components/src/mixins/vocabulary'
import '@/compiled-icons/fontello-sort-name-up'
import '@/compiled-icons/fontello-sort-name-down'
import '@/compiled-icons/fontello-sort-number-up'
import '@/compiled-icons/fontello-sort-number-down'
import '@/compiled-icons/material-content-link'
import '@/compiled-icons/material-action-bookmark'
import '@/compiled-icons/material-toggle-check-box-outline-blank'
import { adminFacetQueries, updateFacetQueries, deactivateFacetQueries, toggleFacet, showFacet } from '../utils/searchfacets'
import { adminBuildParams, adminBuildSearchDef, sortdef } from '../utils/searchutils'
import { setSearchParams } from '../utils/searchlocation'
import { config } from '@/mixins/config'
import { context } from '@/mixins/context'

export default {
  name: 'admin-search',
  mixins: [ config, context, vocabulary ],
  components: {
    Autocomplete,
    AdminSearchResults,
    PPagination
  },
  props: {
    collection: {
      type: String,
      default: ''
    },
    ownerProp: {
      type: String,
      default: ''
    }
  },
  computed: {
    currentPage: {
      get () {
        return this.page
      },
      set (value) {
        this.page = value
        this.search()
        this.$vuetify.goTo(1)
      }
    },
    totalPages: function () {
      return Math.ceil(this.total / this.pagesize)
    }
  },
  data () {
    return {
      link: '',
      limitdialog: false,
      linkdialog: false,
      q: '',
      page: 1,
      pagesize: 10,
      sortdef,
      lang: 'en',
      adminFacetQueries,

      docs: [],
      total: 0,
      facet_counts: null,

      toggleFilter: null
    }
  },
  methods: {
    search: async function (options) {
      // `options` are combined into the Search component. The later are sent
      // over from child components: e.g. SearchFilters.
      // This allows us the buildSearchDef/buildParams functions to pick out
      // whatever properties they might need.

      Object.assign(this, options)

      let { ands } = adminBuildSearchDef(this)
      ands.push('isinadminset:"' + this.config.adminset + '"')
      let params = adminBuildParams(this, ands)
      let response = await this.$http.post(this.config.solr + '/select',
        {
          params: params
        }
      )
      this.docs = response.data.response.docs
      this.total = response.data.response.numFound
      this.facet_counts = response.data.facet_counts
      updateFacetQueries(response.data.facet_counts.facet_queries, adminFacetQueries)

      for (let d of this.docs) {
        if (d.hasOwnProperty('dc_license')) {
          if (Array.isArray(d.dc_license)) {
            for (let l of d.dc_license) {
              if (l.startsWith('http')) {
                Vue.set(d, 'currentlicense', this.getLocalizedTermLabel('alllicenses', l))
              }
            }
          }
        }
      }

      let pagePids = []
      for (let d of this.docs) {
        pagePids.push(d.pid)
      }
      // call add requested licenses
      let rlparams = {
        'pids[]': pagePids
      }
      let rlresponse = await this.$http.request({
        method: 'POST',
        url: this.config.api + '/ir/requestedlicenses',
        data: qs.stringify(rlparams, { arrayFormat: 'repeat' }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-XSRF-TOKEN': this.$store.state.user.token
        }
      })

      if (rlresponse.data.requestedlicenses) {
        for (let rl of rlresponse.data.requestedlicenses) {
          for (let d of this.docs) {
            if (rl.pid === d.pid) {
              if (rl.requestedlicense.startsWith('http')) {
                Vue.set(d, 'requestedlicense', this.getLocalizedTermLabel('alllicenses', rl.requestedlicense))
              } else {
                Vue.set(d, 'requestedlicense', this.getLocalizedTermLabelByNotation('alllicenses', rl.requestedlicense))
              }
            }
          }
        }
      }
    },
    handleSelect: function ({ term, payload }) {
      // called from Autocomplete
      // When an item has been clicked on explicitly - issue a quoted search on it's title,
      // otherwise too many unrealted results are returned
      this.q = payload ? `"${payload}"` : term
      this.search()
    },
    showFacet: function (f) {
      showFacet(f)
      this.search({ adminFacetQueries: this.adminFacetQueries })
    },
    toggleFacet: function (q, f) {
      toggleFacet(q, f)
      this.search({ page: 1, adminFacetQueries: this.adminFacetQueries })
    },
    setSort: function (sort) {
      if (this.sortdef) {
        for (let i = 0; i < this.sortdef.length; i++) {
          if (this.sortdef[i].id === sort) {
            this.sortdef[i].active = !this.sortdef[i].active
          } else {
            this.sortdef[i].active = false
          }
        }
        this.search()
      }
    },
    sortIsActive: function (sort) {
      if (this.sortdef) {
        for (let i = 0; i < this.sortdef.length; i++) {
          if (this.sortdef[i].id === sort) {
            return this.sortdef[i].active
          }
        }
      }
    },
    resetSearchParams: function () {
      this.q = ''
      this.currentPage = 1
      this.page = 1
      this.pagesize = 10
      for (let fq of this.adminFacetQueries) {
        // resetable might be set to false in case this search should
        // work only in limited scope (eg only in a particular collection)
        if (fq.resetable) {
          for (let q of fq.queries) {
            q.active = false
          }
          deactivateFacetQueries(fq)
        }
      }
    },
    toggleSelection: function () {
      this.selectioncheck = !this.selectioncheck
    }
  },
  mounted: async function () {
    setSearchParams(this, this.$route.query)
    await this.search()
  },
  beforeRouteUpdate: async function (to, from, next) {
    this.resetSearchParams()
    await this.search()
    next()
  },
  beforeRouteEnter: async function (to, from, next) {
    next(async vm => {
      vm.resetSearchParams()
      await vm.search()
    })
  }
}
</script>

<style scoped>
.v-pagination {
  justify-content: start
}

.border-right {
  border-right: 1px solid;
  border-color: rgba(0, 0, 0, 0.12);
}

.border-bottom {
  border-bottom: 1px solid;
  border-color: rgba(0, 0, 0, 0.12);
}

svg {
  cursor: pointer
}

.theme--light.v-pagination .v-pagination__item--active {
  box-shadow: none;
  -webkit-box-shadow: none;
}

.facet-label {
  font-weight: 300;
  cursor: pointer
}

.facet-count {
  margin-left: 5px
}

.active {
  text-shadow: rgba(0,0,0,.12) 1px 1px 4px;
}
</style>
