<template>
  <v-container>
    <v-row>
      <v-col>
        <h3 class="title font-weight-light primary--text pt-1">
          {{ $t("What do you want to upload?") }}
        </h3>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn
          raised
          color="primary mr-2"
          :to="{ path: '/submit/journal-article'}"
        >
          {{ $t("Scholarly article") }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row class="mb-2">
      <v-col>
        {{
          $t(
            "This includes: Journal articles, reports, reviews, working papers, conference papers ..."
          )
        }}
      </v-col>
    </v-row>
    <v-divider class="my-2"></v-divider>
    <v-row>
      <v-col>
        <v-btn
          raised
          color="primary mr-2"
          :to="{ path: '/submit/book-part'}"
        >
          {{ $t("Book chapter") }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row class="mb-2">
      <v-col>
        {{
          $t(
            "This includes: Individual chapters from monographs, collections of essays, conference proceedings ..."
          )
        }}
      </v-col>
    </v-row>
    <v-divider class="my-2"></v-divider>
    <v-row>
      <v-col>
        <v-btn
          raised
          color="primary mr-2"
          :to="{ path: '/submit/book'}"
        >
          {{ $t("Book") }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row class="mb-2">
      <v-col>
        {{
          $t(
            "This includes: Complete monographs, collections of essays, conference proceedings ..."
          )
        }}
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {};
</script>

<style scoped>
.v-application a {
  color: #333;
}
</style>
