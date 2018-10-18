import Ember from "ember";
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Controller.extend({
  actions: {
    saveClientDetails(){
      console.log('client info controller');
    }
  }
});
