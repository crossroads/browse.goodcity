import Ember from "ember";
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Controller.extend({
  order: Ember.computed.alias("model.order"),
  selectedId: null,
  selectedTimeId: null,
  selectedDate: null,

  orderTransportParams(){
    var orderTransportProperties = {};
    orderTransportProperties.scheduled_at = this.get('selectedDate');
    orderTransportProperties.timeslot = this.get('selectedTimeId');
    orderTransportProperties.transport_type = this.get("selectedId");
    orderTransportProperties.order_id = this.get('order.id');
    orderTransportProperties.booking_type_id = 1;
    return orderTransportProperties;
  },

  actions: {
  	saveTransportDetails(){
      var orderId = this.get('order.id');

      var orderTransport = this.store.peekAll("orderTransport").filterBy("order.id", orderId).get("firstObject");

      var url, actionType;

      if (orderTransport) {
        url = "/order_transports/" + orderTransport.get('id');
        actionType = "PUT";
      } else {
        url = "/order_transports";
        actionType = "POST";
      }

      this.send('saveOrUpdateOrderTransport', url, actionType);
    },

    saveOrUpdateOrderTransport(url, actionType){
      var loadingView = getOwner(this).lookup('component:loading').append();

      new AjaxPromise(url, actionType, this.get('session.authToken'), { order_transport: this.orderTransportParams() })
      .then(data => {
        this.get("store").pushPayload(data);
        loadingView.destroy();
        this.transitionToRoute("order.confirm_booking", this.get("order.id"));
      });
    }    
  }
});