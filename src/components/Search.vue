<template>
    <v-row no-gutters>
      <v-col md="9" cols="12" class="border-right pr-2">
        <v-row align="start">
          <v-col md="6" cols="9">
            <autocomplete
              class="ml-2"
              placeholder="Search..."
              name="autocomplete"
              :initValue="q"
              :suggester="'titlesuggester'"
              :customParams="{ token: 'dev' }"
              :classes="{ input: 'form-control', wrapper: 'input-wrapper'}"
              :onSelect="handleSelect"
              solo
              :messages="[ total + ' ' + $t('objects') ]"
            ></autocomplete>
          </v-col>
          <v-spacer></v-spacer>
          <v-col md="6" cols="12">
            <search-toolbar
              :setSort="setSort"
              :sortIsActive="sortIsActive"
              :link="link"/>
          </v-col>
        </v-row>
        <v-row class="hidden-md-and-up">
          <v-bottom-sheet v-model="filterdialog" scrollable>
            <template v-slot:activator="{ on }">
              <v-btn class="ml-4" color="primary" v-on="on">Filters</v-btn>
            </template>
            <v-card height="400px">
              <v-card-title class="border-bottom">
                <h3 class="title font-weight-light primary--text pa-2">Filters</h3>
                <v-spacer></v-spacer>
                <v-icon @click="filterdialog = !filterdialog">mdi-close</v-icon>
              </v-card-title>
              <v-card-text>
                <search-filters
                  :search="search"
                  :facetQueries="facetQueries"
                  :persAuthorsProp="persAuthors"
                  :journalsProp="journals"
                  :funderProp="funder"
                ></search-filters>
              </v-card-text>
              <v-divider></v-divider>
            </v-card>
          </v-bottom-sheet>
        </v-row>
        <v-row no-gutters>
          <v-col v-if="inCollection" class="title font-weight-light primary--text">{{ $t('Members of') }} {{ inCollection }} <icon name="material-navigation-close" class="primary--text" height="100%" @click.native="removeCollectionFilter()"></icon></v-col>
          <search-results
            class="ml-2"
            :docs="docs"
            :total="total"
            :getallresults="getAllResults">
          </search-results>
          <p-pagination v-if="total>pagesize" v-bind:length="totalPages" total-visible="10" v-model="page" class="mb-3" />
        </v-row>
      </v-col>
      <v-col cols="3" class="pa-2 hidden-sm-and-down">
        <h3 class="title font-weight-light primary--text border-bottom pa-2">Filters</h3>
        <search-filters
          :search="search"
          :facetQueries="facetQueries"
          :persAuthorsProp="persAuthors"
          :journalsProp="journals"
          :funderProp="funder"
        ></search-filters>
      </v-col>
    </v-row>
</template>

<script>
import qs from 'qs'
import Autocomplete from './Autocomplete'
import SearchResults from './SearchResults'
import SearchFilters from './SearchFilters'
import SearchToolbar from './SearchToolbar'
import PPagination from 'phaidra-vue-components/src/components/utils/PPagination'
import '@/compiled-icons/fontello-sort-name-up'
import '@/compiled-icons/fontello-sort-name-down'
import '@/compiled-icons/fontello-sort-number-up'
import '@/compiled-icons/fontello-sort-number-down'
import '@/compiled-icons/material-content-link'
import '@/compiled-icons/material-action-bookmark'
import '@/compiled-icons/material-toggle-check-box-outline-blank'
import { facetQueries, updateFacetQueries, persAuthors, journals, funder, deactivateFacetQueries, buildAssociationFacet } from '../utils/searchfacets'
import { buildParams, buildSearchDef, sortdef } from '../utils/searchutils'
import { setSearchParams } from '../utils/searchlocation'
import { config } from '@/mixins/config'
import { vocabulary } from 'phaidra-vue-components/src/mixins/vocabulary'

export default {
  name: 'search',
  mixins: [ config, vocabulary ],
  components: {
    Autocomplete,
    SearchResults,
    SearchFilters,
    SearchToolbar,
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

      let { searchdefarr, ands } = buildSearchDef(this)
      ands.push('isinadminset:"' + this.config.adminset + '"')
      let params = buildParams(this, ands)

      if (process.browser) {
        this.link = location.protocol + '//' + location.host + '/search?' + searchdefarr.join('&')
        window.history.replaceState(null, this.$t('Search results'), this.link)
      }

      try {
        let response = await this.$http.request({
          method: 'POST',
          url: this.config.solr + '/select',
          data: qs.stringify(params, { arrayFormat: 'repeat' }),
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          }
        })
        this.docs = response.data.response.docs
        this.total = response.data.response.numFound
        this.facet_counts = response.data.facet_counts
        updateFacetQueries(response.data.facet_counts.facet_queries, facetQueries)
      } catch (error) {
        console.log(error)
        this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
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
        try {
          let response = await this.$http.request({
            method: 'GET',
            url: this.config.solr + '/select',
            data: qs.stringify(params, { arrayFormat: 'repeat' }),
            headers: {
              'content-type': 'application/x-www-form-urlencoded'
            }
          })
          return response.data.response.docs
        } catch (error) {
          console.log(error)
          this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
        }
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
      this.inCollection = ''
      this.persAuthors.values = []
      this.journals.values = []
      this.funder.value = null
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
  watch: {
    collection: function (col) {
      this.inCollection = col
      this.search()
    }
  },
  data () {
    return {
      link: '',
      limitdialog: false,
      linkdialog: false,
      selectioncheck: false,
      filterdialog: false,
      q: '',
      inCollection: this.collection,
      currentPage: 1,
      pagesize: 10,
      sortdef,
      lang: 'en',
      facetQueries,

      persAuthors,
      journals,
      funder,

      docs: [],
      total: 0,
      facet_counts: null
    }
  },
  mounted: function () {
    setSearchParams(this, this.$route.query)
    this.$nextTick(async function () {
      if (!this.vocabularies['orgunits'].loaded) {
        await this.$store.dispatch('loadOrgUnits', this.$i18n.locale)
        facetQueries.push(buildAssociationFacet(this.vocabularies['orgunits'].tree))
      }
      this.search()
    })
    // This call is delayed because at this point
    // `setInstanceSolr` has not yet been executed and
    // the solr url is missing.
    // setTimeout(() => { this.search() }, 100)
  },
  beforeRouteUpdate: async function (to, from, next) {
    if (to.query.reset) {
      this.resetSearchParams()
    }
    if (to.query.owner) {
      this.owner = to.query.owner
    } else {
      this.owner = ''
    }
    if (to.query.collection) {
      this.inCollection = to.query.collection
    } else {
      this.inCollection = ''
    }
    await this.search()
    next()
  },
  beforeRouteEnter: async function (to, from, next) {
    next(async vm => {
      if (to.query.reset) {
        vm.resetSearchParams()
      }
      if (to.query.owner) {
        vm.owner = to.query.owner
      } else {
        vm.owner = ''
      }
      if (to.query.collection) {
        vm.inCollection = to.query.collection
      } else {
        vm.inCollection = ''
      }
      await vm.search()
    })
  }
}
</script>

<style scoped>
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
</style>
