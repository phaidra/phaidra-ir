<template>
  <v-container>
    <ul class="main-ul">
      <li v-for="(f, i) in facetQueries" :key="i">
        <icon @click.native="showFacet(f)" v-if="f.show" name="univie-stop2" class="primary--text"></icon>
        <icon @click.native="showFacet(f)" v-if="!f.show" name="univie-checkbox-unchecked" class="primary--text"></icon>
        <span @click="showFacet(f)" class="facet-label primary--text" :class="{ active: f.show }">
          <template v-if="f.label['skos:prefLabel']">{{ f.label['skos:prefLabel'][$i18n.locale] }}</template>
          <template v-else>{{ $t(f.label) }}</template>
        </span>
        <ul v-if="f.show">
          <li v-for="(q, j) in f.queries" :key="j">
            <span @click="toggleFacet(q,f)">
              <icon v-if="q.active" name="univie-stop2" class="primary--text"></icon>
              <icon v-if="!q.active" name="univie-checkbox-unchecked" class="primary--text"></icon>
              <span :class="{ active: q.active }" class="facet-label primary--text">
                <template v-if="q.label['skos:prefLabel']">{{ q.label['skos:prefLabel'][$i18n.locale] }}</template>
                <template v-else>{{ $t(q.label) }}</template>
              </span>
              <span class="facet-count grey--text" v-if="q.count > 0">({{q.count}})</span>
            </span>
            <ul v-if="q.active && q.childFacet" >
              <li v-for="(q1, k) in q.childFacet.queries" :key="k">
                <span @click="toggleFacet(q1,q.childFacet)">
                  <icon v-if="q1.active" name="univie-stop2" class="primary--text"></icon>
                  <icon v-if="!q1.active" name="univie-checkbox-unchecked" class="primary--text"></icon>
                  <span :class="{ active: q1.active }" class="facet-label primary--text">
                    <template v-if="q1.label['skos:prefLabel']">{{ q1.label['skos:prefLabel'][$i18n.locale] }}</template>
                    <template v-else>{{ $t(q1.label) }}</template>
                  </span>
                  <span class="facet-count grey--text" v-if="q1.count > 0">({{q1.count}})</span>
                </span>
                <ul v-if="q1.active && q1.childFacet" >
                  <li v-for="(q2, l) in q1.childFacet.queries" :key="l">
                    <span @click="toggleFacet(q2,q1.childFacet)">
                      <icon v-if="q2.active" name="univie-stop2" class="primary--text"></icon>
                      <icon v-if="!q2.active" name="univie-checkbox-unchecked" class="primary--text"></icon>
                      <span :class="{ active: q2.active }" class="facet-label primary--text">
                        <template v-if="q2.label['skos:prefLabel']">{{ q2.label['skos:prefLabel'][$i18n.locale] }}</template>
                        <template v-else>{{ $t(q2.label) }}</template>
                      </span>
                      <span class="facet-count grey--text" v-if="q2.count>0">({{q2.count}})</span>
                    </span>
                    <ul v-if="q2.active && q2.childFacet" >
                    <li v-for="(q3, l) in q2.childFacet.queries" :key="l">
                      <span @click="toggleFacet(q3,q2.childFacet)">
                        <icon v-if="q3.active" name="univie-stop2" class="primary--text"></icon>
                        <icon v-if="!q3.active" name="univie-checkbox-unchecked" class="primary--text"></icon>
                        <span :class="{ active: q3.active }" class="facet-label primary--text">
                          <template v-if="q3.label['skos:prefLabel']">{{ q3.label['skos:prefLabel'][$i18n.locale] }}</template>
                          <template v-else>{{ $t(q3.label) }}</template>
                        </span>
                        <span class="facet-count grey--text" v-if="q3.count>0">({{q3.count}})</span>
                      </span>
                    </li>
                  </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
      <li>
        <v-row no-gutters>
          <v-col>
            <icon @click.native="toggleAuthorFilter()" v-if="showAuthorFilter" name="univie-stop2" class="primary--text"></icon>
            <icon @click.native="toggleAuthorFilter()" v-if="!showAuthorFilter" name="univie-checkbox-unchecked" class="primary--text"></icon>
            <span @click="toggleAuthorFilter()" class="facet-label primary--text" :class="{ active: showAuthorFilter }">{{ $t('Authors') }}</span>
          </v-col>
        </v-row>
        <v-row no-gutters v-if="showAuthorFilter">
          <v-col cols="12">
            <v-combobox
              class="mt-4"
              :placeholder="$t('ADD_PREFIX') + ' '  + $t('Author') + ' ' + $t('ADD_SUFFIX') + '...'"
              persistent-hint
              chips
              clearable
              deletable-chips
              multiple
              filled
              single-line
              v-model="persAuthors.values"
              @input="setPersAuthors()"/>
          </v-col>
        </v-row>
      </li>
      <li>
        <v-row no-gutters>
          <v-col>
            <icon @click.native="toggleJournalsFilter()" v-if="showJournalsFilter" name="univie-stop2" class="primary--text"></icon>
            <icon @click.native="toggleJournalsFilter()" v-if="!showJournalsFilter" name="univie-checkbox-unchecked" class="primary--text"></icon>
            <span @click="toggleJournalsFilter()" class="facet-label primary--text" :class="{ active: showJournalsFilter }">{{ $t('Journals') }}</span>
          </v-col>
        </v-row>
        <v-row no-gutters v-if="showJournalsFilter">
          <v-col cols="12">
            <v-combobox
              class="mt-4"
              :placeholder="$t('ADD_PREFIX') + ' '  + $t('Journal title or ISSN') + ' ' + $t('ADD_SUFFIX') + '...'"
              persistent-hint
              chips
              clearable
              deletable-chips
              multiple
              filled
              single-line
              v-model="journals.values"
              @input="setJournals()"/>
          </v-col>
        </v-row>
      </li>
      <li>
        <v-row no-gutters>
          <v-col>
            <icon @click.native="toggleFunderFilter()" v-if="showFunderFilter" name="univie-stop2" class="primary--text"></icon>
            <icon @click.native="toggleFunderFilter()" v-if="!showFunderFilter" name="univie-checkbox-unchecked" class="primary--text"></icon>
            <span @click="toggleFunderFilter()" class="facet-label primary--text" :class="{ active: showFunderFilter }">{{ $t('Funder') }}</span>
          </v-col>
        </v-row>
        <v-row no-gutters v-if="showFunderFilter">
          <v-col cols="12">
            <v-autocomplete
              :value="getTerm('irfunders', funder.value)"
              v-on:input="setFunder($event)"
              :items="vocabularies['irfunders'].terms"
              :item-value="'@id'"
              :filter="autocompleteFilter"
              hide-no-data
              :height="7"
              :label="$t('Funder')"
              filled
              return-object
              clearable
            >
              <template slot="item" slot-scope="{ attr, item }">
                <v-list-item-content two-line>
                  <v-list-item-title  v-html="`${getLocalizedTermLabel('irfunders', item['@id'])}`"></v-list-item-title>
                </v-list-item-content>
              </template>
              <template slot="selection" slot-scope="{ item }">
                <v-list-item-content>
                  <v-list-item-title v-html="`${getLocalizedTermLabel('irfunders', item['@id'])}`"></v-list-item-title>
                </v-list-item-content>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
      </li>
    </ul>
  </v-container>
</template>

<script>
import '@/compiled-icons/univie-stop2'
import '@/compiled-icons/univie-checkbox-unchecked'
import '@/compiled-icons/material-action-account-balance'
import '@/compiled-icons/material-social-person'
import '@/compiled-icons/material-navigation-close'
import { toggleFacet, showFacet } from '../utils/searchfacets'
import { vocabulary } from 'phaidra-vue-components/src/mixins/vocabulary'

export default {
  name: 'search-filters',
  mixins: [ vocabulary ],
  props: {
    search: {
      type: Function,
      required: true
    },
    facetQueries: {
      type: Array,
      required: true
    },
    persAuthorsProp: {
      type: Object
    },
    journalsProp: {
      type: Object
    },
    funderProp: {
      type: Object
    }
  },
  data () {
    return {
      showAuthorFilter: false,
      persAuthors: {},
      showJournalsFilter: false,
      journals: {},
      showFunderFilter: false,
      funder: null
    }
  },
  methods: {
    showFacet: function (f) {
      showFacet(f)
      this.search({ facetQueries: this.facetQueries })
    },
    toggleFacet: function (q, f) {
      toggleFacet(q, f)
      this.search({ page: 1, facetQueries: this.facetQueries })
    },
    toggleAuthorFilter: function () {
      this.showAuthorFilter = !this.showAuthorFilter
      if (!this.showAuthorFilter) {
        this.persAuthors.values = []
        this.search({ persAuthors: this.persAuthors })
      }
    },
    setPersAuthors: function () {
      this.search({ persAuthors: this.persAuthors })
    },
    toggleJournalsFilter: function () {
      this.showJournalsFilter = !this.showJournalsFilter
      if (!this.showJournalsFilter) {
        this.journals.values = []
        this.search({ journals: this.journals })
      }
    },
    setJournals: function () {
      this.search({ journals: this.journals })
    },
    toggleFunderFilter: function () {
      this.showFunderFilter = !this.showFunderFilter
      if (!this.showFunderFilter) {
        this.funder.value = null
        this.search({ funder: this.funder })
      }
    },
    setFunder: function ($event) {
      if ($event) {
        this.funder.value = $event['@id']
      } else {
        this.funder.value = null
      }
      this.search({ funder: this.funder })
    }
  },
  mounted () {
    this.persAuthors = this.persAuthorsProp
    this.journals = this.journalsProp
    this.funder = this.funderProp
  },
  watch: {
    persAuthorsProp: function (v) {
      this.persAuthors = v
      if (v.length) {
        this.showAuthorFilter = true
      }
    },
    journalsProp: function (v) {
      this.journals = v
      if (v.length) {
        this.showJournalsFilter = true
      }
    },
    funderProp: function (v) {
      this.funder = v
      if (v.length) {
        this.showFunderFilter = true
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.container
  padding-top: 1em
  padding-left: 0

ul
  list-style: none
  padding-left: 1em

.facet-label
  cursor: pointer

.facet-count
  margin-left: 5px

svg
  margin-bottom: 3px
  cursor: pointer

svg.primary--text
  margin-right: 4px
</style>
