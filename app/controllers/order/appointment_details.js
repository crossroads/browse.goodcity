import Ember from "ember";
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Controller.extend({
  order: Ember.computed.alias("model"),
  selectedId: null,
  selectedTimeId: null,
  selectedDate: null,

  available_dates: Ember.computed('available_dates.[]', {
    get: function() {
      new AjaxPromise("/available_dates", "GET", this.get('session.authToken'), {schedule_days: 40})
        .then(data => this.set("available_dates", data));
    },
    set: function(key, value) {
      return value;
    }
  }),

  actions: {
  	saveTransportDetails(){
      var orderTransportProperties = {};
      orderTransportProperties.scheduled_at = this.get('selectedDate');
      orderTransportProperties.timeslot = this.get('selectedTimeId');
      orderTransportProperties.transport_type = this.get("selectedId");
      orderTransportProperties.order_id = this.get('order.id');
      orderTransportProperties.booking_type_id = 1;

      var loadingView = getOwner(this).lookup('component:loading').append();

      new  AjaxPromise("/order_transports", "POST", this.get('session.authToken'), { order_transport: orderTransportProperties })
      .then(data => {
        this.get("store").pushPayload(data);
        loadingView.destroy();
        this.transitionToRoute("order.confirm_booking", this.get("order.id"));
      });
    }
  }
});