<template>
  <v-row no-gutters>
    <v-col md="9" cols="12" class="border-right pr-2">
      <v-row align="start">
        <v-col md="6" cols="9">
          <v-text-field
            class="form-control"
            :placeholder="$t('Search') + '...'"
            name="autocomplete"
            v-model="q"
            @keyup.enter="search()"
            autocomplete="off"
            clearable
            single-line
            solo
            append-icon="mdi-magnify"
            @click:append="search()"
            @click:clear="clearSearch()"
            :messages="[total + ' ' + $t('objects')]"
          />
        </v-col>
        <v-spacer></v-spacer>
        <v-col md="6" cols="12" class="pt-2">
          <search-toolbar
            :setSort="setSort"
            :sortIsActive="sortIsActive"
            :link="link"
          />
        </v-col>
      </v-row>
      <v-row class="hidden-md-and-up">
        <v-bottom-sheet v-model="filterdialog" scrollable>
          <template v-slot:activator="{ on }">
            <v-btn class="ml-4" color="primary" v-on="on">Filters</v-btn>
          </template>
          <v-card height="400px">
            <v-card-title class="border-bottom">
              <h3 class="title font-weight-light primary--text pa-2">
                Filters
              </h3>
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
      <v-row no-gutters justify="center">
        <v-col v-if="inCollection" class="title font-weight-light primary--text"
          >{{ $t("Members of") }} {{ inCollection }}
          <icon
            name="material-navigation-close"
            class="primary--text"
            height="100%"
            @click.native="removeCollectionFilter()"
          ></icon
        ></v-col>
        <search-results
          class="ml-2"
          :docs="docs"
          :total="total"
          :getallresults="getAllResults"
        >
        </search-results>
        <v-pagination
          v-if="total > pagesize"
          v-bind:length="totalPages"
          total-visible="10"
          v-model="currentPage"
          class="mb-3"
        />
      </v-row>
    </v-col>
    <v-col cols="3" class="pa-2 hidden-sm-and-down">
      <h3 class="title font-weight-light primary--text border-bottom pa-2">
        Filters
      </h3>
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
import qs from "qs";
import "@/compiled-icons/fontello-sort-name-up";
import "@/compiled-icons/fontello-sort-name-down";
import "@/compiled-icons/fontello-sort-number-up";
import "@/compiled-icons/fontello-sort-number-down";
import "@/compiled-icons/material-content-link";
import "@/compiled-icons/material-action-bookmark";
import "@/compiled-icons/material-toggle-check-box-outline-blank";
import {
  facetQueries,
  updateFacetQueries,
  persAuthors,
  journals,
  funder,
  deactivateFacetQueries,
  buildAssociationFacet,
} from "../utils/searchfacets";
import { buildParams, buildSearchDef, sortdef } from "../utils/searchutils";
import { setSearchParams } from "../utils/searchlocation";
import { config } from "@/mixins/config";
import { vocabulary } from "phaidra-vue-components/src/mixins/vocabulary";
import axios from 'axios';

export default {
  mixins: [config, vocabulary],
  computed: {
    currentPage: {
      get() {
        return this.page;
      },
      set(value) {
        this.page = value;
        this.search();
        this.$vuetify.goTo(1);
      },
    },
    totalPages: function () {
      return Math.ceil(this.total / this.pagesize);
    },
  },
  props: {
    collection: {
      type: String,
      default: "",
    },
  },
  methods: {
    async search(options) {
      this.$store.commit("setLoading", true);
      // `options` are combined into the Search component. The later are sent
      // over from child components: e.g. SearchFilters.
      // This allows us the buildSearchDef/buildParams functions to pick out
      // whatever properties they might need.

      // exclude 'collection' from above manipulation, since it's only passed as a prop
      let { collection } = options || {};
      if (collection) {
        this.inCollection = collection;
        delete options.collection;
      }

      Object.assign(this, options);

      let { searchdefarr, ands } = buildSearchDef(this);
      ands.push('isinadminset:"' + this.config.adminset + '"');
      let params = buildParams(this, ands);

      if (process.browser) {
        this.link =
          location.protocol +
          "//" +
          location.host +
          "/search?" +
          searchdefarr.join("&");
        window.history.replaceState(null, this.$t("Search results"), this.link);
      }

      try {
        let response = await axios.post(
          this.config.solr + "/select",
          qs.stringify(params, { arrayFormat: "repeat" }),
          {
            headers: {
              "content-type": "application/x-www-form-urlencoded",
            },
          }
        );
        console.log('res', response)

        this.docs = response.data.response.docs;
        this.total = response.data.response.numFound;
        this.facet_counts = response.data.facet_counts;
        if (this.facet_counts) {
          updateFacetQueries(
            response.data.facet_counts.facet_queries,
            facetQueries
          );
        }
      } catch (error) {
        console.log(error);
        this.$store.commit("setAlerts", [{ type: "danger", msg: error }]);
      } finally {
        this.$store.commit("setLoading", false);
      }
    },
    clearSearch: function () {
      this.q = "";
      this.search();
    },
    getAllResults: async function () {
      if (this.total > this.config.search.selectionlimit) {
        this.limitdialog = true;
      } else {
        let { ands } = buildSearchDef(this);
        let params = buildParams(this, ands);
        params.page = 0;
        params.rows = this.total;
        params.fl = ["pid", "dc_title"];
        try {
          let response = await this.$http.request({
            method: "GET",
            url: this.config.solr + "/select",
            data: qs.stringify(params, { arrayFormat: "repeat" }),
            headers: {
              "content-type": "application/x-www-form-urlencoded",
            },
          });
          return response.data.response.docs;
        } catch (error) {
          console.log(error);
          this.$store.commit("setAlerts", [{ type: "danger", msg: error }]);
        }
      }
    },
    setSort: function (sort) {
      for (let i = 0; i < this.sortdef.length; i++) {
        if (this.sortdef[i].id === sort) {
          this.sortdef[i].active = !this.sortdef[i].active;
        } else {
          this.sortdef[i].active = false;
        }
      }
      this.search();
    },
    sortIsActive: function (sort) {
      for (let i = 0; i < this.sortdef.length; i++) {
        if (this.sortdef[i].id === sort) {
          return this.sortdef[i].active;
        }
      }
    },
    removeCollectionFilter: function () {
      this.inCollection = "";
      this.search();
    },
    resetSearchParams: function () {
      this.q = "";
      this.inCollection = "";
      this.persAuthors.values = [];
      this.journals.values = [];
      this.funder.value = null;
      this.currentPage = 1;
      this.pagesize = 10;
      for (let fq of this.facetQueries) {
        // resetable might be set to false in case this search should
        // work only in limited scope (eg only in a particular collection)
        if (fq.resetable) {
          for (let q of fq.queries) {
            q.active = false;
          }
          deactivateFacetQueries(fq);
        }
      }
      // open first association query (level: univeristy)
      for (let fq of this.facetQueries) {
        if (fq.id === "association") {
          for (let q of fq.queries) {
            q.active = true;
            break;
          }
          break;
        }
      }
    },
    toggleSelection: function () {
      this.selectioncheck = !this.selectioncheck;
    },
  },
  watch: {
    collection: function (col) {
      this.inCollection = col;
      this.search();
    },
  },
  data() {
    return {
      link: "",
      limitdialog: false,
      linkdialog: false,
      selectioncheck: false,
      filterdialog: false,
      q: "",
      inCollection: this.collection,
      page: 1,
      pagesize: 10,
      sortdef,
      lang: "en",
      facetQueries,

      persAuthors,
      journals,
      funder,

      docs: [],
      total: 0,
      facet_counts: null,
    };
  },
  mounted: function () {
    setSearchParams(this, this.$route.query);
    this.$nextTick(async function () {
      if (!this.vocabularies["orgunits"].loaded) {
        await this.$store.dispatch("vocabulary/loadOrgUnits", this.$i18n.locale);
      }
      let af = buildAssociationFacet(this.vocabularies["orgunits"].tree);
      if(!facetQueries.find(elem => elem.id == af.id && elem.label == af.label)) {
        facetQueries.push(af);
      }
      this.search();
    });
    // This call is delayed because at this point
    // `setInstanceSolr` has not yet been executed and
    // the solr url is missing.
    // setTimeout(() => { this.search() }, 100)
  },
  beforeRouteUpdate: async function (to, from, next) {
    if (to.query.reset) {
      this.resetSearchParams();
    }
    if (to.query.q) {
      this.q = to.query.q;
    } else {
      this.q = "";
    }
    if (to.query.owner) {
      this.owner = to.query.owner;
    } else {
      this.owner = "";
    }
    if (to.query.collection) {
      this.inCollection = to.query.collection;
    } else {
      this.inCollection = "";
    }
    await this.search();
    next();
  },
  beforeRouteEnter: async function (to, from, next) {
    next(async (vm) => {
      if (to.query.reset) {
        vm.resetSearchParams();
      }
      if (to.query.owner) {
        vm.owner = to.query.owner;
      } else {
        vm.owner = "";
      }
      if (to.query.q) {
        vm.q = to.query.q;
      } else {
        vm.q = "";
      }
      if (to.query.collection) {
        vm.inCollection = to.query.collection;
      } else {
        vm.inCollection = "";
      }
      await vm.search();
    });
  },
};
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
  cursor: pointer;
}

.theme--light.v-pagination .v-pagination__item--active {
  box-shadow: none;
  -webkit-box-shadow: none;
}
</style>
