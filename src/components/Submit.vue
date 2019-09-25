<template>
  <v-container>
    <v-row>
      <v-col>
        <v-btn raised color="primary mr-2" :to="{ name: 'submit-ir', params: { submitform: 'journal-article' } }">
          {{$t('Journal article')}}
        </v-btn>
        {{$t('Journal article.')}}
        <v-divider class="my-4"></v-divider>
        <v-btn raised color="primary mr-2" :to="{ name: 'submit-ir', params: { submitform: 'book' } }">
          {{$t('Book')}}
        </v-btn>
        {{$t('Book.')}}
        <v-divider class="my-4"></v-divider>
        <v-btn raised color="primary mr-2" :to="{ name: 'submit-ir', params: { submitform: 'book-part' } }">
          {{$t('Book chapter')}}
        </v-btn>
        {{$t('Book chapter.')}}
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  name: 'submit'
}
</script>

<style scoped>
.v-application a {
  color: #333
}
</style>
