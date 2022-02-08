<template>
  <v-row >
    <v-col cols="12">
      <v-card >
        <v-card-title class="title font-weight-light grey white--text">
          <span>{{ $t(label) }}</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="mt-4">
          <v-row>
            <v-col cols="12">
              <v-textarea
                :value="descriptionValue"
                v-on:blur="$emit('input-description',$event.target.value)"
                :label="$t(descriptionLabel)"
                :filled="inputStyle==='filled'"
                :outlined="inputStyle==='outlined'"
                :hint="descriptionHint ? $t(descriptionHint) : undefined"
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row no-gutters v-if="keywordParser">
            <v-col cols="10">
              <v-textarea
                v-model="keywordspaste"
                filled
                :placeholder="$t('Paste keywords')"
              >
                <template v-slot:append-outer>
                  <v-row>
                    <v-btn class="ma-2" @click="parseKeywordsPaste()" color="primary">{{ $t('Parse') }}</v-btn>
                    <v-btn class="ma-2" @click="loadToPaste()" color="primary">{{ $t('Load') }}</v-btn>
                  </v-row>
                </template>
              </v-textarea>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-combobox
                v-model="model"
                v-on:input="onInput($event)"
                v-on:change="onInput($event)"
                :label="$t(keywordsLabel)"
                multiple
                clearable
                chips
                deletable-chips
                :filled="inputStyle==='filled'"
                :outlined="inputStyle==='outlined'"
                :hint="$t('Confirm each keyword by pressing enter')"
              >
                <template
                  slot="selection"
                  slot-scope="data"
                >
                  <v-chip
                    close
                    :input-value="data.selected"
                    :disabled="data.disabled"
                    class="v-chip--select-multi"
                    @click:close="removeKeyword(data.item)"
                  >
                    {{ htmlToPlaintext(data.item) }}
                  </v-chip>
                </template>
              </v-combobox>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6" v-if="multilingual">
              <v-autocomplete
                :value="getTerm('lang', language)"
                v-on:input="$emit('input-language', $event )"
                :items="vocabularies['lang'].terms"
                :item-value="'@id'"
                :filter="autocompleteFilter"
                hide-no-data
                :label="$t('Language')"
                :filled="inputStyle==='filled'"
                :outlined="inputStyle==='outlined'"
                return-object
                clearable
              >
                <template slot="item" slot-scope="{ item }">
                  <v-list-item-content two-line>
                    <v-list-item-title  v-html="`${getLocalizedTermLabel('lang', item['@id'])}`"></v-list-item-title>
                  </v-list-item-content>
                </template>
                <template slot="selection" slot-scope="{ item }">
                  <v-list-item-content>
                    <v-list-item-title v-html="`${getLocalizedTermLabel('lang', item['@id'])}`"></v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { config } from '@/mixins/config'
import { vocabulary } from 'phaidra-vue-components/src/mixins/vocabulary'
import { fieldproperties } from 'phaidra-vue-components/src/mixins/fieldproperties'
import xmlUtils from 'phaidra-vue-components/src/utils/xml'
import arrayUtils from 'phaidra-vue-components/src/utils/arrays'

export default {
  mixins: [config, vocabulary, fieldproperties],
  props: {
    label: {
      type: String
    },
    keywordsValue: {
      type: Array
    },
    descriptionValue: {
      type: String
    },
    descriptionHint: {
      type: String,
      default: undefined
    },
    descriptionLabel: {
      type: String
    },
    language: {
      type: String
    },
    keywordsLabel: {
      type: String
    },
    keywordParser: {
      type: Boolean,
      default: false
    },
    multilingual: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      items: [],
      model: this.keywordsValue,
      keywordspaste: ''
    }
  },
  watch: {
    keywordsValue: {
      handler: function (val) {
        this.model = this.keywordsValue
        this.keywordspaste = ''
      },
      deep: true
    }
  },
  methods: {
    parseKeywordsPaste () {
      let arr = this.keywordspaste.split(/[;]/)
      arr = arr.map(e => e.trim())
      this.model = arr
      this.$emit('input-keywords', arr)
    },
    loadToPaste () {
      this.keywordspaste = this.keywordsValue.join(';')
    },
    onInput (value) {
      let arr = []
      for (let v of value) {
        if (v.payload) {
          arr.push(v.payload)
        } else {
          arr.push(v)
        }
      }
      this.$emit('input-keywords', arr)
    },
    removeKeyword (keyword) {
      arrayUtils.remove(this.model, keyword)
    },
    htmlToPlaintext (html) {
      return xmlUtils.htmlToPlaintext(html)
    }
  }

}
</script>

<style scoped>
.v-btn {
  margin: 0;
}
</style>
