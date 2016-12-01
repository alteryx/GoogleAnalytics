//Accounts menu functions

//changes
const populateAccountsList = (store) => {
  const token = store.accessToken
  const fetchAccounts = getAcccountsAjaxCall(token);

  const parseAccounts = (results) => {
    const accounts = results.items;
    const accountsList = accounts.map((d, i) => {
      return {uiobject: d.name, dataname: d.id}
    });
    return accountsList;
  }

  const setAccountsDropdownMenu = (accountsList) => {
    //Alteryx.Gui.manager.GetDataItem('accountsDropDown').setStringList(accountsList);
    store.accountsList.stringList = accountsList;
    console.log(accountsList);
  }

  fetchAccounts
    .then(parseAccounts)
    .done(setAccountsDropdownMenu)
    //.fail(handleApiFail)
}

const getAcccountsAjaxCall = (accessToken) => {
    const auth = "Bearer " + accessToken
    const url = "https://www.googleapis.com/analytics/v3/management/accounts"

    const settings = {
        "async": true,
        "crossDomain": true,
        "url": url,
        "method": "GET",
        "dataType": "json",
        "headers": {
            "authorization": auth,
            "cache-control": "no-cache",
        }
    };

    return $.ajax(settings)
};

/*
****************************************************************************
Profiles utils
*/

const getAcccountSummariesAjaxCall = (accessToken) => {
    const auth = "Bearer " + accessToken
    const url = "https://www.googleapis.com/analytics/v3/management/accountSummaries"

    const settings = {
        "async": true,
        "crossDomain": true,
        "url": url,
        "method": "GET",
        "dataType": "json",
        "headers": {
            "authorization": auth,
            "cache-control": "no-cache",
        }
    };

    return $.ajax(settings)
};

const populateWebPropertiesList = (store) => {
  const fetchProfiles = getAcccountSummariesAjaxCall(store.accessToken);

  const filterProfiles = (results) => {
    const filteredResults = results.items.filter( (item) => {
      return item.id === store.accountsList.selection
    });
    return filteredResults;
  }

  const flatten = (list) => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
  );

  const createProfilesList = (filteredProfiles) => {
    const accountItem = filteredProfiles[0];
    const webPropertiesList = accountItem.webProperties;
    const profilesListOfLists = webPropertiesList.map( (webProperty) => {
      const webPropsList = webProperty.profiles.map( (profile) => {
        return { webPropertyId : webProperty.id,
                 webPropertyName: webProperty.name,
                 profileName: profile.name,
                 profileId: profile.id
               }
      });
      return webPropsList
    })
    store.webPropertiesList.data = flatten(profilesListOfLists);
    store.profilesList.data = flatten(profilesListOfLists);
    return flatten(profilesListOfLists);
  }


  const populateWebPropertiesMenuObjects = (webPropsList) => {
    const webPropsMenuList = webPropsList.map( (webProp) => {
      return { uiobject: webProp.webPropertyName, dataname: webProp.webPropertyId }
    });
    store.webPropertiesList.stringList = webPropsMenuList;
    return webPropsMenuList;
  }
  fetchProfiles
    .then(filterProfiles)
    .then(createProfilesList)
    .then(populateWebPropertiesMenuObjects)
    .done((results) => {console.log(results)});
}

const populateProfilesMenu = (store) => {
    const profilesList = store.profilesList.data.filter( (profile) => {
      return profile.webPropertyId === store.webPropertiesList.selection
    });
    const profilesMenuList = profilesList.map( (profile) => {
      return { uiobject: profile.profileName, dataname: profile.profileId }
    });
    store.profilesList.stringList = profilesMenuList
}


export { populateAccountsList, populateWebPropertiesList, populateProfilesMenu }
