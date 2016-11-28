import React from 'react'
import ReactDOM from 'react-dom'
import Hello from './components/hello'
import { setFreshAccessToken, getAccessTokenAjaxCall, login, gup, validateToken, displayFieldset } from './utils/utils'
import AyxStore from './stores/AyxStore'
import * as metrics from './utils/metrics'
import * as accounts from './utils/accountUtils.js'
import { toJS } from 'mobx'

Alteryx.Gui.AfterLoad = (manager) => {




  // Adds metrics.metricsSelectionCheck to UserDataChanged of metricsList
  metrics.bindMetricCheck()

  const collection = [
    {key: 'client_id', type: 'value'},
    {key: 'client_secret', type: 'value'},
    {key: 'refresh_token', type: 'value'},
    {key: 'accessToken', type: 'value'},
    {key: 'metricsList', type: 'listBox'},
    {key: 'accountsList', type: 'dropDown'},
    {key: 'webPropertiesList', type: 'dropDown'},
    {key: 'profilesList', type: 'dropDown'},
  ]


  const store = new AyxStore(manager, collection)

  store.client_id = "734530915454-u7qs1p0dvk5d3i0hogfr0mpmdnjj24u2.apps.googleusercontent.com"
  store.client_secret = "Fty30QrWsKLQW-TmyJdrk9qf"
  store.refresh_token = "1/58fo4PUozzcHFs2VJaY23wxyHc-x3-pb-2dUbNw33W4"
  
  let optionList = [{uiobject:'test1', dataname: 'test1 value'},
                    {uiobject:'test2', dataname: 'test2 value'}]

  //create promise that will run combinedMetricsMetadata and show metrics fieldset

  metrics.combinedMetricsMetadata(store.accessToken, store)

  window.optionList = optionList

  window.store = store

  window.setFreshAccessToken = setFreshAccessToken

  window.login = login

  window.displayFieldset = displayFieldset

  window.getMetricsMetadata = metrics.getMetricsMetadata

  window.getCustomMetricsMetadata = metrics.getCustomMetricsMetadata

  window.combinedMetricsMetadata = metrics.combinedMetricsMetadata

  window.metricsSelectionCheck = metrics.metricsSelectionCheck

  window.bindMetricCheck = metrics.bindMetricCheck

  window.noMetricsSelectedWarning = metrics.noMetricsSelectedWarning

  window.populateAccountsList = accounts.populateAccountsList

  window.populateWebPropertiesList = accounts.populateWebPropertiesList

  window.populateProfilesMenu = accounts.populateProfilesMenu

  window.toJS = toJS

  populateAccountsList(store)
  populateWebPropertiesList(store)
  // populateProfilesMenu(store)
}



//window.setFreshAccessToken = setFreshAccessToken;
//window.getAccessTokenAjaxCall = getAccessTokenAjaxCall;
