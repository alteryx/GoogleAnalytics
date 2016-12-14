import ObservableStore from './ObservableStore';

class AyxStore extends ObservableStore {
  constructor (manager, collection) {
    super(manager, collection)

    collection.forEach((d) => {
      const dataItemName = d.key;
      const item = manager.GetDataItem(dataItemName)
      if (d.type === 'value') {
        item.UserDataChanged.push(() => {
          this[d.key] = item.getValue();
        })
      } else if (d.type === 'dropDown') {
        item.UserDataChanged.push(() => {
          this[d.key].stringList = item.StringList.enums;
          this[d.key].selection = item.value;
        })
      } else if (d.type === 'listBox') {
        item.UserDataChanged.push(() => {
          this[d.key].stringList = item.StringList.enums;
          this[d.key].selection = item.value;
        })
      }
    });
  }
}

export default AyxStore;
