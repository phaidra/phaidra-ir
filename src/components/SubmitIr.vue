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

    <v-stepper v-else-if="form.sections.length > 0" v-model="step" non-linear class="mt-2" alt-labels>
      <v-stepper-header>
        <v-stepper-step edit-icon='mdi-check' :editable="(maxStep >= 1) && (step < 8)" :complete="step > 1" step="1"><template v-if="$vuetify.breakpoint.lgAndUp">{{ $t('Start') }}</template></v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step edit-icon='mdi-check' :editable="(maxStep >= 2) && (step < 8)" :complete="touCheckbox" step="2"><template v-if="$vuetify.breakpoint.lgAndUp">{{ $t('Terms of use') }}</template></v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step edit-icon='mdi-check' :editable="(maxStep >= 3) && (step < 8)" :complete="step > 3" step="3"><template v-if="$vuetify.breakpoint.lgAndUp">{{ $t('Import') }}</template></v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step edit-icon='mdi-check' v-if="(submitformparam === 'journal-article')" :editable="(maxStep >= 4) && (step < 8)" :complete="step > 4" step="4"><template v-if="$vuetify.breakpoint.lgAndUp">{{ $t('Check rights') }}</template></v-stepper-step>
        <v-divider v-if="(submitformparam === 'journal-article')"></v-divider>
        <v-stepper-step edit-icon='mdi-check' :editable="(maxStep >= 5) && (step < 8)" :complete="step > 5" step="5" :rules="[() => validationStatus !== 'error']"><template v-if="$vuetify.breakpoint.lgAndUp">{{ $t('Mandatory fields') }}</template> <small v-if="validationStatus === 'error'">{{ $t('Invalid metadata') }}</small></v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step edit-icon='mdi-check' :editable="(maxStep >= 6) && (step < 8)" :complete="step > 6" step="6"><template v-if="$vuetify.breakpoint.lgAndUp">{{ $t('Optional fields') }}</template></v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step edit-icon='mdi-check' :editable="(maxStep >= 7) && (step < 8)" :complete="maxStep > 7" step="7" @click="updateJsonld()"><template v-if="$vuetify.breakpoint.lgAndUp">{{ $t('Submit') }}</template></v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step edit-icon='mdi-check' :complete="maxStep > 8" step="8"><template v-if="$vuetify.breakpoint.lgAndUp">{{ $t('Notifications') }}</template></v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>

        <v-stepper-content step="1">
          <v-container v-if="checkAllowSubmitRes.allowsubmit === 1">
            <v-row no-gutters>
              <h3 class="title font-weight-light primary--text mb-4">{{ $t('Submitting a publication') }}</h3>
            </v-row>
            <v-row no-gutters>
              <i18n path="SUBMIT_START_1" tag="p">
                <a :href="'/info/policy?lang=' + $i18n.locale" target="_blank">{{ $t('guidelines') }}</a>
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
                        <a :href="'/info/contact?lang=' + $i18n.locale" target="_blank">{{ $t('contact us') }}</a>
                      </i18n>
                    </li>
                  </ul>
                </v-alert>
              </v-col>
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
                    <a @click.stop :href="'https://' + config.phaidrabaseurl + '/terms_of_use/show_terms_of_use'" target="_blank">Phaidra</a>
                  </i18n>
                </template>
              </v-checkbox>
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
                        <v-row v-if="doiImportData.subtitle">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Subtitle') }}</v-col>
                          <v-col md="10" cols="12">{{ doiImportData.subtitle }}</v-col>
                        </v-row>
                        <v-row v-if="doiImportData.dateIssued">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Date issued') }}</v-col>
                          <v-col md="10" cols="12">{{ doiImportData.dateIssued }}</v-col>
                        </v-row>
                        <v-row v-for="(author, i) of doiImportData.authors" :key="'aut'+i">
                          <v-col v-if="i === 0" md="2" cols="12" class="primary--text text-right">{{ $t('Authors') }}</v-col>
                          <v-col v-else md="2" cols="12"></v-col>
                          <v-col md="10" cols="12" v-if="author.firstname || author.lastname"><span class="font-weight-regular">{{ author.firstname + ' ' + author.lastname }}</span><span v-if="author['orcid']"> ({{ author['orcid'] }})</span>
                            <template v-if="author['affiliation']">
                              <template v-for="(af, i) in author['affiliation']"><p :key="'doiaf'+i">{{ af }}</p></template>
                            </template>
                          </v-col>
                          <v-col md="10" cols="12" v-else><span class="font-weight-regular">{{ author.name }}</span></v-col>
                        </v-row>
                        <v-row v-if="doiImportData.keywords">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Keywords') }}</v-col>
                          <v-col md="10" cols="12"><v-chip :key="'kw' + i" v-for="(kw, i) in doiImportData.keywords" class="mr-2 mb-2">{{kw}}</v-chip></v-col>
                        </v-row>
                        <v-row v-if="doiImportData.language">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Language') }}</v-col>
                          <v-col md="10" cols="12">{{ doiImportData.language }}</v-col>
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
                        <v-row v-if="doiImportData.ISBN">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('ISBN') }}</v-col>
                          <v-col md="10" cols="12">{{ doiImportData.ISBN }}</v-col>
                        </v-row>
                        <v-row v-if="doiImportData.license">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('License') }}</v-col>
                          <v-col md="10" cols="12">{{ doiImportData.license }}</v-col>
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
              <v-btn color="primary" @click="step = (submitformparam === 'journal-article' ?  4 : 5); $vuetify.goTo(1)">
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

            <v-row justify="start" class="mt-2">
              <v-col cols="12" md="5" class="mr-4">
                <v-text-field clearable solo v-model="journalSearchQuery" v-on:keyup.enter="journalSearch()" :append-icon="'mdi-magnify'" :placeholder="$t('journal title')"></v-text-field>
              </v-col>
              <v-col cols="12" md="5">
                <v-text-field clearable solo v-model="journalSearchISSN" v-on:keyup.enter="journalSearch()" :append-icon="'mdi-magnify'" :placeholder="$t('ISSN')"></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-data-table
                  :headers="journalSearchHeaders"
                  :items="journalSearchItems"
                  :loading="journalSearchLoading"
                  :loading-text="$t('Loading...')"
                  :options.sync="journalSearchOptions"
                  :server-items-length="journalSearchTotal"
                  :footer-props="{ itemsPerPageOptions: [10, 50, 100] }"
                  show-expand
                  single-expand
                  :expanded.sync="journalSearchSelected"
                >
                  <template v-slot:item.title="{ item }">
                    <template v-if="Array.isArray(item.title)">{{ item.title[0].title | truncate(50) }}</template>
                  </template>
                  <template v-slot:item.publishers="{ item }">
                    <template v-if="Array.isArray(item.publishers)">
                      <template v-if="Array.isArray(item.publishers[0].publisher.name)">
                        <span v-for="(pub, i) in item.publishers" :key="'pub'+i"><template v-if="i > 0">, </template>{{ pub.publisher.name[0].name }}</span>
                      </template>
                    </template>
                  </template>
                  <template v-slot:item.data-table-expand="{ item, expand, isExpanded }">
                    <v-btn text color="primary" @click="expand(!isExpanded)">{{ $t(isExpanded ? 'Unselect journal' : 'Select journal') }}</v-btn>
                  </template>
                  <template v-slot:expanded-item="{ headers, item }">
                    <td :colspan="headers.length">
                      <publisher-policy-versions :publication="item"></publisher-policy-versions>
                    </td>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
            <v-divider class="mt-5 mb-7"></v-divider>
            <v-row no-gutters justify="space-between">
              <v-btn dark color="grey" @click="step = 3; $vuetify.goTo(1)">{{ $t('Back') }}</v-btn>
              <v-btn color="primary" @click="step = 5; $vuetify.goTo(1)">
                <template v-if="this.journalSearchSelected.length > 0">{{ $t('Continue') }}</template>
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
                    :keywordsValue="keywordsValue"
                    :descriptionHint="config.descriptionhint"
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
                        v-on:add-clear="addSeriesClear(s.fields, f)"
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
                        v-on:input-series="containedInSeriesInput(f, $event)"
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
                        v-on:add-series="addContainedInSeries(f.series, $event)"
                        v-on:add-clear-series="addClearContainedInSeries(f.series, $event)"
                        v-on:remove-series="removeContainedInSeries(f.series, $event)"
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

                <v-row v-if="license" no-gutters>
                  <v-col cols="12" md="10">
                    <submit-ir-license-info v-if="s.id === 5" :license="license"></submit-ir-license-info>
                  </v-col>
                </v-row>
                <v-row no-gutters v-if="showSubmitWarning">
                  <v-col cols="12">
                    <v-alert type="error" outlined>
                      <span class="mr-2">{{ $t('SUBMIT_ATTENTION', { journal: journalSearchSelected[0].title[0].title, version: getLocalizedTermLabel('versiontypes', selectedVersion) }) }}</span>
                      <a :href="'mailto:' + config.officecontact.email">{{ config.officecontact.email }}</a>.
                    </v-alert>
                  </v-col>
                </v-row>
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
                <p-d-jsonld :showLang="false" :jsonld="jsonld" :labelColMd="'3'" :valueColMd="'9'" :predicatesToHide="['ebucore:filename', 'ebucore:hasMimeType', 'role:uploader']"></p-d-jsonld>
              </v-col>
            </v-row>
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
    <v-dialog v-model="submitBackDialog" width="500">
      <v-card>
        <v-card-title class="headline grey lighten-2">{{ $t('Submit in progress') }}</v-card-title>
        <v-card-text>{{ $t('Please wait until the submission process has finished.') }}</v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="submitBackDialog = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmBackDialog" width="500">
      <v-card>
        <v-card-title class="headline grey lighten-2">{{ $t('Confirm to exit') }}</v-card-title>
        <v-card-text>{{ $t('Please confirm to exit the submit form.') }}</v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="confirmBackDialog = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

</template>

<script>
import SubmitIrLicenseInfo from '@/components/SubmitIrLicenseInfo'
import SubmitIrFundingField from '@/components/SubmitIrFundingField'
import SubmitIrAlternateIdentifier from '@/components/SubmitIrAlternateIdentifier'
import SubmitIrDescriptionKeywords from '@/components/SubmitIrDescriptionKeywords'
import PublisherPolicyVersions from '@/components/PublisherPolicyVersions'
import arrays from 'phaidra-vue-components/src/utils/arrays'
import jsonLd from 'phaidra-vue-components/src/utils/json-ld'
import fields from 'phaidra-vue-components/src/utils/fields'
import lang3to2map from 'phaidra-vue-components/src/utils/lang3to2map'
import { context } from '@/mixins/context'
import { config } from '@/mixins/config'
import { vocabulary } from 'phaidra-vue-components/src/mixins/vocabulary'
import { validationrules } from 'phaidra-vue-components/src/mixins/validationrules'

export default {
  name: 'submit-ir',
  mixins: [ context, config, validationrules, vocabulary ],
  components: {
    SubmitIrLicenseInfo,
    SubmitIrFundingField,
    SubmitIrDescriptionKeywords,
    SubmitIrAlternateIdentifier,
    PublisherPolicyVersions
  },
  computed: {
    lang2to3map: function () {
      return Object.keys(lang3to2map).reduce((ret, key) => {
        ret[lang3to2map[key]] = key
        return ret
      }, {})
    },
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
    },
    selectedVersion: function () {
      for (let s of this.form.sections) {
        for (let f of s.fields) {
          if (f.predicate === 'oaire:version') {
            return f.value
          }
        }
      }
      return null
    },
    showSubmitWarning: function () {
      let permittedVersions = {
        // these versions are not in sherpa/romeo, so we can't say
        'https://pid.phaidra.org/vocabulary/TV31-080M': true,
        'https://pid.phaidra.org/vocabulary/83ZP-CPP2': true,
        'https://pid.phaidra.org/vocabulary/MT1G-APSB': true,
        'https://pid.phaidra.org/vocabulary/SSQW-AP1S': true,
        'https://pid.phaidra.org/vocabulary/KZB5-0F5G': true
      }
      if (this.journalSearchSelected.length > 0) {
        if (this.journalSearchSelected[0].hasOwnProperty('publisher_policy')) {
          if (Array.isArray(this.journalSearchSelected[0].publisher_policy)) {
            for (let p of this.journalSearchSelected[0].publisher_policy) {
              if (p.open_access_prohibited === 'yes') {
                return true
              }
              if (p.hasOwnProperty('permitted_oa')) {
                if (Array.isArray(p.permitted_oa)) {
                  for (let route of p.permitted_oa) {
                    if (route.hasOwnProperty('article_version')) {
                      if (Array.isArray(route.article_version)) {
                        for (let version of route.article_version) {
                          switch (version) {
                            case 'submitted':
                              permittedVersions['https://pid.phaidra.org/vocabulary/JTD4-R26P'] = true
                              break
                            case 'accepted':
                              permittedVersions['https://pid.phaidra.org/vocabulary/PHXV-R6B3'] = true
                              break
                            case 'published':
                              permittedVersions['https://pid.phaidra.org/vocabulary/PMR8-3C8D'] = true
                              break
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (this.selectedVersion) {
          if (!permittedVersions[this.selectedVersion]) {
            return true
          }
        }
      }
      return false
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
        allowsubmit: 1,
        candobulkupload: null,
        nrdays: null,
        nruploads: null
      },
      jsonld: {},
      keywordsValue: [],
      journalSearchQuery: null,
      journalSearchISSN: null,
      journalSearchLoading: false,
      journalSearchSelected: [],
      journalSearchItems: [],
      journalSearchErrors: [],
      journalSearchTotal: 100,
      journalSearchOptions: {
        page: 1,
        itemsPerPage: 10
      },
      journalSearchHeaders: [
        { text: this.$t('Title'), align: 'left', value: 'title', sortable: false },
        { text: this.$t('Publishers'), align: 'left', value: 'publishers', sortable: false },
        { text: '', align: 'right', value: 'data-table-expand' }
      ],
      submitBackDialog: false,
      confirmBackDialog: false
    }
  },
  watch: {
    journalSearchOptions: {
      handler () {
        this.journalSearch()
      },
      deep: true
    },
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
    async checkAllowSubmit () {
      this.submitformLoading = true
      try {
        let response = await this.$http.get(this.config.api + '/ir/allowsubmit',
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
    async journalSearch () {
      if (process.browser) {
        if (!this.config.apis.sherparomeo) return
        if ((!this.journalSearchQuery) && (!this.journalSearchISSN)) return

        this.journalSearchLoading = true
        this.journalSearchItems = []
        this.journalSearchErrors = []

        let filter = []
        if (this.journalSearchQuery) {
          filter.push(['title', 'contains word', this.journalSearchQuery])
        }
        if (this.journalSearchISSN) {
          filter.push(['issn', 'equals', this.journalSearchISSN])
        }

        try {
          let response = await this.$http.request({
            method: 'GET',
            url: this.config.apis.sherparomeo.url,
            params: {
              'api-key': this.config.apis.sherparomeo.key,
              'item-type': 'publication',
              format: 'Json',
              limit: this.journalSearchOptions.itemsPerPage,
              offset: (this.journalSearchOptions.page - 1) * this.journalSearchOptions.itemsPerPage,
              filter: JSON.stringify(filter)
            }
          })
          if (!response.data.items) {
            this.journalSearchErrors.push(this.$t('No journals found'))
            return
          }
          this.journalSearchItems = response.data.items
        } catch (error) {
          console.error(error)
          this.journalSearchErrors.push(error)
        } finally {
          this.journalSearchLoading = false
        }
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
                if (crossrefData['title'].length > 0) {
                  this.doiImportData.title = crossrefData['title'][0].replace(/\s\s+/g, ' ').trim()
                }
              } else {
                this.doiImportData.title = crossrefData['title'].replace(/\s\s+/g, ' ').trim()
              }
            }

            if (crossrefData['subtitle']) {
              if (Array.isArray(crossrefData['subtitle'])) {
                if (crossrefData['subtitle'].length > 0) {
                  this.doiImportData.subtitle = crossrefData['subtitle'][0].replace(/\s\s+/g, ' ').trim()
                }
              } else {
                this.doiImportData.subtitle = crossrefData['subtitle'].replace(/\s\s+/g, ' ').trim()
              }
            }

            if (crossrefData['issued']) {
              if (crossrefData['issued']['date-parts']) {
                this.doiImportData.dateIssued = crossrefData['issued']['date-parts'][0][0].toString()
              }
            }

            if (crossrefData['language']) {
              if (this.lang2to3map[crossrefData['language']]) {
                this.doiImportData.language = this.lang2to3map[crossrefData['language']]
              }
            }

            let authors = crossrefData['author']
            if (authors.length > 0) {
              for (let author of authors) {
                if (author['given'] || author['family']) {
                  let auth = {
                    type: 'schema:Person',
                    firstname: author['given'] ? author['given'].replace(/\s\s+/g, ' ').trim() : '',
                    lastname: author['family'] ? author['family'].replace(/\s\s+/g, ' ').trim() : ''
                  }
                  if (author['affiliation']) {
                    if (Array.isArray(author['affiliation'])) {
                      auth.affiliation = []
                      for (let af of author['affiliation']) {
                        auth.affiliation.push(af['name'])
                      }
                    }
                  }
                  if (author['ORCID']) {
                    auth.orcid = author['ORCID'].replace('http://orcid.org/', '')
                  }
                  this.doiImportData.authors.push(auth)
                }
                if (author['name']) {
                  let auth = {
                    type: 'schema:Organization',
                    name: author['name']
                  }
                  this.doiImportData.authors.push(auth)
                }
              }
            }

            if (crossrefData['subject']) {
              if (Array.isArray(crossrefData['subject'])) {
                this.doiImportData.keywords = []
                for (let kw of crossrefData['subject']) {
                  this.doiImportData.keywords.push(kw)
                }
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
              if (Array.isArray(crossrefData['publisher'])) {
                if (crossrefData['publisher'].length > 0) {
                  this.doiImportData.publisher = crossrefData['publisher'][0].replace(/\s\s+/g, ' ').trim()
                }
              } else {
                this.doiImportData.publisher = crossrefData['publisher'].replace(/\s\s+/g, ' ').trim()
              }
            }

            if (crossrefData['container-title']) {
              if (Array.isArray(crossrefData['container-title'])) {
                if (crossrefData['container-title'].length > 0) {
                  this.doiImportData.journalTitle = crossrefData['container-title'][0].replace(/\s\s+/g, ' ').trim()
                }
              } else {
                this.doiImportData.journalTitle = crossrefData['container-title'].replace(/\s\s+/g, ' ').trim()
              }
            }

            if (crossrefData['ISSN']) {
              if (Array.isArray(crossrefData['ISSN'])) {
                if (crossrefData['ISSN'].length > 0) {
                  this.doiImportData.journalISSN = crossrefData['ISSN'][0].replace(/\s\s+/g, ' ').trim()
                }
              } else {
                this.doiImportData.journalISSN = crossrefData['ISSN'].replace(/\s\s+/g, ' ').trim()
              }
            }

            if (crossrefData['ISBN']) {
              if (Array.isArray(crossrefData['ISBN'])) {
                if (crossrefData['ISBN'].length > 0) {
                  this.doiImportData.ISBN = crossrefData['ISBN'][0].replace(/\s\s+/g, ' ').trim()
                }
              } else {
                this.doiImportData.ISBN = crossrefData['ISBN'].replace(/\s\s+/g, ' ').trim()
              }
            }

            if (crossrefData['volume']) {
              this.doiImportData.journalVolume = crossrefData['volume'].replace(/\s\s+/g, ' ').trim()
            }

            if (crossrefData['issue']) {
              this.doiImportData.journalIssue = crossrefData['issue'].replace(/\s\s+/g, ' ').trim()
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

            if (crossrefData['license']) {
              if (Array.isArray(crossrefData['license'])) {
                for (let lic of crossrefData['license']) {
                  if (lic['URL']) {
                    if (this.getTerm('alllicenses', lic['URL'])) {
                      this.doiImportData.license = lic['URL']
                    }
                  }
                }
              }
            }
            this.resetForm(this, this.doiImportData)
            if (this.doiImportData.journalISSN) {
              this.journalSearchISSN = this.doiImportData.journalISSN
              this.journalSearch()
            }
          }
        } catch (error) {
          console.error(error)
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
      try {
        await this.$http.get(this.$store.state.config.api + '/keepalive', {
          headers: {
            'X-XSRF-TOKEN': this.$store.state.user.token
          }
        })
      } catch (error) {
        console.log(error)
        if (error.response.status === 401) {
          console.log('submitform: logged out, show login dialog')
          this.loginDialog = true
          return
        }
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
          this.submitBackDialog = false
          this.submitResponse = response.data
          this.step = 8
        }
      } catch (error) {
        console.log(error)
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
    addSeriesClear: function (arr, f) {
      var newField = arrays.duplicate(arr, f)
      if (newField) {
        newField.id = (new Date()).getTime()
        newField.title = ''
        newField.volume = ''
        newField.issue = ''
        newField.issued = ''
        newField.issn = ''
        newField.identifier = ''
        newField.pageStart = ''
        newField.pageEnd = ''
        newField.removable = true
      }
    },
    addEntityClear: function (arr, f) {
      var newField = arrays.duplicate(arr, f)
      if (newField) {
        newField.id = (new Date()).getTime()
        if (this.submitformparam === 'journal-article' || this.submitformparam === 'book-part') {
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
        newField.affiliationType = ''
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
          if (nrRoles > 1) {
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
    containedInSeriesInput: function (f, event) {
      for (let s of f.series) {
        if (s.id === event.series.id) {
          if (event.seriesTitleLanguageTerm) {
            s.seriesTitleLanguage = event.seriesTitleLanguageTerm['@id']
          }
          if (event.seriesTitle) {
            s.seriesTitle = event.seriesTitle
          }
          if (event.seriesVolume) {
            s.seriesVolume = event.seriesVolume
          }
          if (event.seriesIssue) {
            s.seriesIssue = event.seriesIssue
          }
          if (event.seriesIssued) {
            s.seriesIssued = event.seriesIssued
          }
          if (event.seriesIssn) {
            s.seriesIssn = event.seriesIssn
          }
          if (event.seriesIdentifier) {
            s.seriesIdentifier = event.seriesIdentifier
          }
        }
      }
    },
    addContainedInSeries: function (arr, f) {
      var newField = arrays.duplicate(arr, f)
      if (newField) {
        newField.id = (new Date()).getTime()
        newField.removable = true
      }
    },
    addClearContainedInSeries: function (arr, f) {
      var newField = arrays.duplicate(arr, f)
      if (newField) {
        newField.id = (new Date()).getTime()
        newField.seriesTitle = ''
        newField.seriesVolume = ''
        newField.seriesIssue = ''
        newField.seriesIssued = ''
        newField.seriesIssn = ''
        newField.seriesIdentifier = ''
        newField.removable = true
      }
    },
    removeContainedInSeries: function (arr, f) {
      if (arr.length > 1) {
        arrays.remove(arr, f)
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

        if (f.predicate === 'dcterms:language') {
          for (let s of this.form.sections) {
            for (let field of s.fields) {
              if (
                (field.predicate === 'dce:title') ||
                (field.predicate === 'bf:note') ||
                (field.predicate === 'dce:subject')
              ) {
                field.language = event['@id']
              }
            }
          }
        }

        if (f.predicate === 'dcterms:accessRights') {
          this.showEmbargoDate = f.value === 'https://pid.phaidra.org/vocabulary/AVFC-ZZSZ'
        }

        if (f.predicate === 'oaire:version') {
          let dateType = null
          let dateLabel = null
          let dateHidden = false
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
              dateHidden = (this.submitformparam === 'book') || (this.submitformparam === 'book-part')
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
          if (dateType) {
            for (let formfield of fields) {
              if (formfield.mainSubmitDate) {
                formfield.type = dateType
                formfield.dateLabel = dateLabel
                formfield.hidden = dateHidden
                if (dateHidden) {
                  formfield.value = ''
                }
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
      this.checkSeriesPosition()
      this.$emit('form-input-' + f.component, f)
    },
    checkSeriesPosition: function () {
      let objectType
      for (let s of this.form.sections) {
        for (let field of s.fields) {
          if (field.predicate === 'edm:hasType') {
            objectType = field.value
          }
        }
      }
      let versionType
      for (let s of this.form.sections) {
        for (let field of s.fields) {
          if (field.predicate === 'oaire:version') {
            versionType = field.value
          }
        }
      }
      // if journal-article && *not* AO
      if ((objectType === 'https://pid.phaidra.org/vocabulary/VKA6-9XTY') && (versionType !== 'https://pid.phaidra.org/vocabulary/TV31-080M')) {
        this.moveSeriesTo('mandatory')
      } else {
        this.moveSeriesTo('optional')
      }
    },
    getSeriesIdx: function (s) {
      for (let i = 0; i < s.fields.length; i++) {
        if (s.fields[i].predicate === 'rdau:P60193') {
          return i
        }
      }
      return -1
    },
    getObjectTypeIdx: function () {
      for (let s of this.form.sections) {
        if (s.obligation === 'mandatory') {
          for (let i = 0; i < s.fields.length; i++) {
            if (s.fields[i].predicate === 'edm:hasType') {
              return i
            }
          }
        }
      }
      return -1
    },
    getAltIdsIdx: function (section) {
      for (let s of this.form.sections) {
        if (s.obligation === 'optional') {
          for (let i = 0; i < s.fields.length; i++) {
            if (s.fields[i].predicate === 'rdam:P30004') {
              return i
            }
          }
        }
      }
      return -1
    },
    getSection: function (obligation) {
      for (let s of this.form.sections) {
        if (s.obligation === obligation) {
          return s
        }
      }
    },
    moveSeriesTo: function (moveTo) {
      let optionalSection = this.getSection('optional')
      let mandatorySection = this.getSection('mandatory')
      let sidx = this.getSeriesIdx(moveTo === 'mandatory' ? optionalSection : mandatorySection)
      let otidx = this.getObjectTypeIdx()
      let aiidx = this.getAltIdsIdx()
      if (sidx > -1) {
        if (moveTo === 'mandatory') {
          optionalSection.fields[sidx].titleBackgroundColor = this.config.mandatorybgcolor
          mandatorySection.fields.splice(otidx + 1, 0, optionalSection.fields[sidx])
          optionalSection.fields.splice(sidx, 1)
        }
        if (moveTo === 'optional') {
          mandatorySection.fields[sidx].titleBackgroundColor = undefined
          optionalSection.fields.splice(aiidx + 1, 0, mandatorySection.fields[sidx])
          mandatorySection.fields.splice(sidx, 1)
        }
      }
    },
    roleInput: function (f, event) {
      if (event) {
        f.role = event['@id']
        this.$emit('form-input-' + f.component, f)
      }
    },
    containedInRoleInput: function (f, event) {
      for (let r of f.roles) {
        if (r.id === event.role.id) {
          if (event.roleTerm) {
            r.role = event.roleTerm['@id']
          }
          if (event.name) {
            r.name = event.name
          }
          if (event.firstname) {
            r.firstname = event.firstname
          }
          if (event.lastname) {
            r.lastname = event.lastname
          }
        }
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
      this.keywordsValue = value
    },
    resetForm: function (self, doiImportData) {
      self.$store.commit('enableAllVocabularyTerms', 'versiontypes')
      self.$store.commit('enableAllVocabularyTerms', self.irObjectTypeVocabulary)

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
      f.backgroundColor = self.config.mandatorybgcolor
      f.autoMimetype = true
      f.showMimetype = false
      smf.push(f)

      let tf = fields.getField('title')
      if (self.submitformparam === 'book-part') {
        tf.titleLabel = 'Title of book chapter'
      }
      tf.titleBackgroundColor = self.config.mandatorybgcolor
      tf.hideSubtitle = self.submitformparam === 'journal-article'
      if (doiImportData && doiImportData.title) {
        tf.title = doiImportData.title
      }
      if (doiImportData && doiImportData.subtitle) {
        tf.subtitle = doiImportData.subtitle
        tf.hideSubtitle = false
      }
      tf.multilingual = false
      tf.multiplicable = false
      smf.push(tf)

      if (doiImportData && doiImportData.authors.length > 0) {
        for (let author of doiImportData.authors) {
          let role = fields.getField('role-extended')
          role.type = author.type
          role.nameBackgroundColor = self.config.mandatorybgcolor
          role.firstnameBackgroundColor = self.config.mandatorybgcolor
          role.lastnameBackgroundColor = self.config.mandatorybgcolor
          role.roleBackgroundColor = self.config.mandatorybgcolor
          role.affiliationBackgroundColor = self.config.mandatorybgcolor
          role.enableOrgTree = self.config.enableorgtree
          role.enableAffTree = self.config.enableafftree
          role.role = 'role:aut'
          if ((self.submitformparam === 'journal-article') || (self.submitformparam === 'book-part')) {
            role.hideRole = true
            role.label = 'Author'
          }
          role.roleVocabulary = 'irrolepredicate'
          role.ordergroup = 'roles'
          role.firstname = author['firstname'] ? author['firstname'] : ''
          role.lastname = author['lastname'] ? author['lastname'] : ''
          role.showIdentifierType = false
          role.identifierType = 'ids:orcid'
          role.identifierLabel = 'ORCID'
          role.identifierText = author['orcid'] ? author['orcid'] : ''
          if (author['affiliation']) {
            role.affiliationType = 'other'
            // iterate, although currently multiple affiliations are not supported
            for (let af of author['affiliation']) {
              role.affiliationText = af
              break
            }
          } else {
            role.affiliationType = ''
          }
          if (author.type === 'schema:Organization') {
            role.organizationType = 'other'
            role.organizationText = author['name']
          }
          smf.push(role)
        }
      } else {
        let role = fields.getField('role-extended')
        role.nameBackgroundColor = self.config.mandatorybgcolor
        role.firstnameBackgroundColor = self.config.mandatorybgcolor
        role.lastnameBackgroundColor = self.config.mandatorybgcolor
        role.roleBackgroundColor = self.config.mandatorybgcolor
        role.affiliationBackgroundColor = self.config.mandatorybgcolor
        role.enableOrgTree = self.config.enableorgtree
        role.enableAffTree = self.config.enableafftree
        role.role = 'role:aut'
        role.type = 'schema:Person'
        role.enableTypeSelect = false
        if ((self.submitformparam === 'journal-article') || (self.submitformparam === 'book-part')) {
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
      vtf.showValueDefinition = true
      vtf.backgroundColor = self.config.mandatorybgcolor
      smf.push(vtf)

      let issued = fields.getField('date-edtf')
      issued.mainSubmitDate = true // we need to find this field again when changing predicates
      issued.picker = true
      issued.type = 'dcterms:issued'
      issued.hideType = true
      issued.dateLabel = 'Date issued'
      issued.multiplicable = false
      issued.backgroundColor = self.config.mandatorybgcolor
      if (doiImportData && doiImportData.dateIssued) {
        issued.value = doiImportData.dateIssued
      }
      smf.push(issued)

      let lmf = fields.getField('language')
      lmf.multiplicable = false
      if (doiImportData && doiImportData.language) {
        lmf.value = doiImportData.language
      }
      lmf.backgroundColor = self.config.mandatorybgcolor
      smf.push(lmf)

      let otf = fields.getField('object-type')
      otf.vocabulary = self.irObjectTypeVocabulary
      otf.multiplicable = false
      otf.label = 'Type of publication'
      otf.showValueDefinition = true
      otf.backgroundColor = self.config.mandatorybgcolor
      if (doiImportData && doiImportData.publicationTypeId) {
        otf.value = doiImportData.publicationTypeId
      }
      if (self.submitformparam === 'book') {
        otf.value = 'https://pid.phaidra.org/vocabulary/47QB-8QF1'
        otf.disabled = true
      }
      if (self.submitformparam === 'book-part') {
        otf.value = 'https://pid.phaidra.org/vocabulary/XA52-09WA'
        otf.disabled = true
      }
      smf.push(otf)

      if (self.submitformparam === 'book-part') {
        let sf = fields.getField('contained-in')
        sf.titleBackgroundColor = self.config.mandatorybgcolor
        sf.publisherBackgroundColor = self.config.mandatorybgcolor
        sf.label = 'Appeared in'
        sf.multilingual = false
        sf.rolesVocabulary = self.config.containedinrolevocab
        sf.series[0].multiplicableCleared = true
        sf.hideSeriesIssn = true
        sf.hideSeriesIssue = true
        sf.hideSeriesIssued = true
        sf.collapseSeries = true
        sf.hidePages = false
        sf.publicationType = 'other'
        sf.publisherSearch = false
        sf.publisherShowDate = true
        sf.publisherShowPlace = self.config.bookpublisherplace
        sf.publisherHideType = !self.config.enableorgpublisher
        sf.publishingDateLabel = self.config.bookpublisherdatelabel
        sf.publishingDatePicker = self.config.bookpublisherdatepicker
        sf.publisherLabel = 'PUBLISHER_VERLAG'
        sf.dateFormatHint = self.config.dateformathint
        sf.enableOrgTree = self.config.enableorgtree
        if (doiImportData) {
          if (doiImportData.pageStart) {
            sf.pageStart = doiImportData.pageStart
          }
          if (doiImportData.pageEnd) {
            sf.pageEnd = doiImportData.pageEnd
          }
          if (doiImportData.publisher) {
            sf.publisherName = doiImportData.publisher
          }
          if (doiImportData.dateIssued) {
            sf.publishingDate = doiImportData.dateIssued
          }
        }
        smf.push(sf)
      }

      if ((self.submitformparam === 'book')) {
        let pf = fields.getField('bf-publication')
        pf.publisherBackgroundColor = self.config.mandatorybgcolor
        pf.publishingDateBackgroundColor = self.config.mandatorybgcolor
        pf.publisherSearch = false
        pf.multiplicable = false
        pf.showDate = true
        pf.showPlace = self.config.bookpublisherplace
        pf.hideType = !self.config.enableorgpublisher
        pf.publishingDateLabel = self.config.bookpublisherdatelabel
        pf.publishingDatePicker = self.config.bookpublisherdatepicker
        pf.label = 'PUBLISHER_VERLAG'
        pf.dateFormatHint = self.config.dateformathint
        pf.enableOrgTree = self.config.enableorgtree
        if (doiImportData && doiImportData.publisher) {
          pf.publisherName = doiImportData.publisher
        }
        if (doiImportData && doiImportData.dateIssued) {
          pf.publishingDate = doiImportData.dateIssued
        }
        smf.push(pf)
      }

      let arf = fields.getField('access-right')
      arf.vocabulary = 'iraccessright'
      arf.backgroundColor = self.config.mandatorybgcolor
      arf.showValueDefinition = true
      smf.push(arf)

      let embargoDate = fields.getField('date-edtf')
      embargoDate.picker = true
      embargoDate.backgroundColor = self.config.mandatorybgcolor
      embargoDate.type = 'dcterms:available'
      embargoDate.hideType = true
      embargoDate.dateLabel = 'Embargo date'
      embargoDate.dateFormatHint = self.config.dateformathint
      embargoDate.multiplicable = false
      smf.push(embargoDate)

      let lic = fields.getField('license')
      if (doiImportData && doiImportData.license) {
        lic.value = doiImportData.license
      }
      lic.backgroundColor = self.config.mandatorybgcolor
      smf.push(lic)

      self.form.sections.push(
        {
          title: self.$t('Mandatory fields'),
          type: 'digitalobject',
          obligation: 'mandatory',
          id: 5,
          fields: smf
        }
      )

      let sof = []

      // handled by submit-ir-description-keyword component
      sof.push(fields.getField('abstract'))
      self.keywordsValue = []
      let keyws = fields.getField('keyword')
      if (doiImportData) {
        if (doiImportData.keywords) {
          keyws.value = doiImportData.keywords
          self.keywordsValue = doiImportData.keywords
        }
      }
      sof.push(keyws)

      // handled by submit-ir-funding-field component
      let pof = fields.getField('project')
      pof.label = 'Funder/Project'
      pof.multiplicable = true
      pof.multiplicableCleared = true
      pof.subloopFlag = true
      sof.push(pof)

      if ((self.submitformparam === 'book')) {
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
        if (doiImportData && doiImportData.ISBN) {
          isbn.value = doiImportData.ISBN
        }
        sof.push(isbn)
      }

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

      if (self.submitformparam === 'book') {
        let nop = fields.getField('number-of-pages')
        nop.multiplicable = false
        sof.push(nop)
      }

      if ((self.submitformparam === 'journal-article') || (self.submitformparam === 'book')) {
        let sf = fields.getField('series')
        sf.multilingual = false
        sf.multiplicableCleared = self.submitformparam === 'book'
        sf.hideIdentifier = true
        sf.label = self.submitformparam === 'book' ? 'Series' : 'Journal/Series'
        sf.hidePages = self.submitformparam !== 'journal-article'
        sf.hideIssue = self.submitformparam !== 'journal-article'
        sf.hideIssued = self.submitformparam !== 'journal-article'
        sf.hideIssn = self.submitformparam !== 'journal-article'
        sf.issuedDatePicker = true
        sf.dateFormatHint = self.config.dateformathint
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

      if (self.submitformparam === 'journal-article') {
        let pf = fields.getField('bf-publication')
        pf.multiplicable = false
        pf.showPlace = false
        pf.showDate = false
        pf.label = 'PUBLISHER_VERLAG'
        pf.publisherType = 'other'
        pf.enableOrgTree = self.config.enableorgtree
        pf.dateFormatHint = self.config.dateformathint
        if (doiImportData && doiImportData.publisher) {
          pf.publisherName = doiImportData.publisher
        }
        pf.hideType = !self.config.enableorgpublisher
        sof.push(pf)
      }

      self.form.sections.push(
        {
          title: self.$t('Optional fields'),
          type: 'digitalobject',
          obligation: 'optional',
          id: 6,
          fields: sof
        }
      )

      self.checkSeriesPosition()

      self.$nextTick().then(function () {
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
    continueForm: function (step) {
      if (step === 5) {
        this.validateMandatory()
      }
      if (this.validationStatus !== 'error') {
        this.step = step + 1
      }
      if (process.browser) {
        if (navigator.userAgent.indexOf('Firefox') > -1) {
          document.querySelector('#app').scrollIntoView()
        } else {
          this.$vuetify.goTo(1)
        }
      }
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
      if (process.browser) {
        if (navigator.userAgent.indexOf('Firefox') > -1) {
          document.querySelector('#app').scrollIntoView()
        } else {
          this.$vuetify.goTo(1)
        }
      }
    },
    validateMandatory: function () {
      this.validationStatus = ''
      this.validationErrors = []
      let hasLocalAffiliation = false
      for (let s of this.form.sections) {
        if (s.obligation === 'mandatory') {
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
              if ((this.showEmbargoDate || f.type !== 'dcterms:available') && (!f.hidden)) {
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
      if (!hasLocalAffiliation) {
        this.validationStatus = 'error'
        this.validationErrors.push(this.$t('ERROR_AFFILIATION', { institution: this.$t(this.config.institution) }))
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

        let response = await this.$http.request({
          method: 'POST',
          url: this.$store.state.config.api + '/ir/notifications',
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-XSRF-TOKEN': this.$store.state.user.token
          },
          data: httpFormData
        })

        if (response.data.alerts && response.data.alerts.length > 0) {
          this.$store.commit('setAlerts', response.data.alerts)
        }

        if (response.data.status === 200) {
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
      self.submitResponse = null
      self.$store.dispatch('loadLanguages', self.$i18n.locale)
      self.step = 1
      self.maxStep = 0
      self.doiImportInput = null
      self.doiImportData = null
      self.doiImportErrors = []
      self.validationStatus = ''
      self.validationErrors = []
      self.journalSearchQuery = null
      self.journalSearchISSN = null
      self.journalSearchItems = []
      self.journalSearchSelected = []
      self.resetForm(self, null)
    },
    resetDOIImport: function () {
      this.doiImportInput = null
      this.doiImportData = null
      this.doiImportErrors = []
      this.journalSearchQuery = null
      this.journalSearchISSN = null
      this.journalSearchItems = []
      this.journalSearchSelected = []
      this.resetForm(this, null)
    }
  },
  beforeRouteEnter: async function (to, from, next) {
    next(async vm => {
      vm.$store.commit('setSkipsubmitrouteleavehook', false)
      if (!vm.signedin) {
        vm.$router.push('/login')
      }
      await vm.checkAllowSubmit()
      vm.resetSubmission(vm)
    })
  },
  beforeRouteUpdate: async function (to, from, next) {
    this.$store.commit('setSkipsubmitrouteleavehook', false)
    if (!this.signedin) {
      this.$router.push('/login')
    }
    await this.checkAllowSubmit()
    this.resetSubmission(this)
    next()
  },
  beforeRouteLeave: async function (to, from, next) {
    if ((this.step === 8) && (to.name === 'submit')) {
      this.confirmBackDialog = true
      next(Error('Please confirm to exit the submitform'))
    } else {
      if ((this.step === 7) && (to.name === 'submit') && this.loading) {
        this.submitBackDialog = true
        next(Error('Submit in progress'))
      } else {
        if ((this.step > 1) && (to.name === 'submit') && (!this.$store.state.skipsubmitrouteleavehook)) {
          this.step = this.step - 1
          this.$vuetify.goTo(1)
          next(false)
        } else {
          next()
        }
      }
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
