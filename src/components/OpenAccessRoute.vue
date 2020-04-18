<template>
  <v-row no-gutters>
    <v-col>
      <code>{{ route }}</code>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'open-access-route',
  props: {
    route: Object
  }
}
</script>
