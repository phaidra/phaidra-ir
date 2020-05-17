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
        unknownpredicates: [],
        errors: []
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
        unknownpredicates: [],
        errors: []
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
                        importData.errors.push('Unsupported dcterms:type type: ' + values1)
                      }
                      break
                    case 'skos:exactMatch':
                      for (let em of obj['skos:exactMatch']) {
                        if (em !== 'https://pid.phaidra.org/vocabulary/69ZZ-2KGX') {
                          importData.errors.push('Unsupported resource type: ' + em)
                        }
                      }
                      break
                    case 'skos:prefLabel':
                      // will be loaded
                      break
                    default:
                      importData.errors.push('Unsupported dcterms:type property: ' + key1)
                      break
                  }
                })
                break

              case 'edm:hasType':
                Object.entries(obj).forEach(([key1, values1]) => {
                  switch (key1) {
                    case '@type':
                      if (values1 !== 'skos:Concept') {
                        importData.errors.push('Unsupported edm:hasType type: ' + values1)
                      }
                      break
                    case 'skos:exactMatch':
                      for (let em of obj['skos:exactMatch']) {
                        if (importData['objecttype']) {
                          importData.errors.push('Multiple object types: ' + em)
                        } else {
                          importData['objecttype'] = em
                        }
                      }
                      break
                    case 'skos:prefLabel':
                      // will be loaded
                      break
                    default:
                      importData.errors.push('Unsupported edm:hasType property: ' + key1)
                      break
                  }
                })
                break

              case 'oaire:version':
                Object.entries(obj).forEach(([key1, values1]) => {
                  switch (key1) {
                    case '@type':
                      if (values1 !== 'skos:Concept') {
                        importData.errors.push('Unsupported oaire:version type: ' + values1)
                      }
                      break
                    case 'skos:exactMatch':
                      for (let em of obj['skos:exactMatch']) {
                        if (importData['version']) {
                          importData.errors.push('Multiple version types: ' + em)
                        } else {
                          importData['version'] = em
                        }
                      }
                      break
                    case 'skos:prefLabel':
                      // will be loaded
                      break
                    default:
                      importData.errors.push('Unsupported oaire:version property: ' + key1)
                      break
                  }
                })
                break

              case 'dcterms:accessRights':
                Object.entries(obj).forEach(([key1, values1]) => {
                  switch (key1) {
                    case '@type':
                      if (values1 !== 'skos:Concept') {
                        importData.errors.push('Unsupported dcterms:accessRights type: ' + values1)
                      }
                      break
                    case 'skos:exactMatch':
                      for (let em of obj['skos:exactMatch']) {
                        if (importData['accessrights']) {
                          importData.errors.push('Multiple accessrights types: ' + em)
                        } else {
                          importData['accessrights'] = em
                        }
                      }
                      break
                    case 'skos:prefLabel':
                      // will be loaded
                      break
                    default:
                      importData.errors.push('Unsupported dcterms:accessRights property: ' + key1)
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
                        importData.errors.push('Unsupported title type: ' + values1)
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
                      importData.errors.push('Unsupported dce:title property: ' + key1)
                      break
                  }
                })
                break

              // bf:note
              case 'bf:note':
                importData['abstract'] = {}
                if (obj['@type'] !== 'bf:Summary') {
                  importData.errors.push('Unsupported description type: ' + obj['@type'])
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
                  importData.errors.push('Unsupported language structure: ' + JSON.stringify(obj))
                } else {
                  if (importData['language']) {
                    importData.errors.push('Multiple dcterms:language: ' + JSON.stringify(obj))
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
                    case '@type':
                      if (values1 !== 'schema:CreativeWork') {
                        importData.errors.push('Unsupported rdau:P60193 type: ' + values1)
                      }
                      break
                    case 'dce:title':
                      for (let v of values1) {
                        if (importData['series'].title) {
                          importData.errors.push('Multiple rdau:P60193 > dce:title: ' + JSON.stringify(v))
                        } else {
                          Object.entries(v).forEach(([key2, values2]) => {
                            switch (key2) {
                              case '@type':
                                if (values2 !== 'bf:Title') {
                                  importData.errors.push('Unsupported rdau:P60193 > dce:title type: ' + values2)
                                }
                                break
                              case 'bf:mainTitle':
                                for (let title of values2) {
                                  if (importData['series']['title']) {
                                    importData.errors.push('Multiple rdau:P60193 > dce:title: ' + title['@value'])
                                  } else {
                                    importData['series']['title'] = {}
                                    importData['series']['title']['value'] = title['@value']
                                    if (title['@language']) {
                                      importData['series']['title']['language'] = title['@language']
                                    }
                                  }
                                }
                                break
                              default:
                                importData.errors.push('Unsupported rdau:P60193 > dce:title property: ' + key2)
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
                    case 'dcterms:issued':
                      for (let v of values1) {
                        importData['series'].issued = v
                      }
                      break
                    case 'ids:issn':
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
                      importData.errors.push('Unsupported rdau:P60193 property: ' + key1)
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
                    case '@type':
                      if (values1 !== 'schema:CreativeWork') {
                        importData.errors.push('Unsupported rdau:P60101 type: ' + values1)
                      }
                      break
                    case 'dce:title':
                      for (let v of values1) {
                        Object.entries(v).forEach(([key2, values2]) => {
                          switch (key2) {
                            case '@type':
                              if (values2 !== 'bf:Title') {
                                importData.errors.push('Unsupported rdau:P60101 > dce:title type: ' + values2)
                              }
                              break
                            case 'bf:mainTitle':
                              importData['containedin']['title'] = {}
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
                              importData.errors.push('Unsupported rdau:P60101 > dce:title property: ' + key2)
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
                            case '@type':
                              if (values2 !== 'schema:CreativeWork') {
                                importData.errors.push('Unsupported rdau:P60101 > rdau:P60193 type: ' + values2)
                              }
                              break
                            case 'dce:title':
                              for (let v1 of values2) {
                                if (importData['containedin']['series']['title']) {
                                  importData.errors.push('Multiple rdau:P60101 > rdau:P60193 > dce:title: ' + JSON.stringify(v))
                                } else {
                                  Object.entries(v1).forEach(([key3, values3]) => {
                                    switch (key3) {
                                      case '@type':
                                        if (values3 !== 'bf:Title') {
                                          importData.errors.push('Unsupported rdau:P60101 > rdau:P60193 title type: ' + values3)
                                        }
                                        break
                                      case 'bf:mainTitle':
                                        for (let title of values3) {
                                          if (importData['containedin']['series']['title']) {
                                            importData.errors.push('Multiple rdau:P60101 > rdau:P60193 > dce:title: ' + title['@value'])
                                          } else {
                                            importData['containedin']['series']['title'] = {}
                                            importData['containedin']['series']['title']['value'] = title['@value']
                                            if (title['@language']) {
                                              importData['containedin']['series']['title']['language'] = title['@language']
                                            }
                                          }
                                        }
                                        break
                                      default:
                                        importData.errors.push('Unsupported rdau:P60101 > rdau:P60193 > dce:title property: ' + key3)
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
                            case 'dcterms:issued':
                              for (let v of values2) {
                                importData['containedin']['series'].issued = v
                              }
                              break
                            case 'ids:issn':
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
                              importData.errors.push('Unsupported rdau:P60101 > rdau:P60193 property: ' + key2)
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
                            case '@type':
                              if (values2 !== 'bf:Publication') {
                                importData.errors.push('Unsupported rdau:P60101 > bf:provisionActivity type: ' + values2)
                              }
                              break
                            case 'bf:agent':
                              importData['containedin']['publisher']['type'] = 'other'
                              for (let v1 of values2) {
                                if (v1.hasOwnProperty('skos:exactMatch')) {
                                  for (let id of v1['skos:exactMatch']) {
                                    if (id.startsWith('https://pid.phaidra.org/')) {
                                      importData['containedin']['publisher']['type'] = 'select'
                                    }
                                  }
                                }
                                Object.entries(v1).forEach(([key3, values3]) => {
                                  switch (key3) {
                                    case '@type':
                                      if (values3 !== 'schema:Organization') {
                                        importData.errors.push('Unsupported rdau:P60101 > bf:provisionActivity > bf:agent type: ' + values3)
                                      }
                                      break
                                    case 'schema:name':
                                      if (importData['containedin']['publisher']['type'] !== 'select') {
                                        for (let name of values3) {
                                          if (importData['containedin']['publisher']['name']) {
                                            importData.errors.push('Multiple rdau:P60101 > bf:provisionActivity > bf:agent -> schema:name: ' + JSON.stringify(name))
                                          } else {
                                            importData['containedin']['publisher']['name'] = name['@value']
                                          }
                                        }
                                      }
                                      break
                                    case 'skos:exactMatch':
                                      if (importData['containedin']['publisher']['type'] === 'select') {
                                        for (let id of values3) {
                                          if (importData['containedin']['publisher']['orgunit']) {
                                            importData.errors.push('Multiple rdau:P60101 > bf:provisionActivity > bf:agent -> skos:exactMatch: ' + JSON.stringify(id))
                                          } else {
                                            importData['containedin']['publisher']['orgunit'] = id
                                          }
                                        }
                                      }
                                      break
                                    default:
                                      importData.errors.push('Unsupported rdau:P60101 > bf:provisionActivity > bf:agent property: ' + key3)
                                      break
                                  }
                                })
                              }
                              break
                            case 'bf:date':
                              for (let v1 of values2) {
                                if (importData['containedin']['publisher']['date']) {
                                  importData.errors.push('Multiple rdau:P60101 > bf:provisionActivity > bf:date: ' + JSON.stringify(v1))
                                } else {
                                  importData['containedin']['publisher']['date'] = v1
                                }
                              }
                              break
                            default:
                              importData.errors.push('Unsupported rdau:P60101 > bf:provisionActivity property: ' + key2)
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
                                  importData.errors.push('Unsupported rdau:P60101 > role type: ' + values2)
                                }
                                break
                              case 'schema:givenName':
                                for (let firstname of values2) {
                                  if (entity.firstname) {
                                    importData.errors.push('Multiple rdau:P60101 > role > schema:givenName: ' + JSON.stringify(firstname))
                                  } else {
                                    entity.firstname = firstname['@value']
                                  }
                                }
                                break
                              case 'schema:familyName':
                                for (let lastname of values2) {
                                  if (entity.lastname) {
                                    importData.errors.push('Multiple rdau:P60101 > role > schema:familyName: ' + JSON.stringify(lastname))
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
                        importData.errors.push('Unsupported rdau:P60101 property: ' + key1)
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
                if (importData['license']) {
                  importData.errors.push('Multiple edm:rights: ' + obj)
                } else {
                  importData['license'] = obj
                }
                break

              // dce:rights
              case 'dce:rights':
                if (importData['rights']) {
                  importData.errors.push('Multiple dce:rights: ' + JSON.stringify(obj))
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
                  switch (key1) {
                    case '@type':
                      if (values1 !== 'bf:Publication') {
                        importData.errors.push('Unsupported bf:provisionActivity type: ' + values1)
                      }
                      break
                    case 'bf:agent':
                      for (let agent of values1) {
                        if (agent.hasOwnProperty('skos:exactMatch')) {
                          for (let id of agent['skos:exactMatch']) {
                            if (id.startsWith('https://pid.phaidra.org/')) {
                              importData['publisher']['type'] = 'select'
                            }
                          }
                        }
                        Object.entries(agent).forEach(([key2, values2]) => {
                          switch (key2) {
                            case '@type':
                              if (values2 !== 'schema:Organization') {
                                importData.errors.push('Unsupported bf:provisionActivity > bf:agent type: ' + values2)
                              }
                              break
                            case 'schema:name':
                              if (importData['publisher']['type'] !== 'select') {
                                for (let name of values2) {
                                  if (importData['publisher']['name']) {
                                    importData.errors.push('Multiple bf:provisionActivity > bf:agent > schema:name: ' + JSON.stringify(name))
                                  } else {
                                    importData['publisher']['name'] = name['@value']
                                  }
                                }
                              }
                              break
                            case 'skos:exactMatch':
                              if (importData['publisher']['type'] === 'select') {
                                for (let id of values2) {
                                  if (importData['publisher']['orgunit']) {
                                    importData.errors.push('Multiple bf:provisionActivity > bf:agent > skos:exactMatch: ' + JSON.stringify(id))
                                  } else {
                                    importData['publisher']['orgunit'] = id
                                  }
                                }
                              }
                              break
                            default:
                              importData.errors.push('Unsupported bf:provisionActivity > bf:agent property: ' + key2)
                              break
                          }
                        })
                      }
                      break
                    default:
                      importData.errors.push('Unsupported bf:provisionActivity property: ' + key1)
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
                        importData.errors.push('Unsupported frapo:isOutputOf type: ' + values1)
                      }
                      break
                    case 'skos:exactMatch':
                      if (funding['projectid']) {
                        importData.errors.push('Multiple frapo:isOutputOf > skos:exactMatch: ' + JSON.stringify(values1))
                      } else {
                        for (let id of values1) {
                          funding['projectid'] = id
                        }
                      }
                      break
                    case 'frapo:hasFundingAgency':
                      if (funding['funderid']) {
                        importData.errors.push('Multiple frapo:isOutputOf > frapo:hasFundingAgency > skos:exactMatch: ' + JSON.stringify(values1))
                      } else {
                        for (let funder of values1) {
                          Object.entries(funder).forEach(([key2, values2]) => {
                            switch (key2) {
                              case '@type':
                                if (values2 !== 'frapo:FundingAgency') {
                                  importData.errors.push('Unsupported frapo:isOutputOf > frapo:hasFundingAgency type: ' + values2)
                                }
                                break
                              case 'skos:exactMatch':
                                if (funding['funderid']) {
                                  importData.errors.push('Multiple frapo:isOutputOf > frapo:hasFundingAgency > skos:exactMatch: ' + JSON.stringify(values2))
                                } else {
                                  for (let id of values2) {
                                    funding['funderid'] = id
                                  }
                                }
                                break
                              case 'skos:prefLabel':
                                // will be loaded
                                break
                              default:
                                importData.errors.push('Unsupported frapo:isOutputOf > frapo:hasFundingAgency property: ' + key2)
                                break
                            }
                          })
                        }
                        if (!funding['funderid']) {
                          importData.errors.push('Funder ID wasn\'t found: ' + JSON.stringify(values1))
                        }
                      }
                      break
                    default:
                      importData.errors.push('Unsupported frapo:isOutputOf property: ' + key1)
                      break
                  }
                })
                importData['funding'].push(funding)
                break

              case 'schema:numberOfPages':
                if (importData['numberofpages']) {
                  importData.errors.push('Multiple numberofpages: ' + JSON.stringify(obj))
                } else {
                  importData['numberofpages'] = obj
                }
                break

              case 'ebucore:filename':
                if (importData['filename']) {
                  importData.errors.push('Multiple ebucore:filename: ' + JSON.stringify(obj))
                } else {
                  importData['filename'] = obj
                }
                break

              case 'ebucore:hasMimeType':
                if (importData['mimetype']) {
                  importData.errors.push('Multiple ebucore:hasMimeType: ' + JSON.stringify(obj))
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
                    importData.errors.push('Multiple dates, key[' + key + ']: ' + JSON.stringify(obj))
                  } else {
                    importData['date'] = {}
                    importData['date']['type'] = key
                    importData['date']['value'] = obj
                  }
                } else {
                  importData.errors.push('Unsupported date format: ' + JSON.stringify(obj))
                }
                break

              // embargo date
              case 'dcterms:available':
                if (typeof obj === 'string') {
                  if (importData['embargodate']) {
                    importData.errors.push('Multiple dcterms:available dates: ' + JSON.stringify(obj))
                  } else {
                    importData['embargodate'] = obj
                  }
                } else {
                  importData.errors.push('Unsupported date format: ' + JSON.stringify(obj))
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
                  Object.entries(obj).forEach(([key1, values1]) => {
                    switch (key1) {
                      case '@type':
                        if (values1 !== 'schema:Person') {
                          importData.errors.push('Unsupported role type: ' + values1)
                        }
                        break
                      case 'schema:givenName':
                        for (let firstname of values1) {
                          if (entity.firstname) {
                            importData.errors.push('Multiple role > schema:givenName: ' + JSON.stringify(firstname))
                          } else {
                            entity.firstname = firstname['@value']
                          }
                        }
                        break
                      case 'schema:familyName':
                        for (let lastname of values1) {
                          if (entity.lastname) {
                            importData.errors.push('Multiple role > schema:familyName: ' + JSON.stringify(lastname))
                          } else {
                            entity.lastname = lastname['@value']
                          }
                        }
                        break
                      case 'skos:exactMatch':
                        for (let id of values1) {
                          if (entity.identifier) {
                            importData.errors.push('Multiple role > skos:exactMatch: ' + JSON.stringify(id))
                          } else {
                            entity.identifier = {}
                            entity.identifier['type'] = id['@type']
                            entity.identifier['value'] = id['@value']
                          }
                        }
                        break
                      case 'schema:affiliation':
                        for (let af of values1) {
                          if (entity.affiliation) {
                            importData.errors.push('Multiple role > schema:affiliation: ' + JSON.stringify(af))
                          } else {
                            entity.affiliation = {}
                            entity.affiliation['type'] = 'other'
                            if (af.hasOwnProperty('skos:exactMatch')) {
                              for (let id of af['skos:exactMatch']) {
                                if (id.startsWith('https://pid.phaidra.org/')) {
                                  entity.affiliation['type'] = 'select'
                                }
                              }
                            }
                            Object.entries(af).forEach(([key2, values2]) => {
                              switch (key2) {
                                case '@type':
                                  if (values2 !== 'schema:Organization') {
                                    importData.errors.push('Unsupported role > schema:affiliation type: ' + values2)
                                  }
                                  break
                                case 'skos:exactMatch':
                                  for (let id of values2) {
                                    if ((entity.affiliation['type'] === 'select') && (entity.affiliation['value'])) {
                                      importData.errors.push('Multiple role > schema:affiliation > skos:exactMatch: ' + JSON.stringify(id))
                                    } else {
                                      if (id.startsWith('https://pid.phaidra.org/')) {
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
                                  if (entity.affiliation['type'] !== 'select') {
                                    for (let name of values2) {
                                      if ((entity.affiliation['type'] === 'other') && (entity.affiliation['value'])) {
                                        importData.errors.push('Multiple role > schema:affiliation > schema:name: ' + JSON.stringify(name))
                                      } else {
                                        entity.affiliation['value'] = name['@value']
                                      }
                                    }
                                  }
                                  break
                                default:
                                  importData.errors.push('Unsupported role > schema:affiliation property: ' + key2)
                                  break
                              }
                            })
                          }
                        }
                        break
                      default:
                        importData.errors.push('Unsupported role property: ' + key1)
                        break
                    }
                  })
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
