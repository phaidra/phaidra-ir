<template>
  <v-row>

  <v-col cols="12">
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
            :filled="inputStyle==='filled'"
            :outlined="inputStyle==='outlined'"
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
            :filled="inputStyle==='filled'"
            :outlined="inputStyle==='outlined'"
          ></v-text-field>
        </v-col>
        <v-col cols="12" :md="funderIdentifier === 'other' ? 2 : 4">
          <v-text-field
            :value="code"
            :label="$t('Project number')"
            v-on:blur="$emit('input-code',$event.target.value)"
            :filled="inputStyle==='filled'"
            :outlined="inputStyle==='outlined'"
          ></v-text-field>
        </v-col>
        <v-col cols="2">
          <v-btn icon @click="$emit('add', $event)">
            <v-icon>mdi-content-duplicate</v-icon>
          </v-btn>
          <v-btn icon @click="$emit('add-clear', $event)">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn v-if="removable" icon @click="$emit('remove', $event)">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row >
        <v-col :cols="6">
          <v-autocomplete
            v-on:input="$emit('input-identifier-type', $event)"
            :label="$t('Type of identifier')"
            :items="vocabularies['irprojectid'].terms"
            :item-value="'@id'"
            :value="getTerm('irprojectid', identifierType)"
            :filter="autocompleteFilter"
            :filled="inputStyle==='filled'"
            :outlined="inputStyle==='outlined'"
            return-object
            clearable
          >
            <template slot="item" slot-scope="{ item }">
              <v-list-item-content two-line>
                <v-list-item-title  v-html="`${getLocalizedTermLabel('irprojectid', item['@id'])}`"></v-list-item-title>
              </v-list-item-content>
            </template>
            <template slot="selection" slot-scope="{ item }">
              <v-list-item-content>
                <v-list-item-title v-html="`${getLocalizedTermLabel('irprojectid', item['@id'])}`"></v-list-item-title>
              </v-list-item-content>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col :cols="6">
          <v-text-field
            :value="identifier"
            :label="$t('Identifier')"
            v-on:blur="$emit('input-identifier',$event.target.value)"
            :filled="inputStyle==='filled'"
            :outlined="inputStyle==='outlined'"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-col>
    </v-row>
</template>

<script>
import { vocabulary } from 'phaidra-vue-components/src/mixins/vocabulary'
import { fieldproperties } from 'phaidra-vue-components/src/mixins/fieldproperties'

export default {
  mixins: [vocabulary, fieldproperties],
  props: {
    type: {
      type: String
    },
    label: {
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
    code: {
      type: String
    },
    identifierType: {
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
  },
  mounted: function () {
    this.$nextTick(function () {
      this.loading = !this.vocabularies['irfunders'].loaded
      // emit input to set skos:prefLabel in parent
      if (this.funderIdentifier && (this.funderIdentifier !== 'other')) {
        this.$emit('select-funder', this.getTerm('irfunders', this.funderIdentifier))
      }
    })
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
