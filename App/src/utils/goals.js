import AyxStore from '../stores/AyxStore'
import {toJS} from 'mobx' 
import _ from 'lodash'


const accountId = '226181'
const webPropertyId = 'UA-226181-9'
const profileId = '31055553'
const goalsUri = 'https://www.googleapis.com/analytics/v3/management/accounts'
const goalsRequestUri = 'https://www.googleapis.com/analytics/v3/management/accounts/'+accountId+'/webproperties/'+webPropertyId+'/profiles/' +profileId+'/goals' 
const accessToken = 'ya29.CjGkA_MNlXR6u5VIqrIuFHOfenuTrFKZ3rSkLsHRRQaqjojLP734szWNjK0CvAS-Kgxr'

// get goals for all profiles
const getGoalsListAjaxCall = (accessToken) => {
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": goalsRequestUri,
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

//populate Metrics Goals
const populateMetricsGoalsList = (store) => {
	
	const fetchGoals = getGoalsListAjaxCall(store.accessToken);
	
	const parseGoals = (results) => {
		console.log(results)
    const goals = results.items.filter( (d) => d.active != false )
		const goalsList = goals.map((d) => {
      return {
      			uiobject: d.name, 
      			dataname: d.id,
      			type: d.type}
    })
    return goalsList
  }

  const filterMetricsGoals = (goalsList) => {
    const metricsGoals = goalsList.filter( (d) => _.includes(['VISIT_TIME_ON_SITE','VISIT_NUM_PAGES','EVENT'], d.type ))
    return metricsGoals

  }

  //push to metrics goals list
  const goalsStorePush = (results) => {
    results.map( (d) => {
        
        store.metricsGoalsList.stringList.push({uiobject: d.uiobject, dataname: d.dataname})
    })
    console.log(toJS(store.metricsGoalsList.stringList) )
}

  fetchGoals

    .then(parseGoals)
    .then(filterMetricsGoals)
  	.done(goalsStorePush)
  	
}

//populate Dimensions Goals
const populateDimensionsGoalsList = (store) => {
  
  const fetchGoals = getGoalsListAjaxCall(store.accessToken);
  
  const parseGoals = (results) => {
    console.log(results)
    const goals = results.items.filter( (d) => d.active != false )
    const goalsList = goals.map((d) => {
      return {
            uiobject: d.name, 
            dataname: d.id,
            type: d.type}
    })
    return goalsList
  }

  const filterDimensionGoals = (goalsList) => {
    const dimensionGoals = goalsList.filter( (d) => _.includes(['URL_DESTINATION'], d.type ))
    return dimensionGoals

  }

  //push to Dimensions goals list 
  const goalsStorePush = (results) => {
    results.map( (d) => {
        
        store.dimensionsGoalsList.stringList.push({uiobject: d.uiobject, dataname: d.dataname})
    })
    console.log(toJS(store.dimensionsGoalsList.stringList) )
}

  fetchGoals

    .then(parseGoals)
    .then(filterDimensionGoals)
    .done(goalsStorePush)
    
}
	

	

export { populateMetricsGoalsList, populateDimensionsGoalsList };