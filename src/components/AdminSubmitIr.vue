<template>
  <div>
    <v-container v-if="submitformLoading">
      <div class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          class="progressbar mt-12">
        </v-progress-circular>
      </div>
    </v-container>

    <v-stepper v-else-if="form.sections.length > 0" v-model="step" non-linear class="mt-2">
      <v-stepper-header>
        <v-stepper-step edit-icon='mdi-check' :editable="(maxStep >= 3) && (step < 8)" :complete="step > 3" step="3">{{ $t('Import') }}</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step edit-icon='mdi-check' :editable="(maxStep >= 5) && (step < 8)" :complete="step > 5" step="5" :rules="[() => validationStatus !== 'error']">{{ $t('Mandatory fields') }} <small v-if="validationStatus === 'error'">{{ $t('Invalid metadata') }}</small></v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step edit-icon='mdi-check' :editable="(maxStep >= 6) && (step < 8)" :complete="step > 6" step="6">{{ $t('Optional fields') }}</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step edit-icon='mdi-check' :editable="(maxStep >= 7) && (step < 8)" :complete="maxStep > 7" step="7" @click="updateJsonld()">{{ $t('Submit') }}</v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>

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
              <v-col cols="3" class="ml-4 mt-2">
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
            <v-row no-gutters class="justify-end">
              <v-btn color="primary" @click="step = 5; $vuetify.goTo(1)">
                <template v-if="doiImportData">{{ $t('Continue') }}</template>
                <template v-else>{{ $t('Skip') }}</template>
              </v-btn>
            </v-row>
          </v-container>
        </v-stepper-content>

        <v-stepper-content v-for="(s) in form.sections" :key="'tabitem'+s.id" :step="s.id">
          <v-container>
            <v-alert outlined type="error" transition="slide-y-transition" v-if="validationErrors.length > 0">
              <span v-for="(error, i) of validationErrors" :key="'verr'+i">{{ error }}</span>
            </v-alert>
            <v-row>
              <v-col cols="10" offset="1">

                <template v-if="s.id === 6">
                  <submit-ir-description-keywords
                    :label="submitformparam === 'journal-article' ? $t('Article details') : (submitformparam === 'book' ? $t('Book details') : $t('Book chapter details'))"
                    :descriptionLabel="$t('Abstract')"
                    :keywordsLabel="$t('Keywords')"
                    :keywordParser="true"
                    v-on:input-description="setDescription(s, $event)"
                    v-on:input-keywords="setKeywords(s, $event)"
                    :inputStyle="inputStyle"
                    class="my-4"
                  ></submit-ir-description-keywords>
                </template>

                <template v-for="(f) in s.fields">

                  <v-row no-gutters :key="f.id">

                    <template v-if="(f.component === 'p-text-field') && (f.type !== 'bf:Summary')">
                      <p-i-text-field
                        v-bind.sync="f"
                        v-on:input="f.value=$event"
                        v-on:input-language="setSelected(f, 'language', $event)"
                        v-on:add="addField(s.fields, f)"
                        v-on:remove="removeField(s.fields, f)"
                        :inputStyle="inputStyle"
                        class="my-2"
                      ></p-i-text-field>
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
                        :inputStyle="inputStyle"
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
                        :inputStyle="inputStyle"
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
                        :inputStyle="inputStyle"
                        class="my-2"
                      ></p-i-date-edtf>
                    </template>

                    <template v-else-if="f.component === 'p-series'">
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
                        v-on:input-page-start="f.pageStart=$event"
                        v-on:input-page-end="f.pageEnd=$event"
                        v-on:add="addField(s.fields, f)"
                        v-on:remove="removeField(s.fields, f)"
                        :inputStyle="inputStyle"
                        class="my-4"
                      ></p-i-series>
                    </template>

                    <template v-else-if="f.component === 'p-bf-publication'">
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
                        :inputStyle="inputStyle"
                        class="mt-2 mb-8"
                      ></p-i-bf-publication>
                    </template>

                    <template v-else-if="f.component === 'p-contained-in'">
                      <p-i-contained-in
                        class="mt-2 mb-6"
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
                        v-on:input-page-start="f.pageStart=$event"
                        v-on:input-page-end="f.pageEnd=$event"
                        v-on:input-isbn="f.isbn=$event"
                        v-on:input-suggest-publisher="publisherSuggestInput(f, $event)"
                        v-on:input-publisher-name="f.publisherName=$event"
                        v-on:change-publisher-type="f.publisherType = $event"
                        v-on:input-publisher-select="publisherSelectInput(f, $event)"
                        v-on:input-publishing-place="f.publishingPlace=$event"
                        v-on:input-publishing-date="f.publishingDate=$event"
                        v-on:add-role="addContainedInRole(f.roles, $event)"
                        v-on:remove-role="removeContainedInRole(f.roles, $event)"
                        v-on:up-role="sortContainedInRoleUp(f.roles, $event)"
                        v-on:down-role="sortContainedInRoleDown(f.roles, $event)"
                        :inputStyle="inputStyle"
                      ></p-i-contained-in>
                    </template>

                    <template v-else-if="f.component === 'p-entity-extended'">
                      <p-i-entity-extended
                      v-show="f.role !== 'role:uploader'"
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
                        :inputStyle="inputStyle"
                        class="mb-6"
                      ></p-i-entity-extended>
                    </template>

                    <template v-else-if="f.component === 'p-subject-gnd'">
                      <p-i-subject-gnd
                        v-bind.sync="f"
                        v-on:input="f.value=$event"
                        v-on:resolve="updateSubject(f, $event)"
                        v-on:add="addField(s.fields, f)"
                        v-on:remove="removeField(s.fields, f)"
                        :inputStyle="inputStyle"
                        class="my-2"
                      ></p-i-subject-gnd>
                    </template>

                    <template v-else-if="f.component === 'p-vocab-ext-readonly'">
                      <p-i-vocab-ext-readonly
                        v-bind.sync="f"
                        v-on:remove="removeField(s.fields, f)"
                        :inputStyle="inputStyle"
                      ></p-i-vocab-ext-readonly>
                    </template>

                    <template v-else-if="f.component === 'p-literal'">
                      <p-i-literal
                        v-bind.sync="f"
                        v-on:input-value="f.value=$event"
                        v-on:add="addField(s.fields, f)"
                        v-on:remove="removeField(s.fields, f)"
                        :inputStyle="inputStyle"
                        class="my-2"
                      ></p-i-literal>
                    </template>

                    <template v-else-if="f.component === 'isbn'">
                      <p-i-alternate-identifier
                        v-bind.sync="f"
                        v-on:input-identifier="f.value=$event"
                        v-on:input-identifier-type="setSelected(f, 'type', $event)"
                        :inputStyle="inputStyle"
                        class="my-2"
                      ></p-i-alternate-identifier>
                    </template>

                    <template v-else-if="(f.component === 'p-alternate-identifier') && (f.subloopFlag)">
                      <v-row class="my-4">
                        <v-col cols="12">
                          <v-card width="100%">
                            <v-card-title class="title font-weight-light grey white--text">
                              <span>{{ $t('Identifiers') }}</span>
                            </v-card-title>
                            <v-divider></v-divider>
                            <v-card-text class="mt-4">
                              <template v-for="(f) in s.fields">
                                <template no-gutters v-if="(f.component === 'p-alternate-identifier')">
                                    <submit-ir-alternate-identifier
                                      :key="f.id"
                                      v-bind.sync="f"
                                      v-on:input-identifier="f.value=$event"
                                      v-on:input-identifier-type="setSelected(f, 'type', $event)"
                                      v-on:add="addField(s.fields, f)"
                                      v-on:add-clear="addIdentifierClear(s.fields, f)"
                                      v-on:remove="removeField(s.fields, f)"
                                      :inputStyle="inputStyle"
                                      class="my-2"
                                    ></submit-ir-alternate-identifier>
                                  </template>
                                </template>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>
                    </template>

                    <template v-else-if="(f.component === 'p-project') && (f.subloopFlag)">
                      <v-row class="my-4">
                        <v-col cols="12">
                          <v-card width="100%">
                            <v-card-title class="title font-weight-light grey white--text">
                              <span>{{ $t('Funder/Project') }}</span>
                            </v-card-title>
                            <v-divider></v-divider>
                            <v-card-text class="mt-4">
                              <template v-for="(f) in s.fields">
                                <template v-if="(f.component === 'p-project')">
                                  <submit-ir-funding-field
                                    :key="f.id"
                                    v-bind.sync="f"
                                    v-on:select-funder="setFunder(f, $event)"
                                    v-on:input-funder-name="f.funderName=$event"
                                    v-on:input-identifier="f.identifier=$event"
                                    v-on:add="addProject(s.fields, f)"
                                    v-on:add-clear="addProjectClear(s.fields, f)"
                                    v-on:remove="removeField(s.fields, f)"
                                    :inputStyle="inputStyle"
                                    class="my-2"
                                  ></submit-ir-funding-field>
                                </template>
                              </template>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>
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
                            :inputStyle="inputStyle"
                            class="my-2"
                          ></p-i-file>
                        </v-row>
                      </v-col>
                    </template>

                  </v-row>

                </template>

                <v-divider class="mt-5 mb-7"></v-divider>
                <v-row no-gutters justify="space-between">
                  <v-btn dark color="grey" @click="backForm(s.id)">{{ $t('Back') }}</v-btn>
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
            <v-divider class="mt-5 mb-7"></v-divider>
            <v-row no-gutters>
              <v-btn dark color="grey" :disabled="loading" @click="step = 6; $vuetify.goTo(1)">{{ $t('Back') }}</v-btn>
              <v-spacer></v-spacer>
              <v-dialog v-model="resetDialog" max-width="500px">
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" class="mr-3" :disabled="loading" dark color="error">{{ $t('Reset submission') }}</v-btn>
                </template>
                <v-card>
                  <v-card-title class="title font-weight-light grey white--text">
                    {{ $t('Reset submission') }}
                  </v-card-title>
                  <v-card-text>
                    <p class="mt-6 title font-weight-light grey--text text--darken-3">{{ $t('Reset submission process?') }}</p>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn dark @click="resetDialog = false" color="grey">{{ $t('Cancel') }}</v-btn>
                    <v-btn @click="resetSubmission(); resetDialog = false" color="primary">{{ $t('Reset') }}</v-btn>
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

      </v-stepper-items>

    </v-stepper>
  </div>
</template>

<script>
import SubmitIrFundingField from '@/components/SubmitIrFundingField'
import SubmitIrAlternateIdentifier from '@/components/SubmitIrAlternateIdentifier'
import SubmitIrDescriptionKeywords from '@/components/SubmitIrDescriptionKeywords'
import arrays from 'phaidra-vue-components/src/utils/arrays'
import jsonLd from 'phaidra-vue-components/src/utils/json-ld'
import fields from 'phaidra-vue-components/src/utils/fields'
import { context } from '@/mixins/context'
import { config } from '@/mixins/config'
import { vocabulary } from 'phaidra-vue-components/src//mixins/vocabulary'
import { validationrules } from 'phaidra-vue-components/src/mixins/validationrules'

export default {
  name: 'admin-submit-ir',
  mixins: [ context, config, validationrules, vocabulary ],
  components: {
    SubmitIrFundingField,
    SubmitIrDescriptionKeywords,
    SubmitIrAlternateIdentifier
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
    }
  },
  data () {
    return {
      inputStyle: 'filled',
      form: {
        sections: []
      },
      step: 1,
      maxStep: 0,
      loadedMetadata: [],
      loading: false,
      resetDialog: false,
      touCheckbox: false,
      touCheckboxErrors: [],
      doiImportInput: null,
      doiImportData: null,
      doiImportErrors: [],
      license: null,
      showEmbargoDate: false,
      embargoDateMenu: false,
      embargoDateModel: null,
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
      jsonld: {}
    }
  },
  watch: {
    step (val) {
      if (val > this.maxStep) {
        this.maxStep = val
      }
      if (val === 7) {
        this.updateJsonld()
      }
    }
  },
  methods: {
    updateJsonld () {
      this.jsonld = this.getJsonld()
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

          let solrResponse = await this.$http.request({
            method: 'GET',
            url: this.config.solr + '/select',
            params: params
          })

          if (solrResponse.data.response.numFound > 0) {
            this.doiDuplicate = {
              pid: solrResponse.data.response.docs[0].pid,
              title: solrResponse.data.response.docs[0].dc_title[0]
            }
          } else {
            let response = await this.$http.request({
              method: 'GET',
              url: 'https://' + this.config.apis.doi.baseurl + '/' + this.doiToImport,
              headers: {
                'Accept': this.config.apis.doi.accept
              }
            })

            let crossrefData = response.data

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
            this.resetForm(this, this.doiImportData)
          }
        } catch (error) {
          this.doiImportErrors.push(error)
        } finally {
          this.loading = false
        }
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
        let response = await this.$http.request({
          method: 'POST',
          url: this.$store.state.config.api + '/ir/submit',
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-XSRF-TOKEN': this.$store.state.user.token
          },
          data: httpFormData
        })

        if (response.data.alerts && response.data.alerts.length > 0) {
          if ((response.data.alerts.length === 1) && response.data.alerts[0].msg === 'true') {
            // sometimes api returns just 'true', skip this message
          } else {
            this.$store.commit('setAlerts', response.data.alerts)
          }
        }

        if (response.data.status === 200) {
          this.submitResponse = response.data
          this.$router.push('/admin')
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
        newField.subloopFlag = false
      }
    },
    addEntityClear: function (arr, f) {
      var newField = arrays.duplicate(arr, f)
      if (newField) {
        newField.id = (new Date()).getTime()
        if (this.submitformparam === 'journal-article') {
          newField.role = 'role:aut'
        } else {
          newField.role = ''
        }
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
        newField.type = ''
        newField.removable = true
        newField.addOnly = false
        newField.removeOnly = true
        newField.subloopFlag = false
      }
    },
    addProjectClear: function (arr, f) {
      var newField = arrays.duplicate(arr, f)
      if (newField) {
        newField.id = (new Date()).getTime()
        newField.removable = true
        newField.identifier = ''
        newField.funderIdentifier = ''
        newField.funderName = ''
        newField.subloopFlag = false
      }
    },
    addProject: function (arr, f) {
      var newField = arrays.duplicate(arr, f)
      if (newField) {
        newField.id = (new Date()).getTime()
        newField.removable = true
        newField.identifier = ''
        newField.subloopFlag = false
      }
    },
    removeField: function (arr, f) {
      switch (f.component) {
        case 'p-entity-extended':
          let nrRoles = 0
          for (let e of arr) {
            if (e.component === 'p-entity-extended') {
              nrRoles++
            }
          }
          // uploader + 1 author => min 2 roles must stay
          if (nrRoles > 2) {
            arrays.remove(arr, f)
          }
          break
        default:
          let nrFields = 0
          for (let e of arr) {
            if (e.component === f.component) {
              nrFields++
            }
          }
          if (nrFields > 1) {
            arrays.remove(arr, f)
          }
          break
      }
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
      } else {
        f.value = ''
        f['skos:prefLabel'] = []
        f['rdfs:label'] = []
        f['skos:notation'] = []
      }
      this.$emit('form-input-' + f.component, f)
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
    setDescription: function (section, value) {
      for (let f of section.fields) {
        if ((f.component === 'p-text-field') && (f.type === 'bf:Summary')) {
          f.value = value
        }
      }
    },
    setKeywords: function (section, value) {
      for (let f of section.fields) {
        if ((f.component === 'p-keyword')) {
          f.value = value
        }
      }
    },
    resetForm: function (self, doiImportData) {
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
      f.showMimetype = false
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
          role.affiliationType = ''
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
        role.affiliationType = ''
        smf.push(role)
      }

      let vtf = fields.getField('version-type')
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

      let lmf = fields.getField('language')
      lmf.multiplicable = false
      smf.push(lmf)

      let otf = fields.getField('object-type')
      otf.vocabulary = this.irObjectTypeVocabulary
      otf.multiplicable = false
      otf.label = 'Type of publication'
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
        sf.hidePages = false
        if (doiImportData) {
          if (doiImportData.pageStart) {
            sf.pageStart = doiImportData.pageStart
          }
          if (doiImportData.pageEnd) {
            sf.pageEnd = doiImportData.pageEnd
          }
        }
        sf.publisherSearch = false
        sf.publisherShowPlace = false
        sf.publisherShowDate = true
        sf.publisherLabel = 'PUBLISHER_VERLAG'
        if (doiImportData && doiImportData.publisher) {
          sf.publisherName = doiImportData.publisher
        }
        if (doiImportData && doiImportData.dateIssued) {
          sf.publishingDate = doiImportData.dateIssued
        }
        smf.push(sf)
      }

      if ((this.submitformparam === 'book')) {
        let pf = fields.getField('bf-publication')
        pf.publisherSearch = false
        pf.multiplicable = false
        pf.showPlace = false
        pf.showDate = true
        pf.label = 'PUBLISHER_VERLAG'
        if (doiImportData && doiImportData.publisher) {
          pf.publisherName = doiImportData.publisher
        }
        if (doiImportData && doiImportData.dateIssued) {
          pf.publishingDate = doiImportData.dateIssued
        }
        smf.push(pf)

        let isbn = {
          id: 'alternate-identifier',
          fieldname: 'Alternate identifier',
          predicate: 'rdam:P30004',
          component: 'isbn',
          type: 'ids:isbn',
          showType: false,
          disableType: true,
          multiplicable: false,
          identifierLabel: 'ISBN',
          valueErrorMessages: [],
          value: ''
        }
        smf.push(isbn)
      }

      let arf = fields.getField('access-right')
      arf.vocabulary = 'iraccessright'
      smf.push(arf)

      let embargoDate = fields.getField('date-edtf')
      embargoDate.picker = true
      embargoDate.type = 'dcterms:available'
      embargoDate.hideType = true
      embargoDate.dateLabel = 'Embargo date'
      smf.push(embargoDate)

      let lic = fields.getField('license')
      lic.vocabulary = 'alllicenses'
      smf.push(lic)

      self.form.sections.push(
        {
          title: self.$t('Mandatory fields'),
          type: 'digitalobject',
          id: 5,
          fields: smf
        }
      )

      let sof = []

      // handled by submit-ir-description-keyword component
      sof.push(fields.getField('abstract'))
      sof.push(fields.getField('keyword'))

      // handled by submit-ir-funding-field component
      let pof = fields.getField('project')
      pof.label = 'Funder/Project'
      pof.multiplicable = true
      pof.multiplicableCleared = true
      pof.subloopFlag = true
      sof.push(pof)

      let aif = fields.getField('alternate-identifier')
      aif.label = 'Identifier'
      aif.identifierLabel = 'Identifier'
      aif.vocabulary = 'irobjectidentifiertypenoisbn'
      aif.multiplicable = true
      aif.addOnly = true
      aif.subloopFlag = true
      if (doiImportData && doiImportData.doi) {
        aif.type = 'ids:doi'
        aif.value = doiImportData.doi
      }
      sof.push(aif)

      if (this.submitformparam === 'book') {
        let nop = fields.getField('number-of-pages')
        nop.multiplicable = false
        sof.push(nop)
      }

      if ((this.submitformparam === 'journal-article') || (this.submitformparam === 'book')) {
        let sf = fields.getField('series')
        sf.multilingual = false
        sf.hidePages = this.submitformparam !== 'journal-article'
        sf.hideIssue = this.submitformparam !== 'journal-article'
        sf.hideIssued = this.submitformparam !== 'journal-article'
        sf.hideIssn = this.submitformparam !== 'journal-article'
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
          if (doiImportData.pageStart) {
            sf.pageStart = doiImportData.pageStart
          }
          if (doiImportData.pageEnd) {
            sf.pageEnd = doiImportData.pageEnd
          }
          if (doiImportData && doiImportData.dateIssued) {
            sf.issued = doiImportData.dateIssued
          }
        }
        sof.push(sf)
      }

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

      sof.push(fields.getField('rights'))

      self.form.sections.push(
        {
          title: self.$t('Optional fields'),
          type: 'digitalobject',
          id: 6,
          fields: sof
        }
      )

      this.$nextTick().then(function () {
        // put things here which might be overwritten
        // when components re-initialize
        // some use nextTick to wait for vocabularies or
        // something, and then fire input event which is cought
        // eg by selectInput here, but they fire AFTER resetForm
        // while still having old values set
        self.license = null
        self.showEmbargoDate = false
      })
    },
    backForm: function (step) {
      if (step === 6) {
        this.step = 5
      } else {
        if (this.submitformparam === 'journal-article') {
          this.step = 4
        } else {
          this.step = 3
        }
      }
      this.$vuetify.goTo(1)
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
                  if (f.affiliationType === '') {
                    f.affiliationErrorMessages.push(this.$t('Missing affiliation'))
                    f.affiliationTextErrorMessages.push(this.$t('Missing affiliation'))
                    this.validationStatus = 'error'
                  }
                  if (f.affiliationType === 'select') {
                    if (!f.affiliation || (f.affiliation === '') || (f.affiliation.length < 1)) {
                      let event = this.getTerm('orgunits', 'https://pid.phaidra.org/univie-org/1MPF-FAME')
                      this.affiliationSelectInput(f, event)
                    }
                    hasLocalAffiliation = true
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
            if (f.component === 'p-contained-in') {
              f.publisherNameErrorMessages = []
              f.publisherOrgUnitErrorMessages = []
              f.titleErrorMessages = []
              f.isbnErrorMessages = []
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
              if (f.title.length < 1) {
                f.titleErrorMessages.push(this.$t('Missing title'))
                this.validationStatus = 'error'
              }
              if (f.isbn.length < 1) {
                f.isbnErrorMessages.push(this.$t('Missing ISBN'))
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
            if (f.component === 'isbn') {
              f.valueErrorMessages = []
              if (f.value.length < 1) {
                f.valueErrorMessages.push(this.$t('Missing ISBN'))
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
    resetSubmission: async function (self) {
      if (!self) {
        self = this
      }
      self.submitResponse = null
      self.$store.dispatch('loadLanguages', this.$i18n.locale)
      self.step = 3
      self.maxStep = 0
      self.doiImportInput = null
      self.doiImportData = null
      self.doiImportErrors = []
      self.validationStatus = ''
      self.validationErrors = []
      self.resetForm(self, null)
    },
    resetDOIImport: function () {
      this.doiImportInput = null
      this.doiImportData = null
      this.doiImportErrors = []
      this.resetForm(this, null)
    }
  },
  beforeRouteEnter: async function (to, from, next) {
    next(async vm => {
      vm.$store.commit('setSkipsubmitrouteleavehook', false)
      vm.resetSubmission(vm)
    })
  },
  beforeRouteUpdate: async function (to, from, next) {
    this.$store.commit('setSkipsubmitrouteleavehook', false)
    this.resetSubmission(this)
    next()
  },
  beforeRouteLeave: async function (to, from, next) {
    if ((this.step > 1) && (to.name === 'adminsubmit') && (!this.$store.state.skipsubmitrouteleavehook)) {
      this.step = this.step - 1
      this.$vuetify.goTo(1)
      next(false)
    } else {
      next()
    }
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
  transition: none !important;
  -webkit-transition: none !important;
}

.v-stepper__step--editable {
  border-bottom: 3px solid;
  border-color: #9e9e9e;
}
</style>
