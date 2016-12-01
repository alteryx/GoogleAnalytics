import React from 'react'
import ReactDOM from 'react-dom'
import Hello from './components/hello'
import { setFreshAccessToken, getAccessTokenAjaxCall, login, gup, validateToken, displayFieldset } from './utils/utils'
import AyxStore from './stores/AyxStore'
// import * as metrics from './utils/metrics'
// import * as dimensions from './utils/dimensions'
import * as accounts from './utils/accountUtils'
import * as metadataRequest from './utils/metadataRequest'
import { toJS, extendObservable } from 'mobx'
import * as goals from './utils/goals'
import MetricMessage from './components/metricMessage'
import DimensionMessage from './components/dimensionMessage'

Alteryx.Gui.AfterLoad = (manager) => {

  // Adds metrics.metricsSelectionCheck to UserDataChanged of metricsList
  // bind functions no longer necessary due to metricMessage.js and dimensionMessage.js
  // metrics.bindMetricCheck()
  // dimensions.bindDimensionCheck()

  const collection = [
    {key: 'client_id', type: 'value'},
    {key: 'client_secret', type: 'value'},
    {key: 'refresh_token', type: 'value'},
    {key: 'accessToken', type: 'value'},
    {key: 'metricsList', type: 'listBox'},
    {key: 'metricsGoalsList', type: 'listBox'},
    {key: 'dimensionsGoalsList', type: 'listBox'},
    {key: 'accountsList', type: 'dropDown'},
    {key: 'webPropertiesList', type: 'dropDown'},
    {key: 'profilesList', type: 'dropDown'},
    {key: 'dimensionsList', type: 'listBox'},
  ]

  //Instantiate the mobx store which will sync all dataItems
  //specified in the collection.
  const store = new AyxStore(manager, collection)

 //Add computed value to store that tracks total selections for metrics and metric goals.
  extendObservable(store,{
    totalMetricsAndGoals: () => {
      let total = store.metricsList.selection.length + store.metricsGoalsList.selection.length
      return total;
    }
  })
  //Add computed value to store that tracks total selections for dimensions and dimension goals.
  extendObservable(store,{
    totalDimensionsAndGoals: () => {
      let total = store.dimensionsList.selection.length + store.dimensionsGoalsList.selection.length
      return total;
    }
  })

  //Render react component which handles Metric selection messaging.
  ReactDOM.render(<MetricMessage store={store} />, document.querySelector('#selectedMetrics'));
  //Render react component which handles Dimension selection messaging.
  ReactDOM.render(<DimensionMessage store={store} />, document.querySelector('#selectedDimensions'));
  //hardcoded credentials for development only.
  store.client_id = "734530915454-u7qs1p0dvk5d3i0hogfr0mpmdnjj24u2.apps.googleusercontent.com"
  store.client_secret = "Fty30QrWsKLQW-TmyJdrk9qf"
  store.refresh_token = "1/58fo4PUozzcHFs2VJaY23wxyHc-x3-pb-2dUbNw33W4"

  let optionList = [{uiobject:'test1', dataname: 'test1 value'},
                    {uiobject:'test2', dataname: 'test2 value'}]

  //create promise that will run combinedMetricsMetadata and show metrics fieldset

  metadataRequest.pushCombinedMetadata(store)
  goals.populateMetricsGoalsList(store)
  goals.populateDimensionsGoalsList(store)


  window.optionList = optionList

  window.store = store

  window.setFreshAccessToken = setFreshAccessToken

  window.login = login

  window.displayFieldset = displayFieldset

  window.getMetricsMetadata = metrics.getMetricsMetadata

  window.getCustomMetricsMetadata = metrics.getCustomMetricsMetadata

  window.combinedMetricsMetadata = metrics.combinedMetricsMetadata

  // window.metricsSelectionCheck = metrics.metricsSelectionCheck

  // window.bindMetricCheck = metrics.bindMetricCheck

  // window.noMetricsSelectedWarning = metrics.noMetricsSelectedWarning

  // window.noDimensionsSelectedWarning = dimensions.noDimensionsSelectedWarning

  window.populateAccountsList = accounts.populateAccountsList

  window.populateWebPropertiesList = accounts.populateWebPropertiesList

  window.populateProfilesMenu = accounts.populateProfilesMenu

  window.populateMetricsGoalsList = goals.populateMetricsGoalsList

  window.populateDimensionsGoalsList = goals.populateDimensionsGoalsList

  window.combinedDimensionsMetadata = dimensions.combinedDimensionsMetadata

  populateAccountsList(store)
  populateWebPropertiesList(store)
  // populateProfilesMenu(store)
}



//window.setFreshAccessToken = setFreshAccessToken;
//window.getAccessTokenAjaxCall = getAccessTokenAjaxCall;
