<template>
  <v-container class="mt-4">
    <v-row>
      <v-col>
        <v-btn raised color="primary mr-2" :to="{ name: 'adminsubmitform', params: { submitform: 'journal-article' } }">
          {{$t('Scholarly article')}}
        </v-btn>
        <v-divider class="my-4"></v-divider>
        <v-btn raised color="primary mr-2" :to="{ name: 'adminsubmitform', params: { submitform: 'book-part' } }">
          {{$t('Book chapter')}}
        </v-btn>
        <v-divider class="my-4"></v-divider>
        <v-btn raised color="primary mr-2" :to="{ name: 'adminsubmitform', params: { submitform: 'book' } }">
          {{$t('Book')}}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  name: 'admin-submit'
}
</script>

<style scoped>
.v-application a {
  color: #333
}
</style>
