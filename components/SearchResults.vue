<template>
  <v-container>
    <template v-for="(doc, i) in docs">
      <v-row :key="'doc'+i">
        <v-col :cols="12">
          <v-row :key="'prev'+doc.pid">
            <v-col cols="2" class="preview-maxwidth hidden-sm-and-down">
              <!-- <p-img :src="'https://' + config.phaidrabaseurl + '/preview/' + doc.pid + '///120'" class="elevation-1 mt-2">
                <div class="fill-height ma-0" slot="placeholder" align="center" justify="center">
                  <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                </div>
              </p-img> -->
            </v-col>
            <v-col cols="10">
              <v-row no-gutters class="mb-4">
                <v-col cols="10">
                  <h3 class="subtitle-1 font-weight-light primary--text" @click.stop v-if="doc.dc_title">
                    <router-link :to="{ path: 'detail', params: { pid: doc.pid } }">{{ doc.dc_title[0] }}</router-link>
                  </h3>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="2" class="text-right"><span v-if="doc.created" class="grey--text">{{ doc.created | date }}</span></v-col>
              </v-row>
              <v-row no-gutters class="my-4 mr-2" :key="'role'+i" v-if="doc.bib_roles_pers_aut">
                <v-col>
                  <span class="grey--text text--darken-4">
                    <span v-for="(aut,i) in doc.bib_roles_pers_aut" :key="'aut'+i">
                      <template v-if="(i < rolesLimit) || doc.showAllAuthors">
                      {{aut}}<span v-if="(i+1) < doc.bib_roles_pers_aut.length">; </span>
                      </template>
                    </span>
                    <span class="mx-2 primary--text" v-if="doc.bib_roles_pers_aut.length > rolesLimit && !doc.showAllAuthors" @click="showAll(doc)">... {{ $t('show all') }}</span>
                  </span>
                </v-col>
              </v-row>
              <v-row no-gutters class="my-4 mr-2" :key="'role'+i" v-else-if="doc.bib_roles_pers_edt">
                <v-col>
                  <span class="grey--text text--darken-4">
                    <span v-for="(aut,i) in doc.bib_roles_pers_edt" :key="'aut'+i">
                      <template v-if="(i < rolesLimit) || doc.showAllAuthors">
                      {{aut}}<span v-if="(i+1) < doc.bib_roles_pers_edt.length">; </span>
                      </template>
                    </span>
                    <span class="mx-2 primary--text" v-if="doc.bib_roles_pers_edt.length > rolesLimit && !doc.showAllAuthors" @click="showAll(doc)">... {{ $t('show all') }}</span>
                  </span>
                </v-col>
              </v-row>
              <v-row no-gutters class="my-4 mr-2" v-if="doc.bib_journal">
                <v-col>
                  <span class="grey--text text--darken-4">
                    <span class="font-italic mr-2">{{ doc.bib_journal[0] }}</span> <template v-if="doc.bib_volume">{{ doc.bib_volume[0] }}.</template><template v-if="doc.bib_published">{{ doc.bib_published[0] | dateyear }}</template> <template v-if="doc.bib_issue">({{ doc.bib_issue[0] }})</template>
                  </span>
                </v-col>
              </v-row>
              <v-row no-gutters class="my-4 mr-2" v-if="doc.dc_description">
                <v-col>
                  <span class="grey--text text--darken-4">
                    <client-only>
                      <!-- <UtilsPExpandText :text="doc.dc_description[0]" :moreStr="$t('read more')"></UtilsPExpandText> -->
                    <p-expand-text :text="doc.dc_description[0]" :moreStr="$t('read more')"></p-expand-text>
                    </client-only>
                    </span>
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
import { config } from '@/mixins/config'

export default {
  props: ['docs', 'total'],
  mixins: [ config ],
  components: {
  },
  data () {
    return {
      rolesLimit: 4
    }
  },
  methods: {
    showAll: function (doc) {
      Vue.set(doc, 'showAllAuthors', !doc.showAllAuthors)
    }
  },
  mounted() {
    console.log('docs', this.docs)
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
