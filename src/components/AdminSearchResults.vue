<template>
  <v-container>
    <template v-for="(doc, i) in this.docs">
      <v-row :key="'doc'+i">
        <v-col cols="1" class="text-right">
          <span>{{ doc.created | date }}</span>
        </v-col>
        <v-col cols="1">
          <span v-if="doc.bib_roles_pers_uploader && doc.bib_roles_pers_uploader[0]">{{ doc.bib_roles_pers_uploader[0] }}</span>
          <span v-else>{{ doc.owner }}</span>
        </v-col>
        <v-col cols="1">
          <span>{{ doc.pid }}</span>
        </v-col>
        <v-col cols="4">
          <router-link class="font-weight-light primary--text" :to="{ name: 'detail', params: { pid: doc.pid } }">{{ doc.dc_title[0] | truncate(130) }}</router-link>
        </v-col>
        <v-col cols="1">
          requested license
        </v-col>
        <v-col cols="1">
          <v-btn icon :color="'grey darken-1'" @click="openHistory(doc.pid)">
            <v-icon dark>history</v-icon>
          </v-btn>
        </v-col>
        <v-col cols="3">
          <v-btn dark class="mx-2 font-weight-regular" color="primary" v-if="doc.owner !== config.iraccount" @click="accept(doc.pid)">Accept</v-btn>
          <v-btn dark class="mx-2 font-weight-regular" color="grey darken-1" v-if="doc.owner !== config.iraccount" @click="reject(doc.pid)">Reject</v-btn>
          <v-btn dark class="mx-2 font-weight-regular" color="grey darken-1" :to="{ name: 'metadataeditor', params: { pid: doc.pid } }">Edit</v-btn>
          <v-btn dark class="mx-2 font-weight-regular" color="primary" @click="approve(doc.pid)">Approve</v-btn>
          <v-icon class="mx-2">mdi-check</v-icon>
        </v-col>
      </v-row>
      <v-divider :key="'div'+doc.pid" class="my-4 mr-2"></v-divider>
    </template>
    <v-dialog v-model="historyDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <h3 class="title font-weight-light primary--text">{{ $t('History') }}</h3>
        </v-card-title>
        <v-card-text>history</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click.stop="historyDialog=false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import PDLicense from 'phaidra-vue-components/src/components/display/PDLicense'
import PImg from 'phaidra-vue-components/src/components/utils/PImg'
import PExpandText from 'phaidra-vue-components/src/components/utils/PExpandText'
import { config } from '@/mixins/config'

export default {
  name: 'admin-search-results',
  mixins: [ config ],
  components: {
    PDLicense,
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
  data () {
    return {
      historyDialog: false
    }
  },
  methods: {
    openHistory: function (pid) {
      this.historyDialog = true
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
