export function setSearchParams (self, { q, page, pagesize, sortdef, owner, collection, fq, fr }) {
  if (q) {
    self.q = q
  }

  if (page) {
    self.currentPage = parseInt(page)
  }

  if (pagesize) {
    self.pagesize = parseInt(pagesize)
  }

  if (sortdef) {
    for (let i = 0; i < self.sortdef.length; i++) {
      if (self.sortdef[i].id === sortdef) {
        self.sortdef[i].active = true
      }
    }
  }

  if (owner) {
    self.owner = owner
    // SearchFilters.watch will set "showOwnerFilter = true"
  }

  if (collection) {
    self.inCollection = collection
  }

  if (fq) {
    if (typeof fq === 'string') {
      fq = [fq]
    }
    for (let n = 0; n < fq.length; n++) {
      const fqa = fq[n].split('_')
      const facetId = fqa[0]
      const queryId = fqa[1]
      for (let j = 0; j < self.facetQueries.length; j++) {
        if (self.facetQueries[j].id === facetId) {
          self.facetQueries[j].show = 1
          for (let k = 0; k < self.facetQueries[j].queries.length; k++) {
            if (self.facetQueries[j].queries[k].id === queryId) {
              self.facetQueries[j].queries[k].active = 1
            }
            if (self.facetQueries[j].queries[k].childFacet) {
              const lvl1 = self.facetQueries[j].queries[k].childFacet
              for (let l = 0; l < lvl1.queries.length; l++) {
                if (lvl1.queries[l].id === queryId) {
                  lvl1.queries[l].active = 1
                  self.facetQueries[j].queries[k].active = 1
                }
                if (lvl1.queries[l].childFacet) {
                  const lvl2 = lvl1.queries[l].childFacet
                  for (let m = 0; m < lvl2.queries.length; m++) {
                    if (lvl2.queries[m].id === queryId) {
                      lvl2.queries[m].active = 1
                      lvl1.queries[l].active = 1
                      self.facetQueries[j].queries[k].active = 1
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

  if (fr) {
    if (typeof fr === 'string') {
      fr = [fr]
    }
    const roles = {}
    for (let o = 0; o < fr.length; o++) {
      const idx = fr[o].lastIndexOf('_')
      const role = fr[o].substring(0, idx)
      const value = fr[o].substring(idx + 1)

      if (roles[role]) {
        roles[role].values.push(value)
      } else {
        roles[role] = { values: [value] }
      }
    }

    Object.keys(roles).forEach(function (role) {
      if (role === 'bib_roles_pers_aut') {
        self.persAuthors.values = roles[role].values
        // SearchFilters.watch will set "showAuthorFilter = true"
      }
    })
  }
}
