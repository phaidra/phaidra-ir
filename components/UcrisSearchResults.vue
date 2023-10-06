<template>
  <div>
    <v-dialog
      v-model="unlockConfirmationDialog"
      persistent
      max-width="500"
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ $t('Unlock this item?') }}
        </v-card-title>
        <v-card-text>{{ $t('Are you sure you want to unlock this item?') }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red darken-1"
            text
            @click="unlockConfirmationDialog = false"
          >
          {{ $t('Cancel') }}
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="unlockDoc()"
            :loading="isLockLoading"
          >
          {{ $t('Unlock') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="lockDialog"
      persistent
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">
            <span v-if="lockDialogType === 'lock'">{{ $t('Lock this import') }}</span>
            <span v-else>{{ $t('Unlock this import') }}</span>
          </span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col
                cols="12"
              >
              <v-form ref="lockForm">
                <v-text-field
                  label="Lock name"
                  required
                  :rules="[val => (val || '').length > 0 || 'This field is required']"
                  v-model="fullName"
                ></v-text-field>
              </v-form>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="lockDialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            :loading="isLockLoading"
            @click="onLockFormSubmit()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="rejectConfirmationDialog"
      persistent
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">
            {{ $t('Reject this item?') }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col
                cols="12"
              >
              <span>{{ $t('Are you sure you want to reject this item?') }}</span>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="rejectConfirmationDialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            :loading="isRejectLoading"
            @click="onRejectSubmit()"
          >
          {{ $t('Reject') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <template v-for="(doc, i) in this.docs">
      <v-row :key="'doc'+i">
        <v-col cols="3">
          <a class="font-weight-light primary--text" @click="showUcrisObj(doc)">{{ doc.title.value | truncate(100) }}</a>
        </v-col>
        <v-col cols="2">
          {{ getDoiForCol(doc) }}
        </v-col>
        <v-col cols="2">
          <div v-for="(item) in getAuthorList(doc)">
            {{item.firstname}} {{item.lastname}}
          </div>
        </v-col>
        <v-col cols="2">
          {{ getPublicationType(doc) | truncate(100) }}
        </v-col>
        <v-col cols="3">
          <v-spacer></v-spacer>
          <span v-if="doc.isLocked && doc.lockName">{{ $t('Locked By: ') }}<span class="text-bold">{{doc.lockName}}</span></span>
          <v-btn
              v-if="doc.isLocked"
              icon
              @click="unlockConfirmation(doc)"
              color="primary"
            >
              <v-icon>mdi-lock</v-icon>
            </v-btn>
          <v-btn v-if="!doc.isLocked" class="my-1 mx-1 font-weight-regular" @click="ucrisRowSelected(doc)" color="primary">{{ $t('Import') }}</v-btn>
          <v-btn class="my-1 mx-1 font-weight-regular" @click="navigateToUcris(doc)" color="primary">{{ $t('Show in ucris') }}</v-btn>
          <v-btn v-if="!doc.isLocked" class="my-1 mx-1 font-weight-regular" @click="rejectSelected(doc)" color="error">{{ $t('Reject') }}</v-btn>
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
        <span style="color: white;">u:cris json</span>
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
          {{ $t('Close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
    </v-dialog>
    <v-snackbar
      v-model="snackbarVisible"
      :timeout="3000"
    >
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script>
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
    search: Function,
    resetTable: Function
  },
  data () {
    return {
      loading: {},
      isRejectLoading: false,
      selectedUcrisInfo: {},
      showJsonViewer: false,
      lockDialog: false,
      lockDialogType: 'lock',
      fullName: "",
      selectedDoc: null,
      isLockLoading: null,
      unlockConfirmationDialog: false,
      snackbarText: "",
      snackbarVisible: false,
      rejectConfirmationDialog: false,
    }
  },
  methods: {
    lockImport: async function (doc, fullName){
      if(doc.lockName === fullName){
        return
      }
      return axios.post(`${this.config.api}/ir/pureimport/lock/${doc.pureId}/${fullName}`, {}, {
        headers: {
          'X-XSRF-TOKEN': this.$store.state.user.token
        }
      })
    },
    unLockImport: async function (pureId, fullName){
      return axios.post(`${this.config.api}/ir/pureimport/unlock/${pureId}/${fullName}`, {}, {
        headers: {
          'X-XSRF-TOKEN': this.$store.state.user.token
        }
      })
    },
    showSnackbar(text){
      this.snackbarVisible = true;
      this.snackbarText = text
    },
    onLockFormSubmit: async function (){
      this.unlockConfirmationDialog = false
      console.log('full name', this.fullName)
      this.$refs.lockForm.validate();
      if(!this.fullName){
        return
      }
      if(this.lockDialogType === 'unlock'){
        this.isLockLoading = true
        try {
          let response = await this.unLockImport(this.selectedDoc.pureId, this.fullName)
          this.isLockLoading = false
          console.log('response =>>', response)
          this.docs = this.docs.map(elem => {
              if(+elem.pureId === +this.selectedDoc.pureId) {
                elem.isLocked = false
              }
              return elem
          })
        } catch (error) {
          this.showSnackbar(error.message || 'something went wrong')
          this.isLockLoading = false
        }
      }else{
        this.isLockLoading = true
        try {
          await this.lockImport(this.selectedDoc, this.fullName)
          this.isLockLoading = false
          this.$store.commit('setSelectedUcrisData', this.selectedDoc)
          this.$router.push('/admin/submit?type=ucris&id='+this.selectedDoc.pureId+'&uuid='+this.selectedDoc.uuid)
        } catch (error) {
          this.showSnackbar(error.message || 'something went wrong')
          this.isLockLoading = false
        }

      }
      localStorage.setItem('lockName', this.fullName)
      this.lockDialog = false
    },
    unlockDoc: async function (){
      const existingLockName = localStorage.getItem('lockName')
      if(existingLockName) {
        this.isLockLoading = true
        try {
          await this.unLockImport(this.selectedDoc.pureId, existingLockName)
          this.unlockConfirmationDialog = false
          this.docs = this.docs.map(elem => {
              if(+elem.pureId === +this.selectedDoc.pureId) {
                elem.isLocked = false
              }
              return elem
          })
          this.isLockLoading = false
        } catch (error) {
          this.showSnackbar(error.message || 'something went wrong')
          this.isLockLoading = false
        }
        return
      }
      this.lockDialogType = 'unlock'
      this.lockDialog = true
    },
    showUcrisObj(doc){
      this.selectedUcrisInfo = doc;
      this.showJsonViewer = true
    },
    unlockConfirmation: async function (doc){
      this.selectedDoc = doc;
      this.unlockConfirmationDialog = true
    },
    onRejectSubmit: async function (){
      try {
        this.isRejectLoading = true
        await axios.post(`${this.config.api}/ir/pureimport/reject/${this.selectedDoc.uuid}`, {}, {
        headers: {
          'X-XSRF-TOKEN': this.$store.state.user.token
        }
      })
      this.resetTable()
      this.showSnackbar('The item has been rejected successfully!')
      this.isRejectLoading = false
      this.rejectConfirmationDialog = false
    } catch (error) {
      this.showSnackbar(error.message || 'something went wrong')
      this.isRejectLoading = false
      this.rejectConfirmationDialog = false
      }
    },
    rejectSelected: async function (doc){
      this.selectedDoc = doc;
      this.rejectConfirmationDialog = true
    },
    ucrisRowSelected: async function (doc){
      const existingLockName = localStorage.getItem('lockName')
      if(existingLockName) {
        this.isLockLoading = true
        try {
          await this.lockImport(doc, existingLockName)
          this.isLockLoading = false
          this.$store.commit('setSelectedUcrisData', doc)
          this.$router.push('/admin/submit?type=ucris&id='+doc.pureId+'&uuid='+doc.uuid)
        } catch (error) {
          this.showSnackbar(error.message || 'something went wrong')
          this.isLockLoading = false
        }
        return
      }
      this.selectedDoc = doc;
      this.lockDialogType = 'lock'
      this.lockDialog = true
    },
    navigateToUcris(doc) {
      window.open(`https://ucris.univie.ac.at/admin/editor/dk/atira/pure/api/shared/model/researchoutput/editor/contributiontojournaleditor.xhtml?scheme=&type=&id=${doc.pureId} `, '_blank');
    },
    getPublicationType(ucrisData){
      let ucrisType = ucrisData?.type?.uri || 'No type found'
      ucrisType = ucrisType.replace('/dk/atira/pure/researchoutput/researchoutputtypes/','')
      ucrisType = ucrisType.replace('/',"/\n")
      return ucrisType
    },
    getAuthorList(ucrisData){
      let authors = [];
      if(ucrisData?.contributors && ucrisData?.contributors.length){
        let authorRecords = ucrisData.contributors;
        authorRecords.forEach(authorRec => {
          if (authorRec['name'] &&
          authorRec?.role?.uri &&
          authorRec?.role?.uri === '/dk/atira/pure/researchoutput/roles/contributiontojournal/author') {
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
    getDoiForCol(ucrisData){
      if (ucrisData?.electronicVersions) {
        for (let i = 0; i < ucrisData.electronicVersions.length; i++) {
          let ev = ucrisData.electronicVersions[i]
          if (ev.doi) {
            return ev.doi
          }
        }
      }
      return "N/A"
    },
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

.text-bold {
  font-weight: bold;
}

</style>
