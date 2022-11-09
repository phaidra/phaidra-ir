<template>
    <v-row no-gutters>
      <v-col cols="12">
        <v-row justify="start">
          <v-pagination v-if="total>pagesize" v-bind:length="totalPages" total-visible="10" v-model="currentPage"/>
          <v-spacer></v-spacer>
        </v-row>
        <v-divider class="my-3"></v-divider>
        <v-row no-gutters class="display-flex flex-column">
          <ucris-search-results
            :docs="docs"
            :total="total"
            :search="search">
          </ucris-search-results>
          <v-pagination v-if="total>pagesize" v-bind:length="totalPages" total-visible="10" v-model="currentPage" class="mb-3" />
        </v-row>
      </v-col>
    </v-row>
</template>

<script>
import { vocabulary } from 'phaidra-vue-components/src/mixins/vocabulary'
import '@/compiled-icons/fontello-sort-name-up'
import '@/compiled-icons/fontello-sort-name-down'
import '@/compiled-icons/fontello-sort-number-up'
import '@/compiled-icons/fontello-sort-number-down'
import '@/compiled-icons/material-content-link'
import '@/compiled-icons/material-action-bookmark'
import '@/compiled-icons/material-toggle-check-box-outline-blank'
import { adminFacetQueries } from '../../utils/searchfacets'
import { sortdef } from '../../utils/searchutils'
import { config } from '@/mixins/config'
import { context } from '@/mixins/context'
import axios from 'axios'

export default {
  mixins: [ config, context, vocabulary ],
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
      try{
        this.$store.commit('setLoading', true)
        // `options` are combined into the Search component. The later are sent
        // over from child components: e.g. SearchFilters.
        // This allows us the buildSearchDef/buildParams functions to pick out
        // whatever properties they might need.

        Object.assign(this, options)
        let offset = (this.page - 1) * this.pagesize
        let ucrisResponse = await axios.get(this.$store.state.instanceconfig.api + `/ir/puresearch?size=${this.pagesize}&offset=${offset}`,
          {
            headers: {
              'X-XSRF-TOKEN': this.$store.state.user.token
            }
          }
        )
        // let ucrisResponse = await axios(config)
        console.log('ucrisResponse', ucrisResponse)
        // let response = {
        //   data: {
        //     "count": 184936,
        //     "pageInformation": {
        //       "offset": 0,
        //       "size": 10
        //     },
        //     "items": ucrisMetaList,
        //     "navigationLinks": [
        //       {
        //         "ref": "next",
        //         "href": "https://ucris.univie.ac.at/ws/api/523/research-outputs?size=10&offset=10"
        //       }
        //     ]
        //   }

        // }
        // let response = await axios.get(`https://ucris.univie.ac.at/ws/api/523/research-outputs?apiKey=93e52421-edf5-4d3a-9c2a-fd5c1e6a6d2a&size=${this.pagesize}&offset=${this.page - 1}`, {
        //   data: {
        //     "keywordURIs": [
        //       "/dk/atira/pure/keywords/ir_status/ir_pending"
        //     ]
        //   }
        // })
        if(ucrisResponse?.data?.response){
          this.docs = ucrisResponse.data.response.items
          this.total = ucrisResponse.data.response.count
        }
        // this.facet_counts = response.data.facet_counts

      } catch (error) {
        console.log(error)
        this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      } finally {
        this.$store.commit('setLoading', false)
      }
    },
    // clearSearch: function () {
    //   this.q = ''
    //   this.search()
    // },
    // showFacet: function (f) {
    //   showFacet(f)
    //   this.search({ adminFacetQueries: this.adminFacetQueries })
    // },
    // toggleFacet: function (q, f) {
    //   toggleFacet(q, f)
    //   this.search({ page: 1, adminFacetQueries: this.adminFacetQueries })
    // },
    // setSort: function (sort) {
    //   if (this.sortdef) {
    //     for (let i = 0; i < this.sortdef.length; i++) {
    //       if (this.sortdef[i].id === sort) {
    //         this.sortdef[i].active = !this.sortdef[i].active
    //       } else {
    //         this.sortdef[i].active = false
    //       }
    //     }
    //     this.search()
    //   }
    // },
    // sortIsActive: function (sort) {
    //   if (this.sortdef) {
    //     for (let i = 0; i < this.sortdef.length; i++) {
    //       if (this.sortdef[i].id === sort) {
    //         return this.sortdef[i].active
    //       }
    //     }
    //   }
    // },
    // resetSearchParams: function () {
    //   this.q = ''
    //   this.currentPage = 1
    //   this.page = 1
    //   this.pagesize = 10
    //   for (let fq of this.adminFacetQueries) {
    //     // resetable might be set to false in case this search should
    //     // work only in limited scope (eg only in a particular collection)
    //     if (fq.resetable) {
    //       for (let q of fq.queries) {
    //         q.active = false
    //       }
    //       deactivateFacetQueries(fq)
    //     }
    //   }
    // },
    // toggleSelection: function () {
    //   this.selectioncheck = !this.selectioncheck
    // }
  },
  mounted: async function () {
    // setSearchParams(this, this.$route.query)
    await this.search()
  },
  beforeRouteUpdate: async function (to, from, next) {
    // this.resetSearchParams()
    await this.search()
    next()
  },
  beforeRouteEnter: async function (to, from, next) {
    next(async vm => {
      // vm.resetSearchParams()
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
