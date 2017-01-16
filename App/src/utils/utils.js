import AyxStore from '../stores/AyxStore'

// Accounts menu functions
const populateAccountsList = (store) => {
  const token = store.accessToken
  const fetchAccounts = getAcccountsAjaxCall(token)

  const parseAccounts = (results) => {
    const accounts = results.items
    const accountsList = accounts.map((d, i) => {
      return {uiobject: d.name, dataname: d.id}
    })
    return accountsList
  }

  const setAccountsDropdownMenu = (accountsList) => {
    // Alteryx.Gui.manager.GetDataItem('accountsDropDown').setStringList(accountsList);
    console.log(accountsList)
  }

  fetchAccounts
    .then(parseAccounts)
    .done(setAccountsDropdownMenu)
    // .fail(handleApiFail)
}

const getAcccountsAjaxCall = (accessToken) => {
  const auth = 'Bearer ' + accessToken
  const url = 'https://www.googleapis.com/analytics/v3/management/accounts'

  const settings = {
    'async': true,
    'crossDomain': true,
    'url': url,
    'method': 'GET',
    'dataType': 'json',
    'headers': {
      'authorization': auth,
      'cache-control': 'no-cache'
    }
  }

  return $.ajax(settings)
}
/*
Authentication logic
***********************************
***********************************
***********************************
*/
const checkToken = (data) => {
  // set the access token
  if (typeof data.errors === 'undefined') {
    const accessToken = data.access_token
    // console.log('Setting access token: ' + accessToken);
    Alteryx.Gui.manager.GetDataItem('accessToken').setValue(accessToken)
  };
}

const authFail = (error) => {
//  console.log(error.statusText);
  console.log(error)
}

const setFreshAccessToken = () => {
  const fetchToken = getAccessTokenAjaxCall()

  fetchToken
    .done(checkToken)
    .fail(authFail)
}

// non interactive developer method
const getAccessTokenAjaxCall = () => {
  // Add vars for each of the user text box inputs
  const clientID = Alteryx.Gui.manager.GetDataItem('client_id').value
  const clientSecret = Alteryx.Gui.manager.GetDataItem('client_secret').value
  const refreshToken = Alteryx.Gui.manager.GetDataItem('refresh_token').value

    // API call settings
  const settings = {
    'async': true,
    'crossDomain': true,
    'url': 'https://accounts.google.com/o/oauth2/token',
    'method': 'POST',
    'dataType': 'json',
    'headers': {
      'cache-control': 'no-cache',
      'content-type': 'application/x-www-form-urlencoded'
    },
    'data': {
      'client_id': clientID,
      'client_secret': clientSecret,
      'refresh_token': refreshToken,
      'Host': 'accounts.google.com',
      'grant_type': 'refresh_token'
    }
  }

  return $.ajax(settings)
}

// const loggedIn    =   false;

// 1st step - Online login method
const login = (store) => {
  const OAUTHURL = 'https://accounts.google.com/o/oauth2/auth?'
  const VALIDURL = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token='
  const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
    // const CLIENTID    =   '848225068776-9gs7ugqmespd53h65vh058pr7sae1h4c.apps.googleusercontent.com';
  const CLIENTID = '552512737410-g6admen5hqg6q268dmt3d9bminlri7en.apps.googleusercontent.com'
  const REDIRECT = 'https://developers.google.com/oauthplayground'
  const LOGOUT = 'http://accounts.google.com/Logout'
  const TYPE = 'token'
  const _url = OAUTHURL + 'scope=' + SCOPE + '&client_id=' + CLIENTID + '&redirect_uri=' + REDIRECT + '&response_type=' + TYPE

  console.log('login() called')
  console.log('_url')
  console.log(_url)

  const win = window.open(_url, 'windowname1', 'width=800, height=600')

  const pollTimer = window.setInterval(() => {
    console.log('pollTimer() called')
        // window.location.href = toolGuiUrl;
    try {
      if (win.document.location.origin === 'https://developers.google.com') {
        const url = win.document.URL
        accessToken = gup(url, 'access_token')
        console.log('Online Access Token:')
        console.log(accessToken)
        Alteryx.Gui.manager.GetDataItem('accessToken').setValue(accessToken)
        validateToken(accessToken)
                // window.location.href = toolGuiUrl;
        win.close()
        displayFieldset(['#accessMethod', '#onlineCreds'])
      }
    } catch (e) {
                // console.log("catch");
    }
  }, 500)
}

// 2nd step - Parses out the access token from the response url returned in login()
const gup = (url, name) => {
  name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]')
  const regexS = '[\\#&]' + name + '=([^&#]*)'
  const regex = new RegExp(regexS)
  const results = regex.exec(url)
  if (results == null) {
    return ''
  } else {
    return results[1]
  }
}

// 3rd step - Validates the token received from login()
const validateToken = (token) => {
  const VALIDURL = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token='

    // API call settings
  const settings = {
    'async': true,
    'crossDomain': true,
    'url': VALIDURL + token,
    'method': 'GET',
    'dataType': 'jsonp'
  }
  return $.ajax(settings)
        .done(ajaxSuccess)
        // .fail(errParse)
}
const errParse = (jqXHR, textStatus, errorThrown) => {
  switch (jqXHR.status) {
    case 400:
      document.getElementById('connectionStatus').innerHTML = '400 Bad Request Error:  Reconfigure tool and try again'
      break
    case 401:
      document.getElementById('connectionStatus').innerHTML = '401 Invalid Token Error:  Token has expired, click Change Login Credentials to login'
      break
    case 503:
      document.getElementById('connectionStatus').innerHTML = '503 Service Unavailable Error:  Google API is unreachable, try again later'
      break
    default:
      document.getElementById('connectionStatus').innerHTML = 'Error - Unable to reach API:  Reconfigure tool and try again'
  };
  document.getElementById('connectionStatusBox').setAttribute('style', 'display: block; padding: 5px 5px 5px 5px; background: rgba(208, 2, 27, .2)')
    // changeCredentials();
}
const ajaxSuccess = (data, textStatus) => {
    // loggedIn = true;
  document.getElementById('connectionStatus').innerHTML = ''
  document.getElementById('connectionStatusBox').setAttribute('style', 'display: none')
  Alteryx.Gui.manager.GetDataItem('accessToken').setValue(accessToken)
    // Call function to retrive workbook list
    // get_workbook_list();
}

const setPage = (page) => {
  store.page = page
}

const displayFieldset = (fieldsetName) => {
   // Array containing all fieldsets
  let fieldsetArray = [
    '#accessMethod',
    '#onlineCreds',
    '#offlineCreds',
    '#profileSelectors',
    '#datePickers',
    '#metrics',
    '#dimensions',
    '#segments',
    '#token']

  let showArray = []

  showArray.push(fieldsetName)

   // Do we need to exclude the one that's about to be shown?
   // Array containing all fieldsets except for fieldsetName
  let hideArray = fieldsetArray.filter((v) => v !== fieldsetName)

  $(document).ready(() => {
    // Hide each item in the hideArray
    hideArray.forEach((v) => {
      $(v).hide()
    })
    // Show the fieldset corresponding with fieldsetName
    showArray.forEach((v) => {
      $(v).show()
    })
  })
}

export { setFreshAccessToken, getAccessTokenAjaxCall, login, gup, validateToken, displayFieldset, setPage }
