<template>
  <v-row no-gutters>
    <v-col>
      <span class="youarehere">{{ $t('You are here') }}:</span>
      <template v-for="(item, index) in items">
        <icon :key="'icon'+index" left dark name="univie-right" color="#a4a4a4" width="8px" height="8px" class="mx-1"></icon>
        <span :key="'distext'+index" v-if="item.disabled" class="text" >{{ $t(item.text) }}</span>
        <template v-else>
          <a v-if="item.to === '/submit'" @click="goToSubmit()" :key="'subm'+index" class="text primary--text">{{ $t(item.text) }}</a>
          <a :key="'iconex'+index" v-else-if="item.external" :href="item.to" class="text primary--text">{{ $t(item.text) }}</a>
          <nuxt-link :key="'link'+index" v-else :to="item.to" class="text primary--text">{{ $t(item.text) }}</nuxt-link>
        </template>
      </template>
      <v-divider></v-divider>
      <div class="prg">
        <v-progress-linear :active="$store.state.loading" :height="2" indeterminate color="primary"></v-progress-linear>
      </div>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    items: Array
  },
  methods: {
    goToSubmit: function () {
      this.$store.commit('setSkipsubmitrouteleavehook', true)
      this.$router.push('/submit')
    }
  }
}
</script>

<style scoped>
.prg {
  min-height: 3px;
}

.youarehere {
  font-weight: bold;
  font-size: 10pt;
}

.text {
  font-size: 10pt;
}
</style>
