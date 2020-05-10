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
        unknownpredicates: [],
        errors: []
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
                Object.entries(obj).forEach(([key1, values1]) => {
                  switch (key1) {
                    case '@type':
                      if (values1 !== 'skos:Concept') {
                        importData.errors('Unsupported dcterms:type type: ' + values1)
                      }
                      break
                    case 'skos:exactMatch':
                      for (let em of obj['skos:exactMatch']) {
                        if (em !== 'https://pid.phaidra.org/vocabulary/69ZZ-2KGX') {
                          importData.errors('Unsupported resource type: ' + em)
                        }
                      }
                    case 'skos:prefLabel':
                      // will be loaded
                      break
                    default:
                      importData.errors('Unsupported dcterms:type property: ' + key1)
                      break
                  }
                })
                break

              case 'edm:hasType':
                Object.entries(obj).forEach(([key1, values1]) => {
                  switch (key1) {
                    case '@type':
                      if (values1 !== 'skos:Concept') {
                        importData.errors('Unsupported edm:hasType type: ' + values1)
                      }
                      break
                    case 'skos:exactMatch':
                      for (let em of obj['skos:exactMatch']) {
                        if (importData['objecttype']) {
                          importData.errors('Multiple object types: ' + em)
                        } else {
                          importData['objecttype'] = em
                        }
                      }
                    case 'skos:prefLabel':
                      // will be loaded
                      break
                    default:
                      importData.errors('Unsupported edm:hasType property: ' + key1)
                      break
                  }
                })
                break

              case 'oaire:version':
                Object.entries(obj).forEach(([key1, values1]) => {
                  switch (key1) {
                    case '@type':
                      if (values1 !== 'skos:Concept') {
                        importData.errors('Unsupported oaire:version type: ' + values1)
                      }
                      break
                    case 'skos:exactMatch':
                      for (let em of obj['skos:exactMatch']) {
                        if (importData['version']) {
                          importData.errors('Multiple version types: ' + em)
                        } else {
                          importData['version'] = em
                        }
                      }
                    case 'skos:prefLabel':
                      // will be loaded
                      break
                    default:
                      importData.errors('Unsupported oaire:version property: ' + key1)
                      break
                  }
                })
                break

              case 'dcterms:accessRights':
                Object.entries(obj).forEach(([key1, values1]) => {
                  switch (key1) {
                    case '@type':
                      if (values1 !== 'skos:Concept') {
                        importData.errors('Unsupported dcterms:accessRights type: ' + values1)
                      }
                      break
                    case 'skos:exactMatch':
                      for (let em of obj['skos:exactMatch']) {
                        if (importData['accessrights']) {
                          importData.errors('Multiple accessrights types: ' + em)
                        } else {
                          importData['accessrights'] = em
                        }
                      }
                    case 'skos:prefLabel':
                      // will be loaded
                      break
                    default:
                      importData.errors('Unsupported dcterms:accessRights property: ' + key1)
                      break
                  }
                })
                break

              // dce:title
              case 'dce:title':
                importData['title'] = {}
                Object.entries(obj).forEach(([key1, values1]) => {
                  switch (key1) {
                    case '@type':
                      if (values1 !== 'bf:Title') {
                        importData.errors('Unsupported title type: ' + values1)
                      }
                      break
                    case 'bf:mainTitle':
                      for (let title of values1) {
                        importData['title']['value'] = title['@value']
                        if (title['@language']) {
                          importData['title']['language'] = title['@language']
                        }
                      }
                      break
                    case 'bf:subtitle':
                      for (let subtitle of values1) {
                        importData['subtitle'] = subtitle['@value']
                      }
                      break
                    default:
                      importData.errors('Unsupported dce:title property: ' + key1)
                      break
                  }
                })
                break

              // bf:note
              case 'bf:note':
                importData['abstract'] = {}
                if (obj['@type'] !== 'bf:Summary') {
                  importData.errors('Unsupported description type: ' + obj['@type'])
                }
                for (let prefLabel of obj['skos:prefLabel']) {
                  importData['abstract']['value'] = prefLabel['@value']
                  if (prefLabel['@language']) {
                    importData['abstract']['language'] = prefLabel['@language']
                  }
                }
                break

              // dcterms:language
              case 'dcterms:language':
                if (typeof obj === 'object') {
                  importData.errors('Unsupported language structure: ' + JSON.stringify(obj))
                } else {
                  if (importData['language']) {
                    importData.errors('Multiple dcterms:language: ' + JSON.stringify(obj))
                  } else {
                    importData['language'] = obj
                  }
                }
                break

              // dce:subject
              case 'dce:subject':
                // noop - we handled this already
                break

              case 'rdau:P60193':
                importData['series'] = {}
                Object.entries(obj).forEach(([key1, values1]) => {
                  switch (key1) {
                    case 'dce:title':
                      for (let v of values1) {
                        if (importData['series'].title) {
                          importData.errors('Multiple series titles: ' + JSON.stringify(v))
                        } else {
                          Object.entries(v).forEach(([key2, values2]) => {
                            switch (key2) {
                              case '@type':
                                if (values2 !== 'bf:Title') {
                                  importData.errors('Unsupported series title type: ' + values2)
                                }
                                break
                              case 'bf:mainTitle':
                                for (let title of values2) {
                                  if (importData['series'].title) {
                                    importData.errors('Multiple series titles: ' + title['@value'])
                                  } else {
                                    importData['series']['title']['value'] = title['@value']
                                    if (title['@language']) {
                                      importData['series']['title']['language'] = title['@language']
                                    }
                                  }
                                }
                                break
                              default:
                                importData.errors('Unsupported series dce:title property: ' + key2)
                                break
                            }
                          })
                        }
                      }
                      break
                    case 'bibo:volume':
                      for (let v of values1) {
                        importData['series'].volume = v
                      }
                      break
                    case 'bibo:issue':
                      for (let v of values1) {
                        importData['series'].issue = v
                      }
                      break
                    case 'bibo:issued':
                      for (let v of values1) {
                        importData['series'].issued = v
                      }
                      break
                    case 'bibo:issn':
                      for (let v of values1) {
                        importData['series'].issn = v
                      }
                      break
                    case 'skos:exactMatch':
                      for (let v of values1) {
                        importData['series'].identifier = v
                      }
                      break
                    default:
                      importData.errors('Unsupported series property: ' + key1)
                      break
                  }
                })
                Object.entries(jsonld).forEach(([key1, values1]) => {
                  if (key1 === 'schema:pageStart') {
                    for (let ps of values1) {
                      importData['series'].pagestart = ps
                    }
                  }
                  if (key1 === 'schema:pageEnd') {
                    for (let pe of values1) {
                      importData['series'].pageend = pe
                    }
                  }
                })
                break

              case 'rdau:P60101':
                importData['containedin'] = {}
                importData['containedin']['roles'] = []
                Object.entries(obj).forEach(([key1, values1]) => {
                  switch (key1) {
                    case 'dce:title':
                      for (let v of values1) {
                        Object.entries(v).forEach(([key2, values2]) => {
                          switch (key2) {
                            case '@type':
                              if (values2 !== 'bf:Title') {
                                importData.errors('Unsupported title type: ' + values2)
                              }
                              break
                            case 'bf:mainTitle':
                              for (let title of values2) {
                                importData['containedin']['title']['value'] = title['@value']
                                if (title['@language']) {
                                  importData['containedin']['title']['language'] = title['@language']
                                }
                              }
                              break
                            case 'bf:subtitle':
                              for (let subtitle of values2) {
                                importData['containedin']['subtitle'] = subtitle['@value']
                              }
                              break
                            default:
                              importData.errors('Unsupported rdau:P60101 dce:title property: ' + key2)
                              break
                          }
                        })
                      }
                      break
                    case 'ids:isbn':
                      for (let isbn of values1) {
                        importData['containedin'].isbn = isbn
                      }
                      break
                    case 'rdau:P60193':
                      importData['containedin']['series'] = {}
                      for (let v of values1) {
                        Object.entries(v).forEach(([key2, values2]) => {
                          switch (key2) {
                            case 'dce:title':
                              for (let v1 of values2) {
                                if (importData['containedin']['series'].title) {
                                  importData.errors('Multiple rdau:P60101 > rdau:P60193 titles: ' + JSON.stringify(v))
                                } else {
                                  Object.entries(v1).forEach(([key3, values3]) => {
                                    switch (key3) {
                                      case '@type':
                                        if (values3 !== 'bf:Title') {
                                          importData.errors('Unsupported rdau:P60101 > rdau:P60193 title type: ' + values3)
                                        }
                                        break
                                      case 'bf:mainTitle':
                                        for (let title of values3) {
                                          if (importData['containedin']['series'].title) {
                                            importData.errors('Multiple series titles: ' + title['@value'])
                                          } else {
                                            importData['containedin']['series']['title']['value'] = title['@value']
                                            if (title['@language']) {
                                              importData['containedin']['series']['title']['language'] = title['@language']
                                            }
                                          }
                                        }
                                        break
                                      default:
                                        importData.errors('Unsupported rdau:P60101 > rdau:P60193 > dce:title property: ' + key3)
                                        break
                                    }
                                  })
                                }
                              }
                              break
                            case 'bibo:volume':
                              for (let v of values2) {
                                importData['containedin']['series'].volume = v
                              }
                              break
                            case 'bibo:issue':
                              for (let v of values2) {
                                importData['containedin']['series'].issue = v
                              }
                              break
                            case 'bibo:issued':
                              for (let v of values2) {
                                importData['containedin']['series'].issued = v
                              }
                              break
                            case 'bibo:issn':
                              for (let v of values2) {
                                importData['containedin']['series'].issn = v
                              }
                              break
                            case 'skos:exactMatch':
                              for (let v of values2) {
                                importData['containedin']['series'].identifier = v
                              }
                              break
                            default:
                              importData.errors('Unsupported rdau:P60101 > rdau:P60193 property: ' + key2)
                              break
                          }
                        })
                      }
                      break
                    case 'bf:provisionActivity':
                      importData['containedin']['publisher'] = {}
                      for (let v of values1) {
                        Object.entries(v).forEach(([key2, values2]) => {
                          switch (key2) {
                            case 'bf:agent':
                              importData['containedin']['publisher']['type'] = 'other'
                              for (let v1 of values2) {
                                Object.entries(v1).forEach(([key3, values3]) => {
                                  switch (key3) {
                                    case '@type':
                                      if (values3 !== 'schema:Organization') {
                                        importData.errors('Unsupported rdau:P60101 > bf:provisionActivity > bf:agent type: ' + values3)
                                      }
                                      break
                                    case 'schema:name':
                                      for (let name of values3) {
                                        if (importData['containedin']['publisher']['name']) {
                                          importData.errors('Multiple rdau:P60101 > bf:provisionActivity > bf:agent -> schema:name: ' + JSON.stringify(name))
                                        } else {
                                          importData['containedin']['publisher']['name'] = name['@value']
                                        }
                                      }
                                      break
                                    case 'skos:exactMatch':
                                      for (let id of values3) {
                                        if (id.startsWith('https://pid.phaidra.org/')) {
                                          importData['containedin']['publisher']['type'] = 'select'
                                          if (importData['containedin']['publisher']['orgunit']) {
                                            importData.errors('Multiple rdau:P60101 > bf:provisionActivity > bf:agent -> skos:exactMatch: ' + JSON.stringify(id))
                                          } else {
                                            importData['containedin']['publisher']['orgunit'] = id
                                          }
                                        }
                                      }
                                      break
                                    default:
                                      importData.errors('Unsupported rdau:P60101 > bf:provisionActivity > bf:agent property: ' + key3)
                                      break
                                  }
                                })
                              }
                            break
                          case 'bf:date':
                            for (let v1 of values2) {
                              if (importData['containedin']['publisher']['date']) {
                                importData.errors('Multiple rdau:P60101 > bf:provisionActivity > bf:date: ' + JSON.stringify(v1))
                              } else {
                                importData['containedin']['publisher']['date'] = v1
                              }
                            }
                            break
                          default:
                            importData.errors('Unsupported rdau:P60101 > bf:provisionActivity property: ' + key2)
                            break
                          }
                        })
                      }
                      break
                    default:
                      if (key1.startsWith('role')) {
                        for (let role of values1) {
                          let entity = {
                            role: key
                          }
                          Object.entries(role).forEach(([key2, values2]) => {
                            switch (key2) {
                              case '@type':
                                if (values2 !== 'schema:Person') {
                                  importData.errors('Unsupported rdau:P60101 > role type: ' + role['@type'])
                                }
                                break
                              case 'schema:givenName':
                                for (let lastname of values2) {
                                  if (entity.firstname) {
                                    importData.errors('Multiple rdau:P60101 > role > schema:givenName: ' + JSON.stringify(firstname))
                                  } else {
                                    entity.firstname = firstname['@value']
                                  }
                                }
                                break
                              case 'schema:familyName':
                                for (let lastname of values2) {
                                  if (entity.lastname) {
                                    importData.errors('Multiple rdau:P60101 > role > schema:familyName: ' + JSON.stringify(lastname))
                                  } else {
                                    entity.lastname = lastname['@value']
                                  }
                                }
                                break
                              default:
                                break
                            }
                          })
                          importData['containedin']['roles'].push(entity)
                        }
                      } else {
                        importData.errors('Unsupported rdau:P60101 property: ' + key1)
                      }
                      break
                  }
                })
                Object.entries(jsonld).forEach(([key1, values1]) => {
                  if (key1 === 'schema:pageStart') {
                    for (let ps of values1) {
                      importData['containedin']['pagestart'] = ps
                    }
                  }
                  if (key1 === 'schema:pageEnd') {
                    for (let pe of values1) {
                      importData['containedin']['pageend'] = pe
                    }
                  }
                })
                break

              // edm:rights
              case 'edm:rights':
                for (let license of obj['edm:rights']) {
                  if (importData['license']) {
                    importData.errors('Multiple licenses: ' + license)
                  } else {
                    importData['license'] = em
                  }
                }
                importData['license'] = obj
                break

              // dce:rights
              case 'dce:rights':
                if (importData['rights']) {
                  importData.errors('Multiple rights statements: ' + JSON.stringify(obj))
                } else {
                  importData['rights'] = {}
                  importData['rights']['value'] = obj['@value']
                  if (obj['@language']) {
                    importData['rights']['language'] = obj['@language']
                  }
                }
                break

              // bf:provisionActivity
              case 'bf:provisionActivity':
                importData['publisher'] = {}
                importData['publisher']['type'] = 'other'
                Object.entries(obj).forEach(([key1, values1]) => {
                  switch (key3) {
                    case '@type':
                      if (values1 !== 'schema:Organization') {
                        importData.errors('Unsupported bf:provisionActivity > bf:agent type: ' + values1)
                      }
                      break
                    case 'schema:name':
                      for (let name of values1) {
                        if (importData['publisher']['name']) {
                          importData.errors('Multiple bf:provisionActivity > bf:agent -> schema:name: ' + JSON.stringify(name))
                        } else {
                          importData['publisher']['name'] = name['@value']
                        }
                      }
                      break
                    case 'skos:exactMatch':
                      for (let id of values1) {
                        if (id.startsWith('https://pid.phaidra.org/')) {
                          importData['publisher']['type'] = 'select'
                          if (importData['publisher']['orgunit']) {
                            importData.errors('Multiple bf:provisionActivity > bf:agent -> skos:exactMatch: ' + JSON.stringify(id))
                          } else {
                            importData['publisher']['orgunit'] = id
                          }
                        }
                      }
                      break
                    default:
                      importData.errors('Unsupported bf:provisionActivity > bf:agent property: ' + key1)
                      break
                  }
                })
                break

              // frapo:isOutputOf
              case 'frapo:isOutputOf':
                let funding = {}
                Object.entries(obj).forEach(([key1, values1]) => {
                  switch (key1) {
                    case '@type':
                      if (values1 !== 'foaf:Project') {
                        importData.errors('Unsupported frapo:isOutputOf type: ' + values1)
                      }
                      break
                    case 'skos:exactMatch':
                      if (funding['projectid']) {
                        importData.errors('Multiple frapo:isOutputOf > skos:exactMatch: ' + JSON.stringify(values1))
                      } else {
                        for (let id of values1) {
                          funding['projectid'] = id
                        }
                      }
                    case 'frapo:hasFundingAgency':
                      if (funding['funderid']) {
                        importData.errors('Multiple frapo:isOutputOf > frapo:hasFundingAgency > skos:exactMatch: ' + JSON.stringify(values1))
                      } else {
                        for (let funder of values1) {
                          Object.entries(funder).forEach(([key2, values2]) => {
                            switch (key2) {
                              case '@type':
                                if (values1 !== 'frapo:FundingAgency') {
                                  importData.errors('Unsupported frapo:isOutputOf > frapo:hasFundingAgency type: ' + values2)
                                }
                                break
                              case 'skos:exactMatch':
                                if (funding['funderid']) {
                                  importData.errors('Multiple frapo:isOutputOf > frapo:hasFundingAgency > skos:exactMatch: ' + JSON.stringify(values2))
                                } else {
                                  for (let id of values2) {
                                    funding['funderid'] = id
                                  }
                                }
                                break
                              default:
                                importData.errors('Unsupported frapo:isOutputOf > frapo:hasFundingAgency property: ' + key2)
                                break
                            }
                          })
                        }
                      }
                      break
                    default:
                      importData.errors('Unsupported frapo:isOutputOf property: ' + key1)
                      break
                  }
                })
                importData['funding'].push(funding)
                break

              case 'schema:numberOfPages':
                if (importData['numberofpages']) {
                  importData.errors('Multiple numberofpages: ' + JSON.stringify(obj))
                } else {
                  importData['numberofpages'] = obj
                }
                break

              case 'ebucore:filename':
                if (importData['filename']) {
                  importData.errors('Multiple filenames: ' + JSON.stringify(obj))
                } else {
                  importData['filename'] = obj
                }
                break

              case 'ebucore:hasMimeType':
                if (importData['mimetype']) {
                  importData.errors('Multiple mimetypes: ' + JSON.stringify(obj))
                } else {
                  importData['mimetype'] = obj
                }
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
                  if (importData['date']) {
                    importData.errors('Multiple dates, key[' + key + ']: ' + JSON.stringify(values2))
                  } else {
                    importData['date'] = {}
                    importData['date']['type'] = key
                    importData['date']['value'] = obj
                  }
                } else {
                  importData.errors('Unsupported date format: ' + JSON.stringify(obj))
                }
                break

              // embargo date
              case 'dcterms:available':
                if (typeof obj === 'string') {
                  if (importData['embargodate']) {
                    importData.errors('Multiple embargo dates: ' + JSON.stringify(values2))
                  } else {
                    importData['embargodate'] = obj
                  }
                } else {
                  importData.errors('Unsupported date format: ' + JSON.stringify(obj))
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
                  for (let role of values1) {
                    let entity = {
                      role: key
                    }
                    Object.entries(role).forEach(([key2, values2]) => {
                      switch (key2) {
                        case '@type':
                          if (values2 !== 'schema:Person') {
                            importData.errors('Unsupported role type: ' + role['@type'])
                          }
                          break
                        case 'schema:givenName':
                          for (let lastname of values2) {
                            if (entity.firstname) {
                              importData.errors('Multiple role > schema:givenName: ' + JSON.stringify(firstname))
                            } else {
                              entity.firstname = firstname['@value']
                            }
                          }
                          break
                        case 'schema:familyName':
                          for (let lastname of values2) {
                            if (entity.lastname) {
                              importData.errors('Multiple role > schema:familyName: ' + JSON.stringify(lastname))
                            } else {
                              entity.lastname = lastname['@value']
                            }
                          }
                          break
                        case 'skos:exactMatch':
                          for (let id of values2) {
                            if (entity.identifier) {
                              importData.errors('Multiple role > skos:exactMatch: ' + JSON.stringify(id))
                            } else {
                              entity.identifier = {}
                              entity.identifier['type'] = id['@type']
                              entity.identifier['value'] = id['@value']
                            }
                          }
                          break
                        case 'skos:affiliation':
                          for (let af of values2) {
                            if (entity.affiliation) {
                              importData.errors('Multiple role > skos:affiliation: ' + JSON.stringify(id))
                            } else {
                              entity.affiliation = {}
                              entity.affiliation['type'] = 'other'
                              Object.entries(af).forEach(([key3, values3]) => {
                                switch (key3) {
                                  case '@type':
                                    if (values3 !== 'schema:Organization') {
                                      importData.errors('Unsupported role > skos:affiliation type: ' + values3)
                                    }
                                    break
                                  case 'skos:exactMatch':
                                    for (let id of values3) {
                                      if ((entity.affiliation['type'] === 'select') && (entity.affiliation['value'])) {
                                        importData.errors('Multiple role > skos:affiliation > skos:exactMatch: ' + JSON.stringify(id))
                                      } else {
                                        if (id.startsWith('https://pid.phaidra.org/')) {
                                          entity.affiliation['type'] = 'select'
                                          entity.affiliation['value'] = id
                                        } else {
                                          if (af['schema:name']) {
                                            for (let name of af['schema:name']) {
                                              entity.affiliation['value'] = name['@value']
                                            }
                                          }
                                        }
                                      }
                                    }
                                    break
                                  case 'schema:name':
                                    for (let name of values3) {
                                      if ((entity.affiliation['type'] === 'other') && (entity.affiliation['value'])) {
                                        importData.errors('Multiple role > skos:affiliation > schema:name: ' + JSON.stringify(lastname))
                                      } else {
                                        entity.affiliation['value'] = name['@value']
                                      }
                                    }
                                    break
                                  default:
                                    importData.errors('Unsupported role > skos:affiliation property: ' + key3)
                                    break
                                }
                              })
                            }
                          }
                          break
                        default:
                          importData.errors('Unsupported role property: ' + key2)
                          break
                      }
                    })
                    importData['roles'].push(entity)
                  }
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
