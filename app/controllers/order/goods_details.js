import Ember from "ember";
const { getOwner } = Ember;
import AjaxPromise from 'browse/utils/ajax-promise';

export default Ember.Controller.extend({
  queryParams: ["typeId", "fromClientInformation"],
  order: Ember.computed.alias("model"),
  typeId: null,
  fromClientInformation: false,
  qty: null,
  otherDetails: "",
  requestCount: 3,
  sortProperties: ["id"],
  sortedGcRequests: Ember.computed.sort("model.goodcityRequests", "sortProperties"),
  
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
  	addRequest(){
      var orderId = this.get('order.id');
      var goodcityRequestParams = {};
      goodcityRequestParams['quantity'] = 1;
      goodcityRequestParams['order_id'] = orderId;
      var loadingView = getOwner(this).lookup('component:loading').append();

      new AjaxPromise("/goodcity_requests", "POST", this.get('session.authToken'), { goodcity_request: goodcityRequestParams })
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
        });
  	},

    saveGoodsDetails(){
      var promises = [];
      this.get('order.goodcityRequests').forEach(goodcityRequest => {
        promises.push(goodcityRequest.save());
      });

      var loadingView = getOwner(this).lookup('component:loading').append();

      Ember.RSVP.all(promises).then(function(){
        loadingView.destroy();
      }).finally(() =>{
        this.transitionToRoute('order.appointment_details', this.get("order.id"));
      });
    },
  }
});
