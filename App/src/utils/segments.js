import _ from 'lodash'

// get metadata for standard metrics
const getSegmentsMetadata = (store) => {
  const metadataRequestUri = 'https://www.googleapis.com/analytics/v3/management/segments'

  const settings = {
    'async': true,
    'crossDomain': true,
    'url': metadataRequestUri,
    'method': 'GET',
    'dataType': 'json',
    'headers': {
      'Authorization': 'Bearer ' + store.accessToken,
      'cache-control': 'private, max-age=0, must-revalidate, no-transform',
      'content-type': 'application/json; charset=UTF-8'
    }
  }
  return $.ajax(settings)
}

const parseSegments = (results) => {
  const segmentsList = results.items.map((d) => {
    return {
      uiobject: d.name,
      dataname: d.id,
      type: d.type,
      segmentId: d.segmentId,
      kind: d.kind,
      definition: d.definition
    }
  })
  return segmentsList
}
// sort segmentsList using lodash
const sortSegmentsList = (segmentsList) => {
  return _.orderBy(segmentsList, [a => a.uiobject.toLowerCase()], ['asc'])
}

const segmentsStorePush = (result) => {
  store.segmentsList.stringList = []

  result.map((d) => {
    store.segmentsList.stringList.push({uiobject: d.uiobject, dataname: d.definition})
  })
}

const populateSegmentsList = (store) => {
  const fetchSegments = getSegmentsMetadata(store)

  fetchSegments
    .then(parseSegments)
    .then(sortSegmentsList)
    .done(segmentsStorePush)
}

export { getSegmentsMetadata, populateSegmentsList, segmentsStorePush, parseSegments }
