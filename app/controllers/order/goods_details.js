import Ember from "ember";
// import config from '../../config/environment';
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Controller.extend({
  queryParams: ["typeId"],
  order: Ember.computed.alias("model"),
  typeId: null,
  qty: null,
  otherDetails: "",

  description: Ember.computed('typeId', function(){
    var selected = this.get("store").peekRecord("package_type", this.get('typeId'));
    return selected.get('name');
  }),

  getRequestParams() {
    var quantity = this.get("quantity");
    var description = this.get("description");
    var itemSpecifics = this.get('otherDetails');
    var params = {
      quantity: quantity,
      description: description,
      item_specifics: itemSpecifics,
      package_type_id: this.get("typeId"),
      order_id: this.get("order.id")
    };
    return { goodcity_request: params };
  },

  actions: {
  	saveGoodsDetails(){
  		if(this.get("quantity").toString().trim().length === 0) {
        return false;
      } else {
        var loadingView = getOwner(this).lookup('component:loading').append();
        new AjaxPromise("/goodcity_requests", "POST", this.get('session.authToken'), this.getRequestParams())
          .then(data => {
            this.get("store").pushPayload(data);
          })
          .catch(response => {
            this.get("messageBox").alert(response.responseJSON.errors[0]);
          })
          .finally(() => {
            this.transitionToRoute('order.appointment_details', this.get("order.id"));
            loadingView.destroy();
          });
      }
  		console.log('inside goods details submission');
  	}
  }
});
