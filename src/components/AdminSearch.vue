<template>
    <v-row>
      <v-col cols="12">
        <v-row>
          <v-col cols="5">
            <autocomplete
              placeholder="Search..."
              name="autocomplete"
              :initValue="q"
              :suggester="'titlesuggester'"
              :customParams="{ token: 'dev' }"
              :classes="{ input: 'form-control', wrapper: 'input-wrapper' }"
              :onSelect="handleSelect"
              solo
            ></autocomplete>
          </v-col>
          <v-spacer></v-spacer>
        </v-row>
        <v-row justify="space-between">
          <v-col cols="6">
            <p-pagination v-if="total>pagesize" v-bind:length="totalPages" total-visible="10" v-model="page"/>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="2">
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
        </v-row>
        <v-row no-gutters>
          <v-col v-if="inCollection" class="title font-weight-light primary--text">{{ $t('Members of') }} {{ inCollection }} <icon name="material-navigation-close" class="primary--text" height="100%" @click.native="removeCollectionFilter()"></icon></v-col>
          <admin-search-results
            :docs="docs"
            :total="total"
            :selectioncheck="selectioncheck"
            :getallresults="getAllResults"
            :search="search">
          </admin-search-results>
          <p-pagination v-if="total>pagesize" v-bind:length="totalPages" total-visible="10" v-model="page" class="mb-3" />
        </v-row>
      </v-col>
    </v-row>
</template>

<script>
import Vue from 'vue'
import qs from 'qs'
import axios from 'axios'
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
import { facetQueries, updateFacetQueries, persAuthors, corpAuthors, deactivateFacetQueries } from '../utils/searchfacets'
import { buildParams, buildSearchDef, sortdef } from '../utils/searchutils'
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
  computed: {
    page: {
      get () {
        return this.currentPage
      },
      set (value) {
        this.currentPage = value
        this.search()
      }
    },
    totalPages: function () {
      return Math.ceil(this.total / this.pagesize)
    }
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
  methods: {
    search: async function (options) {
      // `options` are combined into the Search component. The later are sent
      // over from child components: e.g. SearchFilters.
      // This allows us the buildSearchDef/buildParams functions to pick out
      // whatever properties they might need.

      // exclude 'collection' from above manipulation, since it's only passed as a prop
      let { collection } = options || {}
      if (collection) {
        this.inCollection = collection
        delete options.collection
      }

      Object.assign(this, options)

      let { ands } = buildSearchDef(this)
      ands.push('isinadminset:"' + this.config.adminset + '"')
      let params = buildParams(this, ands)
      let response = await axios.post(this.config.solr + '/select',
        {
          params: params
        }
      )
      this.docs = response.data.response.docs
      this.total = response.data.response.numFound
      this.facet_counts = response.data.facet_counts
      updateFacetQueries(response.data.facet_counts.facet_queries, facetQueries)

      let pagePids = []
      for (let d of this.docs) {
        pagePids.push(d.pid)
      }
      // call add requested licenses
      let rlresponse = await axios.post(this.config.api + '/ir/requestedlicenses',
        null,
        {
          headers: {
            'X-XSRF-TOKEN': this.user.token
          },
          params: {
            pids: pagePids
          }
        }
      )

      if (rlresponse.data.requestedlicenses) {
        for (let rl of rlresponse.data.requestedlicenses) {
          for (let d of this.docs) {
            if (rl.pid === d.pid) {
              Vue.set(d, 'requestedlicense', this.getLocalizedTermLabel('licenses', rl.requestedlicense))
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
    getAllResults: async function () {
      if (this.total > this.config.search.selectionlimit) {
        this.limitdialog = true
      } else {
        let { ands } = buildSearchDef(this)
        let params = buildParams(this, ands)
        params.page = 0
        params.rows = this.total
        params.fl = [ 'pid', 'dc_title' ]
        let query = qs.stringify(params, { encodeValuesOnly: true, indices: false })
        let url = this.config.solr + '/select'
        let response = await fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: query
        })
        let json = await response.json()
        return json.response.docs
      }
    },
    setSort: function (sort) {
      for (let i = 0; i < this.sortdef.length; i++) {
        if (this.sortdef[i].id === sort) {
          this.sortdef[i].active = !this.sortdef[i].active
        } else {
          this.sortdef[i].active = false
        }
      }
      this.search()
    },
    sortIsActive: function (sort) {
      for (let i = 0; i < this.sortdef.length; i++) {
        if (this.sortdef[i].id === sort) {
          return this.sortdef[i].active
        }
      }
    },
    removeCollectionFilter: function () {
      this.inCollection = ''
      this.search()
    },
    resetSearchParams: function () {
      this.q = ''
      this.inColleection = ''
      this.owner = ''
      // TODO pass showAuthorFiler
      // and showRoleFilter to searchFilters
      // as props so that we can hide toggle them off here
      // the same for roles
      this.corpAuthors.values = []
      this.persAuthors.values = []
      this.roles = []
      this.currentPage = 1
      this.pagesize = 10
      for (let fq of this.facetQueries) {
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
  mounted: function () {
    setSearchParams(this, this.$route.query)
  },
  data () {
    return {
      link: '',
      limitdialog: false,
      linkdialog: false,
      selectioncheck: false,
      q: '',
      inCollection: this.collection,
      currentPage: 1,
      pagesize: 10,
      sortdef,
      lang: 'en',
      facetQueries,

      corpAuthors,
      persAuthors,
      roles: [],
      owner: this.ownerProp,

      docs: [],
      total: 0,
      facet_counts: null
    }
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
  border-right: 1px solid #bdbdbd;
}

.border-bottom {
  border-bottom: 1px solid #bdbdbd;
}

svg {
  cursor: pointer
}

.theme--light.v-pagination .v-pagination__item--active {
  box-shadow: none;
  -webkit-box-shadow: none;
}
</style>
