<template>
  <v-container>
    <admin-search></admin-search>
  </v-container>
</template>

<script>
import AdminSearch from '@/components/AdminSearch'
import { context } from '../mixins/context'
import { config } from '../mixins/config'

export default {
  name: 'admin',
  mixins: [ context, config ],
  components: {
    AdminSearch
  }
}
</script>

<style scoped>

</style>
