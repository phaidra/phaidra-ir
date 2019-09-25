<template>
  <v-container>
  </v-container>
</template>

<script>
import { context } from '../mixins/context'
import { config } from '../mixins/config'

export default {
  name: 'admin',
  mixins: [ context, config ]
}
</script>

<style scoped>

</style>
