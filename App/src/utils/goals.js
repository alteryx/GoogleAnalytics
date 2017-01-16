import _ from 'lodash'

// get goals for all profiles
const getGoalsListAjaxCall = (store) => {
  const accountId = store.accountsList.selection
  const webPropertyId = store.webPropertiesList.selection
  const profileId = store.profilesList.selection
  const goalsUri = 'https://www.googleapis.com/analytics/v3/management/accounts/'
  const goalsRequestUri = goalsUri + accountId + '/webproperties/' + webPropertyId + '/profiles/' + profileId + '/goals'

  const settings = {
    'async': true,
    'crossDomain': true,
    'url': goalsRequestUri,
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
// sort goals list using lodash and use it for each dims and metrics
const sortGoals = (goalsList) => {
  return _.orderBy(goalsList, [a => a.uiobject.toLowerCase()], ['asc'])
}
// populate Metrics Goals
const populateMetricsGoalsList = (store) => {
  const fetchGoals = getGoalsListAjaxCall(store)

  const parseGoals = (results) => {
    const goals = results.items.filter((d) => d.active !== false)
    const goalsList = goals.map((d) => {
      return {
        uiobject: d.name,
        dataname: d.id,
        type: d.type}
    })
    return goalsList
  }

  const filterMetricsGoals = (goalsList) => {
    const metricsGoals = goalsList.filter((d) => _.includes(['VISIT_TIME_ON_SITE', 'VISIT_NUM_PAGES', 'EVENT'], d.type))
    return metricsGoals
  }

  // push to metrics goals list
  const goalsStorePush = (results) => {
    store.metricsGoalsList.stringList = []

    results.map((d) => {
      store.metricsGoalsList.stringList.push({uiobject: d.uiobject, dataname: d.dataname})
    })
  }

  fetchGoals

    .then(parseGoals)
    .then(filterMetricsGoals)
    .then(sortGoals)
    .done(goalsStorePush)
}

// populate Dimensions Goals
const populateDimensionsGoalsList = (store) => {
  const fetchGoals = getGoalsListAjaxCall(store)

  const parseGoals = (results) => {
    // console.log(results)
    const goals = results.items.filter((d) => d.active !== false)
    const goalsList = goals.map((d) => {
      return {
        uiobject: d.name,
        dataname: d.id,
        type: d.type}
    })
    return goalsList
  }

  const filterDimensionGoals = (goalsList) => {
    const dimensionGoals = goalsList.filter((d) => _.includes(['URL_DESTINATION'], d.type))
    return dimensionGoals
  }

  // push to Dimensions goals list
  const goalsStorePush = (results) => {
    store.dimensionsGoalsList.stringList = []

    results.map((d) => {
      store.dimensionsGoalsList.stringList.push({uiobject: d.uiobject, dataname: d.dataname})
    })
    // console.log(toJS(store.dimensionsGoalsList.stringList) )
  }

  fetchGoals

    .then(parseGoals)
    .then(filterDimensionGoals)
    .then(sortGoals)
    .done(goalsStorePush)
}

export { populateMetricsGoalsList, populateDimensionsGoalsList, sortGoals }
