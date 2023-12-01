export const constructDataCite = (dataciteData, that) => {
  // console.log('constructDataCite call =>>')
  let doiImportData = {
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
  if (dataciteData?.data?.attributes?.titles?.length) {
    doiImportData.title = dataciteData.data.attributes.titles[0].title
  }
  if (dataciteData?.data?.attributes?.publicationYear) {
    doiImportData.dateIssued = dataciteData?.data?.attributes?.publicationYear.toString()
  }
  if (dataciteData?.data?.attributes?.creators) {
    let authors = dataciteData?.data?.attributes?.creators
    if (authors.length > 0) {
      for (let author of authors) {
        if (author['givenName'] || author['familyName']) {
          let auth = {
            type: 'schema:Person',
            firstname: author['givenName'] ? author['givenName'].replace(/\s\s+/g, ' ').trim() : '',
            lastname: author['familyName'] ? author['familyName'].replace(/\s\s+/g, ' ').trim() : ''
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
          doiImportData.authors.push(auth)
        }
        if (author['name']) {
          let auth = {
            type: 'schema:Organization',
            name: author['name']
          }
          doiImportData.authors.push(auth)
        }
      }
    }
  }
  if (dataciteData?.data?.attributes?.language) {
    if (that.lang2to3map[dataciteData.data.attributes.language]) {
      doiImportData.language = that.lang2to3map[dataciteData.data.attributes.language]
    }
  }
  if (dataciteData?.data?.attributes?.types?.citeproc) {
    const dataciteType = dataciteData.data.attributes.types.citeproc;
    switch (dataciteType) {
      case 'article':
      case 'journal-article':
      case 'article-journal':
        doiImportData.publicationType = 'article'
        doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/VKA6-9XTY'
        break
      case 'report':
        doiImportData.publicationType = 'report'
        doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/JMAV-7F3R'
        break
      case 'book':
      case 'monograph':
      case 'reference-book':
      case 'edited-book':
        doiImportData.publicationType = 'book'
        doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/47QB-8QF1'
        break
      case 'book-chapter':
      case 'book-part':
      case 'book-section':
        doiImportData.publicationType = 'book_part'
        doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/XA52-09WA'
        break
      case 'dissertation':
        doiImportData.publicationType = 'doctoral_thesis'
        doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/1PHE-7VMS'
        break
      case 'proceedings-article':
      case 'proceedings':
        doiImportData.publicationType = 'conference_object'
        doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/QKDF-E5HA'
        break
      case 'dataset':
        doiImportData.publicationType = 'research_data'
        doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/KW6N-2VTP'
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
        doiImportData.publicationType = 'other'
        doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/PYRE-RAWJ'
        break
      default:
        doiImportData.publicationType = 'other'
        doiImportData.publicationTypeId = 'https://pid.phaidra.org/vocabulary/PYRE-RAWJ'
    }
  }
  if (dataciteData?.data?.attributes?.publisher) {
    doiImportData.publisher = that.$_.unescape(dataciteData.data.attributes.publisher.replace(/\s\s+/g, ' ').trim())
  }
  if (dataciteData?.data?.attributes?.subjects) {
    if (Array.isArray(dataciteData.data.attributes.subjects)) {
      doiImportData.keywords = []
      for (let kw of dataciteData.data.attributes.subjects) {
        doiImportData.keywords.push(kw)
      }
    }
  }
  if (dataciteData?.data?.attributes?.container?.title) {
    doiImportData.journalTitle = that.$_.unescape(dataciteData?.data?.attributes?.container?.title.replace(/\s\s+/g, ' ').trim())
  }
  return doiImportData
}