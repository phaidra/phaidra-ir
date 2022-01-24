import Vue from 'vue'
import config from '../config/phaidra-ir'

export const facetQueries = [
  {
    label: 'Type',
    field: 'edm_hastype_id',
    id: 'edm_hastype_id',
    resetable: true,
    show: false,
    queries: [
      {
        id: 'https://pid.phaidra.org/vocabulary/VKA6-9XTY',
        query: 'edm_hastype_id:"https://pid.phaidra.org/vocabulary/VKA6-9XTY"',
        label: 'journal article'
      },
      // {
      //   id: 'https://pid.phaidra.org/vocabulary/T023-BGTD',
      //   query: 'edm_hastype_id:"https://pid.phaidra.org/vocabulary/T023-BGTD"',
      //   label: 'preprint'
      // },
      // {
      //   id: 'https://pid.phaidra.org/vocabulary/489N-Y6VX',
      //   query: 'edm_hastype_id:"https://pid.phaidra.org/vocabulary/489N-Y6VX"',
      //   label: 'working paper'
      // },
      {
        id: 'https://pid.phaidra.org/vocabulary/JMAV-7F3R',
        query: 'edm_hastype_id:"https://pid.phaidra.org/vocabulary/JMAV-7F3R"',
        label: 'report'
      },
      {
        id: 'https://pid.phaidra.org/vocabulary/JJKV-B1CG',
        query: 'edm_hastype_id:"https://pid.phaidra.org/vocabulary/JJKV-B1CG"',
        label: 'review'
      },
      // {
      //   id: 'https://pid.phaidra.org/vocabulary/MF25-FDGW',
      //   query: 'edm_hastype_id:"https://pid.phaidra.org/vocabulary/MF25-FDGW"',
      //   label: 'contribution to journal'
      // },
      {
        id: 'https://pid.phaidra.org/vocabulary/47QB-8QF1',
        query: 'edm_hastype_id:"https://pid.phaidra.org/vocabulary/47QB-8QF1"',
        label: 'book'
      },
      {
        id: 'https://pid.phaidra.org/vocabulary/XA52-09WA',
        query: 'edm_hastype_id:"https://pid.phaidra.org/vocabulary/XA52-09WA"',
        label: 'book part'
      },
      // {
      //   id: 'https://pid.phaidra.org/vocabulary/1PHE-7VMS',
      //   query: 'edm_hastype_id:"https://pid.phaidra.org/vocabulary/1PHE-7VMS"',
      //   label: 'dissertation'
      // },
      // {
      //   id: 'https://pid.phaidra.org/vocabulary/QKDF-E5HA',
      //   query: 'edm_hastype_id:"https://pid.phaidra.org/vocabulary/QKDF-E5HA"',
      //   label: 'conference object'
      // },
      // {
      //   id: 'https://pid.phaidra.org/vocabulary/F4JN-ZST0',
      //   query: 'edm_hastype_id:"https://pid.phaidra.org/vocabulary/F4JN-ZST0"',
      //   label: 'lecture'
      // },
      // {
      //   id: 'https://pid.phaidra.org/vocabulary/KW6N-2VTP',
      //   query: 'edm_hastype_id:"https://pid.phaidra.org/vocabulary/KW6N-2VTP"',
      //   label: 'dataset'
      // },
      // {
      //   id: 'https://pid.phaidra.org/vocabulary/N35H-PDEE',
      //   query: 'edm_hastype_id:"https://pid.phaidra.org/vocabulary/N35H-PDEE"',
      //   label: 'annotation'
      // },
      {
        id: 'https://pid.phaidra.org/vocabulary/PYRE-RAWJ',
        query: 'edm_hastype_id:"https://pid.phaidra.org/vocabulary/PYRE-RAWJ" OR edm_hastype_id:"https://pid.phaidra.org/vocabulary/N35H-PDEE" OR edm_hastype_id:"https://pid.phaidra.org/vocabulary/KW6N-2VTP" OR edm_hastype_id:"https://pid.phaidra.org/vocabulary/F4JN-ZST0" OR edm_hastype_id:"https://pid.phaidra.org/vocabulary/QKDF-E5HA" OR edm_hastype_id:"https://pid.phaidra.org/vocabulary/1PHE-7VMS" OR edm_hastype_id:"https://pid.phaidra.org/vocabulary/MF25-FDGW" OR edm_hastype_id:"https://pid.phaidra.org/vocabulary/489N-Y6VX" OR edm_hastype_id:"https://pid.phaidra.org/vocabulary/T023-BGTD"',
        label: 'other'
      }
    ]
  }
]

export const adminFacetQueries = [
  {
    label: 'Status',
    field: '',
    exclusive: true,
    id: 'adminstatus',
    queries: [
      {
        id: 'acceptance',
        query: '!owner:' + config.iraccount + ' AND !ispartof:"' + config.ircollection + '"',
        label: 'Acceptance'
      },
      {
        id: 'approval',
        query: 'owner:' + config.iraccount + ' AND !ispartof:"' + config.ircollection + '"',
        label: 'Approval'
      },
      {
        id: 'cleared',
        query: 'ispartof:"' + config.ircollection + '"',
        label: 'Cleared'
      }
    ]
  }
]

export function buildAssociationFacet (orgUnitsTree) {
  const associationFacet = {
    label: 'Association',
    field: 'association_id',
    id: 'association',
    show: true,
    resetable: true,
    queries: []
  }

  let i = 0
  for (const l1Unit of orgUnitsTree) {
    i++
    const l2Facet = {
      label: 'Subunits of ' + l1Unit['@id'],
      field: 'association_id',
      resetable: true,
      id: 'l1-' + l1Unit['@id'],
      queries: []
    }

    if (l1Unit.subunits) {
      for (const l2Unit of l1Unit.subunits) {
        const l3Facet = {
          label: 'Subunits of ' + l2Unit['@id'],
          field: 'association_id',
          resetable: true,
          id: 'l2-' + l2Unit['@id'],
          queries: []
        }

        if (l2Unit.subunits) {
          for (const l3Unit of l2Unit.subunits) {
            const l4Facet = {
              label: 'Subunits of ' + l3Unit['@id'],
              field: 'association_id',
              resetable: true,
              id: 'l3-' + l3Unit['@id'],
              queries: []
            }

            if (l3Unit.subunits) {
              for (const l4Unit of l3Unit.subunits) {
                const l5Facet = {
                  label: 'Subunits of ' + l4Unit['@id'],
                  field: 'association_id',
                  resetable: true,
                  id: 'l4-' + l4Unit['@id'],
                  queries: []
                }

                if (l4Unit.subunits) {
                  for (const l5Unit of l4Unit.subunits) {
                    l5Facet.queries.push({
                      query: 'association_id:"' + l5Unit['@id'] + '"',
                      active: false,
                      id: l5Unit['@id'],
                      label: {
                        'skos:prefLabel': l5Unit['skos:prefLabel']
                      }
                    })
                  }
                }

                l4Facet.queries.push({
                  query: 'association_id:"' + l4Unit['@id'] + '"',
                  active: false,
                  id: l4Unit['@id'],
                  label: {
                    'skos:prefLabel': l4Unit['skos:prefLabel']
                  },
                  childFacet: l5Facet
                })
              }
            }

            l3Facet.queries.push({
              query: 'association_id:"' + l3Unit['@id'] + '"',
              active: false,
              id: l3Unit['@id'],
              label: {
                'skos:prefLabel': l3Unit['skos:prefLabel']
              },
              childFacet: l4Facet
            })
          }
        }

        l2Facet.queries.push({
          query: 'association_id:"' + l2Unit['@id'] + '"',
          active: false,
          id: l2Unit['@id'],
          label: {
            'skos:prefLabel': l2Unit['skos:prefLabel']
          },
          childFacet: l3Facet
        })
      }
    }

    associationFacet.queries.push({
      query: 'association_id:"' + l1Unit['@id'] + '"',
      active: i === 1,
      id: l1Unit['@id'],
      label: {
        'skos:prefLabel': l1Unit['skos:prefLabel']
      },
      childFacet: l2Facet
    })
  }
  return associationFacet
}

function buildDateFacet () {
  const startYear = config.search.datefacetstartyear
  const currYear = new Date().getFullYear()
  const yearsFacet = {
    label: 'Date',
    field: 'bib_published',
    id: 'published',
    show: false,
    resetable: true,
    queries: []
  }

  for (let year = startYear; year <= currYear; year++) {
    yearsFacet.queries.push({
      query: 'bib_published:' + year + ' OR (-bib_published:* AND tcreated:[' + year + '-01-01T00:00:00Z TO ' + year + '-12-31T23:59:59Z])',
      id: year,
      label: year
    })
  }

  return yearsFacet
}

export function updateFacetQueries (facetQueriesSolr, facetQueries) {
  // called by the `search` function
  if (facetQueriesSolr) {
    Object.keys(facetQueriesSolr).forEach(function (key) {
      for (let i = 0; i < facetQueries.length; i++) {
        for (let j = 0; j < facetQueries[i].queries.length; j++) {
          if (facetQueries[i].queries[j].query === key) {
            Vue.set(facetQueries[i].queries[j], 'count', facetQueriesSolr[key])
          }
          if (facetQueries[i].queries[j].childFacet) {
            const lvl1 = facetQueries[i].queries[j].childFacet
            for (let k = 0; k < lvl1.queries.length; k++) {
              if (lvl1.queries[k].query === key) {
                Vue.set(lvl1.queries[k], 'count', facetQueriesSolr[key])
              }
              if (lvl1.queries[k].childFacet) {
                const lvl2 = lvl1.queries[k].childFacet
                for (let l = 0; l < lvl2.queries.length; l++) {
                  if (lvl2.queries[l].query === key) {
                    Vue.set(lvl2.queries[l], 'count', facetQueriesSolr[key])
                  }
                  if (lvl2.queries[l].childFacet) {
                    const lvl3 = lvl2.queries[l].childFacet
                    for (let m = 0; m < lvl3.queries.length; m++) {
                      if (lvl3.queries[m].query === key) {
                        Vue.set(lvl3.queries[m], 'count', facetQueriesSolr[key])
                      }
                      if (lvl3.queries[m].childFacet) {
                        const lvl4 = lvl3.queries[m].childFacet
                        for (let n = 0; n < lvl4.queries.length; n++) {
                          if (lvl4.queries[n].query === key) {
                            Vue.set(lvl4.queries[n], 'count', facetQueriesSolr[key])
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
      }
    })
  }
}

export function toggleFacet (q, f) {
  q.active = !q.active

  if (f.exclusive) {
    for (let i = 0; i < f.queries.length; i++) {
      if (f.queries[i] !== q) {
        f.queries[i].active = 0
      }
    }
  }
}

export function deactivateFacetQueries (f) {
  for (let i = 0; i < f.queries.length; i++) {
    f.queries[i].active = false
    if (f.queries[i].childFacet) {
      const lvl1 = f.queries[i].childFacet
      for (let j = 0; j < lvl1.queries.length; j++) {
        lvl1.queries[j].active = false
        if (lvl1.queries[j].childFacet) {
          const lvl2 = lvl1.queries[j].childFacet
          for (let k = 0; k < lvl2.queries.length; k++) {
            lvl2.queries[k].active = false
            if (lvl2.queries[k].childFacet) {
              const lvl3 = lvl2.queries[k].childFacet
              for (let l = 0; l < lvl3.queries.length; l++) {
                lvl3.queries[l].active = false
              }
            }
          }
        }
      }
    }
  }
}

export function showFacet (f) {
  f.show = !f.show

  if (!f.show) {
    // when hiding facet, remove it's filters
    deactivateFacetQueries(f)
  }
}

export const persAuthors = {
  field: 'bib_roles_pers_aut',
  label: 'Author',
  values: []
}

export const journals = {
  field: 'dc_source',
  label: 'Journal',
  values: []
}

export const funder = {
  field: 'funder_id',
  label: 'Funder',
  value: null
}

facetQueries.push(buildDateFacet())
