// checkbox disable/enable function definition
const checkboxDisableOnThreshold = (parentId, totalSelected, threshold) => {
  const parentNode = document.getElementById(parentId)
  const checkboxes = parentNode.querySelectorAll('input[type="checkbox"]')

  const disableUnchecked = (nodeArray) => {
    for (let i = 0; i < nodeArray.length; i++) {
      if (!nodeArray[i].checked) {
        nodeArray[i].setAttribute('disabled', true)
      }
    }
  }

  const enableAll = (nodeArray) => {
    for (let i = 0; i < nodeArray.length; i++) {
      nodeArray[i].removeAttribute('disabled')
    }
  }

  if (totalSelected >= threshold) {
    disableUnchecked(checkboxes)
  } else {
    enableAll(checkboxes)
  }
}

const toggleDisabled = (elementId) => {
  const target = document.getElementById(elementId)
  const disabled = target => {
    if (target.getAttribute('disabled')) {
      return true
    } else {
      return false
    }
  }

  if (disabled) {
    target.removeAttribute('disabled')
  } else {
    target.setAttribute('disabled', true)
  }
}

// Enable a specific button if all required fields have a value
const conditionallyEnable = (elementId, conditionArray) => {
  const target = document.getElementById(elementId)
  let conditionsMet = true

  // check if conditions are met (selections made by user)
  conditionArray.forEach((d) => {
    if (d === '' || !d) {
      conditionsMet = false
    }
  })

  if (conditionsMet) {
    // enable button
    target.removeAttribute('disabled')
  } else {
    // disable button
    target.setAttribute('disabled', true)
  }
}

export default conditionallyEnable
export {
  toggleDisabled,
  checkboxDisableOnThreshold
}
