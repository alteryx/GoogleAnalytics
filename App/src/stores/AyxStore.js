import ObservableStore from './ObservableStore'

class AyxStore extends ObservableStore {
  constructor (manager, collection) {
    super(manager, collection)

    collection.forEach((d) => {
      const dataItemName = d.key
      const item = manager.GetDataItem(dataItemName)
      if (d.type === 'value') {
        item.UserDataChanged.push(() => { // This a computed value which needs to be refactored to the idiomatic structure for mobx v3.x
          this[d.key] = item.getValue()
        })
      } else if (d.type === 'dropDown') {
        item.UserDataChanged.push(() => { // This a computed value which needs to be refactored to the idiomatic structure for mobx v3.x
          this[d.key].stringList = item.StringList.enums
          this[d.key].selection = item.value
        })
      } else if (d.type === 'listBox') {
        item.UserDataChanged.push(() => { // This a computed value which needs to be refactored to the idiomatic structure for mobx v3.x
          this[d.key].stringList = item.StringList.enums
          this[d.key].selection = item.value
        })
      }
    })
  }
}

export default AyxStore

// Example of idiomatic structure for mobx v3.x computed values:
// observable({
//    get x() { return this.y }
// });
// (reference computed values in app.js, which are already converted)
