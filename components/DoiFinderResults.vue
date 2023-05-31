<template>
  <v-container>
    <template v-for="(doc, i) in this.docs">
      <v-row :key="'doc'+i">
        <v-col cols="4">
          <nuxt-link class="font-weight-light primary--text" :to="{ path: `/detail/${doc.pid}`}">{{ doc.title[0] | truncate(100) }}</nuxt-link>
        </v-col>
        <v-col cols="4">
          {{ doc.DOI}}
        </v-col>
        <v-col cols="2">
          <span v-if="doc.uploader">{{ doc.uploader }}</span>
          <span v-else>{{ doc.owner }}</span>
        </v-col>
        <v-col cols="2">
          <v-spacer></v-spacer>
          <v-btn class="mx-1 font-weight-regular" :to="'/admin/submit?type=ucris&id='+doc.pureId" color="primary">Import</v-btn>
        </v-col>
      </v-row>
      <v-divider :key="'doc'+i" class="my-4 mr-2"></v-divider>
    </template>
  </v-container>
</template>

<script>
import Vue from 'vue'
import { config } from '@/mixins/config'
import { context } from '@/mixins/context'
import axios from 'axios'

export default {
  name: 'doi-search-results',
  mixins: [ config, context ],
  props: {
    docs: {
      type: Array
    },
    total: Number,
  },
  data () {
    return {
    }
  },
  methods: {
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
