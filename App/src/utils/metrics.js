import AyxStore from '../stores/AyxStore'
import {toJS} from 'mobx' 
console.log('metrics.js file exported')
// hard-coded IDs may be temp (discuss further)
const accountId = '226181'
const webPropertyId = 'UA-226181-9'
const profileId = '113553943'
const metadataRequestUri = 'https://www.googleapis.com/analytics/v3/metadata/ga/columns'
const customMetricsMetadataRequestUri = 'https://www.googleapis.com/analytics/v3/management/accounts/'+accountId+'/webproperties/'+webPropertyId+'/customMetrics'
const accessToken = 'ya29.Ci-XAz0oDLbyzBrYi_r7lBBnJHvOI09hIqwKUPsvjpAocWTatFLGG1FyPmjstk92kA'

// get metadata for standard metrics
const getMetricsMetadata = (accessToken) => {
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

// remove deprecated metrics from standard metrics metadata array
const filterMetricsMetadata = (response) => {
    const filteredMetadataItems = response.items.filter( (d) => 
        d.attributes.status != 'DEPRECATED' &&
        d.attributes.type != 'DIMENSION'
    )
    return filteredMetadataItems
}

// get metadata for custom metrics
const getCustomMetricsMetadata = (accessToken) => {
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": customMetricsMetadataRequestUri,
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

// remove inactive custom metrics from the custom metrics metadata array
const filterCustomMetricsMetadata = (response) => {
        const filteredCustomMetricsMetadataItems = response.items.filter( (d) => d.active != false)
        const reformattedCustomMetricsItems = filteredCustomMetricsMetadataItems.map( (d) => {
            return {
                id: d.id,
                attributes: {
                    uiName: d.name,
                    accountId: d.accountId,
                    scope: d.scope,
                    type: d.type,
                    webPropertyId: d.webPropertyId,
                    }
            }
        })
        return reformattedCustomMetricsItems
}

// promise function to update metricsList store
const metricsStorePush = (result) => {
    result.map( (d) => {
        store.metricsList.stringList.push({uiobject: d.attributes.uiName, dataname: d.id})
    })
    console.log(toJS(store.metricsList.stringList) )
}

// merge the standard and custom metrics metadata arrays and store them in metricsList
const combinedMetricsMetadata = (accessToken, store) => {

    const standardMetrics = getMetricsMetadata(accessToken)
    const customMetrics = getCustomMetricsMetadata(accessToken)

    Promise.all([standardMetrics,customMetrics])
        .then( (results) => {
            const filteredCombined = filterMetricsMetadata(results[0]).concat(filterCustomMetricsMetadata(results[1]))
            filteredCombined.sort(function(a, b){
                let uiNameA=a.attributes.uiName.toLowerCase(), uiNameB=b.attributes.uiName.toLowerCase()
                if (uiNameA < uiNameB) //sort string ascending
                    return -1 
                if (uiNameA > uiNameB)
                    return 1
                return 0 //default return value (no sorting)
            })
            return filteredCombined
        })
        .then( (results) => {
            metricsStorePush(results)
        })
}

// COMMENTED OUT SECTIONS - NO LONGER NEEDED DUE TO metricMessage.js
// displays warning if no metrics are selection and if more than 10 metrics are selected
// const metricsSelectionCheck = () => {
//     if (store.metricsList.selection.length < 11) {
//         console.log("metrics selected: " + store.metricsList.selection.length)
//         document.getElementById('maxMetrics').className = ''
//         document.getElementById('maxMetrics').innerHTML = ''
//     } else {
//         console.log("Max of 10 metrics: " + store.metricsList.selection.length)
//         let excess = store.metricsList.selection.length - 10
//         document.getElementById('maxMetrics').className = 'tooMany'
//         document.getElementById('maxMetrics').innerHTML = '<div>Maximum of ten metrics can be chosen.  Please remove '+excess+' metric(s).</div>'
//     }
// }

// Warning if no metrics are selection - trigger when they try to go to the next config window
// const noMetricsSelectedWarning = () => {
//     if (store.metricsList.selection.length < 1) {
//         console.log("must select at least 1 metric")
//         document.getElementById('maxMetrics').className = 'warning'
//         document.getElementById('maxMetrics').innerHTML = 'At least one metric must be selected.';
//     } else {
//         document.getElementById('maxMetrics').className = ''
//         document.getElementById('maxMetrics').innerHTML = ''
//     }
// }

// binds the metricsSelectionCheck to metricsList and runs it each time 
// const bindMetricCheck = () => {
//     Alteryx.Gui.manager.GetDataItem('metricsList').UserDataChanged.push(metricsSelectionCheck)
// }

export { getMetricsMetadata, getCustomMetricsMetadata, combinedMetricsMetadata, metricsStorePush };