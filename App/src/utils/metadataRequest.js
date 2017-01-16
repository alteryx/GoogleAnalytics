// Top level function that contains promises for both Metrics and Dimensions
const pushCombinedMetadata = (store) => {
  const metadata = getMetadata(store)
  const customMetrics = getCustomMetadata(store, 'METRIC')
  const customDimensions = getCustomMetadata(store, 'DIMENSION')
  const promises = [metadata, customMetrics, customDimensions]

  Promise.all(promises)
    .then(preSortMetadata)
    .then(filterBadMetadata)
    .then(sortMetadata)
    .then(storePush)
}

// get metadata for standard metrics and dimensions
const getMetadata = (store) => {
  const metadataRequestUri = 'https://www.googleapis.com/analytics/v3/metadata/ga/columns'

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

// filter out bad metadata
const filterBadMetadata = (response) => {
  let objArray = []
  const excludeList = [
    'ga:contentGroupUniqueViewsXX',
    'ga:calcMetric_<NAME>',
    'ga:metricXX',
    'ga:goalXXAbandons',
    'ga:goalXXAbandonRate',
    'ga:goalXXCompletions',
    'ga:goalXXConversionRate',
    'ga:goalXXStarts',
    'ga:goalXXValue',
    'ga:searchGoalXXConversionRate',
    'ga:landingContentGroupXX',
    'ga:contentGroupXX',
    'ga:previousContentGroupXX',
    'ga:dimensionXX',
    'ga:customVarNameXX',
    'ga:customVarValueXX',
    'ga:productCategoryLevelXX'
  ]

  // loop through each item in matchArray to exclude bad metadata
  response.forEach(d => {
    let remove = false
    for (let i = 0, l = excludeList.length; i < l; i++) {
      if (excludeList[i] === d.id) {
        remove = true
        break
      }
    }
    // push to returned array only if remove is still false
    if (!remove) {
      objArray.push(d)
    }
  })
  return objArray
}

// filter deprecated metrics & dimensions from standard metadata array
const filterMetadata = (response) => {
  return response.items.filter((d) => { return d.attributes.status !== 'DEPRECATED' })
}

// get metadata for custom metrics or dimensions
const getCustomMetadata = (store, metadataType) => {
  // metadataType is our argument when invoking getCustomMetadata() inside pushCombinedMetadata()
  const accountId = store.accountsList.selection
  const webPropertyId = store.webPropertiesList.selection
  const customMetadataUri = 'https://www.googleapis.com/analytics/v3/management/accounts/'
  const customMetricsMetadataRequestUri = customMetadataUri + accountId + '/webproperties/' + webPropertyId + '/customMetrics'
  const customDimensionsMetadataRequestUri = customMetadataUri + accountId + '/webproperties/' + webPropertyId + '/customDimensions'
  const requestUri = metadataType === 'METRIC' ? customMetricsMetadataRequestUri : customDimensionsMetadataRequestUri

  const settings = {
    'async': true,
    'crossDomain': true,
    'url': requestUri,
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

/* remove inactive custom metrics/dimensions from the custom metrics/dimensions metadata array */
const filterCustomMetadata = (response) => {
  // this works on both custom metrics and dimensions, which is good
  return response.items.filter((d) => d.active !== false)
}

const mapCustomMetadata = (results) => {
// set METRIC or DIMENSION type for mapping functions to correctly identify the custom metadata
  const typeProperty = results[0].kind === 'analytics#customMetric' ? 'METRIC'
    : results[0].kind === 'analytics#customDimension' ? 'DIMENSION' : 'OTHER' // using OTHER in case of edge cases

  return results.map((d) => {
    return {
      id: d.id,
      attributes: {
        uiName: d.name,
        accountId: d.accountId,
        scope: d.scope,
        dataType: d.type, /* d.type of custom metrics is actually data type; custom dimensions will be undefined, which is OK */
        webPropertyId: d.webPropertyId,
        type: typeProperty // we define each object as a METRIC or DEFINITION which is used in storePush()
      }
    }
  })
}

/* promise function to filter, map, and concat the standard and custom metrics/dimensions;
prepares data to be sorted */
const preSortMetadata = (results) => {
  const filteredMetadata = filterMetadata(results[0])
  // declaring variables via let to use with if logic that follows
  let filteredCustomMetrics = []
  let mappedCustomMetrics = []
  let filteredCustomDimensions = []
  let mappedCustomDimensions = []

  // logic to account for ZERO custom metrics and/or custom dimensions
  if (results[1].items.length > 0) {
    filteredCustomMetrics = filterCustomMetadata(results[1])
    mappedCustomMetrics = mapCustomMetadata(filteredCustomMetrics)
  }

  if (results[2].items.length > 0) {
    filteredCustomDimensions = filterCustomMetadata(results[2])
    mappedCustomDimensions = mapCustomMetadata(filteredCustomDimensions)
  }

  return filteredMetadata
          .concat(mappedCustomMetrics)
          .concat(mappedCustomDimensions)
}

const sortMetadata = (results) => {
  return results.sort((a, b) => {
    let uiNameA = a.attributes.uiName.toLowerCase()
    let uiNameB = b.attributes.uiName.toLowerCase()
    if (uiNameA < uiNameB) return -1 // sort string ascending
    if (uiNameA > uiNameB) return 1
    return 0 // default return value (no sorting)
  })
}

/* promise function to update the stores;
the map function is a gateway that checks each type and pushes to the appropriate store */
const storePush = (results) => {
  store.metricsList.stringList = []
  store.dimensionsList.stringList = []

  results.map((d) => {
    // This works because we define each METRIC or DIMENSION in mapCustomMetadata()
    const storeType = d.attributes.type === 'METRIC' ? store.metricsList : store.dimensionsList
    storeType.stringList.push({ uiobject: d.attributes.uiName, dataname: d.id })
  })
}

export { getMetadata, filterMetadata, getCustomMetadata, pushCombinedMetadata, storePush, preSortMetadata }
