import React from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
// import * as dimensions from '../utils/dimensions'

class DimensionMessage extends React.Component {
  constructor(props) {
    super(props);
    this.store = props.store;
  }

  addClass(total) {
    return total > 7 ? 'warning' : ''
  }

  messageText(total) {
    let text

    if (total > 7) {
      text = 'Maximum of seven dimensions can be chosen.  Please remove dimension(s).';
    } else {
      text = '';
    };

    return text;
  }

  render() {
    let dimensions = this.store.dimensionsList.selectedValues
    let goals = this.store.dimensionsGoalsList.selectedValues
    let total = this.store.totalDimensionsAndGoals
    let text = this.messageText(total)
    let divClass = this.addClass(total)

    return (
      <div>
        <div className="selectionMessage-outer">Selected Dimensions:
          <div className="selectionMessage-inner">
            {
              // onClick={() => this.clicked(idx)}
              dimensions.map((selection, idx) => <p className="selectionMessage-btn" key={idx}>{selection}</p>)
            }
          </div>
        Selected Goals:
          <div className="selectionMessage-inner">
            {
              goals.map((selection, idx) => <p className="selectionMessage-btn" key={idx}>{selection}</p>)
            }
          </div>
          <div id="dimensionWarning" className={divClass}>
            {text}
          </div>
        </div>
      </div>
    );
  }
}

export default observer(DimensionMessage);
