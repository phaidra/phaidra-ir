import Vue from 'vue'
import config from '../config/phaidra-ir'

export const facetQueries = [
  {
    label: 'Type',
    field: 'resourcetype',
    id: 'resourcetype',
    resetable: true,
    show: false,
    queries: [
      {
        id: 'image',
        query: 'resourcetype:image',
        label: 'Image'
      },
      {
        id: 'book',
        query: 'resourcetype:book',
        label: 'Book'
      },
      {
        id: 'article',
        query: 'resourcetype:journalarticle',
        label: 'Article'
      },
      {
        id: 'text',
        query: 'resourcetype:text',
        label: 'Text'
      },
      {
        id: 'collection',
        query: 'resourcetype:collection',
        label: 'Collection'
      },
      {
        id: 'video',
        query: 'resourcetype:video',
        label: 'Video'
      },
      {
        id: 'other',
        query: 'resourcetype:other',
        label: 'Data'
      },
      {
        id: 'dataset',
        query: 'resourcetype:dataset',
        label: 'Container'
      },
      {
        id: 'map',
        query: 'resourcetype:map',
        label: 'Map'
      },
      {
        id: 'resource',
        query: 'resourcetype:interactiveresource',
        label: 'Resource'
      },
      {
        id: 'sound',
        query: 'resourcetype:sound',
        label: 'Sound'
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
  let associationFacet = {
    label: 'Association',
    field: 'association_id',
    id: 'association',
    show: true,
    resetable: true,
    queries: []
  }

  for (let l1Unit of orgUnitsTree) {
    let l2Facet = {
      label: 'Subunits of ' + l1Unit['@id'],
      field: 'association_id',
      resetable: true,
      id: 'l1-' + l1Unit['@id'],
      queries: []
    }

    if (l1Unit.subunits) {
      for (let l2Unit of l1Unit.subunits) {
        let l3Facet = {
          label: 'Subunits of ' + l2Unit['@id'],
          field: 'association_id',
          resetable: true,
          id: 'l2-' + l2Unit['@id'],
          queries: []
        }

        if (l2Unit.subunits) {
          for (let l3Unit of l2Unit.subunits) {
            let l4Facet = {
              label: 'Subunits of ' + l3Unit['@id'],
              field: 'association_id',
              resetable: true,
              id: 'l3-' + l3Unit['@id'],
              queries: []
            }

            if (l3Unit.subunits) {
              for (let l4Unit of l3Unit.subunits) {
                l4Facet.queries.push({
                  query: 'association_id:"' + l4Unit['@id'] + '"',
                  id: l4Unit['@id'],
                  label: {
                    'skos:prefLabel': l4Unit['skos:prefLabel']
                  }
                })
              }
            }

            l3Facet.queries.push({
              query: 'association_id:"' + l3Unit['@id'] + '"',
              id: l3Unit['@id'],
              label: {
                'skos:prefLabel': l3Unit['skos:prefLabel']
              }
            })
          }
        }

        l2Facet.queries.push({
          query: 'association_id:"' + l2Unit['@id'] + '"',
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
  let months31 = [1, 3, 5, 7, 8, 10, 12]
  let months30 = [4, 6, 9, 11]
  let startYear = 2008
  let currYear = new Date().getFullYear()
  let yearsFacet = {
    label: 'Date',
    field: 'tcreated',
    id: 'created',
    show: false,
    resetable: true,
    queries: []
  }

  for (let year = startYear; year <= currYear; year++) {
    let monthsFacet = {
      label: 'Months of ' + year,
      field: 'tcreated',
      resetable: true,
      id: 'months-' + year,
      queries: []
    }

    for (let month = 1; month <= 12; month++) {
      let daysOfMonth
      if (months30.indexOf(month) > -1) {
        daysOfMonth = 30
      } else {
        if (months31.indexOf(month) > -1) {
          daysOfMonth = 31
        } else {
          let isLeap = ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)
          if (isLeap) {
            daysOfMonth = 29
          } else {
            daysOfMonth = 28
          }
        }
      }

      let daysFacet = {
        label: 'Days of ' + month + '.' + year,
        field: 'tcreated',
        resetable: true,
        id: 'days-' + year + '-' + month,
        queries: []
      }

      for (let day = 1; day <= daysOfMonth; day++) {
        if (day < 10) {
          day = '0' + day
        }
        daysFacet.queries.push({
          query: 'tcreated:[' + year + '-' + month + '-' + day + 'T00:00:00Z TO ' + year + '-' + month + '-' + day + 'T23:59:59Z]',
          id: year + '-' + month + '-' + day,
          label: day + '.' + month + '.' + year
        })
      }

      monthsFacet.queries.push({
        query: 'tcreated:[' + year + '-' + month + '-01T00:00:00Z TO ' + year + '-' + month + '-' + daysOfMonth + 'T00:00:00Z]',
        id: year + '-' + month,
        label: month + '.' + year,
        childFacet: daysFacet
      })
    }

    yearsFacet.queries.push({
      query: 'tcreated:[' + year + '-01-01T00:00:00Z TO ' + year + '-12-31T00:00:00Z]',
      id: year,
      label: year,
      childFacet: monthsFacet
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
            let lvl1 = facetQueries[i].queries[j].childFacet
            for (let k = 0; k < lvl1.queries.length; k++) {
              if (lvl1.queries[k].query === key) {
                Vue.set(lvl1.queries[k], 'count', facetQueriesSolr[key])
              }
              if (lvl1.queries[k].childFacet) {
                let lvl2 = lvl1.queries[k].childFacet
                for (let l = 0; l < lvl2.queries.length; l++) {
                  if (lvl2.queries[l].query === key) {
                    Vue.set(lvl2.queries[l], 'count', facetQueriesSolr[key])
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
  for (var i = 0; i < f.queries.length; i++) {
    f.queries[i].active = false
    if (f.queries[i].childFacet) {
      var lvl1 = f.queries[i].childFacet
      for (var j = 0; j < lvl1.queries.length; j++) {
        lvl1.queries[j].active = false
        if (lvl1.queries[j].childFacet) {
          var lvl2 = lvl1.queries[j].childFacet
          for (var k = 0; k < lvl2.queries.length; k++) {
            lvl2.queries[k].active = false
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
