<template>
  <v-container class="mt-5">
    <v-row>
      <v-col cols="12" md="4" offset-md="4">
        <v-form v-model="valid">
          <v-card>
            <v-card-text>
              <v-col cols="10" offset="1">
                <v-text-field
                  v-on:keyup.enter="login()"
                  :disabled="loading"
                  :label="$t('Username')"
                  :placeholder="' '"
                  v-model="credentials.username"
                  required
                  filled
                  :autocomplete="'username'"
                ></v-text-field>
                <v-text-field
                  v-on:keyup.enter="login()"
                  :disabled="loading"
                  :label="$t('Password')"
                  :placeholder="' '"
                  v-model="credentials.password"
                  required
                  filled
                  :append-icon="e1 ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="toggleVisibility"
                  :type="e1 ? 'password' : 'text'"
                  :autocomplete="'current-password'"
                ></v-text-field>
              </v-col>
            </v-card-text>
            <v-divider class="mt-5"></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                @click="login"
                :disabled="loading"
                :loading="loading"
                color="primary"
                raised
                >{{ $t("Login") }}</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { context } from "../mixins/context";

export default {
  mixins: [context],
  data() {
    return {
      e1: true,
      credentials: {
        username: "",
        password: "",
      },
      valid: false,
      loading: false,
    };
  },
  methods: {
    async login() {
      this.loading = true;
      try {
        await this.$store.dispatch("login", this.credentials);
        if (this.signedin) {
          this.credentials.username = "";
          this.credentials.password = "";
          this.$router.push("/submit");
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    toggleVisibility: function () {
      this.e1 = !this.e1;
    },
  },
};
</script>

<style scoped>
h1,
h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
