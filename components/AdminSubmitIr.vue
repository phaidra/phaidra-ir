<template>
  <div>
    <v-dialog
      v-model="showJsonViewer"
      scrollable
      max-width="700px"
    >
      <v-card>
      <v-card-title class="text-h5 primary">
        <span style="color: white;">Metadata JSON</span>
      </v-card-title>
      <v-card-text>
        <v-card>
          <div class="error-display-container">
            <div class="msg-container">
              <json-viewer :value="selectedUcrisInfo"></json-viewer>
            </div>
          </div>
        </v-card>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="showJsonViewer = false">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
    </v-dialog>
    <template v-if="importData">
      <v-alert v-if="(importData.unknownpredicates.length > 0) || (importData.errors.length > 0)" :type="'error'">
        {{ $t('This object contains metadata not supperted by institutional repository. Please check metadata in Phaidra metadataeditor!') }}
        <ul>
          <li v-for="(pred, i) in importData.unknownpredicates" :key="'up'+i">{{ pred }}</li>
        </ul>
        <ul>
          <li v-for="(err, i) in importData.errors" :key="'er'+i">{{ err }}</li>
        </ul>
      </v-alert>
    </template>

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
      <v-stepper-header :class="targetPid ? 'mdeditor-header' : ''">
        <v-stepper-step v-if="!targetPid" edit-icon='mdi-check' :editable="true" :complete="step > 3" step="3">{{ $t('Import') }}</v-stepper-step>
        <v-divider v-if="!targetPid"></v-divider>
        <v-stepper-step edit-icon='mdi-check' :editable="true" :complete="step > 5" step="5" :rules="[() => validationStatus !== 'error']">{{ $t('Mandatory fields') }} <small v-if="validationStatus === 'error'">{{ $t('Invalid metadata') }}</small></v-stepper-step>
        <v-divider v-if="!targetPid"></v-divider>
        <v-stepper-step edit-icon='mdi-check' :editable="true" :complete="step > 6" step="6">{{ $t('Optional fields') }}</v-stepper-step>
        <v-divider v-if="!targetPid"></v-divider>
        <v-stepper-step v-if="!targetPid" edit-icon='mdi-check' :editable="true" :complete="maxStep > 7" step="7" @click="updateJsonld()">{{ $t('Submit') }}</v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>

        <v-stepper-content v-if="!targetPid" step="3" :class="{ 'pad-0': doiImportDataForUcris }">
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
                <v-text-field v-if="!showDoiSearch" :error-messages="doiImportErrors" filled v-model="doiImportInput" label="DOI" :placeholder="$t('please enter')"/>
                <v-text-field v-if="showDoiSearch" :error-messages="doiSearchErrors" filled v-model="doiSearchInput" label="DOI Search" :placeholder="$t('please enter')"/>
              </v-col>
              <v-col cols="3" class="ml-4 mt-2" v-if="!showDoiSearch">
                <v-btn :loading="loading" :disabled="loading || !doiToImport || (doiToImport.lenght < 1)" class="mx-2" color="primary" @click="importDOI()">{{ $t('Import') }}</v-btn>
                <v-btn :loading="loading" :disabled="loading" class="mx-2" dark color="grey" @click="resetDOIImport()">{{ $t('Reset') }}</v-btn>
              </v-col>
              <v-col cols="3" class="ml-4 mt-2" v-else>
                <v-btn :loading="loading" :disabled="loading" class="mx-2" color="primary" @click="searchForDoiRecord()">{{ $t('Search') }}</v-btn>
              </v-col>
            </v-row>
            <div v-if="showDoiSearchTable" class="col col-10 offset-2">
              <!-- <doi-search-results
                :docs="doiSearchResultDocs"
                :total="doiSearchTotal">
              </doi-search-results> -->
              <v-row v-for="(doc, i) in this.doiSearchResultDocs" :key="'doc'+i">
                <v-col cols="4">
                  {{ doc.title[0] | truncate(100) }}
                </v-col>
                <v-col cols="4">
                  {{ doc.DOI}}
                </v-col>
                <v-col cols="2">
                  <v-spacer></v-spacer>
                  <v-btn class="mx-1 font-weight-regular" @click="importDoiFromSearchRow(doc)" color="primary">Show Metadata</v-btn>
                </v-col>
              </v-row>
            </div>
            <v-alert outlined type="error" color="primary" transition="slide-y-transition" v-if="doiDuplicate">
              <span class="mr-2 black--text">{{ $t('Possible duplicate found') }}:</span><a target="_blank" :href="'https://' + config.phaidrabaseurl + '/' + doiDuplicate.pid">{{ doiDuplicate.title }}</a>
            </v-alert>
            <v-slide-y-transition>
              <v-row no-gutters justify="center">
                <v-col v-if="doiImportDataForUcris" :cols="uCrisId && doiImportDataForUcris ? '6' :'5'" :class="{'ucris-metadbox-container': !doiImportDataForUcris}">
                  <v-card>
                    <v-card-title class="title font-weight-light grey white--text">{{ $t('u:cris Metadata') }}
                      <v-checkbox
                        name="ucris"
                        v-model="isImportUcris"
                        @change="importMetaBoxCheckChange('ucris', isImportUcris)"
                      ></v-checkbox>
                      <v-btn
                        icon
                        @click="showJsonViewer = true"
                      >
                        <v-icon>info</v-icon>
                      </v-btn>
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <v-row ref="item1TitleRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Title') }}</v-col>
                          <v-col v-if="doiImportDataForUcris.title" md="8" cols="12">{{ doiImportDataForUcris.title }}</v-col>
                          <v-col v-if="doiImportDataForUcris.title" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="ucrisTitle"
                              v-model="ucrisSelectedFields.title"
                              @change="ucrisCheckFieldChange('title', ucrisSelectedFields.title)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item1SubtitleRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Subtitle') }}</v-col>
                          <v-col v-if="doiImportDataForUcris.subtitle" md="8" cols="12">{{ doiImportDataForUcris.subtitle }}</v-col>
                          <v-col v-if="doiImportDataForUcris.subtitle" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="ucrissubtitle"
                              v-model="ucrisSelectedFields.subtitle"
                              @change="ucrisCheckFieldChange('subtitle', ucrisSelectedFields.subtitle)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item1DateIssuedRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Date issued') }}</v-col>
                          <v-col v-if="doiImportDataForUcris.dateIssued" md="8" cols="12">{{ doiImportDataForUcris.dateIssued }}</v-col>
                          <v-col v-if="doiImportDataForUcris.dateIssued" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="ucrisdateIssued"
                              v-model="ucrisSelectedFields.dateIssued"
                              @change="ucrisCheckFieldChange('dateIssued', ucrisSelectedFields.dateIssued)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <div class="author-container" ref="doiImportDataForUcrisAuthorsRef">
                          <v-row v-for="(author, i) of doiImportDataForUcris.authors" :key="'aut'+i">
                            <v-col v-if="i === 0" md="2" cols="12" class="primary--text text-right">{{ $t('Authors') }}</v-col>
                            <v-col v-else md="2" cols="12"></v-col>
                            <v-col md="8" cols="12" v-if="author.firstname || author.lastname"><span class="font-weight-regular">{{ author.firstname + ' ' + author.lastname }}</span><span v-if="author['orcid']"> ({{ author['orcid'] }})</span>
                              <template v-if="author['affiliation']">
                                <template v-for="(af, i) in author['affiliation']"><p :key="'doiaf'+i">{{ af }}</p></template>
                              </template>
                            </v-col>
                            <v-col md="8" cols="12" v-else><span class="font-weight-regular">{{ author.name }}</span></v-col>
                            <v-col md="2" cols="12" class="primary--text text-right">
                              <v-checkbox
                                name="ucrisauthors"
                                v-model="ucrisSelectedFields.authors"
                                @change="ucrisCheckFieldChange('authors', ucrisSelectedFields.authors)"
                              ></v-checkbox>
                            </v-col>
                          </v-row>
                        </div>
                        <v-row ref="item1KeywordRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Keywords') }}</v-col>
                          <!-- <div v-if="doiImportDataForUcris.keywords"> -->
                            <v-col v-if="doiImportDataForUcris.keywords" md="8" cols="12"><v-chip :key="'kw' + i" v-for="(kw, i) in doiImportDataForUcris.keywords" class="mr-2 mb-2">{{kw}}</v-chip></v-col>
                            <v-col v-if="doiImportDataForUcris.keywords && doiImportDataForUcris.keywords.length" md="2" cols="12" class="primary--text text-right">
                              <v-checkbox
                                name="ucriskeywords"
                                v-model="ucrisSelectedFields.keywords"
                                @change="ucrisCheckFieldChange('keywords', ucrisSelectedFields.keywords)"
                              ></v-checkbox>
                            </v-col>
                          <!-- </div> -->
                        </v-row>
                        <v-row ref="item1LanguageRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Language') }}</v-col>
                          <v-col v-if="doiImportDataForUcris.language" md="8" cols="12">{{ doiImportDataForUcris.language }}</v-col>
                          <v-col v-if="doiImportDataForUcris.language" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="ucrislanguage"
                              v-model="ucrisSelectedFields.language"
                              @change="ucrisCheckFieldChange('language', ucrisSelectedFields.language)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item1PublicationRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Type of publication') }}</v-col>
                          <v-col v-if="doiImportDataForUcris.publicationType" md="8" cols="12">{{ doiImportDataForUcris.publicationType }}</v-col>
                          <v-col v-if="doiImportDataForUcris.publicationType" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="ucrispublicationType"
                              v-model="ucrisSelectedFields.publicationType"
                              @change="ucrisCheckFieldChange('publicationType', ucrisSelectedFields.publicationType)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item1PublisherRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('PUBLISHER_VERLAG') }}</v-col>
                          <v-col v-if="doiImportDataForUcris.publisher" md="8" cols="12">{{ doiImportDataForUcris.publisher }}</v-col>
                          <v-col v-if="doiImportDataForUcris.publisher" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="ucrispublisher"
                              v-model="ucrisSelectedFields.publisher"
                              @change="ucrisCheckFieldChange('publisher', ucrisSelectedFields.publisher)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item1AppearedRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Appeared in') }}</v-col>
                          <v-col v-if="doiImportDataForUcris.journalTitle" md="8" cols="12">{{ doiImportDataForUcris.journalTitle }}</v-col>
                          <v-col v-if="doiImportDataForUcris.journalTitle" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="ucrisjournalTitle"
                              v-model="ucrisSelectedFields.journalTitle"
                              @change="ucrisCheckFieldChange('journalTitle', ucrisSelectedFields.journalTitle)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item1IssnRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('ISSN') }}</v-col>
                          <v-col v-if="doiImportDataForUcris.journalISSN" md="8" cols="12">{{ doiImportDataForUcris.journalISSN }}</v-col>
                          <v-col v-if="doiImportDataForUcris.journalISSN" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="ucrisjournalISSN"
                              v-model="ucrisSelectedFields.journalISSN"
                              @change="ucrisCheckFieldChange('journalISSN', ucrisSelectedFields.journalISSN)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item1VolumeRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Volume') }}</v-col>
                          <v-col v-if="doiImportDataForUcris.journalVolume" md="8" cols="12">{{ doiImportDataForUcris.journalVolume }}</v-col>
                          <v-col v-if="doiImportDataForUcris.journalVolume" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="ucrisjournalVolume"
                              v-model="ucrisSelectedFields.journalVolume"
                              @change="ucrisCheckFieldChange('journalVolume', ucrisSelectedFields.journalVolume)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item1IssueRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Issue') }}</v-col>
                          <v-col v-if="doiImportDataForUcris.journalIssue" md="8" cols="12">{{ doiImportDataForUcris.journalIssue }}</v-col>
                          <v-col v-if="doiImportDataForUcris.journalIssue" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="ucrisjournalIssue"
                              v-model="ucrisSelectedFields.journalIssue"
                              @change="ucrisCheckFieldChange('journalIssue', ucrisSelectedFields.journalIssue)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item1StartRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Start page') }}</v-col>
                          <v-col v-if="doiImportDataForUcris.pageStart" md="8" cols="12">{{ doiImportDataForUcris.pageStart }}</v-col>
                          <v-col v-if="doiImportDataForUcris.pageStart" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="ucrispageStart"
                              v-model="ucrisSelectedFields.pageStart"
                              @change="ucrisCheckFieldChange('pageStart', ucrisSelectedFields.pageStart)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item1EndRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('End page') }}</v-col>
                          <v-col v-if="doiImportDataForUcris.pageEnd" md="8" cols="12">{{ doiImportDataForUcris.pageEnd }}</v-col>
                          <v-col v-if="doiImportDataForUcris.pageEnd" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="ucrispageEnd"
                              v-model="ucrisSelectedFields.pageEnd"
                              @change="ucrisCheckFieldChange('pageEnd', ucrisSelectedFields.pageEnd)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item1IsbnRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('ISBN') }}</v-col>
                          <v-col v-if="doiImportDataForUcris.ISBN" md="8" cols="12">{{ doiImportDataForUcris.ISBN }}</v-col>
                          <v-col v-if="doiImportDataForUcris.ISBN" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="ucrisISBN"
                              v-model="ucrisSelectedFields.ISBN"
                              @change="ucrisCheckFieldChange('ISBN', ucrisSelectedFields.ISBN)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item1LLicenseRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('License') }}</v-col>
                          <v-col v-if="doiImportDataForUcris.license" md="8" cols="12">{{ doiImportDataForUcris.licenceLabel }}</v-col>
                          <v-col v-if="doiImportDataForUcris.license" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="ucrislicense"
                              v-model="ucrisSelectedFields.license"
                              @change="ucrisCheckFieldChange('license', ucrisSelectedFields.license)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Access Rights') }}</v-col>
                          <v-col v-if="doiImportDataForUcris.accessrights" md="8" cols="12">{{ doiImportDataForUcris.accessRightsLabel }}</v-col>
                          <v-col v-if="doiImportDataForUcris.accessrights" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="ucrisaccessrights"
                              v-model="ucrisSelectedFields.accessrights"
                              @change="ucrisCheckFieldChange('accessrights', ucrisSelectedFields.accessrights)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Version') }}</v-col>
                          <v-col v-if="doiImportDataForUcris.version" md="8" cols="12">{{ doiImportDataForUcris.versionLabel }}</v-col>
                          <v-col v-if="doiImportDataForUcris.version" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="ucrisversion"
                              v-model="ucrisSelectedFields.version"
                              @change="ucrisCheckFieldChange('version', ucrisSelectedFields.version)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col  v-if="doiImportData" :cols="uCrisId && doiImportDataForUcris ? '6' :'12'"  :md="uCrisId && doiImportDataForUcris ? '6' :'7'">
                  <v-card>
                    <v-card-title class="title font-weight-light grey white--text">{{ $t('Following metadata were retrieved') }}
                      <p class="m-0 ml-2" v-if="metaProviderName"> (Agency: {{ metaProviderName }})</p>
                      <v-checkbox
                        name="crossref"
                        v-model="isImportCrossRef"
                        @change="importMetaBoxCheckChange('crossref', isImportCrossRef)"
                      ></v-checkbox>
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <v-row ref="item2TitleRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Title') }}</v-col>
                          <v-col v-if="doiImportData.title" md="8" cols="12">{{ doiImportData.title }}</v-col>
                          <v-col v-if="doiImportData.title" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="crossReftitle"
                              v-model="crossRefSelectedFields.title"
                              @change="crossRefCheckFieldChange('title', crossRefSelectedFields.title)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item2SubtitleRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Subtitle') }}</v-col>
                          <v-col v-if="doiImportData.subtitle" md="8" cols="12">{{ doiImportData.subtitle }}</v-col>
                          <v-col v-if="doiImportData.subtitle" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="crossRefsubtitle"
                              v-model="crossRefSelectedFields.subtitle"
                              @change="crossRefCheckFieldChange('subtitle', crossRefSelectedFields.subtitle)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item2DateIssuedRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Date issued') }}</v-col>
                          <v-col v-if="doiImportData.dateIssued" md="8" cols="12">{{ doiImportData.dateIssued }}</v-col>
                          <v-col v-if="doiImportData.dateIssued" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="crossRefdateIssued"
                              v-model="crossRefSelectedFields.dateIssued"
                              @change="crossRefCheckFieldChange('dateIssued', crossRefSelectedFields.dateIssued)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <div class="author-container" ref="doiImportDataAuthorsRef">
                          <v-row v-for="(author, i) of doiImportData.authors" :key="'aut'+i">
                            <v-col v-if="i === 0" md="2" cols="12" class="primary--text text-right">{{ $t('Authors') }}</v-col>
                            <v-col v-else md="2" cols="12"></v-col>
                            <v-col md="8" cols="12" v-if="author.firstname || author.lastname"><span class="font-weight-regular">{{ author.firstname + ' ' + author.lastname }}</span><span v-if="author['orcid']"> ({{ author['orcid'] }})</span>
                              <template v-if="author['affiliation']">
                                <template v-for="(af, i) in author['affiliation']"><p :key="'doiaf'+i">{{ af }}</p></template>
                              </template>
                            </v-col>
                            <v-col md="8" cols="12" v-else><span class="font-weight-regular">{{ author.name }}</span></v-col>
                            <v-col md="2" cols="12" class="primary--text text-right">
                              <v-checkbox
                                name="crossRefauthors"
                                v-model="crossRefSelectedFields.authors"
                                @change="crossRefCheckFieldChange('authors', crossRefSelectedFields.authors)"
                              ></v-checkbox>
                            </v-col>
                          </v-row>
                        </div>
                        <v-row ref="item2KeywordRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Keywords') }}</v-col>
                          <v-col v-if="doiImportData.keywords" md="8" cols="12"><v-chip :key="'kw' + i" v-for="(kw, i) in doiImportData.keywords" class="mr-2 mb-2">{{kw}}</v-chip></v-col>
                          <v-col v-if="doiImportData.keywords && doiImportData.keywords.length" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="crossRefkeywords"
                              v-model="crossRefSelectedFields.keywords"
                              @change="crossRefCheckFieldChange('keywords', crossRefSelectedFields.keywords)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item2LanguageRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Language') }}</v-col>
                          <v-col v-if="doiImportData.language" md="8" cols="12">{{ doiImportData.language }}</v-col>
                          <v-col v-if="doiImportData.language" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="crossReflanguage"
                              v-model="crossRefSelectedFields.language"
                              @change="crossRefCheckFieldChange('language', crossRefSelectedFields.language)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item2PublicationRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Type of publication') }}</v-col>
                          <v-col v-if="doiImportData.publicationType" md="8" cols="12">{{ doiImportData.publicationType }}</v-col>
                          <v-col v-if="doiImportData.publicationType" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="crossRefpublicationType"
                              v-model="crossRefSelectedFields.publicationType"
                              @change="crossRefCheckFieldChange('publicationType', crossRefSelectedFields.publicationType)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item2PublisherRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('PUBLISHER_VERLAG') }}</v-col>
                          <v-col v-if="doiImportData.publisher" md="8" cols="12">{{ doiImportData.publisher }}</v-col>
                          <v-col v-if="doiImportData.publisher" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="crossRefpublisher"
                              v-model="crossRefSelectedFields.publisher"
                              @change="crossRefCheckFieldChange('publisher', crossRefSelectedFields.publisher)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item2AppearedRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Appeared in') }}</v-col>
                          <v-col v-if="doiImportData.journalTitle" md="8" cols="12">{{ doiImportData.journalTitle }}</v-col>
                          <v-col v-if="doiImportData.journalTitle" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="crossRefjournalTitle"
                              v-model="crossRefSelectedFields.journalTitle"
                              @change="crossRefCheckFieldChange('journalTitle', crossRefSelectedFields.journalTitle)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item2IssnRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('ISSN') }}</v-col>
                          <v-col v-if="doiImportData.journalISSN" md="8" cols="12">{{ doiImportData.journalISSN }}</v-col>
                          <v-col v-if="doiImportData.journalISSN" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="crossRefjournalISSN"
                              v-model="crossRefSelectedFields.journalISSN"
                              @change="crossRefCheckFieldChange('journalISSN', crossRefSelectedFields.journalISSN)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item2VolumeRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Volume') }}</v-col>
                          <v-col v-if="doiImportData.journalVolume" md="8" cols="12">{{ doiImportData.journalVolume }}</v-col>
                          <v-col v-if="doiImportData.journalVolume" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="crossRefjournalVolume"
                              v-model="crossRefSelectedFields.journalVolume"
                              @change="crossRefCheckFieldChange('journalVolume', crossRefSelectedFields.journalVolume)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item2IssueRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Issue') }}</v-col>
                          <v-col v-if="doiImportData.journalIssue" md="8" cols="12">{{ doiImportData.journalIssue }}</v-col>
                          <v-col v-if="doiImportData.journalIssue" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="crossRefjournalIssue"
                              v-model="crossRefSelectedFields.journalIssue"
                              @change="crossRefCheckFieldChange('journalIssue', crossRefSelectedFields.journalIssue)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item2StartRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Start page') }}</v-col>
                          <v-col v-if="doiImportData.pageStart" md="8" cols="12">{{ doiImportData.pageStart }}</v-col>
                          <v-col v-if="doiImportData.pageStart" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="crossRefpageStart"
                              v-model="crossRefSelectedFields.pageStart"
                              @change="crossRefCheckFieldChange('pageStart', crossRefSelectedFields.pageStart)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item2EndRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('End page') }}</v-col>
                          <v-col v-if="doiImportData.pageEnd" md="8" cols="12">{{ doiImportData.pageEnd }}</v-col>
                          <v-col v-if="doiImportData.pageEnd" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="crossRefpageEnd"
                              v-model="crossRefSelectedFields.pageEnd"
                              @change="crossRefCheckFieldChange('pageEnd', crossRefSelectedFields.pageEnd)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item2IsbnRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('ISBN') }}</v-col>
                          <v-col v-if="doiImportData.ISBN" md="8" cols="12">{{ doiImportData.ISBN }}</v-col>
                          <v-col v-if="doiImportData.ISBN" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="crossRefISBN"
                              v-model="crossRefSelectedFields.ISBN"
                              @change="crossRefCheckFieldChange('ISBN', crossRefSelectedFields.ISBN)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item2LLicenseRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('License') }}</v-col>
                          <v-col v-if="doiImportData.license" md="8" cols="12">{{ doiImportData.licenceLabel }}</v-col>
                          <v-col v-if="doiImportData.license" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="crossReflicense"
                              v-model="crossRefSelectedFields.license"
                              @change="crossRefCheckFieldChange('license', crossRefSelectedFields.license)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                        <v-row ref="item2AccessRightsRef">
                          <v-col md="2" cols="12" class="primary--text text-right">{{ $t('Access Rights') }}</v-col>
                          <v-col v-if="doiImportData.accessrights" md="8" cols="12">{{ doiImportData.accessrightsLabel }}</v-col>
                          <v-col v-if="doiImportData.accessrights" md="2" cols="12" class="primary--text text-right">
                            <v-checkbox
                              name="crossRefAccessRights"
                              v-model="crossRefSelectedFields.accessrights"
                              @change="crossRefCheckFieldChange('accessrights', crossRefSelectedFields.accessrights)"
                            ></v-checkbox>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-slide-y-transition>
            <v-divider class="mt-5 mb-7"></v-divider>
            <v-row no-gutters class="justify-end">
              <v-btn v-if="doiImportData || doiImportDataForUcris" @click="firstMetaTabContinue()" color="primary">{{ $t('Continue') }}</v-btn>
              <v-btn v-else @click="step = 5; $vuetify.goTo(1)" color="primary">{{ $t('Skip') }}</v-btn>
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
                    :keywordsValue="keywordsValue"
                    :descriptionValue="descriptionValue"
                    :language="kwDescLanguage"
                    v-on:input-description="setDescription(s, $event)"
                    v-on:input-keywords="setKeywords(s, $event)"
                    v-on:input-language="setDescriptionAndKeywordsLanguage(s, $event)"
                    :inputStyle="inputStyle"
                    :multilingual="typeof importData !== 'undefined'"
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
                        v-on:configure="editFieldProps(f)"
                        :configurable="enablefieldconfig || f.configurable"
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
                        v-on:configure="editFieldProps(f)"
                        :configurable="enablefieldconfig || f.configurable"
                        :inputStyle="inputStyle"
                        class="my-2"
                      ></p-i-title>
                    </template>

                    <template v-else-if="f.component === 'p-select'">
                      <p-i-select
                        v-show="(f.predicate !== 'ebucore:hasMimeType') && (f.predicate !== 'dcterms:type') && (targetPid || !((f.predicate === 'edm:hasType') && ((submitformparam === 'book-part') || (submitformparam === 'book'))))"
                        v-bind.sync="f"
                        v-on:input="selectInput(s.fields, f, $event)"
                        v-on:add="addField(s.fields, f)"
                        v-on:remove="removeField(s.fields, f)"
                        v-on:configure="editFieldProps(f)"
                        :configurable="enablefieldconfig || f.configurable"
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
                        v-on:configure="editFieldProps(f)"
                        :configurable="enablefieldconfig || f.configurable"
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
                        v-on:input-identifier-type="setSelected(f, 'identifierType', $event)"
                        v-on:input-page-start="f.pageStart=$event"
                        v-on:input-page-end="f.pageEnd=$event"
                        v-on:add="addField(s.fields, f)"
                        v-on:add-clear="addSeriesClear(s.fields, f)"
                        v-on:remove="removeField(s.fields, f)"
                        v-on:configure="editFieldProps(f)"
                        :configurable="enablefieldconfig || f.configurable"
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
                        v-on:configure="editFieldProps(f)"
                        :configurable="enablefieldconfig || f.configurable"
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
                        v-on:input-page-start="f.pageStart=$event"
                        v-on:input-page-end="f.pageEnd=$event"
                        v-on:input-isbn="f.isbn=$event"
                        v-on:input-identifier-type="setSelected(f, 'identifierType', $event)"
                        v-on:input-identifier="f.identifier = $event"
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
                        v-on:configure="editFieldProps(f)"
                        :configurable="enablefieldconfig || f.configurable"
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
                        v-on:input-affiliation-ror="affiliationRorInput(f, $event)"
                        v-on:input-affiliation-other="f.affiliationText = $event"
                        v-on:change-organization-type="f.organizationType = $event"
                        v-on:input-organization-select="organizationSelectInput(f, $event)"
                        v-on:input-organization-ror="organizationRorInput(f, $event)"
                        v-on:input-organization-other="f.organizationText = $event"
                        v-on:input-role="roleInput(f, $event)"
                        v-on:add-clear="addEntityClear(s.fields, f)"
                        v-on:add="addField(s.fields, f)"
                        v-on:remove="removeField(s.fields, f)"
                        v-on:up="sortFieldUp(s.fields, f)"
                        v-on:down="sortFieldDown(s.fields, f)"
                        v-on:configure="editFieldProps(f)"
                        :configurable="enablefieldconfig || f.configurable"
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
                        v-on:configure="editFieldProps(f)"
                        :configurable="enablefieldconfig || f.configurable"
                        :inputStyle="inputStyle"
                        class="my-2"
                      ></p-i-subject-gnd>
                    </template>

                    <template v-else-if="f.component === 'p-vocab-ext-readonly'">
                      <p-i-vocab-ext-readonly
                        v-bind.sync="f"
                        v-on:remove="removeField(s.fields, f)"
                        v-on:configure="editFieldProps(f)"
                        :configurable="enablefieldconfig || f.configurable"
                        :inputStyle="inputStyle"
                      ></p-i-vocab-ext-readonly>
                    </template>

                    <template v-else-if="f.component === 'p-literal'">
                      <p-i-literal
                        v-bind.sync="f"
                        v-on:input-value="f.value=$event"
                        v-on:add="addField(s.fields, f)"
                        v-on:remove="removeField(s.fields, f)"
                        v-on:configure="editFieldProps(f)"
                        :configurable="enablefieldconfig || f.configurable"
                        :inputStyle="inputStyle"
                        class="my-2"
                      ></p-i-literal>
                    </template>

                    <template v-else-if="f.component === 'p-association'">
                      <p-i-association
                        v-bind.sync="f"
                        v-on:input="selectInput(s.fields, f, $event)"
                        v-on:add="addField(s.fields, f)"
                        v-on:remove="removeField(s.fields, f)"
                        v-on:configure="editFieldProps(f)"
                        :configurable="enablefieldconfig || f.configurable"
                        :inputStyle="inputStyle"
                        class="my-2"
                      ></p-i-association>
                    </template>

                    <template v-else-if="f.component === 'isbn'">
                      <p-i-alternate-identifier
                        v-bind.sync="f"
                        v-on:input-identifier="f.value=$event"
                        v-on:input-identifier-type="setSelected(f, 'type', $event)"
                        v-on:configure="editFieldProps(f)"
                        :configurable="enablefieldconfig || f.configurable"
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
                                      v-on:configure="editFieldProps(f)"
                                      :configurable="enablefieldconfig || f.configurable"
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
                                    v-on:input-identifier-type="setSelected(f, 'identifierType', $event)"
                                    v-on:input-code="f.code=$event"
                                    v-on:add="addProject(s.fields, f)"
                                    v-on:add-clear="addProjectClear(s.fields, f)"
                                    v-on:remove="removeField(s.fields, f)"
                                    v-on:configure="editFieldProps(f)"
                                    :configurable="enablefieldconfig || f.configurable"
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
                            v-on:input-file="setFilename(s.fields, f, $event)"
                            v-on:input-mimetype="setSelected(f, 'mimetype', $event)"
                            v-on:add="addField(s.fields, f)"
                            v-on:remove="removeField(s.fields, f)"
                            v-on:configure="editFieldProps(f)"
                            :configurable="enablefieldconfig || f.configurable"
                            :inputStyle="inputStyle"
                            class="my-2"
                          ></p-i-file>
                        </v-row>
                      </v-col>
                    </template>

                    <template v-else-if="f.component === 'p-filename-readonly'">
                      <p-i-filename-readonly v-show="false" v-bind.sync="f"></p-i-filename-readonly>
                    </template>

                  </v-row>

                </template>

                <v-divider class="mt-5 mb-7"></v-divider>
                <v-row no-gutters justify="space-between">
                  <v-btn dark color="grey" v-if="!(targetPid && s.id == 5)" @click="backForm(s.id)">{{ $t('Back') }}</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn v-if="!(targetPid && s.id == 6)" class="primary float-right" @click="continueForm(s.id)">{{ $t('Continue') }}</v-btn>
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-stepper-content>

        <v-stepper-content step="7">
          <v-container>
            <v-row>
              <v-col md="10" offset-md="1">
                <p-d-jsonld :showLang="false" :jsonld="jsonld" :predicatesToHide="['ebucore:filename', 'ebucore:hasMimeType', 'role:uploader']"></p-d-jsonld>
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
              <v-btn v-if="!targetPid" raised color="primary" :loading="loading" :disabled="loading" @click.once="submit()" :key="clickoncekey">{{ $t('Submit') }}</v-btn>
            </v-row>
          </v-container>
        </v-stepper-content>

      </v-stepper-items>

    </v-stepper>
    <v-btn v-if="targetPid" style="margin-right:120px;" right fixed bottom  @click="validationEnabled = !validationEnabled" :color="validationEnabled ? 'success' : 'warning'">{{ $t(validationEnabled ? 'Validation enabled' : 'Validation disabled')}}</v-btn>
    <v-btn v-if="targetPid" fixed bottom right raised color="primary" :loading="loading" :disabled="loading || (importData.unknownpredicates.length > 0) || (importData.errors.length > 0)" @click="save()">{{ $t('Save') }}</v-btn>
    <code style="display:none;" class="mdeditor-header">{{ getMetadata() }}</code>
  </div>
</template>

<script>
import {constructDataCite} from '@/utils/doiconstructor'
import SubmitIrFundingField from '@/components/SubmitIrFundingField'
import SubmitIrAlternateIdentifier from '@/components/SubmitIrAlternateIdentifier'
import SubmitIrDescriptionKeywords from '@/components/SubmitIrDescriptionKeywords'
import arrays from 'phaidra-vue-components/src/utils/arrays'
import jsonLd from 'phaidra-vue-components/src/utils/json-ld'
import fields from 'phaidra-vue-components/src/utils/fields'
import langUtil from 'phaidra-vue-components/src/utils/lang'
import lang3to2map from 'phaidra-vue-components/src/utils/lang3to2map'
import { context } from '@/mixins/context'
import { config } from '@/mixins/config'
import { vocabulary } from 'phaidra-vue-components/src/mixins/vocabulary'
import { validationrules } from 'phaidra-vue-components/src/mixins/validationrules'
import axios from 'axios'
import {univeJson} from '../utils/univie'

export default {
  mixins: [ context, config, validationrules, vocabulary ],
  components: {
    SubmitIrFundingField,
    SubmitIrDescriptionKeywords,
    SubmitIrAlternateIdentifier
  },
  props: {
    targetPid: String,
    importData: Object,
    submitformType: String,
    enablefieldconfig: {
      type: Boolean,
      default: false
    }
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
      if (this.importData) {
        switch (this.importData['objecttype']) {
          case 'https://pid.phaidra.org/vocabulary/47QB-8QF1':
            return 'book'
          case 'https://pid.phaidra.org/vocabulary/XA52-09WA':
            return 'book-part'
          default:
            return 'journal-article'
        }
      } else {
        return this.submitformType
      }
    },
    irObjectTypeVocabulary: function () {
      switch (this.submitformparam) {
        case 'journal-article':
          return this.targetPid ? 'irobjecttype' : 'irobjecttypearticle'
        default:
          return 'irobjecttype'
      }
    }
  },
  data () {
    return {
      showJsonViewer: false,
      isUcris: false,
      showDoiSearchTable: false,
      uCrisId: null,
      doiSearchResultDocs: [],
      showDoiSearch: false,
      inputStyle: 'filled',
      form: {
        sections: []
      },
      clickoncekey: 0,
      step: 3,
      maxStep: 0,
      loadedMetadata: [],
      loading: false,
      resetDialog: false,
      touCheckbox: false,
      touCheckboxErrors: [],
      doiImportInput: null,
      doiSearchInput: null,
      doiImportData: null,
      doiImportDataForUcris: null,
      doiImportErrors: [],
      doiSearchErrors: [],
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
      jsonld: {},
      keywordsValue: [],
      descriptionValue: '',
      kwDescLanguage: '',
      validationEnabled: true,
      isImportCrossRef: true,
      isImportUcris: false,
      crossRefSelectedFields: {
        title: true,
        subtitle: true,
        dateIssued: true,
        authors: true,
        keywords: true,
        language: true,
        publicationType: true,
        publisher: true,
        journalTitle: true,
        journalISSN: true,
        journalVolume: true,
        journalIssue: true,
        pageStart: true,
        pageEnd: true,
        ISBN: true,
        license: true,
        accessrights: true,
      },
      ucrisSelectedFields: {
        title: false,
        subtitle: false,
        dateIssued: false,
        authors: false,
        keywords: false,
        language: false,
        publicationType: false,
        publisher: false,
        journalTitle: false,
        journalISSN: false,
        journalVolume: false,
        journalIssue: false,
        pageStart: false,
        pageEnd: false,
        ISBN: false,
        license: false,
        accessrights: false,
        version: false,
      },
      selectedUcrisInfo: null,
      metaProviderName: '',
    }
  },
  watch: {
    '$i18n.locale': function(newVal, oldVal) {
      this.doiImportDataForUcris = this.buildUcrisMetadata(this.selectedUcrisInfo)
      this.resetForm(this, this.doiImportDataForUcris)
    },
    step (val) {
      if (val > this.maxStep) {
        this.maxStep = val
      }
      if (val === 7) {
        this.updateJsonld()
      }
    },
    importData: {
      handler: function (val) {
        this.resetSubmission(this)
        this.step = 5
      },
      deep: true
    }
  },
  mounted() {
    if(this?.$route?.query?.type === 'ucris'){
      this.uCrisId = this?.$route?.query?.id
      this.getUcrisInfo()
    }
  },
  methods: {
    adjustItemHeight(item1, item2){
      if(this.$refs && this.$refs[item1] && this.$refs && this.$refs[item2]){
        const maxItemHeight = Math.max(this.$refs && this.$refs[item1].clientHeight, this.$refs && this.$refs[item2].clientHeight)
        this.$refs[item1].style.height = `${maxItemHeight}px`;
        this.$refs[item2].style.height = `${maxItemHeight}px`;
      }
      return 0
    },
    firstMetaTabContinue(){
      console.log('crossRefSelectedFields =>>', this.crossRefSelectedFields)
      console.log('ucrisSelectedFields =>>', this.ucrisSelectedFields)
      let commonImportData = {
        doi: this.doiToImport ? this.doiToImport.replace(/\s\s+/g, ' ').trim() : null,
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
      for (const key in this.crossRefSelectedFields) {
        if (Object.hasOwnProperty.call(this.crossRefSelectedFields, key)) {
          const element = this.crossRefSelectedFields[key];
          if(element){
            if(key === 'publicationType'){
              commonImportData['publicationTypeId'] = this.doiImportData['publicationTypeId']
            }
            commonImportData[key] = this.doiImportData[key];
          }
        }
      }
      for (const key in this.ucrisSelectedFields) {
        if (Object.hasOwnProperty.call(this.ucrisSelectedFields, key)) {
          const element = this.ucrisSelectedFields[key];
          if(element){
            if(key === 'publicationType'){
              commonImportData['publicationTypeId'] = this.doiImportDataForUcris['publicationTypeId']
            }
            commonImportData[key] = this.doiImportDataForUcris[key];
          }
        }
      }
      console.log('commonImportData =>>', commonImportData)
      this.resetForm(this, commonImportData)
      this.step = 5;
      this.$vuetify.goTo(1);
    },
    crossRefCheckFieldChange(name, value){
      // console.log('ucrisCheckFieldChange name =>>', name)
      // console.log('ucrisCheckFieldChange value =>>', value)
      // console.log('ucrisCheckFieldChange crossRefSelectedFields =>>', this.crossRefSelectedFields)
      // console.log('ucrisCheckFieldChange ucrisSelectedFields =>>', this.ucrisSelectedFields)
      if(value){
        this.ucrisSelectedFields[name] = false
      }
    },
    ucrisCheckFieldChange(name, value){
      // console.log('ucrisCheckFieldChange name =>>', name)
      // console.log('ucrisCheckFieldChange value =>>', value)
      // console.log('ucrisCheckFieldChange crossRefSelectedFields =>>', this.crossRefSelectedFields)
      // console.log('ucrisCheckFieldChange ucrisSelectedFields =>>', this.ucrisSelectedFields)
      if(value){
        this.crossRefSelectedFields[name] = false
      }
    },
    toggleSelectAllForMetaBox(metaboxType, value){
      if(metaboxType === 'ucris'){
        for (const key in this.ucrisSelectedFields) {
          if (Object.hasOwnProperty.call(this.ucrisSelectedFields, key)) {
            this.ucrisSelectedFields[key] = value;

          }
        }
      }
      if(metaboxType === 'crossRef'){
        for (const key in this.crossRefSelectedFields) {
          if (Object.hasOwnProperty.call(this.crossRefSelectedFields, key)) {
            this.crossRefSelectedFields[key] = value;

          }
        }
      }
    },
    importMetaBoxCheckChange(name, value){
      if(name === 'ucris' && value){
        this.isImportCrossRef = false
        this.toggleSelectAllForMetaBox('ucris', true)
        this.toggleSelectAllForMetaBox('crossRef', false)
        this.resetForm(this, this.doiImportDataForUcris)
      }
      if(name === 'ucris' && !value){
        this.isImportCrossRef = true
        this.toggleSelectAllForMetaBox('ucris', false)
        this.toggleSelectAllForMetaBox('crossRef', true)
      }
      if(name === 'crossref' && value){
        this.isImportUcris = false
        this.toggleSelectAllForMetaBox('ucris', false)
        this.toggleSelectAllForMetaBox('crossRef', true)
        this.resetForm(this, this.doiImportData)
      }
      if(name === 'crossref' && !value){
        this.isImportUcris = true
        this.toggleSelectAllForMetaBox('ucris', true)
        this.toggleSelectAllForMetaBox('crossRef', false)
      }
    },
    getDoiAgency: async function (doi) {
      let doiAgencyVal = null
      try {
        const agencyResp = await axios.get(`https://api.crossref.org/works/${doi}/agency`)
        doiAgencyVal = agencyResp?.data?.message?.agency?.id
      } catch (error) {
        console.log('Doi agency error', error)
      }
      return doiAgencyVal;
    },
    getDataSiteInfo: async function (doi) {
      return axios.get(`https://api.datacite.org/dois/${doi}`);
    },

    searchForDoiRecord: async function () {
      try {
        this.metaProviderName = ''
        let doiAgency = await this.getDoiAgency(this.doiSearchInput);
        // return
        this.loading = true
        if(doiAgency === 'datacite'){
          this.metaProviderName = 'Datacite'
          this.loading = false
          this.showDoiSearchTable = false;
          this.doiImportData = {}
          const dataciteResp = await this.getDataSiteInfo(this.doiSearchInput)
          const dataciteData = dataciteResp?.data;
          this.doiImportData = constructDataCite(dataciteData, this)
          setTimeout(() => {
              this.alignMetadataItems()
          }, 1000);
          // this.resetForm(this, this.doiImportData)
          return
        }
        this.metaProviderName = 'Crossref'
        let response = await axios.get(`https://api.crossref.org/works?rows=5&offset=0&query=${this.doiSearchInput}`)
        this.loading = false
        if(response?.data?.message?.items){
          this.doiSearchResultDocs = response.data.message.items;
          this.doiSearchTotal = response.data.message['total-results'];
          this.showDoiSearchTable = true
        }
      } catch (error) {
        this.loading = false
      }
    },
    getUcrisInfo(){
      let selectedUcrisInfoFromStore = this?.$store?.state?.selectedUcrisData
      if(!selectedUcrisInfoFromStore){
        this.$router.push('/ucris')
      }
      this.selectedUcrisInfo = selectedUcrisInfoFromStore;
      if(this.selectedUcrisInfo?.electronicVersions?.length && this.selectedUcrisInfo?.electronicVersions[0]?.doi){
        this.doiImportInput = this.selectedUcrisInfo?.electronicVersions[0]?.doi
        this.doiImportDataForUcris = this.buildUcrisMetadata(this.selectedUcrisInfo)
        this.importDOI();
      } else {
        this.showDoiSearch = true
        this.doiSearchInput = this.selectedUcrisInfo?.title?.value
        this.doiImportDataForUcris = this.buildUcrisMetadata(this.selectedUcrisInfo)
        this.resetForm(this, this.doiImportDataForUcris)
        this.searchForDoiRecord()
      }
    },
    importDoiFromSearchRow(doc){
      this.doiImportInput = doc.DOI
      this.showDoiSearch = false
      this.doiImportDataForUcris = this.buildUcrisMetadata(this.selectedUcrisInfo)
      this.importDOI()
    },
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
    buildUcrisMetadata(ucrisData){
      let localImportData = {
        doi: this.doiToImport ? this.doiToImport.replace(/\s\s+/g, ' ').trim() : null,
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
        pageEnd: '',
        licenceLabel: '',
        accessRightsLabel: '',
        versionLabel: '',
      }
      if(ucrisData?.subTitle?.value){
        localImportData.subtitle = this.$_.unescape(ucrisData?.subTitle?.value.replace(/\s\s+/g, ' ').trim())
      }
      if(ucrisData?.title?.value){
        localImportData.title = this.$_.unescape(ucrisData?.title?.value.replace(/\s\s+/g, ' ').trim())
      }
      if(ucrisData?.publicationStatuses && ucrisData?.publicationStatuses.length && ucrisData?.publicationStatuses[0]?.publicationDate?.year){
        localImportData.dateIssued = ucrisData.publicationStatuses[0].publicationDate.year.toString()
      }
      if(ucrisData?.contributors && ucrisData?.contributors.length){
        let authorRecords = ucrisData.contributors;
        authorRecords.forEach(authorRec => {
          if (authorRec['name'] &&
          authorRec?.role?.uri &&
          authorRec?.role?.uri === '/dk/atira/pure/researchoutput/roles/contributiontojournal/author') {
            const Firstname = authorRec['name']['firstName'] ? authorRec['name']['firstName'].replace(/\s\s+/g, ' ').trim() : '';
            const Lastname = authorRec['name']['lastName'] ? authorRec['name']['lastName'].replace(/\s\s+/g, ' ').trim() : '';
            const auth = {
              type: 'schema:Person',
              firstname: Firstname,
              lastname: Lastname,
            }
            if(authorRec?.externalOrganisations){
              authorRec.externalOrganisations.forEach(extOrgElem => {
                if(extOrgElem?.name?.text?.length){
                  auth.affiliation = []
                  auth.affiliation.push(extOrgElem?.name?.text[0].value)
                }

              })
            }
            if(authorRec?.organisationalUnits){
              authorRec.organisationalUnits.forEach(intOrgElem => {
                if(intOrgElem?.name?.text?.length){
                  if(intOrgElem.externalId){
                    const affId = intOrgElem.externalId.split(',')[0]
                    let affiliationIndex = univeJson.findIndex(x => x.oracle_id === `A${affId}`)
                    if(affiliationIndex >= 0){
                      auth.affiliationUnvieId = univeJson[affiliationIndex].id
                      auth.affiliationType = 'select'
                    }
                  }
                  auth.affiliation = []
                  auth.affiliation.push(intOrgElem?.name?.text[0].value)
                }

              })
            }
            localImportData.authors.push(auth)
          }
        });
      }

      if(ucrisData?.journalAssociation && ucrisData?.journalAssociation?.title?.title){
        localImportData.journalTitle = ucrisData.journalAssociation.title?.title
      }
      if(ucrisData?.journalAssociation && ucrisData?.journalAssociation?.issn?.issn){
        localImportData.journalISSN = ucrisData?.journalAssociation?.issn?.issn
      }
      if(ucrisData?.volume){
        localImportData.journalVolume = ucrisData?.volume
      }
      if(ucrisData?.pages){
        const pageSplit = ucrisData.pages.split('-')
        localImportData.pageStart = pageSplit[0] ? pageSplit[0] : ''
        localImportData.pageEnd = pageSplit[1] ? pageSplit[1] : ''
      }
      if(ucrisData?.journalNumber){
        localImportData.journalIssue = ucrisData?.journalNumber
      }
      if(ucrisData?.type?.uri){
        let ucrisType = ucrisData?.type?.uri || ''
        ucrisType = ucrisType.replace('/dk/atira/pure/researchoutput/researchoutputtypes/','')
        let ns = 'https://pid.phaidra.org/vocabulary/'
        switch (ucrisType) {
            case 'contributiontojournal/article':
            case 'contributiontoperiodical/article':
                localImportData.publicationType = 'article'
                localImportData.publicationTypeId = ns + 'VKA6-9XTY'
                break
            case 'workingpaper/preprint_draft':
                localImportData.publicationType = 'preprint'
                localImportData.publicationTypeId = ns + 'T023-BGTD'
                break
            case 'workingpaper/workingpaper':
            case 'workingpaper/preprint':
                localImportData.publicationType = 'working paper'
                localImportData.publicationTypeId = ns + '489N-Y6VX'
                break
            case 'contributiontojournal/letter':
            case 'contributiontojournal/comment':
            case 'contributiontojournal/scientific':
            case 'contributiontojournal/editorial':
            case 'contributiontojournal/abstract':
            case 'contributiontojournal/correction':
                localImportData.publicationType = 'contribution to journal'
                localImportData.publicationTypeId = ns + 'MF25-FDGW'
                break
            case 'bookanthology/book':
            case 'bookanthology/anthology':
            case 'contributiontoconference/paper':
                localImportData.publicationType = 'book'
                localImportData.publicationTypeId = ns + '47QB-8QF1'
                break
            case 'contributiontobookanthology/chapter':
                localImportData.publicationType = 'book_part'
                localImportData.publicationTypeId = ns + 'XA52-09WA'
                break
            case 'contributiontoperiodical/book':
                localImportData.publicationType = 'review'
                localImportData.publicationTypeId = ns + 'JJKV-B1CG'
                break
            case 'contributiontoconference/poster':
            case 'contributiontoconference/poster':
                localImportData.publicationType = 'conference object'
                localImportData.publicationTypeId = ns + 'QKDF-E5HA'
                break
            default:
                localImportData.publicationType = 'other'
                localImportData.publicationTypeId = ns + 'PYRE-RAWJ'
        }
      }
      if(ucrisData?.language?.term?.en_GB){
        const metaLangVal = ucrisData.language.term['en_GB'];
        if(metaLangVal){
          const langUtilList = langUtil.get_lang()
          const langIndex = langUtilList.findIndex(x => x['skos:prefLabel'] && x['skos:prefLabel']['eng'] && x['skos:prefLabel']['eng'] === metaLangVal)
          if(langIndex >= 0){
            const langVal = langUtilList[langIndex]['@id']
            if(langVal){
              localImportData.language = langVal
            }
          }
        }
      }

      // Keywords
      if(ucrisData?.keywordGroups?.length){
        localImportData.keywords = []
        ucrisData.keywordGroups.forEach(keyGroup => {
          if(keyGroup.typeDiscriminator === "FreeKeywordsKeywordGroup"){
            if(keyGroup.keywords){
              const selectedLang = this.$i18n.locale === 'eng' ? 'en_GB' : 'de_DE'
              const langIndex = keyGroup.keywords.findIndex(x => x.locale === selectedLang)
              if(langIndex >= 0){
                localImportData.keywords.push(...keyGroup.keywords[langIndex].freeKeywords)
              }
            }
          }
        });
      }

      // Access type
      if(ucrisData?.electronicVersions?.length && ucrisData?.electronicVersions[0]?.accessType?.uri){
        const accessTypeVal = ucrisData?.electronicVersions[0]?.accessType?.uri
        localImportData.accessRightsLabel = ucrisData?.electronicVersions[0]?.accessType?.term?.en_GB
        switch (accessTypeVal.toLowerCase()) {
          case '/dk/atira/pure/core/openaccesspermission/open':
              localImportData.accessrights = 'https://pid.phaidra.org/vocabulary/QW5R-NG4J'
            break;
            case '/dk/atira/pure/core/openaccesspermission/embargoed':
              localImportData.accessrights = 'https://pid.phaidra.org/vocabulary/AVFC-ZZSZ'
            break;
            case '/dk/atira/pure/core/openaccesspermission/restricted':
              localImportData.accessrights = 'https://pid.phaidra.org/vocabulary/KC3K-CCGM'
            break;
            case '/dk/atira/pure/core/openaccesspermission/closed':
              localImportData.accessrights = 'https://pid.phaidra.org/vocabulary/QNGE-V02H'
            break;
          default:
            break;
        }
      }

      // Version type
      if(ucrisData?.electronicVersions?.length && ucrisData?.electronicVersions[0]?.versionType?.uri){
        const versionTypeVal = ucrisData?.electronicVersions[0]?.versionType?.uri
        localImportData.versionLabel = ucrisData?.electronicVersions[0]?.versionType?.term?.en_GB
        switch (versionTypeVal.toLowerCase()) {
          case '/dk/atira/pure/researchoutput/electronicversion/versiontype/authorsversion':
              localImportData.version = 'https://pid.phaidra.org/vocabulary/TV31-080M'
            break;
            case '/dk/atira/pure/researchoutput/electronicversion/versiontype/preprint':
              localImportData.version = 'https://pid.phaidra.org/vocabulary/JTD4-R26P'
            break;
            case '/dk/atira/pure/researchoutput/electronicversion/versiontype/other':
              localImportData.version = 'https://pid.phaidra.org/vocabulary/PHXV-R6B3'
            break;
            case '/dk/atira/pure/researchoutput/electronicversion/versiontype/proof':
              localImportData.version = 'https://pid.phaidra.org/vocabulary/83ZP-CPP2'
            break;
            case '/dk/atira/pure/researchoutput/electronicversion/versiontype/publishersversion':
              localImportData.version = 'https://pid.phaidra.org/vocabulary/PMR8-3C8D'
            break;
            case '/dk/atira/pure/researchoutput/electronicversion/versiontype/other':
              localImportData.version = 'https://pid.phaidra.org/vocabulary/MT1G-APSB'
            break;
          default:
            break;
        }
      }

      // License
      if(ucrisData?.electronicVersions?.length && ucrisData?.electronicVersions[0]?.licenseType?.uri){
        const licenseTypeVal = ucrisData?.electronicVersions[0]?.licenseType?.uri
        localImportData.licenceLabel = ucrisData?.electronicVersions[0]?.licenseType?.term?.en_GB
        switch (licenseTypeVal) {
          case "/dk/atira/pure/core/document/licenses/unspecified":
              localImportData.license = "http://rightsstatements.org/vocab/InC/1.0/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by":
              localImportData.license = "http://creativecommons.org/licenses/by/4.0/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_nc":
              localImportData.license = "http://creativecommons.org/licenses/by-nc/4.0/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_nc_nd":
              localImportData.license = "http://creativecommons.org/licenses/by-nc-nd/4.0/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_nc_sa":
              localImportData.license = "http://creativecommons.org/licenses/by-nc-sa/4.0/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_nd":
              localImportData.license = "http://creativecommons.org/licenses/by-nd/4.0/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_sa":
              localImportData.license = "http://creativecommons.org/licenses/by-sa/4.0/"
          break;
          case "/dk/atira/pure/core/document/licenses/other":
              localImportData.license = "http://creativecommons.org/publicdomain/mark/1.0/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_3_0":
              localImportData.license = "http://creativecommons.org/licenses/by/3.0/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_nc_3_0":
              localImportData.license = "http://creativecommons.org/licenses/by-nc/3.0/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_nc_nd_3_0":
              localImportData.license = "http://creativecommons.org/licenses/by-nc-nd/3.0/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_nc_sa_3_0":
              localImportData.license = "http://creativecommons.org/licenses/by-nc-sa/3.0/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_nd_3_0":
              localImportData.license = "http://creativecommons.org/licenses/by-nd/3.0/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_sa_3_0":
              localImportData.license = "http://creativecommons.org/licenses/by-sa/3.0/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_3_0_at":
              localImportData.license = "http://creativecommons.org/licenses/by/3.0/at/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_nc_3_0_at":
              localImportData.license = "http://creativecommons.org/licenses/by-nc/3.0/at/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_nc_nd_3_0_at":
              localImportData.license = "http://creativecommons.org/licenses/by-nc-nd/3.0/at/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_nc_sa_3_0_at":
              localImportData.license = "http://creativecommons.org/licenses/by-nc-sa/3.0/at/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_nd_3_0_at":
              localImportData.license = "http://creativecommons.org/licenses/by-nd/3.0/at/"
          break;
          case "/dk/atira/pure/core/document/licenses/cc_by_sa_3_0_at":
              localImportData.license = "http://creativecommons.org/licenses/by-sa/3.0/at/"
          break;
          default:
            break;
        }
      }

      return localImportData
    },
    importDOI: async function () {
      this.loading = true
      this.doiImportErrors = []
      this.doiDuplicate = null
      this.doiImportData = null
      if (this.doiToImport) {
        let doiAgency = await this.getDoiAgency(this.doiToImport);
        if(doiAgency === 'datacite'){
          this.metaProviderName = 'Datacite'
          this.loading = false
          this.showDoiSearchTable = false;
          this.doiImportData = {}
          const dataciteResp = await this.getDataSiteInfo(this.doiToImport)
          const dataciteData = dataciteResp?.data;
          this.doiImportData = constructDataCite(dataciteData, this)
          setTimeout(() => {
              this.alignMetadataItems()
          }, 1000);
          // this.resetForm(this, this.doiImportData)
          return
        }
        try {
          let solrResponse = await axios.get( `${this.config.solr}/select?wt=json&q=dc_identifier:"${this.doiToImport}"`)


          if (solrResponse.data.response.numFound > 0) {
            this.doiDuplicate = {
              pid: solrResponse.data.response.docs[0].pid,
              title: solrResponse.data.response.docs[0].dc_title[0]
            }
          } 

          let response = await axios.get('https://' + this.config.apis.doi.baseurl + '/works/' + this.doiToImport + '?mailto=' + this.config.email, {
            headers: {
              'Accept': this.config.apis.doi.accept
            }
          })

          let crossrefData = response.data.message

          this.doiImportData = {
            doi: this.doiToImport.replace(/\s\s+/g, ' ').trim(),
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
            pageEnd: '',
            licenceLabel: ''
          }

          if (crossrefData['title']) {
            if (Array.isArray(crossrefData['title'])) {
              if (crossrefData['title'].length > 0) {
                this.doiImportData.title = this.$_.unescape(crossrefData['title'][0].replace(/\s\s+/g, ' ').trim())
              }
            } else {
              this.doiImportData.title = this.$_.unescape(crossrefData['title'].replace(/\s\s+/g, ' ').trim())
            }
          }

          if (crossrefData['subtitle']) {
            if (Array.isArray(crossrefData['subtitle'])) {
              if (crossrefData['subtitle'].length > 0) {
                this.doiImportData.subtitle = this.$_.unescape(crossrefData['subtitle'][0].replace(/\s\s+/g, ' ').trim())
              }
            } else {
              this.doiImportData.subtitle = this.$_.unescape(crossrefData['subtitle'].replace(/\s\s+/g, ' ').trim())
            }
          }

          if (crossrefData['issued']) {
            if (crossrefData['issued']['date-parts']) {
              if (crossrefData['issued']['date-parts'][0]) {
                if (crossrefData['issued']['date-parts'][0][0]) {
                  this.doiImportData.dateIssued = crossrefData['issued']['date-parts'][0][0].toString()
                }
              }
            }
          }

          if (crossrefData['language']) {
            if (this.lang2to3map[crossrefData['language']]) {
              this.doiImportData.language = this.lang2to3map[crossrefData['language']]
            }
          }

          let authors = crossrefData['author']
          if (authors && authors.length > 0) {
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
                this.doiImportData.publisher = this.$_.unescape(crossrefData['publisher'][0].replace(/\s\s+/g, ' ').trim())
              }
            } else {
              this.doiImportData.publisher = this.$_.unescape(crossrefData['publisher'].replace(/\s\s+/g, ' ').trim())
            }
          }

          if (crossrefData['container-title']) {
            if (Array.isArray(crossrefData['container-title'])) {
              if (crossrefData['container-title'].length > 0) {
                this.doiImportData.journalTitle = this.$_.unescape(crossrefData['container-title'][0].replace(/\s\s+/g, ' ').trim())
              }
            } else {
              this.doiImportData.journalTitle = this.$_.unescape(crossrefData['container-title'].replace(/\s\s+/g, ' ').trim())
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
                  const licTerm = this.getTerm('alllicenses', lic['URL'])
                  console.log('licTerm =>>', licTerm)
                  if (licTerm) {
                    this.doiImportData.licenceLabel = licTerm && licTerm['skos:prefLabel'] && licTerm['skos:prefLabel']['eng'] ? licTerm['skos:prefLabel']['eng'] : 'N/A'
                    this.doiImportData.license = lic['URL']
                  }
                }
              }
            }
          }
          this.resetForm(this, this.doiImportData)
          setTimeout(() => {
            this.alignMetadataItems()
          }, 1000);
        } catch (error) {
          console.error(error)
          if (error?.response?.status === 404) {
            this.doiImportErrors.push('DOI Not Found')
          } else {
            this.doiImportErrors.push(error.message)
          }
        } finally {
          this.loading = false
        }
      }
    },
    alignMetadataItems() {
      this.adjustItemHeight('doiImportDataForUcrisAuthorsRef', 'doiImportDataAuthorsRef')
      this.adjustItemHeight('item1TitleRef', 'item2TitleRef')
      this.adjustItemHeight('item1SubtitleRef', 'item2SubtitleRef')
      this.adjustItemHeight('item1DateIssuedRef', 'item2DateIssuedRef')
      this.adjustItemHeight('item1KeywordRef', 'item2KeywordRef')
      this.adjustItemHeight('item1LanguageRef', 'item2LanguageRef')
      this.adjustItemHeight('item1PublicationRef', 'item2PublicationRef')
      this.adjustItemHeight('item1PublisherRef', 'item2PublisherRef')
      this.adjustItemHeight('item1AppearedRef', 'item2AppearedRef')
      this.adjustItemHeight('item1IssnRef', 'item2IssnRef')
      this.adjustItemHeight('item1VolumeRef', 'item2VolumeRef')
      this.adjustItemHeight('item1IssueRef', 'item2IssueRef')
      this.adjustItemHeight('item1StartRef', 'item2StartRef')
      this.adjustItemHeight('item1EndRef', 'item2EndRef')
      this.adjustItemHeight('item1IsbnRef', 'item2IsbnRef')
      this.adjustItemHeight('item1LLicenseRef', 'item2LLicenseRef')
    },
    getMetadata: function () {
      return { metadata: { 'json-ld': this.getJsonld() } }
    },
    getJsonld: function () {
      return jsonLd.form2json(this.form)
    },
    submit: async function () {
      this.loading = true
      try {
        await axios.get(this.$store.state.config.api + '/keepalive', {
          headers: {
            'X-XSRF-TOKEN': this.$store.state.user.token
          }
        })
      } catch (error) {
        console.log(error)
        if (error.response.status === 401) {
          console.log('submitform: logged out, show login dialog')
          this.loading = false
          this.loginDialog = true
          return
        }
      }

       let dupcheckdoi = null
      for (let i = 0; i < this.form.sections.length; i++) {
        let s = this.form.sections[i]
        if (s.fields) {
          for (let j = 0; j < s.fields.length; j++) {
            if (s.fields[j].component === 'p-alternate-identifier' && s.fields[j].type === 'ids:doi') {
              if (s.fields[j].value !== '') {
                dupcheckdoi = s.fields[j].value
              }
            }
          }
        }
      }
      if (dupcheckdoi) {
        console.log('checking dup import of ' + dupcheckdoi)
        try {
          let solrResponse = await axios.get( `${this.config.solr}/select?wt=json&q=dc_identifier:"${dupcheckdoi}"`)
          console.log('found ' + solrResponse.data.response.numFound + ' objects')
          if (solrResponse.data.response.numFound > 0) {
            let dupmsg = 'An object with DOI ' + dupcheckdoi + ' was already uploaded: ' + solrResponse.data.response.docs[0].pid + ' - ' + solrResponse.data.response.docs[0].dc_title[0]
            console.log(dupmsg)
            this.$store.commit('setAlerts', [{ type: 'info', msg: dupmsg }])
            this.loading = false
            return
          }
        } catch (error) {
          console.log(error)
        }
      }


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
        let url = this.$store.state.config.api + '/ir/submit'
        if(this.$route.query?.type === 'ucris'){
          const search = location.search.substring(1);
          const queryParams = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
          url = queryParams.uuid ? this.$store.state.config.api + '/ir/submit?uuid=' + queryParams.uuid : this.$store.state.config.api + '/ir/submit'
        }
        console.log(url)
        let response = await axios.post(url, httpFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-XSRF-TOKEN': this.$store.state.user.token
          }
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
        console.log(error)
        this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      } finally {
        this.$vuetify.goTo(0)
        this.loading = false
        this.clickoncekey++
      }
    },
    save: async function () {
      if (this.validationEnabled) {
        this.validateMandatory()
        if (this.validationStatus === 'error') {
          this.step = 5
          return
        }
      }
      this.loading = true
      var httpFormData = new FormData()
      httpFormData.append('metadata', JSON.stringify(this.getMetadata()))
      try {
          let response = await axios.post(this.$store.state.config.api + '/object/' + this.targetPid + '/metadata', httpFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-XSRF-TOKEN': this.$store.state.user.token
          }
        })
        if (response.data.alerts && response.data.alerts.length > 0) {
          if (response.data.status === 401) {
            response.data.alerts.push({ type: 'danger', msg: 'Please log in' })
          }
          this.$store.commit('setAlerts', response.data.alerts)
        }
        if (response.data.status === 200) {
          this.$emit('object-saved', this.targetpid)
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
        newField.code = ''
        newField.identifier = ''
        newField.identifierType = ''
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
        newField.identifierType = ''
        newField.code = ''
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
        case 'p-project':
          let nrProj = 0
          for (let e of arr) {
            if (e.component === 'p-project') {
              nrProj++
            }
          }
          if (nrProj > 1) {
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
          if (event.hasOwnProperty('seriesTitleLanguageTerm')) {
            s.seriesTitleLanguage = event.seriesTitleLanguageTerm['@id']
          }
          if (event.hasOwnProperty('seriesTitle')) {
            s.seriesTitle = event.seriesTitle
          }
          if (event.hasOwnProperty('seriesVolume')) {
            s.seriesVolume = event.seriesVolume
          }
          if (event.hasOwnProperty('seriesIssue')) {
            s.seriesIssue = event.seriesIssue
          }
          if (event.hasOwnProperty('seriesIssued')) {
            s.seriesIssued = event.seriesIssued
          }
          if (event.hasOwnProperty('seriesIssn')) {
            s.seriesIssn = event.seriesIssn
          }
          if (event.hasOwnProperty('seriesIdentifier')) {
            s.seriesIdentifier = event.seriesIdentifier
          }
          if (event.hasOwnProperty('seriesIdentifierType')) {
            s.seriesIdentifierType = event.seriesIdentifierType
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
      } else {
        f.funderIdentifier = ''
        f.funderName = ''
      }
      this.$forceUpdate()
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
    affiliationRorInput: function (f, event) {
      f.affiliation = ''
      f.affiliationSelectedName = []
      if (event) {
        for (const id of event['skos:exactMatch']) {
          f.affiliation = id
        }
        f.affiliationSelectedName = event['schema:name']
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
    organizationRorInput: function (f, event) {
      f.organization = ''
      f.organizationSelectedName = []
      if (event) {
        for (const id of event['skos:exactMatch']) {
          f.organization = id
        }
        f.organizationSelectedName = event['schema:name']
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
                (field.predicate === 'dce:subject') ||
                (field.predicate === 'dce:rights')
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
          optionalSection.fields[sidx].titleBackgroundColor = this.mandatoryBgColor
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
    setFilename: function (fields, f, event) {
      if (event) {
        f.value = event.name
        f.file = event
      }
      if (event.type) {
        f.mimetype = event.type
        for (let formfield of fields) {
          if (formfield.predicate === 'dcterms:type') {
            if ((event.type === 'application/pdf') || (event.name.endsWith('pdf'))) {
              formfield.value = 'https://pid.phaidra.org/vocabulary/69ZZ-2KGX'
              formfield['skos:prefLabel'] = []
              formfield['skos:prefLabel'].push({ '@value': 'text', '@language': 'eng' })
            } else {
              formfield.value = 'https://pid.phaidra.org/vocabulary/7AVS-Y482'
              formfield['skos:prefLabel'] = []
              formfield['skos:prefLabel'].push({ '@value': 'data', '@language': 'eng' })
            }
          }
        }
      }
      this.$emit('form-input-' + f.component, f)
    },
    setDescription: function (section, value) {
      for (let f of section.fields) {
        if ((f.component === 'p-text-field') && (f.type === 'bf:Summary')) {
          f.value = value
        }
      }
      this.descriptionValue = value
    },
    setKeywords: function (section, value) {
      for (let f of section.fields) {
        if ((f.component === 'p-keyword')) {
          f.value = value
        }
      }
      this.keywordsValue = value
    },
    setDescriptionAndKeywordsLanguage: function (section, event) {
      for (let f of section.fields) {
        if ((f.component === 'p-text-field') && (f.type === 'bf:Summary')) {
          f.language = event['@id']
        }
        if ((f.component === 'p-keyword')) {
          f.language = event['@id']
        }
      }
      this.kwDescLanguage = event['@id']
    },
    resetForm: function (self, doiImportData) {
      self.$store.commit('vocabulary/enableAllVocabularyTerms', 'versiontypes')
      self.$store.commit('vocabulary/enableAllVocabularyTerms', self.irObjectTypeVocabulary)
      self.form = {
        sections: []
      }

      let smf = []

      let rt = fields.getField('resource-type')
      rt.value = 'https://pid.phaidra.org/vocabulary/69ZZ-2KGX'
      if (self.importData && self.importData.resourceType) {
        rt.value = self.importData.resourceType
      }
      smf.push(rt)

      if (!self.importData) {
        let f = fields.getField('file')
        f.multiplicable = false
        f.mimetype = 'application/pdf'
        f.backgroundColor = self.config.mandatorybgcolor
        f.autoMimetype = true
        f.showMimetype = false
        smf.push(f)
      }

      let tf = fields.getField('title')
      if (self.submitformparam === 'book-part') {
        tf.titleLabel = 'Title of book chapter'
      }
      tf.titleBackgroundColor = self.config.mandatorybgcolor
      tf.hideSubtitle = self.submitformparam === 'journal-article'
      tf.multilingual = false
      if (self.importData && self.importData.title) {
        if (self.importData.title.value) {
          tf.title = self.importData.title.value
        }
        if (self.importData.title.language) {
          tf.language = self.importData.title.language
        }
        tf.multilingual = true
      } else {
        if (doiImportData && doiImportData.title) {
          tf.title = doiImportData.title
        }
      }
      if (self.importData && self.importData.subtitle) {
        tf.subtitle = self.importData.subtitle
        tf.hideSubtitle = false
      } else {
        if (doiImportData && doiImportData.subtitle) {
          tf.subtitle = doiImportData.subtitle
          tf.hideSubtitle = false
        }
      }
      tf.multiplicable = false
      smf.push(tf)

      if (self.importData && self.importData.roles) {
        for (let importRole of self.importData.roles) {
          let role = fields.getField('role-extended')
          role.type = 'schema:Person'
          role.nameBackgroundColor = self.config.mandatorybgcolor
          role.firstnameBackgroundColor = self.config.mandatorybgcolor
          role.lastnameBackgroundColor = self.config.mandatorybgcolor
          role.roleBackgroundColor = self.config.mandatorybgcolor
          role.affiliationBackgroundColor = self.config.mandatorybgcolor
          role.enableOrgTree = self.config.enableorgtree
          role.enableAffTree = self.config.enableafftree
          role.role = importRole.role
          role.roleVocabulary = 'irrolepredicate'
          role.ordergroup = 'roles'
          role.firstname = importRole.firstname
          role.lastname = importRole.lastname
          role.showIdentifierType = false
          role.showBirthAndDeathDate = false
          if (importRole.identifier) {
            role.identifierType = importRole.identifier.type
            role.identifierText = importRole.identifier.value
          } else {
            role.identifierType = 'ids:orcid'
            role.identifierLabel = 'ORCID'
          }
          if (importRole.affiliation) {
            role.affiliationType = importRole.affiliation.type
            if (importRole.affiliation.type === 'other') {
              role.affiliationText = importRole.affiliation.value
            } else {
              if (importRole.affiliation.type === 'ror') {
                role.affiliation = importRole.affiliation.value
                role.affiliationRorName = importRole.affiliation.rorName
              } else {
                role.affiliation = importRole.affiliation.value
              }
            }
          }
          smf.push(role)
        }
      } else {
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
            role.showBirthAndDeathDate = false
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
              role.affiliationType = author.affiliationType || 'other'
              // iterate, although currently multiple affiliations are not supported
              for (let af of author['affiliation']) {
                if(author.affiliationType === 'select'){
                  role.affiliation = author.affiliationUnvieId
                } else {
                  role.affiliationText = af

                }
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
          role.showBirthAndDeathDate = false
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
      }

      let vtf = fields.getField('version-type')
      if (self.importData && self.importData.version) {
        vtf.value = self.importData.version
      }
      if (doiImportData && doiImportData.version) {
        vtf.value = doiImportData.version
      }
      smf.push(vtf)

      let issued = fields.getField('date-edtf')
      issued.mainSubmitDate = true // we need to find this field again when changing predicates
      issued.picker = true
      if (self.importData && self.importData.date) {
        issued.type = self.importData.date.type
        issued.value = self.importData.date.value
      } else {
        if (doiImportData && doiImportData.dateIssued) {
          issued.value = doiImportData.dateIssued
        }
        issued.type = 'dcterms:issued'
      }
      switch (issued.type) {
        case 'dcterms:created':
          issued.dateLabel = 'Date created'
          break
        case 'dcterms:dateSubmitted':
          issued.dateLabel = 'Date submitted'
          break
        case 'dcterms:dateAccepted':
          issued.dateLabel = 'Date accepted'
          break
        case 'dcterms:issued':
          issued.dateLabel = 'Date issued'
          break
        case 'dcterms:modified':
          issued.dateLabel = 'Date modified'
          break
        case 'dcterms:date':
          issued.dateLabel = 'Date'
          break
      }
      issued.hideType = true
      issued.multiplicable = false
      issued.backgroundColor = self.config.mandatorybgcolor
      smf.push(issued)

      let lmf = fields.getField('language')
      lmf.multiplicable = false
      if (self.importData && self.importData.language) {
        lmf.value = self.importData.language
      } else {
        if (doiImportData && doiImportData.language) {
          lmf.value = doiImportData.language
        }
      }
      lmf.backgroundColor = self.config.mandatorybgcolor
      smf.push(lmf)

      let otf = fields.getField('object-type')
      otf.vocabulary = self.irObjectTypeVocabulary
      otf.multiplicable = false
      otf.label = 'Type of publication'
      otf.backgroundColor = self.config.mandatorybgcolor
      if (self.importData && self.importData.date) {
        otf.value = self.importData.objecttype
      } else {
        if (doiImportData && doiImportData.publicationTypeId) {
          otf.value = doiImportData.publicationTypeId
        }
      }
      if (self.submitformparam === 'book') {
        otf.value = 'https://pid.phaidra.org/vocabulary/47QB-8QF1'
      }
      if (self.submitformparam === 'book-part') {
        otf.value = 'https://pid.phaidra.org/vocabulary/XA52-09WA'
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
        if (self.importData && self.importData.containedin) {
          if (self.importData.containedin.title) {
            sf.title = self.importData.containedin.title.value
            if (self.importData.containedin.title.language) {
              sf.titleLanguage = self.importData.containedin.title.language
            }
          }
          if (self.importData.containedin.subtitle) {
            sf.subtitle = self.importData.containedin.subtitle
          }
          if (self.importData.containedin.isbn) {
            sf.isbn = self.importData.containedin.isbn
          }
          if (self.importData.containedin.pagestart) {
            sf.pageStart = self.importData.containedin.pagestart
          }
          if (self.importData.containedin.pageend) {
            sf.pageEnd = self.importData.containedin.pageend
          }
          if (self.importData.containedin.identifier) {
            sf.identifier = self.importData.containedin.identifier
          }
          if (self.importData.containedin.identifierType) {
            sf.identifierType = self.importData.containedin.identifierType
          }
          if (self.importData.containedin.roles) {
            if (self.importData.containedin.roles.length > 0) {
              sf.roles = []
              let roleidx = 0
              for (let role of self.importData.containedin.roles) {
                roleidx++
                let entity = {
                  id: 'contained-in-role-' + roleidx,
                  role: role.role,
                  firstname: role.firstname,
                  lastname: role.lastname,
                  ordergroup: 'contained-in-role'
                }
                sf.roles.push(entity)
              }
            }
          }
          if (self.importData.containedin.series) {
            if (self.importData.containedin.series.length > 0) {
              sf.series = []
              let seriesidx = 0
              for (let ser of self.importData.containedin.series) {
                seriesidx++
                let series = {
                  id: 'contained-in-series-' + seriesidx,
                  seriesType: 'schema:CreativeWork',
                  multiplicableCleared: true
                }
                if (ser.title) {
                  series.seriesTitle = ser.title.value
                  if (ser.title.language) {
                    series.seriesTitleLanguage = ser.title.language
                  }
                }
                if (ser.volume) {
                  series.seriesVolume = ser.volume
                }
                if (ser.issue) {
                  series.seriesIssue = ser.issue
                }
                if (ser.issued) {
                  series.seriesIssued = ser.issued
                }
                if (ser.issn) {
                  series.seriesIssn = ser.issn
                }
                if (ser.identifier) {
                  series.seriesIdentifier = ser.identifier
                }
                if (ser.identifierType) {
                  series.seriesIdentifierType = ser.identifierType
                }
                sf.series.push(series)
              }
            }
          }
          if (self.importData.containedin.publisher) {
            if (self.importData.containedin.publisher.type) {
              sf.publisherType = self.importData.containedin.publisher.type
              if (self.importData.containedin.publisher.type === 'other') {
                if (self.importData.containedin.publisher.name) {
                  sf.publisherName = self.importData.containedin.publisher.name
                }
              } else {
                if (self.importData.containedin.publisher.orgunit) {
                  sf.publisherOrgUnit = self.importData.containedin.publisher.orgunit
                }
              }
            }
            if (self.importData.containedin.publisher.date) {
              sf.publishingDate = self.importData.containedin.publisher.date
            }
            if (self.importData.containedin.publisher.place) {
              sf.publishingPlace = self.importData.containedin.publisher.place
            }
          }
        } else {
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
        if (self.importData && self.importData.publisher) {
          if (self.importData.publisher.type) {
            pf.publisherType = self.importData.publisher.type
            if (self.importData.publisher.type === 'other') {
              if (self.importData.publisher.name) {
                pf.publisherName = self.importData.publisher.name
              }
            } else {
              if (self.importData.publisher.orgunit) {
                pf.publisherOrgUnit = self.importData.publisher.orgunit
              }
            }
          }
          if (self.importData.publisher.date) {
            pf.publishingDate = self.importData.publisher.date
          }
          if (self.importData.publisher.place) {
            pf.publishingPlace = self.importData.publisher.place
          }
        } else {
          if (doiImportData && doiImportData.publisher) {
            pf.publisherName = doiImportData.publisher
          }
          if (doiImportData && doiImportData.dateIssued) {
            pf.publishingDate = doiImportData.dateIssued
          }
        }
        smf.push(pf)
      }

      let arf = fields.getField('access-right')
      arf.vocabulary = 'iraccessright'
      arf.backgroundColor = self.config.mandatorybgcolor
      if (self.importData && self.importData.accessrights) {
        arf.value = self.importData.accessrights
      }
      if (doiImportData && doiImportData.accessrights) {
        arf.value = doiImportData.accessrights
      }
      smf.push(arf)

      let embargoDate = fields.getField('date-edtf')
      embargoDate.picker = true
      embargoDate.backgroundColor = self.config.mandatorybgcolor
      embargoDate.type = 'dcterms:available'
      embargoDate.hideType = true
      embargoDate.dateLabel = 'Embargo date'
      embargoDate.dateFormatHint = self.config.dateformathint
      if (self.importData && self.importData.embargodate) {
        embargoDate.value = self.importData.embargodate
        self.showEmbargoDate = true
      }
      embargoDate.multiplicable = false
      smf.push(embargoDate)

      let lic = fields.getField('license')
      if (self.importData && self.importData.license) {
        lic.value = self.importData.license
      } else {
        if (doiImportData && doiImportData.license) {
          lic.value = doiImportData.license
        }
      }
      lic.showDisclaimer = false
      lic.vocabulary = 'alllicenses'
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
      let abst = fields.getField('abstract')
      self.descriptionValue = ''
      self.kwDescLanguage = ''
      self.keywordsValue = []
      if (self.importData && self.importData.abstract) {
        if (self.importData.abstract.value) {
          abst.value = self.importData.abstract.value
          self.descriptionValue = self.importData.abstract.value
        }
        if (self.importData.abstract.language) {
          abst.language = self.importData.abstract.language
          self.kwDescLanguage = self.importData.abstract.language
        }
      }
      sof.push(abst)
      let keyws = fields.getField('keyword')
      if (self.importData && self.importData.keywords) {
        if (self.importData.keywords) {
          keyws.value = self.importData.keywords
          self.keywordsValue = self.importData.keywords
        }
      } else {
        if (doiImportData) {
          if (doiImportData.keywords) {
            keyws.value = doiImportData.keywords
            self.keywordsValue = doiImportData.keywords
          }
        }
      }
      sof.push(keyws)

      let identifiersArrayNoIsbn = []
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
        if (self.importData && self.importData.identifiers) {
          for (let id of self.importData.identifiers) {
            if (id.type === 'ids:isbn') {
              isbn.value = id.value
            } else {
              identifiersArrayNoIsbn.push(id)
            }
          }
        }
        sof.push(isbn)
      }

      // watch out not to edit self.importData.identifiers
      // there's a watcher on it which triggers this method
      // ==> infinite loop
      let identifiers = []
      if (identifiersArrayNoIsbn.length > 0) {
        identifiers = identifiersArrayNoIsbn
      } else {
        if (self.importData && self.importData.identifiers) {
          identifiers = self.importData.identifiers
        }
      }

      if (self.importData && identifiers.length > 0) {
        let i = 0
        for (let id of identifiers) {
          i++
          let aif = fields.getField('alternate-identifier')
          aif.label = 'Identifier'
          aif.identifierLabel = 'Identifier'
          aif.vocabulary = 'irobjectidentifiertypenoisbn'
          aif.multiplicable = true
          aif.addOnly = true
          aif.subloopFlag = i === 1
          if (id.type) {
            aif.type = id.type
          }
          if (id.value) {
            aif.value = id.value
          }
          sof.push(aif)
        }
      } else {
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
      }

      // handled by submit-ir-funding-field component
      if (self.importData && self.importData.funding && (self.importData.funding.length > 0)) {
        let i = 0
        for (let funding of self.importData.funding) {
          i++
          let pof = fields.getField('project')
          pof.label = 'Funder/Project'
          pof.removable = true
          pof.multiplicable = true
          pof.multiplicableCleared = true
          pof.subloopFlag = i === 1
          if (funding.funderid) {
            pof.funderIdentifier = funding.funderid
          }
          if ((funding.funderid === 'other') && funding.fundername) {
            pof.funderName = funding.fundername
          }
          if (funding.projectid) {
            pof.identifier = funding.projectid
          }
          if (funding.projectidtype) {
            pof.identifierType = funding.projectidtype
          }
          if (funding.projectcode) {
            pof.code = funding.projectcode
          }
          sof.push(pof)
        }
      } else {
        let pof = fields.getField('project')
        pof.label = 'Funder/Project'
        pof.multiplicable = true
        pof.multiplicableCleared = true
        pof.subloopFlag = true
        sof.push(pof)
      }

      if (self.submitformparam === 'book') {
        let nop = fields.getField('number-of-pages')
        nop.multiplicable = false
        if (self.importData && self.importData.numberofpages) {
          nop.value = self.importData.numberofpages
        }
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
        if (self.importData && self.importData.series) {
          if (self.importData.series.title) {
            sf.title = self.importData.series.title.value
            if (self.importData.series.title.language) {
              sf.titleLanguage = self.importData.series.title.language
            }
          }
          if (self.importData.series.volume) {
            sf.volume = self.importData.series.volume
          }
          if (self.importData.series.issue) {
            sf.issue = self.importData.series.issue
          }
          if (self.importData.series.issued) {
            sf.issued = self.importData.series.issued
          }
          if (self.importData.series.issn) {
            sf.issn = self.importData.series.issn
          }
          if (self.importData.series.identifier) {
            sf.identifier = self.importData.series.identifier
          }
          if (self.importData.series.pagestart) {
            sf.pageStart = self.importData.series.pagestart
          }
          if (self.importData.series.pageend) {
            sf.pageEnd = self.importData.series.pageend
          }
        } else {
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
        if (self.importData && self.importData.publisher) {
          if (self.importData.publisher.type) {
            pf.publisherType = self.importData.publisher.type
            if (self.importData.publisher.type === 'other') {
              if (self.importData.publisher.name) {
                pf.publisherName = self.importData.publisher.name
              }
            } else {
              if (self.importData.publisher.orgunit) {
                pf.publisherOrgUnit = self.importData.publisher.orgunit
              }
            }
          }
          if (self.importData.publisher.date) {
            pf.publishingDate = self.importData.publisher.date
          }
          if (self.importData.publisher.place) {
            pf.publishingPlace = self.importData.publisher.place
          }
        } else {
          if (doiImportData && doiImportData.publisher) {
            pf.publisherName = doiImportData.publisher
          }
        }
        pf.hideType = !self.config.enableorgpublisher
        sof.push(pf)
      }

      let rights = fields.getField('rights')
      if (self.importData && self.importData.rights) {
        if (self.importData.rights.value) {
          rights.value = self.importData.rights.value
        }
        if (self.importData.rights.language) {
          rights.language = self.importData.rights.language
        }
      }
      sof.push(rights)

      if (self.importData) {
        if (self.importData.filename) {
          let fn = fields.getField('filename-readonly')
          fn.value = self.importData.filename
          sof.push(fn)
        }
        if (self.importData.mimetype) {
          let mim = fields.getField('mime-type')
          mim.readonly = true
          mim.value = self.importData.mimetype
          sof.push(mim)
        }
        if (self.importData.systemtag) {
          let st = fields.getField('system-tag')
          st.value = self.importData.systemtag
          st.hidden = true
          sof.push(st)
        }
      }

      if (self.config.submit.association) {
        let added = false
        if (self.importData) {
          if (self.importData.associations) {
            if (self.importData.associations.length > 0) {
              for (let asoc of self.importData.associations) {
                added = true
                let asf = fields.getField('association')
                asf.value = asoc
                sof.push(asf)
              }
            }
          }
        }
        if (!added) {
          sof.push(fields.getField('association'))
        }
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
        self.showEmbargoDate = self.importData && self.importData.embargodate
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
      if (process.browser) {
        if (navigator.userAgent.indexOf('Firefox') > -1) {
          document.querySelector('#app').scrollIntoView()
        } else {
          this.$vuetify.goTo(1)
        }
      }
    },
    continueForm: function (step) {
      if (this.targetPid) {
        this.step = step + 1
      } else {
        if (step === 5) {
          if (this.validationEnabled) {
            this.validateMandatory()
          }
        }
        if (this.validationStatus !== 'error') {
          this.step = step + 1
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
                  if (f.affiliationType === "ror") {
                    if (
                      !f.affiliation ||
                      f.affiliation === "" ||
                      f.affiliation.length < 1
                    ) {
                      f.affiliationErrorMessages.push(
                        this.$t("Missing affiliation")
                      );
                      this.validationStatus = "error";
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
                  if (f.organizationType === 'ror') {
                    if (f.organization.length < 1) {
                      f.organizationErrorMessages.push(this.$t('Missing organization'))
                      this.validationStatus = 'error'
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
      if (!hasLocalAffiliation && (this.user.username !== this.config.iraccount)) {
        this.validationStatus = 'error'
        this.validationErrors.push(this.$t('ERROR_AFFILIATION', { institution: this.$t(this.config.institution) }))
      }
    },
    resetSubmission: async function (self) {
      if (!self) {
        self = this
      }
      self.submitResponse = null
      self.$store.dispatch('vocabulary/loadLanguages', self.$i18n.locale)
      self.step = 3
      self.maxStep = 0
      self.doiImportInput = null
      self.doiImportData = null
      self.doiImportErrors = []
      self.validationStatus = ''
      self.validationErrors = []
      self.validationEnabled = true
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
    if ((this.step > 3) && (to.name === 'adminsubmit') && (!this.$store.state.skipsubmitrouteleavehook)) {
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

.v-stepper__header {
  justify-content: center !important;
}

.v-stepper__content {
  transition: none !important;
  -webkit-transition: none !important;
}

.v-stepper__step--editable {
  border-bottom: 3px solid;
  border-color: #9e9e9e;
}
.ucris-metadbox-container {
  margin-right: 15px;
}
.pad-0 {
  padding: 0
}
.m-0 {
  margin: 0;
}
</style>
