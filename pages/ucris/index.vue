<template>
    <v-row no-gutters>
      <v-col cols="12">
        <v-row justify="center">
          <v-pagination v-if="total>pagesize" v-bind:length="totalPages" total-visible="10" v-model="currentPage"/>
        </v-row>
        <v-row no-gutters class="display-flex flex-column mt-6">
          <ucris-search-results
            :docs="docs"
            :total="total"
            :search="search"
            :resetTable="resetTable"
            >
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
      lang: 'en',

      docs: [],
      total: 0,
      facet_counts: null,

      toggleFilter: null
    }
  },
  methods: {
    resetTable: function () {
      this.docs = [];
      this.total = [];
      this.page = 0;
      this.search()
    },
    search: async function () {
      try{
        this.$store.commit('setLoading', true)

        let offset = (this.page - 1) * this.pagesize
        let lockedData = []
        let lockedPureIdResp = await axios.get(this.$store.state.instanceconfig.api + `/ir/pureimport/locks`, {
            headers: {
              'X-XSRF-TOKEN': this.$store.state.user.token
            }
        })
        if(lockedPureIdResp && lockedPureIdResp.data && lockedPureIdResp.data.locks){
          lockedData = lockedPureIdResp.data.locks
        }
        let ucrisResponse = await axios.get(this.$store.state.instanceconfig.api + `/ir/puresearch?size=${this.pagesize}&offset=${offset}&ir_status=ir_pending`,
          {
            headers: {
              'X-XSRF-TOKEN': this.$store.state.user.token
            }
          }
        )
        console.log('ucrisResponse', ucrisResponse)
        if(ucrisResponse?.data?.response){
          const existingLockName = localStorage.getItem('lockName')
          this.docs = ucrisResponse.data.response.items.map(elem => {
            const lockIndex = lockedData.findIndex(x => +x.pureId === +elem.pureId)
            if(lockIndex >= 0){
              elem.lockName = lockedData[lockIndex].lockName
            }
            if(lockIndex >= 0 && existingLockName !== lockedData[lockIndex].lockName) {
              elem.isLocked = true
            }
            return elem
          })
          this.total = ucrisResponse.data.response.count
        }
        console.log('docs', this.docs)

      } catch (error) {
        console.log(error)
        this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      } finally {
        this.$store.commit('setLoading', false)
      }
    },
  },
  mounted: async function () {
    await this.search()
  },
  beforeRouteUpdate: async function (to, from, next) {
    await this.search()
    next()
  },
  beforeRouteEnter: async function (to, from, next) {
    next(async vm => {
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
