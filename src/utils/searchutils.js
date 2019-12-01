export function buildSearchDef ({ sortdef, q, page, pagesize, facetQueries, persAuthors, journals, funder, inCollection: collection }) {
  let searchdefarr = []

  for (let i = 0; i < sortdef.length; i++) {
    if (sortdef[i].active) {
      searchdefarr.push('sortdef=' + encodeURIComponent(sortdef[i].id))
    }
  }

  if (q) {
    searchdefarr.push('q=' + encodeURIComponent(q))
  }
  searchdefarr.push('page=' + page)
  if (pagesize) {
    searchdefarr.push('pagesize=' + pagesize)
  }

  let ands = []
  for (let i = 0; i < facetQueries.length; i++) {
    let ors = []
    for (let j = 0; j < facetQueries[i].queries.length; j++) {
      if (facetQueries[i].queries[j].active) {
        // tag '{!tag=' + state.facetQueries[i].id + '}' +
        if (facetQueries[i].queries[j].childFacet) {
          // there are two levels, only take the lowest active levels
          let lvl1 = facetQueries[i].queries[j].childFacet
          let foundActiveLvl1Query = false
          for (let k = 0; k < lvl1.queries.length; k++) {
            if (lvl1.queries[k].active) {
              foundActiveLvl1Query = true

              let lvl2 = lvl1.queries[k].childFacet
              let foundActiveLvl2Query = false
              for (let l = 0; l < lvl2.queries.length; l++) {
                if (lvl2.queries[l].active) {
                  foundActiveLvl2Query = true
                  ors.push(lvl2.queries[l].query)
                  searchdefarr.push('fq=' + facetQueries[i].id + '_' + lvl2.queries[l].id)
                }
              }

              if (!foundActiveLvl2Query) {
                ors.push(lvl1.queries[k].query)
                searchdefarr.push('fq=' + facetQueries[i].id + '_' + lvl1.queries[k].id)
              }
            }
          }

          if (!foundActiveLvl1Query) {
            ors.push(facetQueries[i].queries[j].query)
            searchdefarr.push('fq=' + facetQueries[i].id + '_' + facetQueries[i].queries[j].id)
          }
        } else {
          ors.push(facetQueries[i].queries[j].query)
          searchdefarr.push('fq=' + facetQueries[i].id + '_' + facetQueries[i].queries[j].id)
        }
      }
    }
    if (ors.length > 0) {
      if (ors.length > 1) {
        ands.push('(' + ors.join(' OR ') + ')')
      } else {
        ands.push(ors[0])
      }
    }
  }

  for (let j = 0; j < persAuthors.values.length; j++) {
    let v = persAuthors.values[j]
    if (v !== '') {
      ands.push('(' + persAuthors.field + ':"' + v + '")')
      searchdefarr.push('fr=' + persAuthors.field + '_' + encodeURIComponent(v))
    }
  }

  for (let j = 0; j < journals.values.length; j++) {
    let v = journals.values[j]
    if (v !== '') {
      ands.push('(' + journals.field + ':"' + v + '")')
      searchdefarr.push('fr=' + journals.field + '_' + encodeURIComponent(v))
    }
  }

  if (funder.value && funder.value !== '') {
    ands.push('(' + funder.field + ':"' + funder.value + '")')
    searchdefarr.push('fr=' + funder.field + '_' + encodeURIComponent(funder.value))
  }

  // an object should have at least an owner, else it's garbage
  ands.push('owner:*')

  if (collection) {
    ands.push('ispartof:"' + collection + '"')
    searchdefarr.push('collection=' + collection)
  }

  return { searchdefarr, ands }
}

export function buildParams ({ q, page, pagesize, sortdef, lang, facetQueries }, ands) {
  let params = {
    q,
    defType: 'edismax',
    wt: 'json',
    qf: 'pid^5 dc_title^4 dc_creator^3 dc_subject^2 dc_source^2 _text_',
    start: (page - 1) * pagesize,
    rows: pagesize,
    sort: '',
    facet: true,
    'facet.query': []
  }

  if (q === '' || q === null) {
    params.q = '*:*'
    params.sort = 'created desc'
  }

  for (let i = 0; i < sortdef.length; i++) {
    if (sortdef[i].active) {
      if ((sortdef[i].id === 'title asc') || (sortdef[i].id === 'title desc')) {
        params.sort = sortdef[i].def[lang]
      } else {
        params.sort = sortdef[i].def
      }
    }
  }

  // TODO: new fn: serializefacetQueries (careful, current implementation might be using mutation)
  for (let i = 0; i < facetQueries.length; i++) {
    if (facetQueries[i].show) {
      for (let j = 0; j < facetQueries[i].queries.length; j++) {
        // exclude '{!ex=' + state.facetQueries[i].id + '}' +
        if (facetQueries[i].queries[j].active && facetQueries[i].queries[j].childFacet) {
          let childFacetLvl1 = facetQueries[i].queries[j].childFacet
          for (let k = 0; k < childFacetLvl1.queries.length; k++) {
            if (childFacetLvl1.queries[k].active && childFacetLvl1.queries[k].childFacet) {
              let childFacetLvl2 = childFacetLvl1.queries[k].childFacet
              for (let l = 0; l < childFacetLvl2.queries.length; l++) {
                // days
                params['facet.query'].push(childFacetLvl2.queries[l].query)
              }
            }
            // months
            params['facet.query'].push(childFacetLvl1.queries[k].query)
          }
        }
        params['facet.query'].push(facetQueries[i].queries[j].query)
      }
    }
  }

  if (ands.length > 0) {
    params['fq'] = ands.join(' AND ')
  }

  return params
}

export function adminBuildSearchDef ({ sortdef, q, page, pagesize, adminFacetQueries }) {
  let searchdefarr = []

  for (let i = 0; i < sortdef.length; i++) {
    if (sortdef[i].active) {
      searchdefarr.push('sortdef=' + encodeURIComponent(sortdef[i].id))
    }
  }

  if (q) {
    searchdefarr.push('q=' + encodeURIComponent(q))
  }
  searchdefarr.push('page=' + page)
  if (pagesize) {
    searchdefarr.push('pagesize=' + pagesize)
  }

  let ands = []
  for (let i = 0; i < adminFacetQueries.length; i++) {
    let ors = []
    for (let j = 0; j < adminFacetQueries[i].queries.length; j++) {
      if (adminFacetQueries[i].queries[j].active) {
        // tag '{!tag=' + state.facetQueries[i].id + '}' +
        if (adminFacetQueries[i].queries[j].childFacet) {
          // there are two levels, only take the lowest active levels
          let lvl1 = adminFacetQueries[i].queries[j].childFacet
          let foundActiveLvl1Query = false
          for (let k = 0; k < lvl1.queries.length; k++) {
            if (lvl1.queries[k].active) {
              foundActiveLvl1Query = true

              let lvl2 = lvl1.queries[k].childFacet
              let foundActiveLvl2Query = false
              for (let l = 0; l < lvl2.queries.length; l++) {
                if (lvl2.queries[l].active) {
                  foundActiveLvl2Query = true
                  ors.push(lvl2.queries[l].query)
                  searchdefarr.push('fq=' + adminFacetQueries[i].id + '_' + lvl2.queries[l].id)
                }
              }

              if (!foundActiveLvl2Query) {
                ors.push(lvl1.queries[k].query)
                searchdefarr.push('fq=' + adminFacetQueries[i].id + '_' + lvl1.queries[k].id)
              }
            }
          }

          if (!foundActiveLvl1Query) {
            ors.push(adminFacetQueries[i].queries[j].query)
            searchdefarr.push('fq=' + adminFacetQueries[i].id + '_' + adminFacetQueries[i].queries[j].id)
          }
        } else {
          ors.push(adminFacetQueries[i].queries[j].query)
          searchdefarr.push('fq=' + adminFacetQueries[i].id + '_' + adminFacetQueries[i].queries[j].id)
        }
      }
    }
    if (ors.length > 0) {
      if (ors.length > 1) {
        ands.push('(' + ors.join(' OR ') + ')')
      } else {
        ands.push(ors[0])
      }
    }
  }

  return { searchdefarr, ands }
}

export function adminBuildParams ({ q, page, pagesize, sortdef, lang, adminFacetQueries }, ands) {
  let params = {
    q,
    defType: 'edismax',
    wt: 'json',
    qf: 'pid^5 dc_title^4 dc_creator^3 dc_subject^2 _text_',
    start: (page - 1) * pagesize,
    rows: pagesize,
    sort: '',
    facet: true,
    'facet.query': []
  }

  if (q === '' || q === null) {
    params.q = '*:*'
    params.sort = 'created desc'
  }

  for (let i = 0; i < sortdef.length; i++) {
    if (sortdef[i].active) {
      if ((sortdef[i].id === 'title asc') || (sortdef[i].id === 'title desc')) {
        params.sort = sortdef[i].def[lang]
      } else {
        params.sort = sortdef[i].def
      }
    }
  }

  for (let i = 0; i < adminFacetQueries.length; i++) {
    for (let j = 0; j < adminFacetQueries[i].queries.length; j++) {
      params['facet.query'].push(adminFacetQueries[i].queries[j].query)
    }
  }

  if (ands.length > 0) {
    params['fq'] = ands.join(' AND ')
  }

  return params
}

export const sortdef = [
  {
    id: 'title asc',
    active: false,
    def: {
      'en': 'sort_eng_dc_title asc,sort_dc_title asc',
      'de': 'sort_deu_dc_title asc,sort_dc_title asc',
      'it': 'sort_ita_dc_title asc,sort_dc_title asc'
    }
  },
  {
    id: 'title desc',
    active: false,
    def: {
      'en': 'sort_eng_dc_title desc,sort_dc_title desc',
      'de': 'sort_deu_dc_title desc,sort_dc_title desc',
      'it': 'sort_ita_dc_title desc,sort_dc_title desc'
    }
  },
  {
    id: 'created asc',
    active: false,
    def: 'created asc'
  },
  {
    id: 'created desc',
    active: false,
    def: 'created desc'
  }
]
