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

  newRequest(){
    return this.get('requests').pushObject(this.store.createRecord('goodcityRequest',{
      description: '',
      quantity: '',
      order: this.get('order')
    }));
  },

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

    removeRequest(reqId) {
      var url = `/goodcity_requests/${reqId}`;
      var req = this.get("store").peekRecord("goodcity_request", reqId);
      var loadingView = getOwner(this).lookup('component:loading').append();
      new AjaxPromise(url, "DELETE", this.get('session.authToken'))
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
          this.get("store").unloadRecord(req);
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
