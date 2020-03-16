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
                  <v-btn @click="parseKeywordsPaste()" color="primary">{{ $t('Parse') }}</v-btn>
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
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { vocabulary } from 'phaidra-vue-components/src/mixins/vocabulary'
import { fieldproperties } from 'phaidra-vue-components/src/mixins/fieldproperties'
import xmlUtils from 'phaidra-vue-components/src/utils/xml'
import arrayUtils from 'phaidra-vue-components/src/utils/arrays'

export default {
  name: 'submit-ir-description-keywords',
  mixins: [vocabulary, fieldproperties],
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
    descriptionLabel: {
      type: String
    },
    keywordsLabel: {
      type: String
    },
    keywordParser: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      items: [],
      model: this.value,
      keywordspaste: ''
    }
  },
  watch: {
    keywordsValue (val) {
      this.model = this.value
    }
  },
  methods: {
    parseKeywordsPaste () {
      let arr = this.keywordspaste.split(/[,;]/)
      arr = arr.map(e => e.trim())
      this.model = arr
      this.$emit('input-keywords', arr)
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
