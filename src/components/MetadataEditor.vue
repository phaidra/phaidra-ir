<template>

  <admin-submit-ir
    :importData="importData"
    :targetPid="pid"
    @object-saved="objectSaved()"
  ></admin-submit-ir>

</template>

<script>
import { context } from '../mixins/context'
import { config } from '../mixins/config'
import AdminSubmitIr from './AdminSubmitIr'

export default {
  name: 'metadata-editor',
  mixins: [ context, config ],
  components: {
    AdminSubmitIr
  },
  computed: {
    pid: function () {
      return this.$route.params.pid
    }
  },
  data () {
    return {
      importData: {
        roles: [],
        funding: [],
        identifiers: [],
        keywords: [],
        abstract: {},
        unknownpredicates: []
      }
    }
  },
  methods: {
    objectSaved: function (event) {
      this.$router.push({ name: 'detail', params: { pid: this.pid } })
      this.$vuetify.goTo(0)
    },
    loadJsonld: async function (self, pid) {
      self.importData = {
        roles: [],
        funding: [],
        identifiers: [],
        keywords: [],
        abstract: {},
        unknownpredicates: []
      }
      try {
        let response = await self.$http.request({
          method: 'GET',
          url: self.config.api + '/object/' + pid + '/metadata',
          params: {
            mode: 'resolved'
          }
        })
        self.importData = self.getImportData(response.data.metadata['JSON-LD'])
      } catch (error) {
        console.log(error)
        self.$store.commit('setAlerts', [{ type: 'danger', msg: error }])
      }
    },
    getImportData: function (jsonld) {
      let importData = {
        roles: [],
        funding: [],
        identifiers: [],
        keywords: [],
        abstract: {},
        unknownpredicates: []
      }
      // ir only have 1 keywords component, so we assume the language is the same
      let keywords = []
      Object.entries(jsonld).forEach(([key, value]) => {
        if (key === 'dce:subject') {
          for (let v of value) {
            if (v['@type'] === 'skos:Concept') {
              for (let pl of v['skos:prefLabel']) {
                keywords.push(pl['@value'])
                // language will come from abstract
              }
            }
          }
        }
      })
      importData['keywords'] = keywords

      Object.entries(jsonld).forEach(([key, values]) => {
        if (key !== '@type') {
          for (let obj of values) {
            switch (key) {
              // alternate identifier
              case 'rdam:P30004':
                importData['identifiers'].push(
                  {
                    type: obj['@type'],
                    value: obj['@value']
                  }
                )
                break

              case 'dcterms:type':
                // this is fix in uscholar
                break

              // not repeatable in uscholar
              // edm:hasType
              case 'edm:hasType':
                for (let em of obj['skos:exactMatch']) {
                  importData['objecttype'] = em
                }
                break

              // not repeatable in uscholar
              // oaire:version
              case 'oaire:version':
                for (let em of obj['skos:exactMatch']) {
                  importData['version'] = em
                }
                break

              // not repeatable in uscholar
              // dcterms:accessRights
              case 'dcterms:accessRights':
                for (let em of obj['skos:exactMatch']) {
                  importData['accessrights'] = em
                }
                break

              // not repeatable in uscholar (only type bf:Title)
              // dce:title
              case 'dce:title':
                if (obj['bf:mainTitle']) {
                  importData['title'] = {}
                  for (let title of obj['bf:mainTitle']) {
                    importData['title']['value'] = title['@value']
                    if (title['@language']) {
                      importData['title']['language'] = title['@language']
                    }
                  }
                }
                if (obj['bf:subtitle']) {
                  for (let subtitle of obj['bf:subtitle']) {
                    importData['subtitle'] = subtitle['@value']
                  }
                }
                break

              // not repeatable in uscholar (only bf:Summary)
              // bf:note
              case 'bf:note':
                importData['abstract'] = {}
                for (let prefLabel of obj['skos:prefLabel']) {
                  importData['abstract']['value'] = prefLabel['@value']
                  if (prefLabel['@language']) {
                    importData['abstract']['language'] = prefLabel['@language']
                  }
                }
                break

              // only simple language (no skos:Concept)
              // dcterms:language
              case 'dcterms:language':
                importData['language'] = obj
                break

              // dce:subject
              case 'dce:subject':
                // noop - we handled this already
                break

              case 'rdau:P60193':
                importData['series'] = {}
                if (obj['dce:title']) {
                  for (let t of obj['dce:title']) {
                    if (t['bf:mainTitle']) {
                      for (let mt of t['bf:mainTitle']) {
                        if (mt['@value']) {
                          importData['series'].title = mt['@value']
                        }
                        // language is not used
                      }
                    }
                  }
                }
                if (obj['bibo:volume']) {
                  for (let v of obj['bibo:volume']) {
                    importData['series'].volume = v
                  }
                }
                if (obj['bibo:issue']) {
                  for (let v of obj['bibo:issue']) {
                    importData['series'].issue = v
                  }
                }
                if (obj['dcterms:issued']) {
                  for (let v of obj['dcterms:issued']) {
                    importData['series'].issued = v
                  }
                }
                if (obj['identifiers:issn']) {
                  for (let v of obj['identifiers:issn']) {
                    importData['series'].issn = v
                  }
                }
                if (obj['skos:exactMatch']) {
                  for (let v of obj['skos:exactMatch']) {
                    importData['series'].identifier = v
                  }
                }
                Object.entries(jsonld).forEach(([key1, value1]) => {
                  if (key1 === 'schema:pageStart') {
                    for (let ps of value1) {
                      importData['series'].pagestart = ps
                    }
                  }
                  if (key1 === 'schema:pageEnd') {
                    for (let pe of value1) {
                      importData['series'].pageend = pe
                    }
                  }
                })
                break

              case 'rdau:P60101':
                importData['containedin'] = {}
                if (obj['dce:title']) {
                  for (let t of obj['dce:title']) {
                    if (t['bf:mainTitle']) {
                      for (let mt of t['bf:mainTitle']) {
                        if (mt['@value']) {
                          importData['containedin']['title'] = mt['@value']
                        }
                        // language is not used
                      }
                    }
                    if (t['bf:subtitle']) {
                      for (let st of t['bf:subtitle']) {
                        if (st['@value']) {
                          importData['containedin']['subtitle'] = st['@value']
                        }
                      }
                    }
                  }
                }
                if (obj['ids:isbn']) {
                  for (let isbn of obj['ids:isbn']) {
                    importData['containedin'].isbn = isbn
                  }
                }
                importData['containedin']['roles'] = []
                Object.entries(obj).forEach(([key, value]) => {
                  if (key.startsWith('role')) {
                    for (let role of value) {
                      let entity = {
                        role: key
                      }
                      if (role['schema:familyName']) {
                        for (let lastname of role['schema:familyName']) {
                          entity.lastname = lastname['@value']
                        }
                      }
                      if (role['schema:givenName']) {
                        for (let firstname of role['schema:givenName']) {
                          entity.firstname = firstname['@value']
                        }
                      }
                      importData['containedin']['roles'].push(entity)
                    }
                  }
                })
                Object.entries(jsonld).forEach(([key1, value1]) => {
                  if (key1 === 'schema:pageStart') {
                    for (let ps of value1) {
                      importData['containedin']['pagestart'] = ps
                    }
                  }
                  if (key1 === 'schema:pageEnd') {
                    for (let pe of value1) {
                      importData['containedin']['pageend'] = pe
                    }
                  }
                })
                if (obj['rdau:P60193']) {
                  importData['containedin']['series'] = {}
                  for (let series of obj['rdau:P60193']) {
                    if (series['dce:title']) {
                      for (let t of series['dce:title']) {
                        if (t['bf:mainTitle']) {
                          for (let mt of t['bf:mainTitle']) {
                            if (mt['@value']) {
                              importData['containedin']['series']['title'] = mt['@value']
                            }
                            // language is not used
                          }
                        }
                      }
                    }
                    if (series['bibo:volume']) {
                      for (let v of series['bibo:volume']) {
                        importData['containedin']['series']['volume'] = v
                      }
                    }
                    if (series['bibo:issue']) {
                      for (let v of series['bibo:issue']) {
                        importData['containedin']['series']['issue'] = v
                      }
                    }
                    if (series['dcterms:issued']) {
                      for (let v of series['dcterms:issued']) {
                        importData['containedin']['series']['issued'] = v
                      }
                    }
                    if (series['ids:issn']) {
                      for (let v of series['ids:issn']) {
                        importData['containedin']['series']['issn'] = v
                      }
                    }
                    if (series['skos:exactMatch']) {
                      for (let v of series['skos:exactMatch']) {
                        importData['containedin']['series']['identifier'] = v
                      }
                    }
                  }
                }
                if (obj['bf:provisionActivity']) {
                  importData['containedin']['publisher'] = {}
                  for (let prov of obj['bf:provisionActivity']) {
                    if (prov['bf:agent']) {
                      for (let pub of prov['bf:agent']) {
                        if (pub['skos:exactMatch']) {
                          for (let id of pub['skos:exactMatch']) {
                            if (id.startsWith('https://pid.phaidra.org/')) {
                              importData['containedin']['publisher']['type'] = 'select'
                              importData['containedin']['publisher']['orgunit'] = id
                            } else {
                              importData['containedin']['publisher']['type'] = 'other'
                              if (pub['schema:name']) {
                                for (let name of pub['schema:name']) {
                                  importData['containedin']['publisher']['name'] = name['@value']
                                }
                              }
                            }
                          }
                        } else {
                          if (pub['schema:name']) {
                            importData['containedin']['publisher']['type'] = 'other'
                            if (pub['schema:name']) {
                              for (let name of pub['schema:name']) {
                                importData['containedin']['publisher']['name'] = name['@value']
                              }
                            }
                          }
                        }
                      }
                    }
                    if (prov['bf:date']) {
                      for (let pdate of prov['bf:date']) {
                        importData['containedin']['publisher']['date'] = pdate
                      }
                    }
                  }
                }
                break

              // edm:rights
              case 'edm:rights':
                importData['license'] = obj
                break

              // dce:rights
              case 'dce:rights':
                importData['rights'] = {}
                importData['rights']['value'] = obj['@value']
                if (obj['@language']) {
                  importData['rights']['language'] = obj['@language']
                }
                break

              // bf:provisionActivity
              case 'bf:provisionActivity':
                importData['publisher'] = {}
                if (obj['bf:agent']) {
                  for (let pub of obj['bf:agent']) {
                    if (pub['skos:exactMatch']) {
                      for (let id of pub['skos:exactMatch']) {
                        if (id.startsWith('https://pid.phaidra.org/')) {
                          importData['publisher']['type'] = 'select'
                          importData['publisher']['orgunit'] = id
                        } else {
                          importData['publisher']['type'] = 'other'
                          if (pub['schema:name']) {
                            for (let name of pub['schema:name']) {
                              importData['publisher']['name'] = name['@value']
                            }
                          }
                        }
                      }
                    } else {
                      if (pub['schema:name']) {
                        importData['publisher']['type'] = 'other'
                        if (pub['schema:name']) {
                          for (let name of pub['schema:name']) {
                            importData['publisher']['name'] = name['@value']
                          }
                        }
                      }
                    }
                  }
                }
                if (obj['bf:place']) {
                  for (let pl of obj['bf:place']) {
                    if (pl['skos:prefLabel']) {
                      for (let pllab of pl['skos:prefLabel']) {
                        importData['publisher']['place'] = pllab['@value']
                      }
                    }
                  }
                }
                if (obj['bf:date']) {
                  for (let pdate of obj['bf:date']) {
                    importData['publisher']['date'] = pdate
                  }
                }
                break

              // frapo:isOutputOf
              case 'frapo:isOutputOf':
                let funding = {}
                if (obj['@type'] === 'foaf:Project') {
                  if (obj['skos:exactMatch']) {
                    for (let v of obj['skos:exactMatch']) {
                      funding['projectid'] = v
                    }
                  }
                  if (obj['frapo:hasFundingAgency']) {
                    for (let funder of obj['frapo:hasFundingAgency']) {
                      if (funder['skos:exactMatch']) {
                        for (let em of funder['skos:exactMatch']) {
                          funding['funderid'] = em
                        }
                      }
                    }
                  }
                  importData['funding'].push(funding)
                }
                break

              // schema:numberOfPages
              case 'schema:numberOfPages':
                importData['numberofpages'] = obj
                break

              // ebucore:filename
              case 'ebucore:filename':
                importData['filename'] = obj
                break

              // ebucore:hasMimeType
              case 'ebucore:hasMimeType':
                importData['mimetype'] = obj
                break

              // dates (not embargo date, save that one separately)
              case 'dcterms:date':
              case 'dcterms:created':
              case 'dcterms:modified':
              case 'dcterms:issued':
              case 'dcterms:valid':
              case 'dcterms:dateAccepted':
              case 'dcterms:dateCopyrighted':
              case 'dcterms:dateSubmitted':
              case 'rdau:P60071':
              case 'phaidra:dateAccessioned':
                // only edtf now (later time can be edm:TimeSpan)
                if (typeof obj === 'string') {
                  importData['date'] = {}
                  importData['date']['type'] = key
                  importData['date']['value'] = obj
                }
                break

              // embargo date
              case 'dcterms:available':
                if (typeof obj === 'string') {
                  importData['embargodate'] = obj
                }
                break

              // pages, handled insisde rdau:P60193 or rdau:P60101
              case 'schema:pageStart':
              case 'schema:pageEnd':
                // noop
                break

              default:

                // role
                if (key.startsWith('role')) {
                  let entity = {
                    role: key
                  }
                  entity.role = key
                  let role = obj
                  if (role['@type'] === 'schema:Person') {
                    if (role['schema:familyName']) {
                      for (let lastname of role['schema:familyName']) {
                        entity.lastname = lastname['@value']
                      }
                    }
                    if (role['schema:givenName']) {
                      for (let firstname of role['schema:givenName']) {
                        entity.firstname = firstname['@value']
                      }
                    }
                    if (role['skos:exactMatch']) {
                      for (let id of role['skos:exactMatch']) {
                        entity.identifier = {}
                        entity.identifier['type'] = id['@type']
                        entity.identifier['value'] = id['@value']
                      }
                    }
                    if (role['schema:affiliation']) {
                      for (let af of role['schema:affiliation']) {
                        entity.affiliation = {}
                        if (af['skos:exactMatch']) {
                          for (let id of af['skos:exactMatch']) {
                            if (id.startsWith('https://pid.phaidra.org/')) {
                              entity.affiliation['type'] = 'select'
                              entity.affiliation['value'] = id
                            } else {
                              entity.affiliation['type'] = 'other'
                              if (af['schema:name']) {
                                for (let name of af['schema:name']) {
                                  entity.affiliation['value'] = name['@value']
                                }
                              }
                            }
                          }
                        } else {
                          if (af['schema:name']) {
                            entity.affiliation['type'] = 'other'
                            for (let name of af['schema:name']) {
                              entity.affiliation['value'] = name['@value']
                            }
                          }
                        }
                      }
                    }
                  }
                  importData['roles'].push(entity)
                } else {
                  // unknown predicate
                  importData['unknownpredicates'].push(key)
                }
                break
            }
          }
        }
      })

      return importData
    }
  },
  beforeRouteEnter: function (to, from, next) {
    next(vm => {
      vm.$store.commit('setLoading', true)
      vm.loadJsonld(vm, to.params.pid).then(() => {
        vm.$store.commit('setLoading', false)
        next()
      })
    })
  },
  beforeRouteUpdate: function (to, from, next) {
    this.$store.commit('setLoading', true)
    this.loadJsonld(this, to.params.pid).then(() => {
      this.$store.commit('setLoading', false)
      next()
    })
  }
}
</script>
