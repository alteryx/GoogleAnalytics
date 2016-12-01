// Code for populating and managing the dimentions list selector
// By: Erik Burton
// Created: 2016-11-28
// 


import AyxStore from '../stores/AyxStore'
import {toJS} from 'mobx'

// hard-coded IDs may be temp (discuss further)
const accountId = '226181'
const webPropertyId = 'UA-226181-9'
const profileId = '113553943'
const metadataRequestUri = 'https://www.googleapis.com/analytics/v3/metadata/ga/columns'
const customDimensionsMetadataRequestUri = 'https://www.googleapis.com/analytics/v3/management/accounts/'+accountId+'/webproperties/'+webPropertyId+'/customDimensions'
const accessToken = 'ya29.Ci-XAz0oDLbyzBrYi_r7lBBnJHvOI09hIqwKUPsvjpAocWTatFLGG1FyPmjstk92kA'

// get metadata for standard metrics
const getDimensionsMetadata = (accessToken) => {
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
const filterDimensionsMetadata = (response) => {
    const filteredMetadataItems = response.items.filter( (d) => 
        d.attributes.status != 'DEPRECATED' &&
        d.attributes.type != 'METRIC'
    )
    return filteredMetadataItems
}

// get metadata for custom metrics
const getCustomDimensionsMetadata = (accessToken) => {
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": customDimensionsMetadataRequestUri,
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
const filterCustomDimensionsMetadata = (response) => {
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

// promise function to update dimensionsList store
const dimensionsStorePush = (result) => {
    result.map( (d) => {
        store.dimensionsList.stringList.push({uiobject: d.attributes.uiName, dataname: d.id})
    })
    console.log(toJS(store.dimensionsList.stringList) )
}

// merge the standard and custom metrics metadata arrays and store them in dimensionsList
const combinedDimensionsMetadata = (accessToken, store) => {

    const standardMetrics = getDimensionsMetadata(accessToken)
    const customMetrics = getCustomDimensionsMetadata(accessToken)

    Promise.all([standardMetrics,customMetrics])
        .then( (results) => {
            const filteredCombined = filterDimensionsMetadata(results[0]).concat(filterCustomDimensionsMetadata(results[1]))
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
            dimensionsStorePush(results)
        })
}

// NO LONGER NEEDED - WARNINGS NOW HANDLED IN dimensionMessage.js
// displays warning if no metrics are selection and if more than 10 metrics are selected
// const dimensionsSelectionCheck = () => {
//     if (store.dimensionsList.selection.length < 8) {
//         console.log("Dimensions selected: " + store.dimensionsList.selection.length)
//         document.getElementById('maxDimensions').className = ''
//         document.getElementById('maxDimensions').innerHTML = ''
//     } else {
//         console.log("Max of 7 dimensions: " + store.dimensionsList.selection.length)
//         document.getElementById('maxDimensions').className = 'tooMany'
//         document.getElementById('maxDimensions').innerHTML = '<div style="display:inline-block;vertical-align:middle;text-align:center;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAFMandsAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxIAAAsSAdLdfvwAAADRSURBVChTtZOxDcIwEEWZI/SIFaiZhREYhmFoKRApkOgo6IjoUCgIJrbxnfFxjh1jhPKlr7N/nr8URxndt4V2ztgkFupR4aSQi0LueODUH3AHQcweJI4LrIPJc4LkbYeArDd2mn0ApfwV+g1o9jM0zzzAiWcEPKuV1m2NhnUHGNujqrU2gowAJS4YckHGGvr9P5Dj4UvkdY0vDjNVGi8pJ+bXOOP9wx4m7CEPWOOgpDnM6dvwEpTJ4Xn3jFciTksLO0FJOf2UvAUcPzf8xea50C8xwHD+EY9YyQAAAABJRU5ErkJggg==" alt="warningIcon.png"/></div><div style="display:inline-block;vertical-align:middle;text-align:left;margin-left:10px;">Must select seven or<br>fewer dimensions</div>'
//     }
// }

// Warning if no metrics are selection - trigger when they try to go to the next config window
// const noDimensionsSelectedWarning = () => {
//     if (store.dimensionsList.selection.length < 1) {
//         console.log("must select at least 1 dimension")
//         document.getElementById('maxDimensions').className = 'tooMany'
//         document.getElementById('maxDimensions').innerHTML = '<div style="display:inline-block;vertical-align:middle;text-align:center;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAFMandsAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxIAAAsSAdLdfvwAAADRSURBVChTtZOxDcIwEEWZI/SIFaiZhREYhmFoKRApkOgo6IjoUCgIJrbxnfFxjh1jhPKlr7N/nr8URxndt4V2ztgkFupR4aSQi0LueODUH3AHQcweJI4LrIPJc4LkbYeArDd2mn0ApfwV+g1o9jM0zzzAiWcEPKuV1m2NhnUHGNujqrU2gowAJS4YckHGGvr9P5Dj4UvkdY0vDjNVGi8pJ+bXOOP9wx4m7CEPWOOgpDnM6dvwEpTJ4Xn3jFciTksLO0FJOf2UvAUcPzf8xea50C8xwHD+EY9YyQAAAABJRU5ErkJggg==" alt="warningIcon.png"/></div><div style="display:inline-block;vertical-align:middle;text-align:left;margin-left:10px;">Must select one<br>or more dimensions</div>';
//     } else {
//     	console.log("noDimensionsSelectedWarning else path")
//         document.getElementById('maxDimensions').className = ''
//         document.getElementById('maxDimensions').innerHTML = ''
//     }
// }

// binds the dimensionsSelectionCheck to dimensionsList and runs it each time 
// const bindDimensionCheck = () => {
//     Alteryx.Gui.manager.GetDataItem('dimensionsList').UserDataChanged.push(dimensionsSelectionCheck)
// }

export { getDimensionsMetadata, getCustomDimensionsMetadata, combinedDimensionsMetadata, dimensionsStorePush };