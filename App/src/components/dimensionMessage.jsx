import React from 'react'
import { observer } from 'mobx-react'

const PropTypes = React.PropTypes

class DimensionMessage extends React.Component {
  constructor (props) {
    super(props)
    this.store = props.store
  }

  addClass (total) {
    return total > 7 ? 'warning' : ''
  }

  messageText (total) {
    let text

    if (total > 7) {
      text = 'Maximum of seven dimensions can be chosen.  Please remove dimension(s).'
    } else {
      text = ''
    }

    return text
  }

  render () {
    const dimensions = this.store.dimensionsList.selectedValues
    const goals = this.store.dimensionsGoalsList.selectedValues
    const total = this.store.totalDimensionsAndGoals
    const text = this.messageText(total)
    const divClass = this.addClass(total)

    return (
      <div>
        <div className="selectionMessage-outer">Selected Dimensions:
          <div className="selectionMessage-inner">
            {
              // onClick={() => this.clicked(idx)}
              dimensions.map((selection, idx) => (
                <p className="selectionMessage-btn" key={idx}>{selection}</p>))
            }
          </div>
        Selected Goals:
          <div className="selectionMessage-inner">
            {
              goals.map((selection, idx) => (
                <p className="selectionMessage-btn" key={idx}>{selection}</p>))
            }
          </div>
          <div id="dimensionWarning" className={divClass}>
            {text}
          </div>
        </div>
      </div>
    )
  }
}

DimensionMessage.propTypes = {
  store: PropTypes.object
}

export default observer(DimensionMessage)
