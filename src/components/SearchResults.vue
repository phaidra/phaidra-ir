<template>
  <v-container>
    <template v-for="(doc, i) in this.docs">
      <v-row :key="'doc'+i">
        <v-col :cols="12">
          <v-row :key="'prev'+doc.pid">
            <v-col cols="2" class="preview-maxwidth">
              <p-img :src="'https://' + config.phaidrabaseurl + '/preview/' + doc.pid + '///120'" class="elevation-1 mt-2">
                <div class="fill-height ma-0" slot="placeholder" align="center" justify="center">
                  <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                </div>
              </p-img>
            </v-col>
            <v-col cols="10">
              <v-row no-gutters class="mb-4">
                <v-col cols="10">
                  <h3 class="subtitle-1 font-weight-light primary--text" @click.stop v-if="doc.dc_title">
                    <router-link :to="{ name: 'detail', params: { pid: doc.pid } }">{{ doc.dc_title[0] }}</router-link>
                  </h3>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="2" class="text-right"><span v-if="doc.created" class="grey--text">{{ doc.created | date }}</span></v-col>
              </v-row>
              <v-row no-gutters class="my-4 mr-2" :key="'role'+i" v-if="doc.bib_roles_pers_aut">
                <v-col>
                  <span class="grey--text text--darken-4">
                    <span v-for="(aut,i) in doc.bib_roles_pers_aut" :key="'aut'+i">
                      <template v-if="(i < 3) || doc.showAllAuthors">
                      {{aut}}<span v-if="(i+1) < doc.bib_roles_pers_aut.length">; </span>
                      </template>
                    </span>
                    <span class="mx-2 primary--text" v-if="doc.bib_roles_pers_aut.length > 3 && !doc.showAllAuthors" @click="showAll(doc)">... {{ $t('show all') }}</span>
                  </span>
                </v-col>
              </v-row>
              <v-row no-gutters class="my-4 mr-2" :key="'role'+i" v-else-if="doc.bib_roles_pers_edt">
                <v-col>
                  <span class="grey--text text--darken-4">
                    <span v-for="(aut,i) in doc.bib_roles_pers_edt" :key="'aut'+i">
                      <template v-if="(i < 3) || doc.showAllAuthors">
                      {{aut}}<span v-if="(i+1) < doc.bib_roles_pers_edt.length">; </span>
                      </template>
                    </span>
                    <span class="mx-2 primary--text" v-if="doc.bib_roles_pers_edt.length > 3 && !doc.showAllAuthors" @click="showAll(doc)">... {{ $t('show all') }}</span>
                  </span>
                </v-col>
              </v-row>
              <v-row no-gutters class="my-4 mr-2" v-if="doc.bib_journal">
                <v-col>
                  <span class="grey--text text--darken-4">
                    <span class="font-italic mr-2">{{ doc.bib_journal[0] }}</span> <template v-if="doc.bib_volume">{{ doc.bib_volume[0] }}.</template>{{ doc.bib_published | dateyear }} <template v-if="doc.bib_issue">({{ doc.bib_issue[0] }})</template>
                  </span>
                </v-col>
              </v-row>
              <v-row no-gutters class="my-4 mr-2" v-if="doc.dc_description">
                <v-col>
                  <span class="grey--text text--darken-4"><p-expand-text :text="doc.dc_description[0]" :moreStr="$t('read more')"/></span>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-divider :key="'div'+doc.pid" class="my-4 mr-2"></v-divider>
    </template>

  </v-container>
</template>

<script>
import Vue from 'vue'
import PImg from 'phaidra-vue-components/src/components/utils/PImg'
import PExpandText from 'phaidra-vue-components/src/components/utils/PExpandText'
import { config } from '@/mixins/config'

export default {
  name: 'search-results',
  mixins: [ config ],
  components: {
    PImg,
    PExpandText
  },
  props: {
    getallresults: {
      type: Function,
      required: true
    },
    docs: {
      type: Array
    },
    total: Number
  },
  methods: {
    showAll: function (doc) {
      Vue.set(doc, 'showAllAuthors', !doc.showAllAuthors)
    }
  }
}
</script>

<style scoped>
.preview-maxwidth {
  max-width: 120px;
}

.card__title--primary {
  padding-top: 10px;
}

.card__text {
  padding-top: 0px;
}

.container {
  padding: 0;
}

.v-application a {
  text-decoration: none;
}

</style>
