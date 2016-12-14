import React from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
//import * as metrics from '../utils/metrics'

class SegmentMessage extends React.Component {
  constructor(props) {
    super(props);
    this.store = props.store;
  }

  addClass(total) {
    return total > 4 ? 'warning' : ''
  }

  messageText(total) {
    let text

    if (total > 4) {
      text = 'Maximum of four segments can be chosen.  Please remove segment(s).';
    } else {
      text = '';
    };

    return text;
  }

  render() {
    let segments = this.store.segmentsList.selectedValues
    let total = this.store.totalSegments
    let text = this.messageText(total)
    let divClass = this.addClass(total)

    return (
      <div>
        <div className="selectionMessage-outer">Selected Segments:
          <div className="selectionMessage-inner">
            {
              // onClick={() => this.clicked(idx)}
              segments.map((selection, idx) => <p className="selectionMessage-btn" key={idx}>{selection}</p>)
            }
          </div>
          <div id="segmentWarning" className={divClass}>
            {text}
          </div>
        </div>
      </div>
    );
  }
}

export default observer(SegmentMessage);