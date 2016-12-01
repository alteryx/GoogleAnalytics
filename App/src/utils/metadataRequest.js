import AyxStore from '../stores/AyxStore'
import {toJS} from 'mobx' 

// hard-coded IDs may be temp (discuss further)
const accountId = '226181'
const webPropertyId = 'UA-226181-9'
const profileId = '113553943'
const metadataRequestUri = 'https://www.googleapis.com/analytics/v3/metadata/ga/columns'
const customMetricsMetadataRequestUri = 'https://www.googleapis.com/analytics/v3/management/accounts/' + accountId + '/webproperties/' + webPropertyId + '/customMetrics'
const customDimensionsMetadataRequestUri = 'https://www.googleapis.com/analytics/v3/management/accounts/' + accountId +'/webproperties/' + webPropertyId + '/customDimensions'

// get metadata for standard metrics and dimensions
const getMetadata = (accessToken) => {
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": metadataRequestUri,
        "method": "GET",
        "dataType": "json",
        "headers": {
            "Authorization": 'Bearer ' + accessToken,
            "cache-control": "private, max-age=0, must-revalidate, no-transform",
            "content-type": "application/json; charset=UTF-8" 
        } 
    }
    return $.ajax(settings)
}

// filter deprecated metrics & dimensions from standard metadata array
const filterMetadata = (response) => {
    return response.items.filter( (d) => {return d.attributes.status != 'DEPRECATED'} )
}

// get metadata for custom metrics or dimensions
const getCustomMetadata = (accessToken, metadataType) => {
	// metadataType is our argument when invoking getCustomMetadata() inside pushCombinedMetadata()
	const requestUri = metadataType === 'METRIC' ? customMetricsMetadataRequestUri : customDimensionsMetadataRequestUri
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": requestUri,
        "method": "GET",
        "dataType": "json",
        "headers": {
            "Authorization": 'Bearer ' + accessToken,
            "cache-control": "private, max-age=0, must-revalidate, no-transform",
            "content-type": "application/json; charset=UTF-8" 
        } 
    }
    return $.ajax(settings)
}

/* remove inactive custom metrics/dimensions from the custom metrics/dimensions metadata array	*/
const filterCustomMetadata = (response) => {
    // this works on both custom metrics and dimensions, which is good
    return response.items.filter( (d) => d.active != false)
}

const mapCustomMetadata = (results) => {
	// set METRIC or DIMENSION type for mapping functions to correctly identify the custom metadata
	const typeProperty =
		results[0].kind === 'analytics#customMetric' ? 'METRIC' :
		results[0].kind === 'analytics#customDimension' ? 'DIMENSION' : 'OTHER' // using OTHER in case of edge cases

	return results.map( (d) => {
        return {
            id: d.id,
            attributes: {
                uiName: d.name,
                accountId: d.accountId,
                scope: d.scope,
                dataType: d.type, /* d.type of custom metrics is actually data type; custom dimensions will be undefined, which is OK */
                webPropertyId: d.webPropertyId,
                type: typeProperty, // we define each object as a METRIC or DEFINITION which is used in storePush()
            }
        }
	})
}

/*	promise function to filter, map, and concat the standard and custom metrics/dimensions;
	prepares data to be sorted */
const preSortMetadata = (results) => {
	const filteredMetadata 			= filterMetadata(results[0])
	const filteredCustomMetrics 	= filterCustomMetadata(results[1])
	const filteredCustomDimensions 	= filterCustomMetadata(results[2])
	const mappedCustomMetrics 		= mapCustomMetadata(filteredCustomMetrics)
	const mappedCustomDimensions 	= mapCustomMetadata(filteredCustomDimensions)
	return filteredMetadata
			.concat(mappedCustomMetrics)
			.concat(mappedCustomDimensions)
}

const sortMetadata = (results) => {
    return results.sort( (a, b) => {
        let uiNameA = a.attributes.uiName.toLowerCase(),
        	uiNameB = b.attributes.uiName.toLowerCase()
        if (uiNameA < uiNameB) return -1  //sort string ascending
        if (uiNameA > uiNameB) return 1
        return 0 //default return value (no sorting)
    })
}

/* 	promise function to update the stores; 
	the map function is a gateway that checks each type and pushes to the appropriate store */
const storePush = (results) => { 
    results.map( (d) => {
    	// This works because we define each METRIC or DIMENSION in filterCustomMetadata()
    	const storeType = d.attributes.type === 'METRIC' ? store.metricsList : store.dimensionsList 
        storeType.stringList.push( {uiobject: d.attributes.uiName, dataname: d.id} )
    })
    console.log(toJS(store.metricsList.stringList) ) // do we need to console.log this? it does NOT appear
    console.log(toJS(store.dimensionsList.stringList) ) // do we need to console.log this? it does NOT appear
}

// 	Top level function that contains promises for both Metrics and Dimensions
const pushCombinedMetadata = (store) => {
	const metadata = getMetadata(store.accessToken)
	const customMetrics = getCustomMetadata(store.accessToken, 'METRIC')
	const customDimensions = getCustomMetadata(store.accessToken, 'DIMENSION')
	const promises = [metadata, customMetrics, customDimensions]

    Promise.all( promises )
    	.then( preSortMetadata )
    	.then( sortMetadata )
    	.then( storePush )	  	
}

export { getMetadata, filterMetadata, getCustomMetadata, pushCombinedMetadata, storePush, preSortMetadata };