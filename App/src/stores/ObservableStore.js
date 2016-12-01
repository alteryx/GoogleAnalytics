import { autorun, autorunAsync, extendObservable, toJS } from 'mobx';
import _ from 'lodash';
// import store from '../stores/Storage';
//something

class ObservableStore {
  //Takes as arguments the alteryx manager,
  //and the key:value list of objects
  //to observe. List is made up of dataItem, and type (value or json) objects.
  constructor(manager, collection) {
    collection.forEach(d => {
      //store Alteryx dataItem object as "item"
      const item = manager.GetDataItemByDataName(d.key);
      extendObservable(this, {//this context for adding observables to current obj.
        //if dataItem is of type value, simply fetch value from Alteryx,
        //else, if JSON, use JSON.parse to deserialize the data.
        [`${d.key}`]:
            (d.type === 'value'
              ?
                item.getValue()
              :
                (d.type === 'dropDown' || d.type === 'listBox')
                  ? { selection: item.getValue(), stringList: item.StringList.enums }
                  :JSON.parse(item.getValue())),
      });
      if (d.type === 'listBox') {
        extendObservable(this[d.key], {
          selectedValues: () => {
            return this[d.key].selection.map( (selVal) => {
                let matchItems = this[d.key].stringList.filter( (optionItem) => {
                  return optionItem.dataName === selVal;
                });
              return matchItems[0] ? matchItems[0].uiObject : 'Missing ' + selVal 
            });
          }
        })
      }
      this.allowChangeFlag = true;
      autorunAsync(() => {
        let dropDownBool = (d.type === 'dropDown');
        let textBoxBool = (d.type === 'value');
        let listBoxBool = (d.type === 'listBox');
        let allowChangeFlag = (this.allowChangeFlag);
        let userDataChanged = item.UserDataChanged;

        console.log('Autorunning asynchrously...');
        if(textBoxBool & (toJS(this[d.key]) != item.getValue())){
          item.setValue(
            d.type === 'value' ? toJS(this[d.key]) : JSON.stringify(toJS(this[d.key]))
          );
        } else if (
                    (dropDownBool) &&
                    ((toJS(this[d.key].selection) != item.getValue()) ||
                      !(_.isEqual(toJS(this[d.key].stringList), item.StringList.enums)))
                  ) {
          item.UserDataChanged = [];
          item.setValue();
          item.setStringList();
          item.UserDataChanged = userDataChanged;
          item.setStringList(toJS(this[d.key].stringList));
          item.setValue(toJS(this[d.key].selection));
        } else if (
                    (listBoxBool)  && (allowChangeFlag) &&
                    (
                      !(
                        _.isEqual(
                            toJS(this[d.key].selection),
                            item.getValue()
                        )
                      )
                    ||
                    !(
                        _.isEqual(
                          toJS(this[d.key].stringList),
                          item.StringList.enums
                        )
                      )
                    )
                  ) {
          item.UserDataChanged = [];
          item.setValue();
          item.setStringList();
          item.UserDataChanged = userDataChanged;
          item.setStringList(toJS(this[d.key].stringList));
          item.setValue(toJS(this[d.key].selection));
        }
      },
      //1 millisecond delay to deal with new 11.0 changes.
    1);
    });
  }
}

export default ObservableStore;
