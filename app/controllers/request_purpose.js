import Ember from "ember";
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Controller.extend({
  peopleCount: null,
  description: "",
  selectedId: null,
  isSelfSelected: Ember.computed.equal("selectedId", "own"),


  actions: {
    saveBenificieryDetails(){
      console.log('abc');
    }
  }
});
