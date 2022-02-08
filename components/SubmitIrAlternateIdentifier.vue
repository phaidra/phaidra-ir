<template>
  <v-row>
    <v-col cols="12" md="5" v-if="showType">
      <v-autocomplete
        v-on:input="$emit('input-identifier-type', $event)"
        :label="$t('Type of identifier')"
        :items="vocabularies[vocabulary].terms"
        :item-value="'@id'"
        :value="getTerm(vocabulary, type)"
        :filter="autocompleteFilter"
        :disabled="disabletype"
        :filled="inputStyle==='filled'"
        :outlined="inputStyle==='outlined'"
        return-object
        clearable
      >
        <template slot="item" slot-scope="{ item }">
          <v-list-item-content two-line>
            <v-list-item-title  v-html="`${getLocalizedTermLabel(vocabulary, item['@id'])}`"></v-list-item-title>
            <v-list-item-subtitle v-if="showIds" v-html="`${item['@id']}`"></v-list-item-subtitle>
          </v-list-item-content>
        </template>
        <template slot="selection" slot-scope="{ item }">
          <v-list-item-content>
            <v-list-item-title v-html="`${getLocalizedTermLabel(vocabulary, item['@id'])}`"></v-list-item-title>
          </v-list-item-content>
        </template>
      </v-autocomplete>
    </v-col>
    <v-col cols="12" :md="showType ? 5 : 10">
      <v-text-field
        :value="value"
        v-on:input="$emit('input-identifier', $event)"
        :label="$t(identifierLabel ? identifierLabel : 'Identifier')"
        :placeholder="placeholder(type)"
        :required="required"
        :rules="[validationrules[getIdentifierRuleName(type)]]"
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
</template>

<script>
import { vocabulary } from 'phaidra-vue-components/src/mixins/vocabulary'
import { fieldproperties } from 'phaidra-vue-components/src/mixins/fieldproperties'
import { validationrules } from 'phaidra-vue-components/src/mixins/validationrules'

export default {
  mixins: [vocabulary, fieldproperties, validationrules],
  props: {
    value: {
      type: String,
      required: true
    },
    label: {
      type: String
    },
    type: {
      type: String
    },
    identifierLabel: {
      type: String
    },
    vocabulary: {
      type: String,
      default: 'objectidentifiertype'
    },
    required: {
      type: Boolean
    },
    disabletype: {
      type: Boolean
    },
    showType: {
      type: Boolean
    },
    showIds: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    placeholder: function (type) {
      for (let i of this.vocabularies[this.vocabulary].terms) {
        if (i['@id'] === type) {
          return i['skos:example']
        }
      }
    }
  },
  mounted: function () {
    this.$nextTick(function () {
      this.loading = !this.vocabularies[this.vocabulary].loaded
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
