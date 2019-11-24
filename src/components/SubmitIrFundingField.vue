<template>
  <v-row>
    <v-col cols="12" :md="funderIdentifier === 'other' ? 4 : 6">
      <v-autocomplete
        :value="getTerm('irfunders', funderIdentifier)"
        v-on:input="$emit('select-funder', $event)"
        :items="vocabularies['irfunders'].terms"
        :item-value="'@id'"
        :filter="autocompleteFilter"
        hide-no-data
        :label="$t('Funder')"
        filled
        return-object
        clearable
      >
        <template slot="item" slot-scope="{ item }">
          <v-list-item-content two-line>
            <v-list-item-title  v-html="`${getLocalizedTermLabel('irfunders', item['@id'])}`"></v-list-item-title>
            <v-list-item-subtitle v-if="showIds" v-html="`${item['@id']}`"></v-list-item-subtitle>
          </v-list-item-content>
        </template>
        <template slot="selection" slot-scope="{ item }">
          <v-list-item-content>
            <v-list-item-title v-html="`${getLocalizedTermLabel('irfunders', item['@id'])}`"></v-list-item-title>
          </v-list-item-content>
        </template>
      </v-autocomplete>
    </v-col>
    <v-col cols="12" md="4" v-if="funderIdentifier === 'other'">
      <v-text-field
        :value="funderName"
        :label="$t('Funder name')"
        v-on:blur="$emit('input-funder-name',$event.target.value)"
        filled
      ></v-text-field>
    </v-col>
    <v-col cols="12" :md="funderIdentifier === 'other' ? 2 : 4">
      <v-text-field
        :value="identifier"
        :label="$t('Project identifier')"
        v-on:blur="$emit('input-identifier',$event.target.value)"
        homepage
        filled
      ></v-text-field>
    </v-col>
    <v-col cols="1" v-if="actions.length">
      <v-menu open-on-hover bottom offset-y>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="(action, i) in actions" :key="i" @click="$emit(action.event, $event)">
            <v-list-item-title>{{ action.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-col>
  </v-row>
</template>

<script>
import { vocabulary } from 'phaidra-vue-components/src/mixins/vocabulary'
import { fieldproperties } from 'phaidra-vue-components/src/mixins/fieldproperties'

export default {
  name: 'submit-ir-funding-field',
  mixins: [vocabulary, fieldproperties],
  props: {
    type: {
      type: String
    },
    name: {
      type: String
    },
    nameLanguage: {
      type: String
    },
    funderName: {
      type: String
    },
    funderNameLanguage: {
      type: String
    },
    identifier: {
      type: String
    },
    funderIdentifier: {
      type: String
    },
    description: {
      type: String
    },
    descriptionLanguage: {
      type: String
    },
    homepage: {
      type: String
    },
    showIds: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.v-btn {
  margin: 0;
}
.vertical-center {
 align-items: center;
}
</style>
