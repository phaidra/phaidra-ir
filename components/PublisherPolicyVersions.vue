<template>
  <div class="pa-4">
    <v-tabs>
      <v-tab v-for="(version, i) in versions" :key="'ver'+i">{{ version.label }}</v-tab>
      <v-tab-item v-for="(version, i) in versions" :key="'veri'+i">
        <v-card outlined>
          <v-card-text>
            <div class="my-6">{{ $t('The following Open Access routes are permitted for this version') }}:</div>
            <template v-if="version.oaroutes.length > 1">
            <v-tabs>
              <v-tab v-for="(route, i) in version.oaroutes" :key="'op'+i">{{ $t('Option') }} {{ i+1 }}</v-tab>
              <v-tab-item v-for="(route, i) in version.oaroutes" :key="'rt'+i">
                <open-access-route :route="route"></open-access-route>
              </v-tab-item>
            </v-tabs>
            </template>
            <template v-else>
              <open-access-route :route="version.oaroutes[0]"></open-access-route>
            </template>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs>
    <div class="mb-2 mt-6" v-if="links.length > 0">{{ $t('For more information, please see the following links') }}:</div>
    <div v-for="(url, i) in links" class="pt-2" :key="'url'+i">
      <a :href="url.url" target="_blank">{{ url.description }}</a>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    publication: Object
  },
  computed: {
    links: function () {
      let links = []
      if (Array.isArray(this.publication.publisher_policy)) {
        for (let policy of this.publication.publisher_policy) {
          if (Array.isArray(policy.urls)) {
            for (let url of policy.urls) {
              links.push(url)
            }
          }
        }
      }
      return links
    },
    versions: function () {
      let versions = []
      let versionsHahs = {}
      if (Array.isArray(this.publication.publisher_policy)) {
        for (let policy of this.publication.publisher_policy) {
          if (Array.isArray(policy.permitted_oa)) {
            for (let route of policy.permitted_oa) {
              if (!versionsHahs.hasOwnProperty(route.article_version)) {
                versionsHahs[route.article_version] = {
                  label: route.article_version,
                  oaroutes: []
                }
              }
              if (Array.isArray(route.article_version_phrases)) {
                for (let phrase of route.article_version_phrases) {
                  if (phrase.language === 'en') {
                    versionsHahs[route.article_version].label = phrase.phrase
                  }
                }
              }
              versionsHahs[route.article_version].oaroutes.push(route)
            }
          }
        }
      }
      Object.entries(versionsHahs).forEach(([key, value]) => {
        versions.push(value)
      })
      return versions
    }
  }
}
</script>
