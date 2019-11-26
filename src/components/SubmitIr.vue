<template>

  <v-container v-if="submitformLoading">
    <div class="text-center">
      <v-progress-circular
        indeterminate
        color="primary"
        class="progressbar mt-12">
      </v-progress-circular>
    </div>
  </v-container>

  <v-stepper v-else-if="form.sections.length > 0" v-model="step" non-linear>
    <v-stepper-header>
      <v-stepper-step :complete="step > 1" step="1">{{ $t('Start') }}</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="touCheckbox" step="2">{{ $t('Terms of use') }}</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :editable="(step > 3) && (step < 8)" :complete="step > 3" step="3">{{ $t('Import') }}</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step v-if="(submitformparam === 'journal-article')" :editable="(step > 4) && (step < 8)" :complete="step > 4" step="4">{{ $t('Check rights') }}</v-stepper-step>
      <v-divider v-if="(submitformparam === 'journal-article')"></v-divider>
      <v-stepper-step :editable="(step > 5) && (step < 8)" :complete="step > 5" step="5" :rules="[() => validationStatus !== 'error']">{{ $t('Mandatory fields') }} <small v-if="validationStatus === 'error'">{{ $t('Invalid metadata') }}</small></v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :editable="(step > 6) && (step < 8)" :complete="step > 6" step="6">{{ $t('Optional fields') }}</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="step > 7" step="7">{{ $t('Submit') }}</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="step > 8" step="8">{{ $t('Notifications') }}</v-stepper-step>
    </v-stepper-header>

    <v-stepper-items>

      <v-stepper-content step="1">
        <v-container v-if="checkAllowSubmitRes.allowsubmit === 1">
          <v-row no-gutters>
            <h3 class="title font-weight-light primary--text mb-4">{{ $t('Submitting a publication') }}</h3>
          </v-row>
          <v-row no-gutters>
            <i18n path="SUBMIT_START_1" tag="p">
              <a :href="'/info/policy'" target="_blank">{{ $t('guidelines') }}</a>
            </i18n>
          </v-row>
          <v-row no-gutters justify="center">
            <v-col>
              <v-alert outlined type="error" color="primary">
                <h3 class="title font-weight-light mb-4 ml-4">{{ $t('Important notice') }}</h3>
                <ul class="black--text ml-4">
                  <li>
                    <i18n path="SUBMIT_START_2" tag="p">
                      <strong>{{ $t('if you hold the necessary rights') }}</strong>
                    </i18n>
                  </li>
                  <li>
                    <i18n path="SUBMIT_START_3" tag="p">
                      <strong>{{ $t('a larger number of publications') }}</strong>
                      <a :href="'/info/contact'" target="_blank">{{ $t('contact us') }}</a>
                    </i18n>
                  </li>
                </ul>
              </v-alert>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <i18n path="SUBMIT_START_4" tag="p">
              <a :href="'/info/about'" target="_blank">{{ $t('Über u:scholar') }}</a>
            </i18n>
          </v-row>
          <v-row no-gutters>
            <i18n path="SUBMIT_START_5" tag="p">
              <a :href="'mailto:' + config.officecontact.email">{{ config.officecontact.email }}</a>
            </i18n>
          </v-row>
          <v-row no-gutters>
            <i18n path="SUBMIT_START_6" tag="p">
              <a :href="'/info/about'" target="_blank">{{ $t('contact us') }}</a>
              <a :href="'mailto:' + config.officecontact.email">{{ config.officecontact.email }}</a>
            </i18n>
          </v-row>
          <v-divider class="mt-5 mb-7"></v-divider>
          <v-row no-gutters justify="center">
            <v-btn color="primary" @click="step = 2; $vuetify.goTo(1)">{{ $t('Start') }}</v-btn>
          </v-row>
        </v-container>
        <v-container v-else>
          <v-row no-gutters justify="center">
            <v-col>
              <v-alert outlined type="error">
                <i18n path="SUBMIT_NOT_ALLOWED" tag="p">
                  <span>{{ checkAllowSubmitRes.nruploads }}</span>
                  <a :href="'mailto:' + config.officecontact.email">{{ config.officecontact.email }}</a>
                  <span>{{ config.officecontact.phone }}</span>
                </i18n>
              </v-alert>
            </v-col>
          </v-row>
        </v-container>
      </v-stepper-content>

      <v-stepper-content step="2">
        <v-container>
          <v-row no-gutters>
            <h3 class="title font-weight-light primary--text mb-4">{{ $t('Terms of use') }}</h3>
          </v-row>
          <v-row no-gutters>
            <p>{{ $t('SUBMIT_TOU_1') }}</p>
          </v-row>
          <v-row no-gutters>
            <p>{{ $t('SUBMIT_TOU_2') }}</p>
          </v-row>
          <v-row no-gutters>
            <p>{{ $t('SUBMIT_TOU_3') }}</p>
          </v-row>
          <v-row no-gutters>
            <v-checkbox v-model="touCheckbox" color="primary" :error-messages="touCheckboxErrors">
              <template v-slot:label>
                <i18n path="SUBMIT_TOU_4" tag="span" class="black--text">
                  <a @click.stop href="https://phaidra.univie.ac.at/terms_of_use/show_terms_of_use" target="_blank">Phaidra</a>
                </i18n>
              </template>
            </v-checkbox>
          </v-row>
          <v-row no-gutters>
            <a class="mt-4" href="https://uscholar.univie.ac.at/static/doc/InstitutionalRepository-TermsOfUse-German.pdf" target="_blank">{{ $t('Terms of use (PDF)') }}</a>
          </v-row>
          <v-divider class="mt-5 mb-7"></v-divider>
          <v-row no-gutters justify="space-between">
            <v-btn dark color="grey" @click="step = 1; $vuetify.goTo(1)">{{ $t('Back') }}</v-btn>
            <v-btn color="primary" @click="checkTou(); $vuetify.goTo(1)">{{ $t('Continue') }}</v-btn>
          </v-row>
        </v-container>
      </v-stepper-content>

      <v-stepper-content step="3">
        <v-container>
          <v-row no-gutters>
            <h3 class="title font-weight-light primary--text mb-4">{{ $t('Metadata-Import via DOI') }}</h3>
          </v-row>
          <v-row no-gutters>
            <p>{{ $t('Many electronically published journals assign persistent names, so called DOIs (Digital Object Identifiers), to their articles.') }}</p>
          </v-row>
          <v-row no-gutters>
            <p>{{ $t('If you enter your article\'s DOI here, its metadata can be loaded automatically.') }}</p>
          </v-row>
          <v-row no-gutters justify="center">
            <v-col cols="4">
              <v-text-field :error-messages="doiImportErrors" filled v-model="doiImportInput" label="DOI" :placeholder="$t('please enter')"/>
            </v-col>
            <v-col cols="2" class="ml-4 mt-2">
              <v-btn :loading="loading" :disabled="loading" class="mx-2" color="primary" @click="importDOI()">{{ $t('Import') }}</v-btn>
              <v-btn :loading="loading" :disabled="loading" class="mx-2" dark color="grey" @click="resetDOIImport()">{{ $t('Reset') }}</v-btn>
            </v-col>
          </v-row>
          <v-alert outlined type="error" color="primary" transition="slide-y-transition" v-if="doiDuplicate">
            <span class="mr-2 black--text">{{ $t('Possible duplicate found') }}:</span><a target="_blank" :href="'https://' + config.phaidrabaseurl + '/' + doiDuplicate.pid">{{ doiDuplicate.title }}</a>
          </v-alert>
          <v-slide-y-transition>
            <v-row no-gutters v-if="doiImportData" justify="center">
              <v-col cols="12" md="7">
                <v-card>
                  <v-card-title class="title font-weight-light grey white--text">{{ $t('Folowing metadata were retrieved') }}</v-card-title>
                  <v-card-text>
                    <v-container>
                      <v-row v-if="doiImportData.title">
                        <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Title') }}</v-col>
                        <v-col md="10" cols="12">{{ doiImportData.title }}</v-col>
                      </v-row>
                      <v-row v-if="doiImportData.dateIssued">
                        <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Date issued') }}</v-col>
                        <v-col md="10" cols="12">{{ doiImportData.dateIssued }}</v-col>
                      </v-row>
                      <v-row v-for="(author, i) of doiImportData.authors" :key="'aut'+i">
                        <v-col v-if="i === 0" md="2" cols="12" class="primary--text text-right">{{ $t('Authors') }}</v-col>
                        <v-col v-else md="2" cols="12"></v-col>
                        <v-col md="10" cols="12">{{ author.firstname + ' ' + author.lastname }}</v-col>
                      </v-row>
                      <v-row v-if="doiImportData.publicationType">
                        <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Type of publication') }}</v-col>
                        <v-col md="10" cols="12">{{ doiImportData.publicationType }}</v-col>
                      </v-row>
                      <v-row v-if="doiImportData.publisher">
                        <v-col md="2" cols="12" class="primary--text text-right">{{ $t('PUBLISHER_VERLAG') }}</v-col>
                        <v-col md="10" cols="12">{{ doiImportData.publisher }}</v-col>
                      </v-row>
                      <v-row v-if="doiImportData.journalTitle">
                        <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Appeared in') }}</v-col>
                        <v-col md="10" cols="12">{{ doiImportData.journalTitle }}</v-col>
                      </v-row>
                      <v-row v-if="doiImportData.journalISSN">
                        <v-col md="2" cols="12" class="primary--text text-right">{{ $t('ISSN') }}</v-col>
                        <v-col md="10" cols="12">{{ doiImportData.journalISSN }}</v-col>
                      </v-row>
                      <v-row v-if="doiImportData.journalVolume">
                        <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Volume') }}</v-col>
                        <v-col md="10" cols="12">{{ doiImportData.journalVolume }}</v-col>
                      </v-row>
                      <v-row v-if="doiImportData.journalIssue">
                        <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Issue') }}</v-col>
                        <v-col md="10" cols="12">{{ doiImportData.journalIssue }}</v-col>
                      </v-row>
                      <v-row v-if="doiImportData.pageStart">
                        <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Start page') }}</v-col>
                        <v-col md="10" cols="12">{{ doiImportData.pageStart }}</v-col>
                      </v-row>
                      <v-row v-if="doiImportData.pageEnd">
                        <v-col md="2" cols="12" class="primary--text text-right">{{ $t('End page') }}</v-col>
                        <v-col md="10" cols="12">{{ doiImportData.pageEnd }}</v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-slide-y-transition>
          <v-divider class="mt-5 mb-7"></v-divider>
          <v-row no-gutters justify="space-between">
            <v-btn dark color="grey" @click="step = 2; $vuetify.goTo(1)">{{ $t('Back') }}</v-btn>
            <v-btn color="primary" @click="step = (submitformparam === 'journal-article' ?  4 : 5);  $vuetify.goTo(1)">
              <template v-if="doiImportData">{{ $t('Continue') }}</template>
              <template v-else>{{ $t('Skip') }}</template>
            </v-btn>
          </v-row>
        </v-container>
      </v-stepper-content>

      <v-stepper-content v-if="(submitformparam === 'journal-article')" step="4">
        <v-container>
          <v-row no-gutters>
            <h3 class="title font-weight-light primary--text mb-4">{{ $t('SHERPA/RoMEO') }}</h3>
          </v-row>
          <v-row no-gutters>
            <p>{{ $t('SHERPA RoMEO is an online resource that aggregates and analyses publisher open access policies from around the world and provides summaries of self-archiving permissions and conditions of rights given to authors on a journal-by-journal basis.') }}</p>
          </v-row>
          <v-row no-gutters justify="center">
            <v-col cols="12" md="8">
              <v-combobox
                v-model="rightsCheckModel"
                :items="rightsCheckItems"
                :loading="rightsCheckLoading"
                :search-input.sync="rightsCheckSearch"
                :error-messages="rightsCheckErrors"
                hide-no-data
                hide-selected
                item-text="title"
                item-value="issn"
                solo
                :placeholder="$t('please enter exact journal title or ISSN')"
                filled
                clearable
              >
                <template slot="item" slot-scope="{ item }">
                  <v-list-item-content>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ $t('ISSN') + ': ' + item.issn }}</v-list-item-subtitle>
                    <v-list-item-subtitle v-if="item.romeopub">{{ $t('PUBLISHER_VERLAG') + ': ' + item.romeopub }}</v-list-item-subtitle>
                  </v-list-item-content>
                </template>
                <template slot="selection" slot-scope="{ item }">
                  <v-list-item-content>
                    <v-list-item-title v-if="item.title">{{ item.title }}</v-list-item-title>
                    <v-list-item-title v-else>{{ item.issn }}</v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-combobox>
            </v-col>
          </v-row>
          <v-row no-gutters v-if="rightsCheckData" justify="center">
            <v-col cols="12" md="8">
              <v-row v-if="rightsCheckData.journal">
                <v-col md="3" cols="12" class="primary--text text-right">{{ $t('JOURNAL_ERSCHIENENIN') }}</v-col>
                <v-col md="9" cols="12">{{ rightsCheckData.journal.title }}</v-col>
              </v-row>
              <v-row v-else>
                <v-col offset-md="3" md="9">{{ $t('Journal data not available') }}</v-col>
              </v-row>
              <template v-if="rightsCheckData.publisher">
                <v-row v-if="rightsCheckData.publisher">
                  <v-col md="3" cols="12" class="primary--text text-right">{{ $t('PUBLISHER_VERLAG') }}</v-col>
                  <v-col md="9" cols="12">
                    <template v-if="rightsCheckData.publisher.homeurl">
                      <a target="_blank" :href="rightsCheckData.publisher.homeurl">{{ rightsCheckData.publisher.name }}</a>
                    </template>
                    <template v-else>{{ rightsCheckData.publisher.name }}</template>
                  </v-col>
                </v-row>
                <v-row v-if="rightsCheckData.publisher.prearchiving">
                  <v-col md="3" cols="12" class="primary--text text-right">{{ $t('AUTHOR_PREPRINT') }}</v-col>
                  <v-col md="9" cols="12">
                    <v-icon v-if="rightsCheckData.publisher.prearchiving === 'can'" left color="green">mdi-check</v-icon>
                    <v-icon v-if="rightsCheckData.publisher.prearchiving === 'cannot'" left color="red">mdi-cancel</v-icon>
                    <v-icon v-if="rightsCheckData.publisher.prearchiving === 'restricted'" left color="red">mdi-exclamation</v-icon>
                    {{ rightsCheckData.publisher.prearchiving }}
                  </v-col>
                </v-row>
                <v-row v-if="rightsCheckData.publisher.prerestrictions && (rightsCheckData.publisher.prerestrictions.length > 0)">
                  <v-col md="3" cols="12" class="primary--text text-right">{{ $t('Restrictions') }}</v-col>
                  <v-col md="9" cols="12">
                    <ul>
                      <li v-for="(r, i) in rightsCheckData.publisher.prerestrictions" :key="i">
                        {{ r }}
                      </li>
                    </ul>
                  </v-col>
                </v-row>
                <v-row v-if="rightsCheckData.publisher.postarchiving">
                  <v-col md="3" cols="12" class="primary--text text-right">{{ $t('AUTHOR_POSTPRINT') }}</v-col>
                  <v-col md="9" cols="12">
                    <v-icon v-if="rightsCheckData.publisher.postarchiving === 'can'" left color="green">mdi-check</v-icon>
                    <v-icon v-if="rightsCheckData.publisher.postarchiving === 'cannot'" left color="red">mdi-cancel</v-icon>
                    <v-icon v-if="rightsCheckData.publisher.postarchiving === 'restricted'" left color="red">mdi-exclamation</v-icon>
                    {{ rightsCheckData.publisher.postarchiving }}
                  </v-col>
                </v-row>
                <v-row v-if="rightsCheckData.publisher.postrestrictions && (rightsCheckData.publisher.postrestrictions.length > 0)">
                  <v-col md="3" cols="12" class="primary--text text-right">{{ $t('Restrictions') }}</v-col>
                  <v-col md="9" cols="12">
                    <ul>
                      <li v-for="(r, i) in rightsCheckData.publisher.postrestrictions" :key="i">
                        {{ r }}
                      </li>
                    </ul>
                  </v-col>
                </v-row>
                <v-row v-if="rightsCheckData.publisher.pdfarchiving">
                  <v-col md="3" cols="12" class="primary--text text-right">{{ $t('PUBLISHER_PDF') }}</v-col>
                  <v-col md="9" cols="12">
                    <v-icon v-if="rightsCheckData.publisher.pdfarchiving === 'can'" left color="green">mdi-check</v-icon>
                    <v-icon v-if="rightsCheckData.publisher.pdfarchiving === 'cannot'" left color="red">mdi-cancel</v-icon>
                    <v-icon v-if="rightsCheckData.publisher.pdfarchiving === 'restricted'" left color="red">mdi-exclamation</v-icon>
                    {{ rightsCheckData.publisher.pdfarchiving }}
                  </v-col>
                </v-row>
                <v-row v-if="rightsCheckData.publisher.pdfrestrictions && (rightsCheckData.publisher.pdfrestrictions.length > 0)">
                  <v-col md="3" cols="12" class="primary--text text-right">{{ $t('Restrictions') }}</v-col>
                  <v-col md="9" cols="12">
                    <ul>
                      <li v-for="(r, i) in rightsCheckData.publisher.pdfrestrictions" :key="i">
                        {{ r }}
                      </li>
                    </ul>
                  </v-col>
                </v-row>
                <v-row v-if="rightsCheckData.publisher.conditions">
                  <v-col md="3" cols="12" class="primary--text text-right">{{ $t('Further conditions') }}</v-col>
                  <v-col md="9" cols="12">
                    <ul>
                      <li v-for="(r, i) in rightsCheckData.publisher.conditions" :key="i">
                        {{ r }}
                      </li>
                    </ul>
                  </v-col>
                </v-row>
                <v-row v-if="rightsCheckData.disclaimer">
                  <v-col md="3" cols="12" class="primary--text text-right">{{ $t('Disclaimer') }}</v-col>
                  <v-col md="9" cols="12">{{rightsCheckData.disclaimer}}</v-col>
                </v-row>
              </template>
              <v-row v-else>
                <v-col offset-md="3" md="9">{{ $t('Publisher data not available') }}</v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-divider class="mt-5 mb-7"></v-divider>
          <v-row no-gutters justify="space-between">
            <v-btn dark color="grey" @click="step = 3; $vuetify.goTo(1)">{{ $t('Back') }}</v-btn>
            <v-btn color="primary" @click="step = 5; $vuetify.goTo(1)">{{ $t('Continue') }}</v-btn>
          </v-row>
        </v-container>
      </v-stepper-content>

      <v-stepper-content v-for="(s) in form.sections" :key="'tabitem'+s.id" :step="s.id">
        <v-container>
          <v-alert outlined type="error" transition="slide-y-transition" v-if="validationErrors.length > 0">
            <span v-for="(error, i) of validationErrors" :key="'verr'+i">{{ error }}</span>
          </v-alert>
          <v-row>
            <v-col cols="11" offset="1">
              <template v-for="(f) in s.fields">
                <v-row no-gutters :key="f.id">

                  <template v-if="f.component === 'p-text-field'">
                    <p-i-text-field
                      v-bind.sync="f"
                      v-on:input="f.value=$event"
                      v-on:input-language="setSelected(f, 'language', $event)"
                      v-on:add="addField(s.fields, f)"
                      v-on:remove="removeField(s.fields, f)"
                      class="my-2"
                    ></p-i-text-field>
                  </template>

                  <template v-else-if="f.component === 'p-keyword'">
                    <p-i-keyword
                      v-bind.sync="f"
                      v-on:input="f.value=$event"
                      v-on:input-language="setSelected(f, 'language', $event)"
                      v-on:add="addField(s.fields, f)"
                      v-on:remove="removeField(s.fields, f)"
                      class="my-2"
                    ></p-i-keyword>
                  </template>

                  <template v-if="f.component === 'p-title'">
                    <p-i-title
                      v-bind.sync="f"
                      v-on:input-title="f.title=$event"
                      v-on:input-subtitle="f.subtitle=$event"
                      v-on:input-language="setSelected(f, 'language', $event)"
                      v-on:add="addField(s.fields, f)"
                      v-on:remove="removeField(s.fields, f)"
                      v-on:up="sortFieldUp(s.fields, f)"
                      v-on:down="sortFieldDown(s.fields, f)"
                      class="my-2"
                    ></p-i-title>
                  </template>

                  <template v-else-if="f.component === 'p-select'">
                    <p-i-select
                      v-show="f.predicate !== 'dcterms:type' && !((f.predicate === 'edm:hasType') && ((submitformparam === 'book-part') || (submitformparam === 'book')))"
                      v-bind.sync="f"
                      v-on:input="selectInput(s.fields, f, $event)"
                      v-on:add="addField(s.fields, f)"
                      v-on:remove="removeField(s.fields, f)"
                      class="my-2"
                    ></p-i-select>
                  </template>

                  <template v-else-if="f.component === 'p-date-edtf'">
                    <p-i-date-edtf
                      v-show="f.type === 'dcterms:available' ? showEmbargoDate : true"
                      v-bind.sync="f"
                      v-on:input-date="f.value=$event"
                      v-on:input-date-type="setSelected(f, 'type', $event)"
                      v-on:add="addField(s.fields, f)"
                      v-on:remove="removeField(s.fields, f)"
                      class="my-2"
                    ></p-i-date-edtf>
                  </template>

                  <template v-else-if="f.component === 'p-series'">
                    <v-col cols="10">
                      <p-i-series
                        v-bind.sync="f"
                        v-on:input-select-journal="selectJournal(s.fields, f, $event)"
                        v-on:input-title="f.title=$event"
                        v-on:input-title-language="setSelected(f, 'titleLanguage', $event)"
                        v-on:input-volume="f.volume=$event"
                        v-on:input-issue="f.issue=$event"
                        v-on:input-issued="f.issued=$event"
                        v-on:input-issn="f.issn=$event"
                        v-on:input-identifier="f.identifier=$event"
                        v-on:add="addField(s.fields, f)"
                        v-on:remove="removeField(s.fields, f)"
                        class="my-2"
                      ></p-i-series>
                    </v-col>
                  </template>

                  <template v-else-if="f.component === 'p-citation'">
                    <v-col cols="10">
                      <p-i-citation
                        v-bind.sync="f"
                        v-on:input-citation-type="setSelected(f, 'type', $event)"
                        v-on:input-citation="f.citation=$event"
                        v-on:input-citation-language="setSelected(f, 'citationLanguage', $event)"
                        v-on:input-identifier="f.identifier=$event"
                        v-on:add="addField(s.fields, f)"
                        v-on:remove="removeField(s.fields, f)"
                        class="my-2"
                      ></p-i-citation>
                    </v-col>
                  </template>

                  <template v-else-if="f.component === 'p-bf-publication'">
                    <v-col cols="10">
                      <p-i-bf-publication
                        v-bind.sync="f"
                        v-on:input-suggest-publisher="publisherSuggestInput(f, $event)"
                        v-on:input-publisher-name="f.publisherName=$event"
                        v-on:change-type="f.publisherType = $event"
                        v-on:input-publisher-select="publisherSelectInput(f, $event)"
                        v-on:input-publishing-place="f.publishingPlace=$event"
                        v-on:input-publishing-date="f.publishingDate=$event"
                        v-on:add="addField(s.fields, f)"
                        v-on:remove="removeField(s.fields, f)"
                        class="my-2"
                      ></p-i-bf-publication>
                    </v-col>
                  </template>

                  <template v-else-if="f.component === 'p-contained-in'">
                    <v-col cols="10">
                      <p-i-contained-in
                        v-bind.sync="f"
                        v-on:input-title="f.title=$event"
                        v-on:input-subtitle="f.subtitle=$event"
                        v-on:input-title-language="setSelected(f, 'titleLanguage', $event)"
                        v-on:input-role="containedInRoleInput(f, $event)"
                        v-on:input-series-title="f.seriesTitle=$event"
                        v-on:input-series-title-language="setSelected(f, 'seriesTitleLanguage', $event)"
                        v-on:input-series-volume="f.seriesVolume=$event"
                        v-on:input-series-issue="f.seriesIssue=$event"
                        v-on:input-series-issued="f.seriesIssued=$event"
                        v-on:input-series-issn="f.seriesIssn=$event"
                        v-on:input-series-identifier="f.seriesIdentifier=$event"
                        v-on:add-role="addContainedInRole(f.roles, $event)"
                        v-on:remove-role="removeContainedInRole(f.roles, $event)"
                        v-on:up-role="sortContainedInRoleUp(f.roles, $event)"
                        v-on:down-role="sortContainedInRoleDown(f.roles, $event)"
                      ></p-i-contained-in>
                    </v-col>
                  </template>

                  <template v-else-if="f.component === 'p-entity-extended'">
                    <v-col cols="10" v-show="f.role !== 'role:uploader'">
                      <p-i-entity-extended
                        v-bind.sync="f"
                        v-on:change-type="f.type = $event"
                        v-on:input-firstname="f.firstname = $event"
                        v-on:input-lastname="f.lastname = $event"
                        v-on:input-name="f.name = $event"
                        v-on:input-identifier="f.identifierText = $event"
                        v-on:change-affiliation-type="f.affiliationType = $event"
                        v-on:input-affiliation-select="affiliationSelectInput(f, $event)"
                        v-on:input-affiliation-other="f.affiliationText = $event"
                        v-on:change-organization-type="f.organizationType = $event"
                        v-on:input-organization-select="organizationSelectInput(f, $event)"
                        v-on:input-organization-other="f.organizationText = $event"
                        v-on:input-role="roleInput(f, $event)"
                        v-on:add-clear="addEntityClear(s.fields, f)"
                        v-on:add="addField(s.fields, f)"
                        v-on:remove="removeField(s.fields, f)"
                        v-on:up="sortFieldUp(s.fields, f)"
                        v-on:down="sortFieldDown(s.fields, f)"
                        class="my-2"
                      ></p-i-entity-extended>
                    </v-col>
                  </template>

                  <template v-else-if="f.component === 'p-subject-gnd'">
                    <p-i-subject-gnd
                      v-bind.sync="f"
                      v-on:input="f.value=$event"
                      v-on:resolve="updateSubject(f, $event)"
                      v-on:add="addField(s.fields, f)"
                      v-on:remove="removeField(s.fields, f)"
                      class="my-2"
                    ></p-i-subject-gnd>
                  </template>

                  <template v-else-if="f.component === 'p-vocab-ext-readonly'">
                    <p-i-vocab-ext-readonly
                      v-bind.sync="f"
                      v-on:remove="removeField(s.fields, f)"
                    ></p-i-vocab-ext-readonly>
                  </template>

                  <template v-else-if="f.component === 'p-literal'">
                    <p-i-literal
                      v-bind.sync="f"
                      v-on:input-value="f.value=$event"
                      v-on:add="addField(s.fields, f)"
                      v-on:remove="removeField(s.fields, f)"
                      class="my-2"
                    ></p-i-literal>
                  </template>

                  <template v-else-if="f.component === 'p-alternate-identifier'">
                    <p-i-alternate-identifier
                      v-bind.sync="f"
                      v-on:input-identifier="f.value=$event"
                      v-on:input-identifier-type="setSelected(f, 'type', $event)"
                      v-on:add="addField(s.fields, f)"
                      v-on:add-clear="addIdentifierClear(s.fields, f)"
                      v-on:remove="removeField(s.fields, f)"
                      class="my-2"
                    ></p-i-alternate-identifier>
                  </template>

                  <template v-else-if="f.component === 'p-project'">
                    <submit-ir-funding-field
                      v-bind.sync="f"
                      v-on:select-funder="setFunder(f, $event)"
                      v-on:input-funder-name="f.funderName=$event"
                      v-on:input-identifier="f.identifier=$event"
                      v-on:add="addField(s.fields, f)"
                      v-on:remove="removeField(s.fields, f)"
                      class="my-2"
                    ></submit-ir-funding-field>
                  </template>

                  <template v-else-if="f.component === 'p-file'">
                    <v-col cols="12">
                      <v-row no-gutters>
                        <p-i-file
                          v-bind.sync="f"
                          v-on:input-file="setFilename(f, $event)"
                          v-on:input-mimetype="setSelected(f, 'mimetype', $event)"
                          v-on:add="addField(s.fields, f)"
                          v-on:remove="removeField(s.fields, f)"
                          class="my-2"
                        ></p-i-file>
                      </v-row>
                    </v-col>
                  </template>

                </v-row>

              </template>
              <v-row>
                 <v-col cols="12" md="10">
                  <submit-ir-license-info v-if="s.id === 5" :license="license"></submit-ir-license-info>
                 </v-col>
              </v-row>
              <v-row no-gutters v-if="showSubmitWarning">
                <v-col cols="12" md="10">
                  <v-alert type="error" outlined>
                    <span class="mr-2">{{ $t('SUBMIT_ATTENTION', { journal: rightsCheckData.journal.title }) }}</span>
                    <a :href="'mailto:' + config.officecontact.email">{{ config.officecontact.email }}</a>.
                  </v-alert>
                </v-col>
              </v-row>
              <v-divider class="mt-5 mb-7"></v-divider>
              <v-row no-gutters justify="space-between">
                <v-btn dark color="grey" @click="step = (s.id - (submitformparam === 'journal-article' ?  1 : 2)); $vuetify.goTo(1)">{{ $t('Back') }}</v-btn>
                <v-btn color="primary" @click="continueForm(s.id)">{{ $t('Continue') }}</v-btn>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-stepper-content>

      <v-stepper-content step="7">
        <v-container>
          <v-row>
            <v-col md="10" offset-md="1">
              <p-d-jsonld :jsonld="jsonld"></p-d-jsonld>
            </v-col>
          </v-row>
          <v-row v-if="altVersionPid">
            <v-col md="10" offset-md="1">
              <v-alert outlined type="info" color="primary">
                <p>
                  {{ $t('This object will be marked as alternative version of object') }}
                  <a class="mx-4" target="_blank" :href="'https://' + config.phaidrabaseurl + '/' + altVersionPid">{{ 'https://' + config.phaidrabaseurl + '/' + altVersionPid }}</a>
                  <v-btn @click="altVersionPid = null" color="grey" dark>{{ $t('Remove this relationship') }}</v-btn>
                </p>
              </v-alert>
            </v-col>
          </v-row>
          <!--
          <v-row>
            <code>{{ jsonld }}</code>
          </v-row>
          -->
          <v-divider class="mt-5 mb-7"></v-divider>
          <v-row no-gutters>
            <v-btn dark color="grey" :disabled="loading" @click="step = 6; $vuetify.goTo(1)">{{ $t('Back') }}</v-btn>
            <v-spacer></v-spacer>
            <v-dialog v-model="discardDialog" max-width="500px">
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" class="mr-3" :disabled="loading" dark color="error">{{ $t('Discard submission') }}</v-btn>
              </template>
              <v-card>
                <v-card-title class="title font-weight-light grey white--text">
                  {{ $t('Discard submission') }}
                </v-card-title>
                <v-card-text>
                  <p class="mt-6 title font-weight-light grey--text text--darken-3">{{ $t('Discard submission process?') }}</p>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn dark @click="discardDialog = false" color="grey">{{ $t('Cancel') }}</v-btn>
                  <v-btn :to="'/'" @click="discardDialog = false" color="primary">{{ $t('Discard') }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="loginDialog" max-width="500px">
              <v-card>
                <v-card-title class="title font-weight-light grey white--text">
                  {{ $t('Please log in') }}
                </v-card-title>
                <v-card-text>
                  <p class="mt-6 title font-weight-light grey--text text--darken-3">{{ $t('You have been logged out. Please log in to continue submit.') }}</p>
                  <v-col cols="10" offset="1">
                    <v-text-field
                      :disabled="loading"
                      :label="$t('Username')"
                      v-model="credentials.username"
                      required
                      filled
                      single-line
                      :autocomplete="'username'"
                    ></v-text-field>
                    <v-text-field
                      :disabled="loading"
                      :label="$t('Password')"
                      v-model="credentials.password"
                      required
                      filled
                      single-line
                      :append-icon="loginPassVisible ? 'mdi-eye' : 'mdi-eye-off'"
                      @click:append="loginPassVisible = !loginPassVisible"
                      :type="loginPassVisible ? 'password' : 'text'"
                      :autocomplete="'current-password'"
                    ></v-text-field>
                  </v-col>
                </v-card-text>
                <v-divider class="mt-5"></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn dark @click="loginDialog = false" color="grey">{{ $t('Cancel') }}</v-btn>
                  <v-btn @click="login()" :disabled="loading" :loading="loading" color="primary" raised>{{ $t('Login') }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-btn raised color="primary" :loading="loading" :disabled="loading" @click="submit()">{{ $t('Submit') }}</v-btn>
          </v-row>
        </v-container>
      </v-stepper-content>

      <v-stepper-content step="8">
        <v-container v-if="submitResponse">
          <v-row no-gutters>
            <h3 class="title font-weight-light primary--text mb-4">{{ $t('Thank you for your submission.') }}</h3>
          </v-row>
          <v-row no-gutters>
            <p>{{ $t('The submission process was successful. Your data will be checked as quickly as possible.') }}</p>
          </v-row>
          <v-row no-gutters>
            <p>{{ $t('During the verification process your object has a temporary status, where it can only be accessed according to copyright laws ("all rights reserved"). Furthermore, it cannot yet be found through academic search engines such as BASE.') }}</p>
          </v-row>
          <v-row no-gutters>
            <p>{{ $t('The persistent URL of your object is') }} <a target="_blank" :href="'https://' + config.phaidrabaseurl + '/' + submitResponse.pid">{{ 'https://' + config.phaidrabaseurl + '/' + submitResponse.pid }}</a>.</p>
          </v-row>
          <v-row no-gutters v-if="submitResponse.alternatives && (submitResponse.alternatives.length > 0)">
            <p>{{ $t('The persistent URLs of alternative versions are') }}:</p>
            <p v-for="(a, i) of submitResponse.alternatives" :key="'alt'+i"><a target="_blank" :href="'https://' + config.phaidrabaseurl + '/' + a">{{ 'https://' + config.phaidrabaseurl + '/' + a }}</a>.</p>
          </v-row>
          <template v-if="this.showEmbargoDate">
            <v-row no-gutters>
              <p>{{ $t('Your publication will be available as soon as the embargo period has expired.') }}</p>
            </v-row>
            <v-row no-gutters>
              <p>{{ $t('Please contact me via email') }}</p>
            </v-row>
            <v-row no-gutters>
              <v-checkbox v-model="notificationCheckbox" hide-details color="primary" class="mt-0">
                <template v-slot:label>
                  <span class="black--text">{{ $t('as soon as my submission has been successfully verified') + ',' }}</span>
                </template>
              </v-checkbox>
            </v-row>
            <v-row no-gutters>
              <v-checkbox v-model="embargoNotificationCheckbox" hide-details color="primary">
                <template v-slot:label>
                  <span class="black--text">{{ $t('as soon as the embargo period has expired') + '.' }}</span>
                </template>
              </v-checkbox>
            </v-row>
          </template>
          <v-row no-gutters v-else>
            <v-checkbox v-model="notificationCheckbox" hide-details color="primary" class="mt-0">
              <template v-slot:label>
                <span class="black--text">{{ $t('Please notify me by e-mail as soon as my object is fully accessible.') }}</span>
              </template>
            </v-checkbox>
          </v-row>
          <v-divider class="mt-5 mb-7"></v-divider>
          <v-row no-gutters>
            <v-spacer></v-spacer>
            <v-btn color="primary" :loading="loading" :disabled="loading" @click="confirm()">{{ $t('Confirm') }}</v-btn>
          </v-row>
        </v-container>
      </v-stepper-content>

    </v-stepper-items>

  </v-stepper>

</template>

<script>
import SubmitIrLicenseInfo from '@/components/SubmitIrLicenseInfo'
import SubmitIrFundingField from '@/components/SubmitIrFundingField'
import xmlUtils from 'phaidra-vue-components/src/utils/xml'
import arrays from 'phaidra-vue-components/src/utils/arrays'
import jsonLd from 'phaidra-vue-components/src/utils/json-ld'
import fields from 'phaidra-vue-components/src/utils/fields'
import { context } from '@/mixins/context'
import { config } from '@/mixins/config'
import { validationrules } from 'phaidra-vue-components/src/mixins/validationrules'
import qs from 'qs'
import axios from 'axios'
var iconv = require('iconv-lite')

export default {
  name: 'submit-ir',
  mixins: [ context, config, validationrules ],
  components: {
    SubmitIrLicenseInfo,
    SubmitIrFundingField
  },
  computed: {
    doiToImport: function () {
      if (this.doiImportInput) {
        let doi = this.doiImportInput.replace('https://', '')
        doi = doi.replace('http://', '')
        doi = doi.replace('dx.doi.org/', '')
        doi = doi.replace('doi.org/', '')
        doi = doi.replace('doi:', '')
        return doi
      } else {
        return null
      }
    },
    jsonld: function () {
      return this.getJsonld()
    },
    submitformparam: function () {
      return this.$route.params.submitform
    },
    irObjectTypeVocabulary: function () {
      switch (this.submitformparam) {
        case 'journal-article':
          return 'irobjecttypearticle'
        default:
          return 'irobjecttype'
      }
    },
    showSubmitWarning: function () {
      for (let s of this.form.sections) {
        for (let f of s.fields) {
          if (f.predicate === 'oaire:version') {
            if (f.value === 'https://pid.phaidra.org/vocabulary/PMR8-3C8D') {
              if (this.rightsCheckData.publisher.pdfarchiving === 'cannot') {
                return true
              }
            }
          }
        }
      }
      return false
    }
  },
  data () {
    return {
      form: {
        sections: []
      },
      step: 1,
      loadedMetadata: [],
      loading: false,
      discardDialog: false,
      touCheckbox: false,
      touCheckboxErrors: [],
      doiImportInput: null,
      doiImportData: null,
      doiImportErrors: [],
      license: null,
      showEmbargoDate: false,
      embargoDateMenu: false,
      embargoDateModel: null,
      rightsCheckModel: null,
      rightsCheckItems: [],
      rightsCheckErrors: [],
      rightsCheckData: null,
      rightsCheckLoading: false,
      rightsCheckSearch: '',
      rightsCheckDebounce: 500,
      rightsCheckMinLetters: 3,
      rightsCheckDebounceTask: null,
      doiDuplicate: null,
      validationStatus: '',
      validationErrors: [],
      submitResponse: null,
      altVersionPid: null,
      notificationCheckbox: false,
      embargoNotificationCheckbox: false,
      loginDialog: false,
      loginPassVisible: true,
      credentials: {
        username: '',
        password: ''
      },
      submitformLoading: false,
      checkAllowSubmitRes: {
        allowsubmit: null,
        candobulkupload: null,
        nrdays: null,
        nruploads: null
      }
    }
  },
  watch: {
    rightsCheckSearch (val) {
      val && this.queryRightsCheckDebounce(val)
    },
    rightsCheckModel (val) {
      val && val.issn && this.queryRightsCheckJournal(val.issn)
    }
  },
  methods: {
    async checkAllowSubmit () {
      this.submitformLoading = true
      try {
        let response = await axios.get(this.config.api + '/ir/allowsubmit',
          {
            headers: {
              'X-XSRF-TOKEN': this.user.token
            }
          }
        )
        if (response.data.alerts && response.data.alerts.length > 0) {
          this.$store.commit('setAlerts', response.data.alerts)
        }
        if (response.data.allowsubmit) {
          this.checkAllowSubmitRes.allowsubmit = response.data.allowsubmit
        }
        if (response.data.candobulkupload) {
          this.checkAllowSubmitRes.candobulkupload = response.data.candobulkupload
        }
        if (response.data.nrdays) {
          this.checkAllowSubmitRes.nrdays = response.data.nrdays
        }
        if (response.data.nrdays) {
          this.checkAllowSubmitRes.nrdays = response.data.nrdays
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.submitformLoading = false
      }
    },
    async login () {
      this.loading = true
      try {
        await this.$store.dispatch('login', this.credentials)
        if (this.signedin) {
          this.loginDialog = false
          this.credentials.username = ''
          this.credentials.password = ''
          this.submit()
        }
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    },
    queryRightsCheckDebounce (value) {
      this.showList = true
      if (this.rightsCheckDebounce) {
        if (this.rightsCheckDebounceTask !== undefined) clearTimeout(this.rightsCheckDebounceTask)
        this.rightsCheckDebounceTask = setTimeout(() => {
          return this.suggestJournals(value)
        }, this.rightsCheckDebounce)
      } else {
        return this.suggestJournals(value)
      }
    },
    async suggestJournals (q) {
      if (q.length < this.rightsCheckMinLetters || !this.config.apis.sherparomeo) return

      this.rightsCheckLoading = true
      this.rightsCheckItems = []
      this.rightsCheckErrors = []

      var params = {
        ak: this.config.apis.sherparomeo.key,
        versions: 'all',
        qtype: 'contains',
        jtitle: q
      }

      var query = qs.stringify(params)

      try {
        let response = await axios.request({
          method: 'GET',
          url: this.config.apis.sherparomeo.url + '?' + query,
          responseType: 'arraybuffer'
        })
        let utfxml = iconv.decode(Buffer.from(response.data), 'ISO-8859-1')
        let dp = new window.DOMParser()
        let obj = xmlUtils.xmlToJson(dp.parseFromString(utfxml, 'text/xml'))
        if (!obj.romeoapi[1].journals.journal) {
          this.rightsCheckErrors.push(this.$t('No journals found'))
          return
        }
        if (Array.isArray(obj.romeoapi[1].journals.journal)) {
          for (let j of obj.romeoapi[1].journals.journal) {
            this.rightsCheckItems.push(
              {
                title: j.jtitle['#text'],
                issn: j.issn['#text'],
                romeopub: j.romeopub['#text']
              }
            )
          }
        } else {
          this.queryRightsCheckJournal(obj.romeoapi[1].journals.journal.issn['#text'])
        }
      } catch (error) {
        console.error(error)
        this.rightsCheckErrors.push(error)
      } finally {
        this.rightsCheckLoading = false
      }
    },
    stripTags (text) {
      return text.replace(/<\/?[^>]+(>|$)/g, '')
    },
    async queryRightsCheckJournal (issn) {
      if (!issn || !this.config.apis.sherparomeo) return

      this.rightsCheckLoading = true

      var params = {
        ak: this.config.apis.sherparomeo.key,
        versions: 'all',
        issn: issn
      }

      var query = qs.stringify(params)

      try {
        let response = await axios.request({
          method: 'GET',
          url: this.config.apis.sherparomeo.url + '?' + query,
          responseType: 'arraybuffer'
        })
        let utfxml = iconv.decode(Buffer.from(response.data), 'ISO-8859-1')
        let dp = new window.DOMParser()
        let obj = xmlUtils.xmlToJson(dp.parseFromString(utfxml, 'text/xml'))
        let disclaimer = obj.romeoapi[1].header.disclaimer['#text']
        let j = obj.romeoapi[1].journals.journal
        let journal = null
        if (j) {
          journal = {
            title: j.jtitle['#text'],
            issn: j.issn['#text'],
            romeopub: j.romeopub['#text']
          }
        }
        let p = obj.romeoapi[1].publishers.publisher
        let publisher = null
        if (p) {
          publisher = {
            name: p.name['#text'],
            homeurl: p.homeurl['#text'],
            color: p.romeocolour['#text']
          }
          publisher['prearchiving'] = p.preprints.prearchiving['#text']
          publisher['prerestrictions'] = []
          if (p.preprints.prerestrictions.prerestriction) {
            for (let prerestriction of p.preprints.prerestrictions.prerestriction) {
              publisher['prerestrictions'].push(this.stripTags(prerestriction['#text']))
            }
          }
          publisher['postarchiving'] = p.postprints.postarchiving['#text']
          publisher['postrestrictions'] = []
          if (p.postprints.postrestrictions.postrestriction) {
            for (let postrestriction of p.postprints.postrestrictions.postrestriction) {
              publisher['postrestrictions'].push(this.stripTags(postrestriction['#text']))
            }
          }
          publisher['pdfarchiving'] = p.pdfversion.pdfarchiving['#text']
          publisher['pdfrestrictions'] = []
          if (p.pdfversion.pdfrestrictions.pdfrestriction) {
            for (let pdfrestriction of p.pdfversion.pdfrestrictions.pdfrestriction) {
              publisher['pdfrestrictions'].push(this.stripTags(pdfrestriction['#text']))
            }
          }
          publisher['conditions'] = []
          if (p.conditions.condition) {
            for (let condition of p.conditions.condition) {
              publisher['conditions'].push(this.stripTags(condition['#text']))
            }
          }
        }
        this.rightsCheckData = {
          disclaimer: disclaimer,
          journal: journal,
          publisher: publisher
        }
      } catch (error) {
        console.error(error)
        this.rightsCheckErrors.push(error)
      } finally {
        this.rightsCheckLoading = false
      }
    },
    importDOI: async function () {
      this.loading = true
      this.doiImportErrors = []
      this.doiDuplicate = null
      this.doiImportData = null
      if (this.doiImportInput) {
        try {
          let params = {
            wt: 'json',
            q: 'dc_identifier:"' + this.doiToImport + '"'
          }

          let query = qs.stringify(params)

          let solrResponse = await fetch(this.config.solr + '/select?' + query, {
            method: 'GET',
            mode: 'cors'
          })
          let solrJson = await solrResponse.json()
          if (solrJson.response.numFound > 0) {
            this.doiDuplicate = {
              pid: solrJson.response.docs[0].pid,
              title: solrJson.response.docs[0].dc_title[0]
            }
          } else {
            let response = await fetch('https://' + this.config.apis.doi.baseurl + '/' + this.doiToImport, {
              method: 'GET',
              mode: 'cors',
              headers: {
                'Accept': this.config.apis.doi.accept
              }
            })
            let crossrefData = await response.json()

            this.doiImportData = {
              doi: this.doiToImport,
              title: '',
              dateIssued: '',
              authors: [],
              publicationType: '',
              publisher: '',
              journalTitle: '',
              journalISSN: '',
              journalVolume: '',
              journalIssue: '',
              pageStart: '',
              pageEnd: ''
            }

            if (crossrefData['title']) {
              if (Array.isArray(crossrefData['title'])) {
                this.doiImportData.title = crossrefData['title'][0]
              } else {
                this.doiImportData.title = crossrefData['title']
              }
            }

            if (crossrefData['issued']) {
              if (crossrefData['issued']['date-parts']) {
                this.doiImportData.dateIssued = crossrefData['issued']['date-parts'][0][0].toString()
              }
            }

            let authors = crossrefData['author']
            if (authors.length > 0) {
              for (let author of authors) {
                this.doiImportData.authors.push({ firstname: author['given'], lastname: author['family'] })
              }
            }

            // https://github.com/citation-style-language/schema/blob/master/csl-types.rnc
            // https://wiki.univie.ac.at/display/IR/Mapping+CrossRef-Erscheinungsformen
            switch (crossrefData['type']) {
              case 'article':
              case 'journal-article':
              case 'article-journal':
                this.doiImportData.publicationType = 'article'
                this.doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/VKA6-9XTY'
                break
              case 'report':
                this.doiImportData.publicationType = 'report'
                this.doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/JMAV-7F3R'
                break
              case 'book':
              case 'monograph':
              case 'reference-book':
              case 'edited-book':
                this.doiImportData.publicationType = 'book'
                this.doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/47QB-8QF1'
                break
              case 'book-chapter':
              case 'book-part':
              case 'book-section':
                this.doiImportData.publicationType = 'book_part'
                this.doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/XA52-09WA'
                break
              case 'dissertation':
                this.doiImportData.publicationType = 'doctoral_thesis'
                this.doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/1PHE-7VMS'
                break
              case 'proceedings-article':
              case 'proceedings':
                this.doiImportData.publicationType = 'conference_object'
                this.doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/QKDF-E5HA'
                break
              case 'dataset':
                this.doiImportData.publicationType = 'research_data'
                this.doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/KW6N-2VTP'
                break
              case 'other':
              case 'standard':
              case 'standard-series':
              case 'book-entry':
              case 'book-series':
              case 'book-set':
              case 'book-track':
              case 'component':
              case 'journal-issue':
              case 'journal-volume':
              case 'journal':
              case 'report-series':
                this.doiImportData.publicationType = 'other'
                this.doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/PYRE-RAWJ'
                break
              default:
                this.doiImportData.publicationType = 'other'
                this.doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/PYRE-RAWJ'
            }

            if (crossrefData['publisher']) {
              this.doiImportData.publisher = crossrefData['publisher']
            }

            if (crossrefData['container-title']) {
              this.doiImportData.journalTitle = crossrefData['container-title']
            }

            if (crossrefData['ISSN']) {
              if (Array.isArray(crossrefData['ISSN'])) {
                this.doiImportData.journalISSN = crossrefData['ISSN'][0]
              } else {
                this.doiImportData.journalISSN = crossrefData['ISSN']
              }
            }

            if (crossrefData['volume']) {
              this.doiImportData.journalVolume = crossrefData['volume']
            }

            if (crossrefData['issue']) {
              this.doiImportData.journalIssue = crossrefData['issue']
            }

            if (crossrefData['page']) {
              let page = crossrefData['page'].split('-')
              let regexnum = new RegExp('^[0-9]+$')
              let startpage = page[0]
              if (regexnum.test(startpage)) {
                this.doiImportData.pageStart = startpage
              }
              if (page.length > 1) {
                let endpage = page[1]
                if (regexnum.test(endpage)) {
                  this.doiImportData.pageEnd = endpage
                }
              }
            }
            this.resetForm(this, this.doiImportData, null)
            if (this.doiImportData.journalISSN) {
              this.rightsCheckSearch = this.doiImportData.journalISSN
            }
          }
        } catch (error) {
          this.doiImportErrors.push(error)
        } finally {
          this.loading = false
        }
      }
    },
    checkTou: function () {
      if (this.touCheckbox) {
        this.step = 3
      } else {
        this.touCheckboxErrors.push(this.$t('You have to accept the terms of use.'))
      }
    },
    getMetadata: function () {
      return { metadata: { 'json-ld': this.getJsonld() } }
    },
    getJsonld: function () {
      return jsonLd.form2json(this.form)
    },
    submit: async function () {
      if (!this.user.token) {
        this.loginDialog = true
        return
      }

      this.loading = true
      this.submitResponse = null
      var httpFormData = new FormData()
      for (let i = 0; i < this.form.sections.length; i++) {
        let s = this.form.sections[i]
        if (s.fields) {
          for (let j = 0; j < s.fields.length; j++) {
            if (s.fields[j].component === 'p-file') {
              if (s.fields[j].file !== '') {
                httpFormData.append('file', s.fields[j].file)
              }
            }
          }
        }
      }

      if (this.altVersionPid) {
        httpFormData.append('isAlternativeVersionOf', this.altVersionPid)
      }

      httpFormData.append('metadata', JSON.stringify(this.getMetadata()))

      try {
        let response = await fetch(this.$store.state.config.api + '/ir/submit', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'X-XSRF-TOKEN': this.$store.state.user.token
          },
          body: httpFormData
        })

        let json = await response.json()

        if (json.alerts && json.alerts.length > 0) {
          this.$store.commit('setAlerts', json.alerts)
        }

        if (json.status === 200) {
          this.submitResponse = json
          this.step = 8
        }
      } catch (error) {
        this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      } finally {
        this.$vuetify.goTo(0)
        this.loading = false
      }
    },
    addField: function (arr, f) {
      var newField = arrays.duplicate(arr, f)
      if (newField) {
        newField.id = (new Date()).getTime()
        newField.firstname = ''
        newField.lastname = ''
        newField.identifierText = ''
        newField.removable = true
      }
    },
    addEntityClear: function (arr, f) {
      var newField = arrays.duplicate(arr, f)
      if (newField) {
        newField.id = (new Date()).getTime()
        newField.role = ''
        newField.name = ''
        newField.firstname = ''
        newField.lastname = ''
        newField.identifierText = ''
        newField.affiliation = ''
        newField.affiliationText = ''
        newField.affiliationType = 'select'
        newField.organization = ''
        newField.organizationText = ''
        newField.organizationType = 'select'
        newField.type = 'schema:Person'
        newField.removable = true
      }
    },
    addIdentifierClear: function (arr, f) {
      var newField = arrays.duplicate(arr, f)
      if (newField) {
        newField.id = (new Date()).getTime()
        newField.value = ''
        newField.removable = true
        newField.addOnly = false
        newField.removeOnly = true
      }
    },
    removeField: function (arr, f) {
      arrays.remove(arr, f)
    },
    sortFieldUp: function (arr, f) {
      var i = arr.indexOf(f)
      if (arr[i - 1]) {
        if (arr[i - 1].ordergroup === f.ordergroup) {
          arrays.moveUp(arr, f)
        }
      }
    },
    sortFieldDown: function (arr, f) {
      var i = arr.indexOf(f)
      if (arr[i + 1]) {
        if (arr[i + 1].ordergroup === f.ordergroup) {
          arrays.moveDown(arr, f)
        }
      }
    },
    sortMemberUp: function (s) {
      var i = this.form.sections.indexOf(s)
      if (this.form.sections[i - 1]) {
        if (this.form.sections[i - 1].type === 'member') {
          arrays.moveUp(this.form.sections, s)
        }
      }
    },
    sortMemberDown: function (s) {
      var i = this.form.sections.indexOf(s)
      if (this.form.sections[i + 1]) {
        if (this.form.sections[i + 1].type === 'member') {
          arrays.moveDown(this.form.sections, s)
        }
      }
    },
    addContainedInRole: function (arr, f) {
      var newField = arrays.duplicate(arr, f)
      if (newField) {
        newField.id = (new Date()).getTime()
        newField.removable = true
      }
    },
    removeContainedInRole: function (arr, f) {
      if (arr.length > 1) {
        arrays.remove(arr, f)
      }
    },
    sortContainedInRoleUp: function (arr, f) {
      var i = arr.indexOf(f)
      if (arr[i - 1]) {
        if (arr[i - 1].ordergroup === f.ordergroup) {
          arrays.moveUp(arr, f)
        }
      }
    },
    sortContainedInRoleDown: function (arr, f) {
      var i = arr.indexOf(f)
      if (arr[i + 1]) {
        if (arr[i + 1].ordergroup === f.ordergroup) {
          arrays.moveDown(arr, f)
        }
      }
    },
    setFunder: function (f, event) {
      if (event) {
        f.funderIdentifier = event['@id']
        f.funderName = ''
        if (event['@id'] !== 'other') {
          let preflabels = event['skos:prefLabel']
          Object.entries(preflabels).forEach(([key, value]) => {
            f.funderName = value
          })
        }
        this.$forceUpdate()
      }
    },
    affiliationSelectInput: function (f, event) {
      f.affiliation = ''
      f.affiliationSelectedName = []
      if (event) {
        f.affiliation = event['@id']
        let preflabels = event['skos:prefLabel']
        Object.entries(preflabels).forEach(([key, value]) => {
          f.affiliationSelectedName.push({ '@value': value, '@language': key })
        })
      }
    },
    publisherSelectInput: function (f, event) {
      f.publisherOrgUnit = ''
      f.publisherSelectedName = []
      if (event) {
        f.publisherOrgUnit = event['@id']
        let preflabels = event['skos:prefLabel']
        Object.entries(preflabels).forEach(([key, value]) => {
          f.publisherSelectedName.push({ '@value': value, '@language': key })
        })
      }
    },
    publisherSuggestInput: function (f, event) {
      if (event) {
        f.publisherName = event['name']
      }
    },
    organizationSelectInput: function (f, event) {
      f.organization = ''
      f.organizationSelectedName = []
      if (event) {
        f.organization = event['@id']
        let preflabels = event['skos:prefLabel']
        Object.entries(preflabels).forEach(([key, value]) => {
          f.organizationSelectedName.push({ '@value': value, '@language': key })
        })
      }
    },
    selectJournal: function (fields, f, event) {
      if (event.title) {
        f.title = event.title
      }
      if (event.issn) {
        f.issn = event.issn
      }
      if (event.romeopub) {
        for (let formfield of fields) {
          if (formfield.component === 'p-bf-publication') {
            formfield.publisherType = 'other'
            formfield.publisherName = event.romeopub
          }
        }
      }
    },
    setSelected: function (f, property, event) {
      if (event) {
        f[property] = event['@id']
      }
      this.$emit('form-input-' + f.component, f)
    },
    updateSubject: function (f, event) {
      f['skos:prefLabel'] = event['skos:prefLabel']
      if (f['skos:prefLabel']) {
        if (f['skos:prefLabel'].length > 0) {
          // needed to init the search input if loading from template
          // will be synced with component's initquery prop
          f.initquery = f['skos:prefLabel'][0]['@value']
        }
      }
      f['rdfs:label'] = event['rdfs:label']
      this.$emit('form-input-' + f.component, f)
    },
    selectInput: function (fields, f, event) {
      if (event) {
        f.value = event['@id']
        if (event['@type']) {
          f.type = event['@type']
        }
        if (event['skos:prefLabel']) {
          let preflabels = event['skos:prefLabel']
          f['skos:prefLabel'] = []
          Object.entries(preflabels).forEach(([key, value]) => {
            f['skos:prefLabel'].push({ '@value': value, '@language': key })
          })
        }
        if (event['rdfs:label']) {
          let rdfslabels = event['rdfs:label']
          if (rdfslabels) {
            f['rdfs:label'] = []
            Object.entries(rdfslabels).forEach(([key, value]) => {
              f['rdfs:label'].push({ '@value': value, '@language': key })
            })
          }
        }
        if (event['skos:notation']) {
          f['skos:notation'] = event['skos:notation']
        }

        if (f.predicate === 'edm:rights') {
          this.license = f.value
        }

        if (f.predicate === 'dcterms:accessRights') {
          this.showEmbargoDate = f.value === 'https://pid.phaidra.org/vocabulary/AVFC-ZZSZ'
        }

        this.$store.commit('enableAllVocabularyTerms', 'versiontypes')
        this.$store.commit('enableAllVocabularyTerms', this.irObjectTypeVocabulary)

        if (this.submitformparam !== 'book') {
          if (f.predicate === 'edm:hasType') {
            this.filterVocabulary(
              'versiontypes',
              'oaire:version',
              fields,
              f.value,
              [
                {
                  // if object is dataset
                  conditionIds: [
                    'https://pid.phaidra.org/vocabulary/KW6N-2VTP'
                  ],
                  // disable version AO and AM
                  disableIds: [
                    'https://pid.phaidra.org/vocabulary/TV31-080M',
                    'https://pid.phaidra.org/vocabulary/PHXV-R6B3'
                  ]
                },
                {
                  // if object is 'dissertation' or 'book' or 'book part' or 'journal article'
                  conditionIds: [
                    'https://pid.phaidra.org/vocabulary/1PHE-7VMS',
                    'https://pid.phaidra.org/vocabulary/47QB-8QF1',
                    'https://pid.phaidra.org/vocabulary/XA52-09WA',
                    'https://pid.phaidra.org/vocabulary/VKA6-9XTY'
                  ],
                  // disable version AO and SMUR
                  disableIds: [
                    'https://pid.phaidra.org/vocabulary/TV31-080M',
                    'https://pid.phaidra.org/vocabulary/JTD4-R26P'
                  ]
                },
                {
                  // if object is 'preprint' or 'working paper'
                  conditionIds: [
                    'https://pid.phaidra.org/vocabulary/T023-BGTD',
                    'https://pid.phaidra.org/vocabulary/489N-Y6VX'
                  ],
                  // disable version AM and VoR and CVoR and EVoR
                  disableIds: [
                    'https://pid.phaidra.org/vocabulary/PHXV-R6B3',
                    'https://pid.phaidra.org/vocabulary/PMR8-3C8D',
                    'https://pid.phaidra.org/vocabulary/MT1G-APSB',
                    'https://pid.phaidra.org/vocabulary/SSQW-AP1S'
                  ]
                }
              ]
            )
          }
        }

        if (f.predicate === 'oaire:version') {
          let dateType = null
          let dateLabel = null
          switch (f.value) {
            case 'https://pid.phaidra.org/vocabulary/TV31-080M': // AO
            case 'https://pid.phaidra.org/vocabulary/83ZP-CPP2': // P
              dateType = 'dcterms:created'
              dateLabel = 'Date created'
              break
            case 'https://pid.phaidra.org/vocabulary/JTD4-R26P': // SMUR
              dateType = 'dcterms:dateSubmitted'
              dateLabel = 'Date submitted'
              break
            case 'https://pid.phaidra.org/vocabulary/PHXV-R6B3': // AM
              dateType = 'dcterms:dateAccepted'
              dateLabel = 'Date accepted'
              break
            case 'https://pid.phaidra.org/vocabulary/PMR8-3C8D': // VoR
              dateType = 'dcterms:issued'
              dateLabel = 'Date issued'
              break
            case 'https://pid.phaidra.org/vocabulary/SSQW-AP1S': // EVoR
            case 'https://pid.phaidra.org/vocabulary/MT1G-APSB': // CVoR
              dateType = 'dcterms:modified'
              dateLabel = 'Date modified'
              break
            case 'https://pid.phaidra.org/vocabulary/KZB5-0F5G': // NA
              dateType = 'dcterms:date'
              dateLabel = 'Date'
              break
          }

          if (this.submitformparam !== 'book') {
            this.filterVocabulary(
              this.irObjectTypeVocabulary,
              'edm:hasType',
              fields,
              f.value,
              [
                {
                  // if version is AO or AM
                  conditionIds: [
                    'https://pid.phaidra.org/vocabulary/TV31-080M',
                    'https://pid.phaidra.org/vocabulary/PHXV-R6B3'
                  ],
                  // disable type dataset
                  disableIds: [
                    'https://pid.phaidra.org/vocabulary/KW6N-2VTP'
                  ]
                },
                {
                  // if version is AO or SMUR
                  conditionIds: [
                    'https://pid.phaidra.org/vocabulary/TV31-080M',
                    'https://pid.phaidra.org/vocabulary/JTD4-R26P'
                  ],
                  // disable object 'dissertation' and 'book' and 'book part' and 'journal article'
                  disableIds: [
                    'https://pid.phaidra.org/vocabulary/1PHE-7VMS',
                    'https://pid.phaidra.org/vocabulary/47QB-8QF1',
                    'https://pid.phaidra.org/vocabulary/XA52-09WA',
                    'https://pid.phaidra.org/vocabulary/VKA6-9XTY'
                  ]
                },
                {
                  // if version is AM or VoR or CVoR or EVoR
                  conditionIds: [
                    'https://pid.phaidra.org/vocabulary/PHXV-R6B3',
                    'https://pid.phaidra.org/vocabulary/PMR8-3C8D',
                    'https://pid.phaidra.org/vocabulary/MT1G-APSB',
                    'https://pid.phaidra.org/vocabulary/SSQW-AP1S'

                  ],
                  // disable object 'preprint' and 'working paper'
                  disableIds: [
                    'https://pid.phaidra.org/vocabulary/T023-BGTD',
                    'https://pid.phaidra.org/vocabulary/489N-Y6VX'
                  ]
                }
              ]
            )
          }
          if (dateType) {
            for (let formfield of fields) {
              if (formfield.mainSubmitDate) {
                formfield.type = dateType
                formfield.dateLabel = dateLabel
              }
            }
          }
        }
      } else {
        f.value = ''
        f['skos:prefLabel'] = []
        f['rdfs:label'] = []
        f['skos:notation'] = []
      }
      this.$emit('form-input-' + f.component, f)
    },
    filterVocabulary: function (vocabulary, predicate, fields, selectedValue, filter) {
      for (let f of filter) {
        for (let conditionId of f.conditionIds) {
          if (selectedValue === conditionId) {
            for (let formfield of fields) {
              if (formfield.predicate === predicate) {
                for (let toDisable of f.disableIds) {
                  if (formfield.value === toDisable) {
                    formfield.value = null
                  }
                }
              }
            }
            this.$store.commit('disableVocabularyTerms', {
              vocabulary: vocabulary,
              termids: f.disableIds
            })
          }
        }
      }
    },
    roleInput: function (f, event) {
      if (event) {
        f.role = event['@id']
        this.$emit('form-input-' + f.component, f)
      }
    },
    setFilename: function (f, event) {
      if (event) {
        f.value = event.name
        f.file = event
      }
      this.$emit('form-input-' + f.component, f)
    },
    resetForm: function (self, doiImportData, importedComponents) {
      self.$store.commit('enableAllVocabularyTerms', 'versiontypes')
      self.$store.commit('enableAllVocabularyTerms', this.irObjectTypeVocabulary)

      self.form = {
        sections: []
      }

      let smf = []

      let rt = fields.getField('resource-type')
      rt.value = 'https://pid.phaidra.org/vocabulary/69ZZ-2KGX'
      smf.push(rt)

      let f = fields.getField('file')
      f.multiplicable = false
      f.mimetype = 'application/pdf'
      f.autoMimetype = true
      smf.push(f)

      let tf = fields.getField('title')
      if (doiImportData && doiImportData.title) {
        tf.title = doiImportData.title
      }
      tf.hideSubtitle = true
      tf.multilingual = false
      tf.multiplicable = false
      smf.push(tf)

      let uploader = fields.getField('role-extended')
      uploader.role = 'role:uploader'
      uploader.roleVocabulary = 'rolepredicate'
      uploader.firstname = this.user.firstname
      uploader.lastname = this.user.lastname
      smf.push(uploader)

      if (doiImportData && doiImportData.authors.length > 0) {
        for (let author of doiImportData.authors) {
          let role = fields.getField('role-extended')
          role.type = 'schema:Person'
          role.role = 'role:aut'
          role.roleVocabulary = 'irrolepredicate'
          role.ordergroup = 'roles'
          role.firstname = author.firstname
          role.lastname = author.lastname
          role.showIdentifierType = false
          role.identifierType = 'ids:orcid'
          role.identifierLabel = 'ORCID'
          smf.push(role)
        }
      } else {
        let role = fields.getField('role-extended')
        role.role = 'role:aut'
        role.type = 'schema:Person'
        role.enableTypeSelect = false
        if ((this.submitformparam === 'journal-article') || (this.submitformparam === 'book-part')) {
          role.hideRole = true
          role.label = 'Author'
        }
        role.roleVocabulary = 'irrolepredicate'
        role.ordergroup = 'roles'
        role.showIdentifierType = false
        role.identifierType = 'ids:orcid'
        role.identifierLabel = 'ORCID'
        smf.push(role)
      }

      let vtf = fields.getField('version-type')
      vtf.showValueDefinition = true
      vtf.hint = self.$t('The version type you choose can restrict the possible publication type values.')
      smf.push(vtf)

      let issued = fields.getField('date-edtf')
      issued.mainSubmitDate = true // we need to find this field again when changing predicates
      issued.picker = true
      issued.type = 'dcterms:issued'
      issued.hideType = true
      issued.dateLabel = 'Date issued'
      issued.multiplicable = false
      if (doiImportData && doiImportData.dateIssued) {
        issued.value = doiImportData.dateIssued
      }
      smf.push(issued)

      smf.push(fields.getField('language'))

      let otf = fields.getField('object-type')
      otf.vocabulary = this.irObjectTypeVocabulary
      otf.multiplicable = false
      otf.label = 'Type of publication'
      otf.showValueDefinition = true
      if (doiImportData && doiImportData.publicationTypeId) {
        otf.value = doiImportData.publicationTypeId
      }
      if (this.submitformparam === 'book') {
        otf.value = 'https://pid.phaidra.org/vocabulary/47QB-8QF1'
        otf.disabled = true
      }
      if (this.submitformparam === 'book-part') {
        otf.value = 'https://pid.phaidra.org/vocabulary/XA52-09WA'
        otf.disabled = true
      }
      smf.push(otf)

      if (this.submitformparam === 'book-part') {
        let sf = fields.getField('contained-in')
        sf.label = 'Appeared in'
        sf.multilingual = false
        sf.hideSeriesIssn = true
        sf.collapseSeries = true
        smf.push(sf)
      }

      if ((this.submitformparam === 'book') || (this.submitformparam === 'book-part')) {
        let pf = fields.getField('bf-publication')
        pf.publisherSearch = false
        pf.multiplicable = false
        pf.showPlace = false
        pf.showDate = false
        pf.label = 'PUBLISHER_VERLAG'
        if (doiImportData && doiImportData.publisher) {
          pf.publisherName = doiImportData.publisher
        }
        smf.push(pf)
      }

      let arf = fields.getField('access-right')
      arf.vocabulary = 'iraccessright'
      arf.showValueDefinition = true
      smf.push(arf)

      let embargoDate = fields.getField('date-edtf')
      embargoDate.picker = true
      embargoDate.type = 'dcterms:available'
      embargoDate.hideType = true
      embargoDate.dateLabel = 'Embargo date'
      smf.push(embargoDate)

      smf.push(fields.getField('license'))

      self.form.sections.push(
        {
          title: self.$t('Mandatory fields'),
          type: 'digitalobject',
          id: 5,
          fields: smf
        }
      )

      let sof = []

      let dof = fields.getField('abstract')
      dof.multiplicable = false
      dof.multilingual = false
      sof.push(dof)

      let pof = fields.getField('project')
      pof.multiplicable = true
      sof.push(pof)

      let aif = fields.getField('alternate-identifier')
      aif.identifierLabel = 'Identifier'
      aif.vocabulary = 'irobjectidentifiertype'
      aif.multiplicable = true
      aif.addOnly = true
      if (doiImportData && doiImportData.doi) {
        aif.type = 'ids:doi'
        aif.value = doiImportData.doi
      }
      sof.push(aif)

      if ((this.submitformparam === 'book') || (this.submitformparam === 'book-part')) {
        let isbn = fields.getField('alternate-identifier')
        isbn.label = 'ISBN'
        isbn.multiplicable = true
        sof.push(isbn)
      }

      let kof = fields.getField('keyword')
      kof.multiplicable = false
      kof.multilingual = false
      kof.disableSuggest = true
      sof.push(kof)

      if (this.submitformparam === 'journal-article') {
        let sf = fields.getField('series')
        sf.multilingual = false
        sf.journalSuggest = true
        sf.hideIdentifier = true
        sf.issuedDatePicker = true
        if (doiImportData) {
          if (doiImportData.journalTitle) {
            sf.title = doiImportData.journalTitle
          }
          if (doiImportData.journalISSN) {
            sf.issn = doiImportData.journalISSN
          }
          if (doiImportData.journalVolume) {
            sf.volume = doiImportData.journalVolume
          }
          if (doiImportData.journalIssue) {
            sf.issue = doiImportData.journalIssue
          }
        }
        sof.push(sf)
      }

      if (this.submitformparam !== 'book') {
        let ps = fields.getField('page-start')
        if (doiImportData && doiImportData.pageStart) {
          ps.value = doiImportData.pageStart
        }
        sof.push(ps)
      }

      let pe = fields.getField('page-end')
      if (doiImportData && doiImportData.pageEnd) {
        pe.value = doiImportData.pageEnd
      }
      sof.push(pe)

      if (this.submitformparam === 'journal-article') {
        let pf = fields.getField('bf-publication')
        pf.multiplicable = false
        pf.showPlace = false
        pf.showDate = false
        pf.label = this.$t('PUBLISHER_VERLAG')
        if (doiImportData && doiImportData.publisher) {
          pf.publisherName = doiImportData.publisher
        }
        sof.push(pf)
      }

      self.form.sections.push(
        {
          title: self.$t('Optional fields'),
          type: 'digitalobject',
          id: 6,
          fields: sof
        }
      )
    },
    continueForm: function (step) {
      if (step === 5) {
        this.validateMandatory()
      }
      if (this.validationStatus !== 'error') {
        this.step = step + 1
      }
      this.$vuetify.goTo(1)
    },
    validateMandatory: function () {
      this.validationStatus = ''
      this.validationErrors = []
      let hasLocalAffiliation = false
      for (let s of this.form.sections) {
        if (s.id === 5) {
          for (let f of s.fields) {
            if (f.component === 'p-title') {
              f.titleErrorMessages = []
              if (f.title.length < 1) {
                f.titleErrorMessages.push(this.$t('Missing title'))
                this.validationStatus = 'error'
              }
            }
            if (f.component === 'p-entity-extended') {
              if (f.role !== 'role:uploader') {
                f.firstnameErrorMessages = []
                f.lastnameErrorMessages = []
                f.roleErrorMessages = []
                f.affiliationErrorMessages = []
                f.affiliationTextErrorMessages = []
                f.organizationErrorMessages = []
                f.organizationTextErrorMessages = []
                if (f.role.length < 1) {
                  f.roleErrorMessages.push(this.$t('Missing role'))
                  this.validationStatus = 'error'
                }
                if (f.type === 'schema:Person') {
                  if (f.firstname.length < 1) {
                    f.firstnameErrorMessages.push(this.$t('Missing firstname'))
                    this.validationStatus = 'error'
                  }
                  if (f.lastname.length < 1) {
                    f.lastnameErrorMessages.push(this.$t('Missing lastname'))
                    this.validationStatus = 'error'
                  }
                  if (f.affiliationType === 'select') {
                    if (f.affiliation.length < 1) {
                      f.affiliationErrorMessages.push(this.$t('Missing affiliation'))
                      this.validationStatus = 'error'
                    } else {
                      hasLocalAffiliation = true
                    }
                  }
                  if (f.affiliationType === 'other') {
                    if (f.affiliationText.length < 1) {
                      f.affiliationTextErrorMessages.push(this.$t('Missing affiliation'))
                      this.validationStatus = 'error'
                    }
                  }
                }
                if (f.type === 'schema:Organization') {
                  if (f.organizationType === 'select') {
                    if (f.organization.length < 1) {
                      f.organizationErrorMessages.push(this.$t('Missing organization'))
                      this.validationStatus = 'error'
                    } else {
                      hasLocalAffiliation = true
                    }
                  }
                  if (f.organizationType === 'other') {
                    if (f.organizationText.length < 1) {
                      f.organizationTextErrorMessages.push(this.$t('Missing organization'))
                      this.validationStatus = 'error'
                    }
                  }
                }
              }
            }
            if (f.component === 'p-date-edtf') {
              if (this.showEmbargoDate || f.type !== 'dcterms:available') {
                f.typeErrorMessages = []
                f.valueErrorMessages = []
                if (f.type.length < 1) {
                  f.typeErrorMessages.push(this.$t('Missing date type'))
                  this.validationStatus = 'error'
                }
                if (f.value.length < 1) {
                  f.valueErrorMessages.push(this.$t('Missing date'))
                  this.validationStatus = 'error'
                }
              }
            }
            if (f.component === 'p-select') {
              f.errorMessages = []
              if (f.value.length < 1) {
                f.errorMessages.push(this.$t('Please select'))
                this.validationStatus = 'error'
              }
            }
            if (f.component === 'p-file') {
              f.fileErrorMessages = []
              f.mimetypeErrorMessages = []
              if (!f.file) {
                f.fileErrorMessages.push(this.$t('Please select'))
                this.validationStatus = 'error'
              }
              if (f.mimetype.length < 1) {
                f.mimetypeErrorMessages.push(this.$t('Please select'))
                this.validationStatus = 'error'
              }
            }
            if (f.component === 'p-bf-publication') {
              f.publisherNameErrorMessages = []
              f.publisherOrgUnitErrorMessages = []
              if (f.publisherType === 'select') {
                if (f.publisherOrgUnit.length < 1) {
                  f.publisherOrgUnitErrorMessages.push(this.$t('Missing publisher'))
                  this.validationStatus = 'error'
                }
              }
              if (f.publisherType === 'other') {
                if (f.publisherName.length < 1) {
                  f.publisherNameErrorMessages.push(this.$t('Missing publisher'))
                  this.validationStatus = 'error'
                }
              }
            }
            if (f.component === 'p-series') {
              f.titleErrorMessages = []
              if (f.title.length < 1) {
                f.titleErrorMessages.push(this.$t('Missing title'))
                this.validationStatus = 'error'
              }
            }
          }
        }
      }
      if (!hasLocalAffiliation && (this.user.username !== this.config.iraccount)) {
        this.validationStatus = 'error'
        this.validationErrors.push(this.$t('At least one person named must be affiliated with the') + ' ' + this.config.institution)
      }
    },
    confirm: async function () {
      if (!this.embargoNotificationCheckbox && !this.notificationCheckbox) {
        this.$router.push('/search')
      }
      this.loading = true
      try {
        var httpFormData = new FormData()

        httpFormData.append('pid', this.submitResponse.pid)
        if (this.submitResponse.alternatives && (this.submitResponse.alternatives.length > 0)) {
          httpFormData.append('alternatives[]', this.submitResponse.alternatives)
        }
        if (this.notificationCheckbox) {
          httpFormData.append('notification', this.notificationCheckbox)
        }
        if (this.embargoNotificationCheckbox) {
          httpFormData.append('embargonotification', this.embargoNotificationCheckbox)
        }

        let response = await fetch(this.$store.state.config.api + '/ir/notifications', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'X-XSRF-TOKEN': this.$store.state.user.token
          },
          body: httpFormData
        })

        let json = await response.json()

        if (json.alerts && json.alerts.length > 0) {
          this.$store.commit('setAlerts', json.alerts)
        }

        if (json.status === 200) {
          this.$router.push('/search')
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    resetSubmission: async function (self) {
      if (!self) {
        self = this
      }
      self.license = null
      self.submitResponse = null
      self.$store.dispatch('loadLanguages', this.$i18n.locale)
      self.step = 6
      self.doiImportInput = null
      self.doiImportData = null
      self.doiImportErrors = []
      self.resetForm(self, null, null)
    },
    resetDOIImport: function () {
      this.license = null
      this.doiImportInput = null
      this.doiImportData = null
      this.doiImportErrors = []
      this.rightsCheckSearch = null
      this.rightsCheckData = null
      this.resetForm(this, null, null)
    }
  },
  mounted: async function () {
    // this.objectListLoad()
    // this.resetSubmission(this)
  },
  beforeRouteEnter: async function (to, from, next) {
    next(async vm => {
      await vm.checkAllowSubmit()
      // vm.submitformLoading = true
      // setTimeout(function () { vm.submitformLoading = false }, 500)
      vm.resetSubmission(vm)
    })
  },
  beforeRouteUpdate: async function (to, from, next) {
    await this.checkAllowSubmit()
    // this.submitformLoading = true
    // setTimeout(function () { this.submitformLoading = false }, 500)
    this.resetSubmission(this)
    next()
  }
}
</script>

<style scoped>
.v-btn {
  margin: 0;
}

.prewrap {
  white-space: pre-wrap;
}

.progressbar {
  opacity: 0.7
}

.v-stepper__content {
  transition: none;
  -webkit-transition: none;
}
</style>
