<template>
  <v-card class="mb-8 mx-2" width="100%">
    <v-card-title class="title font-weight-light grey white--text">
      <span>{{ $t('Rights and licences') }}</span>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text class="mt-4">
      <template v-if="$i18n.locale === 'deu'">
        <v-row class="px-4 mx-2">
          <p>Jeder Upload ist urheberrechtlich geschützt. Es gilt: "Alle Rechte vorbehalten". Im Falle einer bestehenden Creative-Commons-Lizenz bzw. für eine Erstlizenzierung <b>beachten Sie</b>:</p>
          <p>a) Sollte das Objekt bereits eine CC-Lizenz aufweisen, so wählen Sie diese bitte hier aus. Damit kann die <b>vorhandene CC-Lizenz</b> auch in den Metadaten des Objektes im Repository angezeigt und weitergegeben werden.</p>
          <p>b) Sollte das Objekt noch keine CC-Lizenz aufweisen und auch sonst unter keiner Lizenz stehen, so können Sie hier eine <b>Erstlizenzierung</b> vornehmen. Dies setzt voraus, dass Sie über die entsprechenden Rechte verfügen.</p>
        </v-row>
      </template>
      <template v-else>
        <v-row class="px-4 mx-2">
          <p>Every upload is protected by copyright. "All rights reserved" applies. <b>Please note</b> the following in case of an existing Creative Commons licence or for an initial licensing:</p>
          <p>a) Should the object already bear a CC licence please select it here. This ensures the <b>existing CC licence</b> can be displayed in the repository and accordingly distributed.</p>
          <p>b) Should the object not bear any CC licence or other licence you can <b>apply a licence</b> here. This requires you to have the necessary rights.</p>
        </v-row>
      </template>
      <v-col cols="12" v-if="!hidden">
        <v-row>
          <v-col :cols="(actions.length ? 10 : 12)">
            <!---->
            <v-autocomplete
              :value="getTerm(vocabulary, value)"
              :background-color="backgroundColor ? backgroundColor : undefined"
              v-on:input="$emit('input', $event)"
              :rules="required ? [ v => !!v || 'Required'] : []"
              :items="loadedTerms"
              :item-value="'@id'"
              :loading="loading"
              :filter="autocompleteFilter"
              hide-no-data
              :height="7"
              :label="$t(label)"
              :filled="inputStyle==='filled'"
              :outlined="inputStyle==='outlined'"
              return-object
              clearable
              :readonly="readonly"
              :disabled="disabled || readonly"
              :hint="hint"
              :persistent-hint="hint ? true : false"
              :error-messages="errorMessages"
            >
              <!-- the attr binds the 'disabled' property of the vocabulary term (if defined) to the item component -->
              <template slot="item" slot-scope="{ attr, item }">
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
          <v-col cols="2" v-if="actions.length">
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
        <template v-if="$i18n.locale === 'deu'">

          <v-slide-y-transition hide-on-leave>
            <div v-if="value === 'http://rightsstatements.org/vocab/InC/1.0/'" class="license-desc mx-4">
              <p>
                Dieses Objekt ist durch das Urheberrecht und/oder verwandte Schutzrechte geschützt. Sie sind berechtigt, das Objekt in jeder Form zu nutzen, die das Urheberrechtsgesetz und/oder einschlägige verwandte Schutzrechte gestatten. Für weitere Nutzungsarten benötigen Sie die Zustimmung der/des Rechteinhaber/s. Siehe <a href="https://rightsstatements.org/page/InC/1.0/?language=de" target="_blank">https://rightsstatements.org/page/InC/1.0/</a>
              </p>
            </div>
          </v-slide-y-transition>

          <v-slide-y-transition hide-on-leave>
            <div v-if="value === 'http://creativecommons.org/licenses/by/4.0/'" class="license-desc mx-4">
              <p>
                Der Lizenznehmer darf:
                <br/><strong>Teilen</strong> — das Material in jedwedem Format oder Medium vervielfältigen und weiterverbreiten
                <br/><strong>Bearbeiten</strong> — das Material remixen, verändern und darauf aufbauen, sogar kommerziell
              </p>
              <p>
                Unter folgenden Bedingungen:
                <br/><strong>Namensnennung</strong>
              </p>
              <p>
                Kurzfassung der Lizenz:
                <br/><a href="https://creativecommons.org/licenses/by/4.0/deed.de" target="_blank">https://creativecommons.org/licenses/by/4.0/deed.de</a>
                <br/>Vollständiger Lizenztext:
                <br/><a href="https://creativecommons.org/licenses/by/4.0/legalcode" target="_blank">https://creativecommons.org/licenses/by/4.0/legalcode</a>
              </p>
            </div>
          </v-slide-y-transition>

          <v-slide-y-transition hide-on-leave>
            <div v-if="value === 'http://creativecommons.org/licenses/by-sa/4.0/'" class="license-desc mx-4">
              <p>
                Der Lizenznehmer darf:
                <br/><strong>Teilen</strong> — das Material in jedwedem Format oder Medium vervielfältigen und weiterverbreiten
                <br/><strong>Bearbeiten</strong> — das Material remixen, verändern und darauf aufbauen, sogar kommerziell
              </p>
              <p>
                Unter folgenden Bedingungen:
                <br/><strong>Namensnennung — Weitergabe unter gleichen Bedingungen</strong>
              </p>
              <p>
                Kurzfassung der Lizenz:
                <br/><a href="https://creativecommons.org/licenses/by-sa/4.0/deed.de" target="_blank">https://creativecommons.org/licenses/by-sa/4.0/deed.de</a>
                <br/>Vollständiger Lizenztext:
                <br/><a href="https://creativecommons.org/licenses/by-sa/4.0/legalcode" target="_blank">https://creativecommons.org/licenses/by-sa/4.0/legalcode</a>
              </p>
            </div>
          </v-slide-y-transition>

          <v-slide-y-transition hide-on-leave>
            <div v-if="value === 'http://creativecommons.org/licenses/by-nc/4.0/'" class="license-desc mx-4">
              <p>
                Der Lizenznehmer darf:
                <br/><strong>Teilen</strong> — das Material in jedwedem Format oder Medium vervielfältigen und weiterverbreiten
                <br/><strong>Bearbeiten</strong> — das Material remixen, verändern und darauf aufbauen
              </p>
              <p>
                Unter folgenden Bedingungen:
                <br/><strong>Namensnennung — nicht kommerziell</strong>
              </p>
              <p>
                Kurzfassung der Lizenz:
                <br/><a href="https://creativecommons.org/licenses/by-nc/4.0/deed.de" target="_blank">https://creativecommons.org/licenses/by-nc/4.0/deed.de</a>
                <br/>Vollständiger Lizenztext:
                <br/><a href="https://creativecommons.org/licenses/by-nc/4.0/legalcode" target="_blank">https://creativecommons.org/licenses/by-nc/4.0/legalcode</a>
              </p>
            </div>
          </v-slide-y-transition>

          <v-slide-y-transition hide-on-leave>
            <div v-if="value === 'http://creativecommons.org/licenses/by-nd/4.0/'" class="license-desc mx-4">
              <p>
                Der Lizenznehmer darf:
                <br/><strong>Teilen</strong> — das Material in jedwedem Format oder Medium vervielfältigen und weiterverbreiten und zwar für beliebige Zwecke, sogar kommerziell
              </p>
              <p>
                Unter folgenden Bedingungen:
                <br/><strong>Namensnennung — keine Bearbeitungen</strong>
              </p>
              <p>
                Kurzfassung der Lizenz:
                <br/><a href="https://creativecommons.org/licenses/by-nd/4.0/deed.de" target="_blank">https://creativecommons.org/licenses/by-nd/4.0/deed.de</a>
                <br/>Vollständiger Lizenztext:
                <br/><a href="https://creativecommons.org/licenses/by-nd/4.0/legalcode" target="_blank">https://creativecommons.org/licenses/by-nd/4.0/legalcode</a>
              </p>
            </div>
          </v-slide-y-transition>

          <v-slide-y-transition hide-on-leave>
            <div v-if="value === 'http://creativecommons.org/licenses/by-nc-sa/4.0/'" class="license-desc mx-4">
              <p>
                Der Lizenznehmer darf:
                <br/><strong>Teilen</strong> — das Material in jedwedem Format oder Medium vervielfältigen und weiterverbreiten
                <br/><strong>Bearbeiten</strong> — das Material remixen, verändern und darauf aufbauen
              </p>
              <p>
                Unter folgenden Bedingungen:
                <br/><strong>Namensnennung — nicht kommerziell — Weitergabe unter gleichen Bedingungen</strong>
              </p>
              <p>
                Kurzfassung der Lizenz:
                <br/><a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de" target="_blank">https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de</a>
                <br/>Vollständiger Lizenztext:
                <br/><a href="https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode" target="_blank">https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode</a>
              </p>
            </div>
          </v-slide-y-transition>

          <v-slide-y-transition hide-on-leave>
            <div v-if="value === 'http://creativecommons.org/licenses/by-nc-nd/4.0/'" class="license-desc mx-4">
              <p>
                Der Lizenznehmer darf:
                <br/><strong>Teilen</strong> — das Material in jedwedem Format oder Medium vervielfältigen und weiterverbreiten
              </p>
              <p>
                Unter folgenden Bedingungen:
                <br/><strong>Namensnennung — nicht kommerziell — keine Bearbeitungen</strong>
              </p>
              <p>
                Kurzfassung der Lizenz:
                <br/><a href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.de" target="_blank">https://creativecommons.org/licenses/by-nc-nd/4.0/deed.de</a>
                <br/>Vollständiger Lizenztext:
                <br/><a href="https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode" target="_blank">https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode</a>
              </p>
            </div>
          </v-slide-y-transition>

        </template>
        <template v-else>

          <v-slide-y-transition hide-on-leave>
            <div v-if="value === 'http://rightsstatements.org/vocab/InC/1.0/'" class="license-desc mx-4">
              <p>
                This Item is protected by copyright and/or related rights. You are free to use this Item in any way that is permitted by the copyright and related rights legislation that applies to your use. For other uses you need to obtain permission from the rights-holder(s). See <a target="_blank" href="https://rightsstatements.org/page/InC/1.0/?language=en">https://rightsstatements.org/page/InC/1.0/</a>
              </p>
            </div>
          </v-slide-y-transition>

          <v-slide-y-transition hide-on-leave>
            <div v-if="value === 'http://creativecommons.org/licenses/by/4.0/'" class="license-desc mx-4">
              <p>
                The licensee may:
                <br/><strong>Share</strong> — copy and redistribute the material in any medium or format
                <br/><strong>Adapt</strong> — remix, transform, and build upon the material, even commercially
              </p>
              <p>
                Under the following terms:
                <br/><strong>Attribution</strong>
              </p>
              <p>
                Licence outline:
                <br/><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">https://creativecommons.org/licenses/by/4.0/</a>
                <br/>Full licence:
                <br/><a href="https://creativecommons.org/licenses/by/4.0/legalcode" target="_blank">https://creativecommons.org/licenses/by/4.0/legalcode</a>
              </p>
            </div>
          </v-slide-y-transition>

          <v-slide-y-transition hide-on-leave>
            <div v-if="value === 'http://creativecommons.org/licenses/by-sa/4.0/'" class="license-desc mx-4">
              <p>
                The licensee may:
                <br/><strong>Share</strong> — copy and redistribute the material in any medium or format
                <br/><strong>Adapt</strong> — remix, transform, and build upon the material, even commercially
              </p>
              <p>
                Under the following terms:
                <br/><strong>Attribution — ShareAlike</strong>
              </p>
              <p>
                Licence outline:
                <br/><a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">https://creativecommons.org/licenses/by-sa/4.0/</a>
                <br/>Full licence:
                <br/><a href="https://creativecommons.org/licenses/by-sa/4.0/legalcode" target="_blank">https://creativecommons.org/licenses/by-sa/4.0/legalcode</a>
              </p>
            </div>
          </v-slide-y-transition>

          <v-slide-y-transition hide-on-leave>
            <div v-if="value === 'http://creativecommons.org/licenses/by-nc/4.0/'" class="license-desc mx-4">
              <p>
                The licensee may:
                <br/><strong>Share</strong> — copy and redistribute the material in any medium or format
                <br/><strong>Adapt</strong> — remix, transform, and build upon the material
              </p>
              <p>
                Under the following terms:
                <br/><strong>Attribution — NonCommercial</strong>
              </p>
              <p>
                Licence outline:
                <br/><a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank">https://creativecommons.org/licenses/by-nc/4.0/</a>
                <br/>Full licence:
                <br/><a href="https://creativecommons.org/licenses/by-nc/4.0/legalcode" target="_blank">https://creativecommons.org/licenses/by-nc/4.0/legalcode</a>
              </p>
            </div>
          </v-slide-y-transition>

          <v-slide-y-transition hide-on-leave>
            <div v-if="value === 'http://creativecommons.org/licenses/by-nd/4.0/'" class="license-desc mx-4">
              <p>
                The licensee may:
                <br/><strong>Share</strong> — copy and redistribute the material in any medium or format for any purpose, even commercially
              </p>
              <p>
                Under the following terms:
                <br/><strong>Attribution — NoDerivatives</strong>
              </p>
              <p>
                Licence outline:
                <br/><a href="https://creativecommons.org/licenses/by-nd/4.0/" target="_blank">https://creativecommons.org/licenses/by-nd/4.0/</a>
                <br/>Full licence:
                <br/><a href="https://creativecommons.org/licenses/by-nd/4.0/legalcode" target="_blank">https://creativecommons.org/licenses/by-nd/4.0/legalcode</a>
              </p>
            </div>
          </v-slide-y-transition>

          <v-slide-y-transition hide-on-leave>
            <div v-if="value === 'http://creativecommons.org/licenses/by-nc-sa/4.0/'" class="license-desc mx-4">
              <p>
                The licensee may:
                <br/><strong>Share</strong> — copy and redistribute the material in any medium or format
                <br/><strong>Adapt</strong> — remix, transform, and build upon the material
              </p>
              <p>
                Under the following terms:
                <br/><strong>Attribution — NonCommercial — ShareAlike</strong>
              </p>
              <p>
                Licence outline:
                <br/><a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">https://creativecommons.org/licenses/by-nc-sa/4.0/</a>
                <br/>Full licence:
                <br/><a href="https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode" target="_blank">https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode</a>
              </p>
            </div>
          </v-slide-y-transition>

          <v-slide-y-transition hide-on-leave>
            <div v-if="value === 'http://creativecommons.org/licenses/by-nc-nd/4.0/'" class="license-desc mx-4">
              <p>
                The licensee may:
                <br/><strong>Share</strong> — copy and redistribute the material in any medium or format
              </p>
              <p>
                Under the following terms:
                <br/><strong>Attribution — NonCommercial — NoDerivatives</strong>
              </p>
              <p>
                Licence outline:
                <br/><a href="https://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank">https://creativecommons.org/licenses/by-nc-nd/4.0/</a>
                <br/>Full licence:
                <br/><a href="https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode" target="_blank">https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode</a>
              </p>
            </div>
          </v-slide-y-transition>
        </template>
        <v-slide-y-transition hide-on-leave>
          <v-row no-gutters v-show="isCCLicense" :class=" hint ? 'mt-2 mb-6' : 'mb-6'">
            <v-col cols="10">
              <v-row class="px-4">
                <p v-html="$t('LICENSE_DISCLAIMER', { institution: $t($store.state.instanceconfig.institution) })"></p>
              </v-row>
            </v-col>
          </v-row>
        </v-slide-y-transition>
      </v-col>
    </v-card-text>
  </v-card>
</template>

<script>
import { vocabulary } from 'phaidra-vue-components/src/mixins/vocabulary'
import { fieldproperties } from 'phaidra-vue-components/src/mixins/fieldproperties'

export default {
  name: 'p-i-select',
  mixins: [vocabulary, fieldproperties],
  props: {
    value: {
      type: String
    },
    label: {
      type: String,
      required: true
    },
    required: {
      type: Boolean
    },
    vocabulary: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showValueDefinition: {
      type: Boolean,
      default: false
    },
    hint: {
      type: String
    },
    errorMessages: {
      type: Array
    },
    showIds: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    loadedTerms: function () {
      if (this.vocabularies[this.vocabulary]) {
        return this.vocabularies[this.vocabulary].loaded ? this.vocabularies[this.vocabulary].terms : []
      }
      return []
    },
    isCCLicense: function () {
      return this.value.startsWith('http://creativecommons.org/licenses')
    }
  },
  data () {
    return {
      loading: false,
      terms: []
    }
  },
  mounted: function () {
    this.$nextTick(async function () {
      if (this.vocabulary) {
        if (this.vocabularies[vocabulary]) {
          if (this.vocabularies[vocabulary].loaded) {
            // emit input to set skos:prefLabel in parent
            if (this.value) {
              for (let term of this.vocabularies[this.vocabulary].terms) {
                if (term['@id'] === this.value) {
                  this.$emit('input', term)
                }
              }
            }
          }
        } else {
          await this.$store.dispatch('vocabulary/loadVocabulary', this.vocabulary)
          // emit input to set skos:prefLabel in parent
          if (this.value) {
            for (let term of this.vocabularies[this.vocabulary].terms) {
              if (term['@id'] === this.value) {
                this.$emit('input', term)
              }
            }
          }
        }
      }
    })
  }
}
</script>

<style scoped>
.v-btn {
  margin: 0;
}
</style>