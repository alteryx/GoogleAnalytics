import React from 'react'
import ReactDOM from 'react-dom'
import { setFreshAccessToken, login, displayFieldset, setPage } from './utils/utils'
import AyxStore from './stores/AyxStore'
import * as accounts from './utils/accountUtils'
import * as metadataRequest from './utils/metadataRequest'
import { extendObservable, autorun, toJS } from 'mobx'
import * as goals from './utils/goals'
import * as segments from './utils/segments'
import MetricMessage from './components/metricMessage.jsx'
import DimensionMessage from './components/dimensionMessage.jsx'
import moment from 'moment'
import * as picker from './utils/datePickers'
import SegmentMessage from './components/segmentMessage.jsx'
import DateMessage from './components/dateMessage.jsx'
import conditionallyEnable from './utils/interfaceStateControl'

Alteryx.Gui.AfterLoad = (manager) => {

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
    {key: 'startDatePicker', type: 'value'},
    {key: 'endDatePicker', type: 'value'},
    {key: 'preDefDropDown', type: 'value'},
    {key: 'segmentsList', type: 'listBox'},
    {key: 'advOptions', type: 'value'},
    {key: 'maxResults', type: 'value'},
    {key: 'page', type: 'value'}
  ]

  // Instantiate the mobx store which will sync all dataItems
  // specified in the collection.
  const store = new AyxStore(manager, collection)

  // Set Predefined dropdown to 'custom' value if it is undefined.
  if (!store.preDefDropDown) {
    store.preDefDropDown = 'custom'
  }

  extendObservable(store, {
    // Compute total selections for metrics and metric goals for use in react messaging
    get totalMetricsAndGoals () {
      let total = store.metricsList.selection.length + store.metricsGoalsList.selection.length
      return total
    },
    // Compute total selections for dimensions and dimension goals for use in react messaging
    get totalDimensionsAndGoals () {
      let total = store.dimensionsList.selection.length + store.dimensionsGoalsList.selection.length
      return total
    },
    // Compute total number of selected segments, for use in react messaging
    get totalSegments () {
      let total = store.segmentsList.selection.length
      return total
    },
    // Compute if startDatePicker value is greater than endDatePicker value
    get startIsAfterEnd () {
      return store.startDatePicker > store.endDatePicker
    },
    // Compute start date for currently selected preDefDropDown value
    get preDefStart () {
      if (store.preDefDropDown === 'custom') {
        return store.startDatePicker
      } else {
        return picker.setDates(store.preDefDropDown).start
      }
    },
    // Compute end date for currently selected preDefDropDown value
    get preDefEnd () {
      if (store.preDefDropDown === 'custom') {
        return store.endDatePicker
      } else {
        return picker.setDates(store.preDefDropDown).end
      }
    },
    // Compute if preDefined date values match currently set picker values
    get isCustomDate () {
      return store.startDatePicker !== store.preDefStart ||
             store.endDatePicker !== store.preDefEnd
    }
  })

  autorun(() => {
    store.page === '' ? displayFieldset('#accessMethod') : displayFieldset(store.page)
  })

  // Update preDefined selector to 'custom' when a custom date is selected/entered
  autorun(() => {
    if (store.isCustomDate) {
      store.preDefDropDown = 'custom'
    }
  })

  // Update Start and End date picker values to the selected predefined date range
  autorun(() => {
    if (store.preDefDropDown) {
      if (store.preDefDropDown !== 'custom') {
        store.startDatePicker = store.preDefStart
        store.endDatePicker = store.preDefEnd
      }
    }
  })

  // Populate webPropertiesList when account has been chosen
  autorun(() => {
    if (store.accountsList.selection !== '') {
      accounts.populateWebPropertiesList(store)
    }
  })

  // Populate profiles list if webproperties has no selection and no stringlist
  autorun(() => {
    if (store.webPropertiesList.selection !== '' &&
        store.webPropertiesList.stringList.length > 0) {
      accounts.populateProfilesMenu(store)
    }
  })

  autorun(() => {
    if (store.accessToken !== '' || store.accountsList.stringList.length < 1) {
      accounts.populateAccountsList(store)
      metadataRequest.pushCombinedMetadata(store)
      goals.populateMetricsGoalsList(store)
      goals.populateDimensionsGoalsList(store)
      segments.populateSegmentsList(store)
    }
  })

  // Displays the maxResults spinner input if advOptions is true else hides it
  autorun(() => {
    if (store.advOptions) {
      document.getElementById('maxResults').style.display = 'block'
    } else {
      document.getElementById('maxResults').style.display = 'none'
      // resets maxResults to default if advOptions is deselected
      store.maxResults = 1000
    }
  })

  // Disable Next Buttons until all page requirements are met
  autorun(() => {
    const profileConditions = [
      store.accountsList.selection,
      store.webPropertiesList.selection,
      store.profilesList.selection
    ]

    conditionallyEnable('profileSelectorsNextBtn', profileConditions)
  })

  autorun(() => {
    const target = document.getElementById('metricsNextBtn')
    const total = store.totalMetricsAndGoals

    if (total < 1) {
      target.setAttribute('disabled', 'true')
    } else if (total > 10) {
      target.setAttribute('disabled', 'true')
    } else {
      target.removeAttribute('disabled')
    }
  })

  autorun(() => {
    const target = document.getElementById('datePickersNextBtn')
    const invalidDateRange = store.startIsAfterEnd

    if (invalidDateRange) {
      target.setAttribute('disabled', 'true')
    } else {
      target.removeAttribute('disabled')
    }
  })

  // Render react component which handles Metric selection messaging
  ReactDOM.render(<MetricMessage store={store} />, document.querySelector('#selectedMetrics'))

  // Render react component which handles Dimension selection messaging.
  ReactDOM.render(<DimensionMessage store={store} />, document.querySelector('#selectedDimensions'))

  // Render react component which handles Segment selection messaging.
  ReactDOM.render(<SegmentMessage store={store} />, document.querySelector('#selectedSegments'))

  // Render react component which handles a warning message for End Date not at or after Start Date.
  ReactDOM.render(<DateMessage store={store} />, document.querySelector('#dateWarning'))

  // REMOVE? - Pretty sure this is just test code that can be removed... ~Erik
  let optionList = [{uiobject: 'test1', dataname: 'test1 value'},
                    {uiobject: 'test2', dataname: 'test2 value'}]

  // All window declarations, below, are simply to expose functionality to the console, and
  // should probably be removed or commented out before shipping the connector.
  window.optionList = optionList

  window.store = store

  window.setFreshAccessToken = setFreshAccessToken

  window.login = login

  window.displayFieldset = displayFieldset

  window.setPage = setPage

  window.populateAccountsList = accounts.populateAccountsList

  window.populateWebPropertiesList = accounts.populateWebPropertiesList

  window.populateProfilesMenu = accounts.populateProfilesMenu

  window.populateMetricsGoalsList = goals.populateMetricsGoalsList

  window.populateDimensionsGoalsList = goals.populateDimensionsGoalsList

  window.moment = moment

  window.getDates = picker.getDates

  window.setDates = picker.setDates

  window.toJS = toJS
}
