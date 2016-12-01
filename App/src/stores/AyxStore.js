import ObservableStore from './ObservableStore';
import { autorun, computed, toJS } from 'mobx';

class AyxStore extends ObservableStore {
  constructor(manager, collection) {
    super(manager, collection)

    collection.forEach( (d) => {
      const dataItemName = d.key;
      const item = manager.GetDataItem(dataItemName)
      if (d.type === 'value') {
        item.UserDataChanged.push(() => {
          store[d.key] = item.value;
        })
      } else if (d.type === 'dropDown') {
        item.UserDataChanged.push(() => {
          store[d.key].stringList = item.StringList.enums;
          store[d.key].selection = item.value;
        })
      } else if (d.type === 'listBox') {
        item.UserDataChanged.push(() => {
          store[d.key].stringList = item.StringList.enums;
          store[d.key].selection = item.value;
        })
      }

    });
  }
}

export default AyxStore;

/*
  manager.GetDataItem('client_id').UserDataChanged.push(() => {
    store.client_id = manager.GetDataItem('client_id').value;
  })
*/
