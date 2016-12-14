import React from 'react'
import { observer } from 'mobx-react'

class DateMessage extends React.Component {
  constructor (props) {
    super(props);
    this.store = props.store;
  }

  addClass (dateBool) {
    return dateBool ? 'warning' : ''
  }

  addText (dateBool) {
    return dateBool ? 'Start date cannot be after End date.' : ''
  }

  render () {
    let dateBool = this.store.startIsAfterEnd
    let text = this.addText(dateBool)
    let divClass = this.addClass(dateBool)

    return (
      <div className={divClass}>
        {text}
      </div>
    );
  }
}

export default observer(DateMessage);
