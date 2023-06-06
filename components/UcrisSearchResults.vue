<template>
  <v-container>
    <template v-for="(doc, i) in this.docs">
      <v-row :key="'doc'+i">
        <v-col cols="3">
          <a class="font-weight-light primary--text" @click="showUcrisObj(doc)">{{ doc.title.value | truncate(100) }}</a>
        </v-col>
        <v-col cols="3" class="word-break">
          {{ getDoiForCol(doc) | truncate(100) }}
        </v-col>
        <v-col cols="2" class="word-break">
          <div v-for="(item) in getAuthorList(doc)">
            {{item.firstname}} {{item.lastname}}
          </div>
        </v-col>
        <v-col cols="1" class="word-break">
          {{ getPublicationType(doc) | truncate(100) }}
        </v-col>
        <v-col cols="3">
          <v-spacer></v-spacer>
          <v-btn class="mx-1 font-weight-regular" @click="ucrisRowSelected(doc)" color="primary">Import</v-btn>
          <v-btn class="mt-1 mx-1 font-weight-regular" @click="navigateToUcris(doc)" color="primary">Show in ucris</v-btn>
          <!-- <v-btn :disabled="loading[doc.pid]" :loading="loading[doc.pid]" class="mx-1 font-weight-regular" color="primary" v-if="isNew(doc)" @click="accept(doc.pid)">Accept</v-btn>
          <v-btn :disabled="loading[doc.pid]" :loading="loading[doc.pid]" class="mx-1 font-weight-regular" color="grey darken-1 white--text" v-if="isNew(doc)" @click="reject(doc.pid)">Reject</v-btn>
          <v-btn :disabled="loading[doc.pid]" :loading="loading[doc.pid]" class="mx-1 font-weight-regular" color="grey darken-1 white--text" v-if="isAccepted(doc)" :to="{ path: `/metadata/${doc.pid}/edit`}">Edit</v-btn>
          <v-btn :disabled="loading[doc.pid]" :loading="loading[doc.pid]" class="mx-1 font-weight-regular" color="primary" @click="approve(doc.pid)" v-if="isAccepted(doc) && !isApproved(doc)">Approve</v-btn>
          <v-icon class="mx-1" v-if="isApproved(doc)">mdi-check</v-icon> -->
        </v-col>
      </v-row>
      <v-divider :key="'div'+doc.pureId" class="my-4 mr-2"></v-divider>
    </template>
    <v-dialog
      v-model="showJsonViewer"
      scrollable
      max-width="700px"
    >
      <v-card>
      <v-card-title class="text-h5 primary">
        <span style="color: white;">UCRIS JSON</span>
      </v-card-title>
      <v-card-text>
        <v-card>
          <div class="error-display-container">
            <div class="msg-container">
              <json-viewer :expand-depth="15" expanded :value="selectedUcrisInfo"></json-viewer>
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
    <v-dialog v-model="historyDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <h3 class="title font-weight-light primary--text">{{ $t('History') }}</h3>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-container>
            <template v-for="(e, i) in events">
              <v-row :key="'row'+i">
                <v-col>{{ e.event }}</v-col>
                <v-col>{{ e.username }}</v-col>
                <v-col>{{ e.ts | time }}</v-col>
              </v-row>
              <v-divider v-if="i < (events.length - 1)" :key="'div'+i"></v-divider>
            </template>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click.stop="historyDialog=false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="rightsDialog" max-width="1200px">
      <v-card>
        <v-card-title>
          <h3 class="title font-weight-light primary--text">{{ $t('Access rights') }}</h3>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-container>
            <p-m-rights :pid="rightsPid" :rights="rights" :enableGroups="false" v-on:load-rights="loadRights()"></p-m-rights>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click.stop="rightsDialog=false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="uploadDialog" max-width="1200px">
      <v-card>
        <v-card-title>
          <h3 class="title font-weight-light primary--text">{{ $t('Upload new file to') }} {{uploadPid}} ({{uploadCmodel}})</h3>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-container @drop.prevent="addDropFile"
    @dragover.prevent>
            <v-file-input v-model="fileUpload" :error-messages="fileUploadErrors"></v-file-input>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click.stop="uploadDialog=false">Close</v-btn>
          <v-btn color="primary" @click="uploadFile()">Upload</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import Vue from 'vue'
import { config } from '@/mixins/config'
import { context } from '@/mixins/context'
import axios from 'axios'

export default {
  name: 'ucris-search-results',
  mixins: [ config, context ],
  props: {
    docs: {
      type: Array
    },
    total: Number,
    search: Function
  },
  data () {
    return {
      loading: {},
      historyDialog: false,
      events: [],
      rightsDialog: false,
      uploadDialog: false,
      rights: {},
      rightsPid: {},
      uploadPid: {},
      uploadCmodel: {},
      fileUploadErrors: [],
      fileUpload: null,
      selectedUcrisInfo: {},
      showJsonViewer: false,
    }
  },
  methods: {
    showUcrisObj(doc){
      this.selectedUcrisInfo = doc;
      this.showJsonViewer = true
    },
    ucrisRowSelected(doc){
      this.$store.commit('setSelectedUcrisData', doc)
      this.$router.push('/admin/submit?type=ucris&id='+doc.pureId)
    },
    navigateToUcris(doc) {
      window.open(`https://ucris.univie.ac.at/admin/editor/dk/atira/pure/api/shared/model/researchoutput/editor/contributiontojournaleditor.xhtml?scheme=&type=&id=${doc.pureId} `, '_blank');
    },
    getPublicationType(ucrisData){
      let localImportData = {}
      if(ucrisData?.type?.term?.text?.length){
        let ucrisType = ucrisData.type.term.text[0].value || ''
        localImportData.publicationTypeName = ucrisType
        ucrisType = ucrisType.toLowerCase()
        switch (ucrisType) {
            case 'article':
            case 'journal-article':
            case 'article-journal':
                localImportData.publicationType = 'article'
                localImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/VKA6-9XTY'
                break
            case 'review':
                localImportData.publicationType = 'review'
                localImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/JJKV-B1CG'
                break
            case 'report':
                localImportData.publicationType = 'report'
                localImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/JMAV-7F3R'
                break
            case 'book':
            case 'monograph':
            case 'reference-book':
            case 'edited-book':
                localImportData.publicationType = 'book'
                localImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/47QB-8QF1'
                break
            case 'book-chapter':
            case 'book-part':
            case 'book-section':
                localImportData.publicationType = 'book_part'
                localImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/XA52-09WA'
                break
            case 'dissertation':
                localImportData.publicationType = 'doctoral_thesis'
                localImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/1PHE-7VMS'
                break
            case 'proceedings-article':
            case 'proceedings':
                localImportData.publicationType = 'conference_object'
                localImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/QKDF-E5HA'
                break
            case 'dataset':
                localImportData.publicationType = 'research_data'
                localImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/KW6N-2VTP'
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
                localImportData.publicationType = 'other'
                localImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/PYRE-RAWJ'
                break
            default:
                localImportData.publicationType = 'other'
                localImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/PYRE-RAWJ'
        }
      }
      return localImportData.publicationTypeName
    },
    getAuthorList(ucrisData){
      let authors = [];
      if(ucrisData?.personAssociations && ucrisData?.personAssociations.length){
        let authorRecords = ucrisData.personAssociations;
        authorRecords.forEach(authorRec => {
          if (authorRec['name'] &&
          authorRec?.personRole?.term?.text &&
          authorRec?.personRole?.term?.text.length && authorRec?.personRole?.term?.text[0].value === 'Author') {
            const Firstname = authorRec['name']['firstName'] ? authorRec['name']['firstName'].replace(/\s\s+/g, ' ').trim() : '';
            const Lastname = authorRec['name']['lastName'] ? authorRec['name']['lastName'].replace(/\s\s+/g, ' ').trim() : '';
            const auth = {
              firstname: Firstname,
              lastname: Lastname,
            }
            authors.push(auth)
          }
        });
      }
      if(authors.length > 3){
        return authors.slice(0, 3)
      }
      return authors;
    },
    getDoiForCol(row){
      return row?.electronicVersions?.length && row?.electronicVersions[0]?.doi ? row?.electronicVersions[0]?.doi : 'N/A'
    },
    downloadFile: async function (downloadUrl) {
      let response = await axios.get(downloadUrl, {
        headers: {
          'X-XSRF-TOKEN': this.$store.state.user.token
        },
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      let fileName = response.headers['content-disposition'].split('filename=')[1]
      link.setAttribute('download', fileName.replaceAll('"', ''))
      link.click()
      window.URL.revokeObjectURL(url)

    },
    addDropFile (e) {
      if (e.dataTransfer.files.length > 1) {
        this.fileUploadErrors.push(this.$t('Select only 1 file'))
        return
      }
      this.fileUpload = e.dataTransfer.files[0]
    },
    uploadFile: async function () {
      if (!this.fileUpload) {
        this.fileUploadErrors.push(this.$t('Missing file'))
        return
      }
      Vue.set(this.loading, this.uploadPid, true)
      try {
        var httpFormData = new FormData()
        httpFormData.append('file', this.fileUpload)
        let response = await axios.post(this.config.api + '/object/' + this.uploadPid + '/data', httpFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-XSRF-TOKEN': this.$store.state.user.token
          }
        })
        if (response.status === 200) {
          this.$store.commit('setAlerts', [{ type: 'success', msg: 'File ' + this.fileUpload.name + ' sucessfully uploaded to ' + this.uploadPid }])
        } else {
          if (response.data.alerts && response.data.alerts.length > 0) {
            this.$store.commit('setAlerts', response.data.alerts)
          }
        }
      } catch (error) {
        this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      } finally {
        this.uploadDialog = false
        Vue.set(this.loading, this.uploadPid, false)
      }
    },
    isApproved: function (doc) {
      return (doc.owner === this.config.iraccount) && doc.systemtag?.includes(this.config.adminset + ':approved')
    },
    isAccepted: function (doc) {
      return doc.owner === this.config.iraccount
    },
    isNew: function (doc) {
      return doc.owner !== this.config.iraccount
    },
    loadRights: async function () {
      Vue.set(this.loading, this.rightsPid, true)
      try {
        let response = await axios.get(this.config.api + '/object/' + this.rightsPid + '/rights', {
          headers: {
            'X-XSRF-TOKEN': this.$store.state.user.token
          }
        })
        if (response.status === 200) {
          this.rights = response.data.metadata.rights
        } else {
          if (response.data.alerts && response.data.alerts.length > 0) {
            this.$store.commit('setAlerts', response.data.alerts)
          }
        }
      } catch (error) {
        this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      } finally {
        Vue.set(this.loading, this.rightsPid, false)
      }
    },
    openUpload: function (pid, cmodel) {
      this.uploadPid = pid
      this.uploadCmodel = cmodel
      this.uploadDialog = true
    },
    openRights: async function (pid) {
      this.rightsPid = pid
      Vue.set(this.loading, this.rightsPid, true)
      try {
        let response = await axios.get(this.config.api + '/object/' + this.rightsPid + '/rights', {
          headers: {
            'X-XSRF-TOKEN': this.$store.state.user.token
          }
        })
        if (response.status === 200) {
          this.rights = response.data.metadata.rights
          this.rightsDialog = true
        } else {
          if (response.data.alerts && response.data.alerts.length > 0) {
            this.$store.commit('setAlerts', response.data.alerts)
          }
        }
      } catch (error) {
        this.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      } finally {
        Vue.set(this.loading, this.rightsPid, false)
      }
    },
    openHistory: async function (pid) {
      Vue.set(this.loading, pid, true)
      try {
        let response = await axios.get(this.config.api + '/ir/' + pid + '/events',
          {
            headers: {
              'X-XSRF-TOKEN': this.user.token
            }
          }
        )
        if (response.data.alerts && response.data.alerts.length > 0) {
          this.$store.commit('setAlerts', response.data.alerts)
        }
        if (response.data.events) {
          this.events = response.data.events
          this.historyDialog = true
        }
      } catch (error) {
      } finally {
        Vue.set(this.loading, pid, false)
      }
    },
    approve: async function (pid) {
      Vue.set(this.loading, pid, true)
      try {
        let response = await axios.post(this.config.api + '/ir/' + pid + '/approve',
          null,
          {
            headers: {
              'X-XSRF-TOKEN': this.user.token
            }
          }
        )
        if (response.data.alerts && response.data.alerts.length > 0) {
          this.$store.commit('setAlerts', response.data.alerts)
        }
      } catch (error) {
        console.error(error)
      } finally {
        Vue.set(this.loading, pid, false)
        this.search()
      }
    },
    accept: async function (pid) {
      Vue.set(this.loading, pid, true)
      try {
        let response = await axios.post(this.config.api + '/ir/' + pid + '/accept',
          null,
          {
            headers: {
              'X-XSRF-TOKEN': this.user.token
            }
          }
        )
        if (response.data.alerts && response.data.alerts.length > 0) {
          this.$store.commit('setAlerts', response.data.alerts)
        }
      } catch (error) {
        console.error(error)
      } finally {
        Vue.set(this.loading, pid, false)
        this.search()
      }
    },
    reject: async function (pid) {
      Vue.set(this.loading, pid, true)
      try {
        let response = await axios.post(this.config.api + '/ir/' + pid + '/reject',
          null,
          {
            headers: {
              'X-XSRF-TOKEN': this.user.token
            }
          }
        )
        if (response.data.alerts && response.data.alerts.length > 0) {
          this.$store.commit('setAlerts', response.data.alerts)
        }
      } catch (error) {
        console.error(error)
      } finally {
        Vue.set(this.loading, pid, false)
        this.search()
      }
    }
  }
}
</script>

<style scoped>
.preview-maxwidth {
  max-width: 120px;
}

.card__title--primary {
  padding-top: 10px;
}

.card__text {
  padding-top: 0px;
}

.container {
  padding: 0;
}

.v-application a {
  text-decoration: none;
}

.word-break {
  word-wrap: break-word;
}

</style>
